import json
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path

from studio.models import GenerationRecipe, ValidationError
from studio.runtime import StudioRuntime
from tests.test_studio_generation import FixtureRunner


class SubmissionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.runner = FixtureRunner()
        self.runtime = StudioRuntime(self.root, runner=self.runner)
        self.word = self.runtime.workspaces.create('Hello robot', 'en', 'hello_robot')
        self.other = self.runtime.workspaces.create('Other robot', 'en', 'other_robot')
        self.service = self.runtime.generation
        self.recipe = GenerationRecipe('en', 'british', 'modern', 2, 1, ['qwen3', 'omnivoice'])

    def tearDown(self):
        self.runtime.shutdown()
        self.temp.cleanup()

    def source(self, engine='qwen3', word=None, count=2):
        job = self.service.enqueue((word or self.word).id, replace(self.recipe, engines=[engine], samples=count))
        self.assertTrue(self.runtime.workers.run_once('gpu'))
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'complete')
        return job.id

    def test_each_provider_gets_full_count_and_independent_dataset(self):
        result = self.service.submit(self.word.id, replace(self.recipe, samples=3))
        self.assertEqual(len(result.jobs), 2)
        self.assertEqual(result.batch_ids, [job.id for job in result.jobs])
        self.assertEqual({tuple(j.payload['recipe']['engines']) for j in result.jobs}, {('qwen3',), ('omnivoice',)})
        self.assertTrue(all(j.payload['recipe']['samples'] == 3 for j in result.jobs))
        self.assertTrue(all(j.payload['submission_id'] == result.id for j in result.jobs))
        for job in result.jobs:
            self.assertTrue(self.runtime.workers.run_once('gpu'))
            batch = self.service.get_batch(self.word.id, job.id)
            self.assertEqual(len(batch.audio), 3)
            self.assertFalse(batch.selected)
        self.service.select_batches(self.word.id, [result.batch_ids[0]])
        self.assertEqual(self.service.selection(self.word.id), [result.batch_ids[0]])

    def test_invalid_admission_is_atomic(self):
        for recipe in (replace(self.recipe, engines=[]), replace(self.recipe, engines=['qwen3', 'unknown']),
                       replace(self.recipe, engines=['qwen3', 'qwen3']), replace(self.recipe, samples=0),
                       replace(self.recipe, samples=True)):
            with self.subTest(recipe=recipe), self.assertRaises(ValidationError):
                self.service.submit(self.word.id, recipe)
            self.assertEqual(self.runtime.jobs.list().total, 0)

    def test_legacy_ensemble_admission_still_returns_one_job(self):
        job = self.service.enqueue(self.word.id, self.recipe)
        self.assertEqual(job.payload['recipe']['engines'], ['qwen3', 'omnivoice'])
        self.assertEqual(self.runtime.jobs.list().total, 1)

    def test_moss_only_accepts_multiple_completed_direct_sources(self):
        sources = [self.source('qwen3'), self.source('omnivoice')]
        recipe = replace(self.recipe, engines=['moss'], moss_source_batch_ids=sources, moss_samples=2)
        result = self.service.submit(self.word.id, recipe)
        self.assertEqual(len(result.jobs), 1)
        self.assertEqual(result.jobs[0].payload['recipe']['moss_source_batch_ids'], sources)
        self.assertEqual(result.jobs[0].payload['recipe']['samples'], 2)
        self.assertEqual(self.service.get_recipe(self.word.id), recipe)

    def test_after_current_snapshots_only_new_sources_and_own_count(self):
        old = self.source()
        recipe = replace(self.recipe, engines=['qwen3', 'omnivoice', 'moss'],
                         moss_after_current=True, moss_samples=3)
        result = self.service.submit(self.word.id, recipe)
        self.assertEqual(len(result.jobs), 3)
        moss = result.jobs[-1]
        self.assertEqual(moss.payload['recipe']['engines'], ['moss'])
        self.assertEqual(moss.payload['recipe']['samples'], 3)
        self.assertEqual(moss.payload['recipe']['moss_source_batch_ids'], result.batch_ids[:-1])
        self.assertNotIn(old, moss.payload['recipe']['moss_source_batch_ids'])
        self.assertTrue(all(j.payload['recipe']['samples'] == 2 for j in result.jobs[:-1]))

    def test_moss_invalid_sources_do_not_admit_jobs(self):
        source = self.source()
        foreign = self.source(word=self.other)
        base = self.runtime.jobs.list().total
        for ids in ([], [source, source], [foreign], ['unknown'], ['0' * 32], [source] * 101):
            recipe = replace(self.recipe, engines=['moss'], moss_source_batch_ids=ids)
            with self.subTest(ids=ids), self.assertRaises(ValidationError):
                self.service.submit(self.word.id, recipe)
            self.assertEqual(self.runtime.jobs.list().total, base)

    def test_canonical_duplicates_do_not_inflate_available_references(self):
        sources = [self.source('qwen3'), self.source('omnivoice')]
        # Both fixture batches contain identical pairs of canonical WAVs.
        with self.assertRaisesRegex(ValidationError, 'distinct reference'):
            self.service.submit(self.word.id, replace(self.recipe, engines=['moss'],
                                moss_source_batch_ids=sources, moss_samples=3))

    def test_after_current_requires_direct_sources_and_rejects_mixed_modes(self):
        for engines, ids, count in ((['moss'], [], 2), (['qwen3', 'moss'], ['0' * 32], 2),
                                    (['qwen3', 'moss'], [], 3)):
            recipe = replace(self.recipe, engines=engines, moss_after_current=True,
                             moss_source_batch_ids=ids, moss_samples=count)
            with self.subTest(engines=engines, ids=ids, count=count), self.assertRaises(ValidationError):
                self.service.submit(self.word.id, recipe)
            self.assertEqual(self.runtime.jobs.list().total, 0)

    def test_source_catalog_is_lightweight_scoped_filtered_and_paginated(self):
        first = self.source('qwen3')
        second = self.source('omnivoice')
        self.source(word=self.other)
        self.service.enqueue(self.word.id, replace(self.recipe, engines=['qwen3']))
        page = self.service.sources(self.word.id, 'en', offset=1, limit=1)
        self.assertEqual(page.total, 2)
        self.assertEqual([s.id for s in page.items], [first])
        item = page.items[0]
        self.assertEqual(item.sample_count, 2)
        self.assertEqual(item.providers, ['qwen3'])
        self.assertFalse(hasattr(item, 'audio'))
        self.assertEqual(self.service.sources(self.word.id, 'fr').total, 0)
        self.assertNotEqual(first, second)

    def test_pending_and_moss_sources_are_ineligible(self):
        pending = self.service.enqueue(self.word.id, replace(self.recipe, engines=['qwen3']))
        for source in [pending.id]:
            with self.assertRaises(ValidationError):
                self.service.submit(self.word.id, replace(self.recipe, engines=['moss'], moss_source_batch_ids=[source]))
        self.runtime.workers.run_once('gpu')
        moss = self.source('moss')  # Legacy fixture permits mixed/clone-only historical output.
        with self.assertRaises(ValidationError):
            self.service.submit(self.word.id, replace(self.recipe, engines=['moss'], moss_source_batch_ids=[moss]))
