import json
import io
import tempfile
import unittest
from dataclasses import asdict, replace
from pathlib import Path

from studio.models import Conflict, GenerationRecipe, ValidationError
from studio.runtime import StudioRuntime
from tests.test_studio_generation import FixtureRunner, wav


class ReferenceRunner(FixtureRunner):
    bad_parent = False
    family_conflict = False

    def run(self, context, argv, *, cwd=None):
        options = dict(part.split('=', 1) for part in argv if part.startswith('--') and '=' in part)
        if '--reference-manifest' not in options:
            return super().run(context, argv, cwd=cwd)
        self.calls.append((context.job.id, argv, cwd))
        rows = [json.loads(line) for line in Path(options['--reference-manifest']).read_text().splitlines()]
        self.references = rows
        output = Path(options['--output-dir']); output.mkdir(parents=True)
        parents = {}
        for index in range(int(options['--samples'])):
            (output / f'{index}.wav').write_bytes(wav(2 if self.family_conflict else index + 100))
            parents[f'{index}.wav'] = '0' * 32 if self.bad_parent else rows[index % len(rows)]['audio_id']
        (output / '.generation_manifest.json').write_text(json.dumps({'source_audio_ids': parents}))
        return 0


class SubmissionTests(unittest.TestCase):
    def api(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from studio.api import create_router
        app = FastAPI(); app.include_router(create_router(self.runtime))
        return TestClient(app)

    def test_submission_http_contract_is_per_provider(self):
        with self.api() as client:
            path = f'/api/studio/wakewords/{self.word.id}/generation'
            result = client.post(path + '/submissions', json=asdict(self.recipe))
            self.assertEqual(result.status_code, 201, result.text)
            body = result.json()
            self.assertEqual(len(body['jobs']), 2)
            self.assertEqual(body['batch_ids'], [j['id'] for j in body['jobs']])
            self.assertEqual([j['payload']['recipe']['samples'] for j in body['jobs']], [2, 2])
            self.assertEqual(client.post(path.replace(self.word.id, '0' * 32) + '/submissions', json=asdict(self.recipe)).status_code, 404)
            self.assertEqual(client.post(path + '/submissions', json={**asdict(self.recipe), 'samples': True}).status_code, 422)

    def test_source_http_contract_is_lightweight_scoped_and_bounded(self):
        source = self.source()
        with self.api() as client:
            path = f'/api/studio/wakewords/{self.word.id}/generation/sources'
            page = client.get(path, params={'language': 'en', 'limit': 1}).json()
            self.assertEqual(page['total'], 1)
            self.assertEqual(page['items'][0]['id'], source)
            self.assertEqual(page['items'][0]['sample_count'], 2)
            self.assertNotIn('audio', page['items'][0])
            self.assertEqual(client.get(path.replace(self.word.id, self.other.id)).json()['total'], 0)
            self.assertEqual(client.get(path, params={'offset': -1}).status_code, 422)
            self.assertEqual(client.get(path, params={'limit': 101}).status_code, 422)
            invalid = replace(self.recipe, engines=['moss'], moss_source_batch_ids=['0' * 32])
            self.assertEqual(client.post(path.replace('/sources', '/submissions'), json=asdict(invalid)).status_code, 422)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.runner = FixtureRunner()
        self.runtime = StudioRuntime(self.root, runner=self.runner)
        self.word = self.runtime.workspaces.create('Hello robot', 'en', 'hello_robot')
        self.runtime.datasets.select(self.word.id, [])
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

    def use_reference_runner(self):
        self.runner = ReferenceRunner()
        self.runtime.workers.runner = self.runner

    def test_moss_executes_with_approved_sources_and_inherits_parent_families(self):
        sources = [self.source('qwen3'), self.source('omnivoice')]
        self.use_reference_runner()
        result = self.service.submit(self.word.id, replace(self.recipe, engines=['moss'], moss_source_batch_ids=sources))
        job = result.jobs[0]
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'complete')
        batch = self.service.get_batch(self.word.id, job.id)
        self.assertEqual(len(self.runner.references), 2)  # Canonical duplicates across sources removed.
        with self.service.store.transaction() as db:
            rows = [db.execute('SELECT * FROM audio_records WHERE id=?', (a.audio_id,)).fetchone() for a in batch.audio]
            for index, row in enumerate(rows):
                self.assertEqual(row['parent_id'], self.runner.references[index]['audio_id'])
                self.assertEqual(row['family_id'], self.runner.references[index]['family_id'])
        self.assertEqual(self.service.selection(self.word.id), [])
        from tests.studio_harness import augmentation_fixture
        augmentation_fixture(self.root)
        self.service.select_batches(self.word.id, [sources[0], job.id])
        from uuid import uuid4
        manifest = self.runtime.training.snapshot(self.word.id, uuid4().hex)
        splits = {}
        for audio in manifest.audio:
            self.assertEqual(splits.setdefault(audio.family_id, audio.split), audio.split)

    def test_unapproved_parent_or_family_conflict_rolls_back_publication(self):
        source = self.source()
        self.use_reference_runner()
        for field in ('bad_parent', 'family_conflict'):
            setattr(self.runner, field, True)
            result = self.service.submit(self.word.id, replace(self.recipe, engines=['moss'], moss_source_batch_ids=[source]))
            self.runtime.workers.run_once('gpu')
            job = result.jobs[0]
            self.assertEqual(self.runtime.jobs.get(job.id).status, 'failed')
            with self.service.store.transaction() as db:
                self.assertEqual(db.execute('SELECT count(*) FROM generation_batch_audio WHERE batch_id=?', (job.id,)).fetchone()[0], 0)
            setattr(self.runner, field, False)

    def test_cancelled_failed_or_interrupted_producer_prevents_moss_inference(self):
        for state in ('cancelled', 'failed', 'interrupted'):
            result = self.service.submit(self.word.id, replace(self.recipe, engines=['qwen3', 'moss'], moss_after_current=True))
            producer, moss = result.jobs
            if state == 'cancelled':
                self.runtime.jobs.cancel(producer.id)
            elif state == 'failed':
                self.runner.mode = 'invalid'
                self.runtime.workers.run_once('gpu')
                self.runner.mode = 'valid'
            else:
                self.runtime.jobs.claim('gpu', self.runtime.clock())
                self.runtime.jobs.abandon()
                self.runtime.jobs.recover()
            before = len(self.runner.calls)
            self.runtime.workers.run_once('gpu')
            self.assertEqual(self.runtime.jobs.get(moss.id).status, 'failed')
            self.assertEqual(len(self.runner.calls), before)
            self.assertIn('MOSS sources', self.runtime.jobs.log_tail(moss.id))

    def test_after_current_runs_after_runtime_reconstruction(self):
        result = self.service.submit(self.word.id, replace(self.recipe, engines=['qwen3', 'moss'], moss_after_current=True))
        self.runtime.shutdown()
        self.runner = ReferenceRunner()
        self.runtime = StudioRuntime(self.root, runner=self.runner)
        self.service = self.runtime.generation
        self.runtime.workers.run_once('gpu')
        self.runtime.workers.run_once('gpu')
        self.assertEqual([self.runtime.jobs.get(j.id).status for j in result.jobs], ['complete', 'complete'])
        self.assertEqual(self.service.get_batch(self.word.id, result.jobs[-1].id).recipe.moss_source_batch_ids, result.batch_ids[:-1])

    def test_source_deletion_blocks_active_moss_and_retains_completed_derivative_ancestors(self):
        source = self.source()
        original = self.service.get_batch(self.word.id, source)
        self.use_reference_runner()
        result = self.service.submit(self.word.id, replace(self.recipe, engines=['moss'], moss_source_batch_ids=[source]))
        with self.assertRaises(Conflict):
            self.service.delete_batch(self.word.id, source)
        self.runtime.workers.run_once('gpu')
        self.service.delete_batch(self.word.id, source)
        for audio in original.audio:
            self.assertEqual(self.runtime.blobs.read(audio.normalized_hash), wav(original.audio.index(audio) + 1))
        self.service.delete_batch(self.word.id, result.jobs[0].id)
        with self.service.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 0)

    def test_moss_preview_uses_one_reference_without_publishing_training_audio(self):
        source = self.source()
        self.use_reference_runner()
        recipe = replace(self.recipe, engines=['moss'], moss_source_batch_ids=[source])
        preview = self.service.enqueue_preview(self.word.id, recipe)
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(preview.id).status, 'complete')
        self.assertEqual(self.service.preview_audio(self.word.id, preview.id), wav(100))
        self.assertEqual(self.service.list(self.word.id).total, 1)
        with self.service.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 2)
        for invalid in (replace(recipe, moss_source_batch_ids=[]), replace(recipe, moss_after_current=True)):
            with self.assertRaises(ValidationError):
                self.service.enqueue_preview(self.word.id, invalid)

    def test_sources_with_wrong_language_or_changed_phrase_are_rejected(self):
        source = self.source()
        recipe = replace(self.recipe, engines=['moss'], moss_source_batch_ids=[source])
        with self.assertRaises(ValidationError):
            self.service.submit(self.word.id, replace(recipe, language='fr', english_accent='mixed'))
        with self.service.store.transaction() as db:
            db.execute('UPDATE wakewords SET phrase=? WHERE id=?', ('Changed phrase', self.word.id))
        with self.assertRaises(ValidationError):
            self.service.submit(self.word.id, recipe)
