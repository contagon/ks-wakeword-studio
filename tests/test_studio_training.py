import io
import json
import tempfile
import unittest
from datetime import timedelta
from dataclasses import asdict
from pathlib import Path
from studio.models import Conflict, WakewordUpdate
from studio.runtime import StudioRuntime
from studio.training import TrainingService
from test_studio_generation import wav


class TrainingRunner:
    def __init__(self):
        self.calls, self.hook, self.mode = [], None, 'valid'

    def run(self, context, argv, *, cwd=None):
        self.calls.append(argv)
        options = dict(a.split('=', 1) for a in argv if a.startswith('--') and '=' in a)
        manifest = json.loads(Path(options['--input-manifest']).read_text())
        root = Path(options['--data-dir'])
        if self.hook:
            self.hook(context)
        if self.mode == 'crash':
            raise RuntimeError('simulated worker failure')
        out = root / 'output/fixture'
        out.mkdir(parents=True)
        slug = manifest['model_id']
        if self.mode != 'missing':
            (out / f'{slug}.tflite').write_bytes(b'\x00\x00\x00\x00TFL3fixture')
        (out / f'{slug}.json').write_text(json.dumps({'type': 'micro', 'model': f'{slug}.tflite', 'calibration': {'recall': .8}}))
        (out / 'logs').mkdir()
        (out / 'logs/training.log').write_text('fixture engine log')
        (root / 'work/trained_models').mkdir(parents=True)
        (root / 'work/trained_models/training_parameters.yaml').write_text('features: []')
        if self.mode != 'unvalidated':
            (root / 'validation.json').write_text('{"microWakeWord":true}')
        return 0


class TrainingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        from studio_harness import augmentation_fixture
        augmentation_fixture(self.root)
        self.runner = TrainingRunner()
        self.runtime = StudioRuntime(self.root, runner=self.runner)
        self.word = self.runtime.workspaces.create('Hello robot', 'en', 'hello_robot')
        self.other = self.runtime.workspaces.create('Other robot', 'en', 'other_robot')
        self.service = self.runtime.training

    def tearDown(self):
        self.runtime.shutdown()
        self.temp.cleanup()

    def audio(self, word=None, label='positive', n=1):
        return self.runtime.samples.import_audio(word or self.word.id, label, io.BytesIO(wav(n)))

    def run_job(self, word=None, trigger='manual'):
        job = self.service.enqueue(word or self.word.id, trigger)
        self.assertTrue(self.runtime.workers.run_once('gpu'))
        return self.runtime.jobs.get(job.id)

    def test_snapshot_at_start_admitted_labels_retained_after_deletion(self):
        from studio.models import DiagnosticClip
        positive = self.audio()
        negative = self.audio(label='negative', n=2)
        self.audio(label='discarded', n=3)
        self.audio(self.other.id, n=4)
        self.runtime.samples.ingest('device', DiagnosticClip('pending'), io.BytesIO(wav(5)), self.word.id)
        self.runtime.samples.ingest('device', DiagnosticClip('unmapped'), io.BytesIO(wav(6)), None)
        deleted = self.audio(n=7)
        self.runtime.samples.delete(deleted.id, deleted.revision)
        job = self.service.enqueue(self.word.id, 'manual')
        self.runtime.samples.set_label(negative.id, 'positive', negative.revision)
        self.runtime.workspaces.update(self.word.id, WakewordUpdate(phrase='Edited'))
        self.runtime.workers.run_once('gpu')
        manifest = self.service.get_manifest(self.word.id, job.id)
        self.assertEqual(manifest.phrase, 'Edited')
        self.assertEqual([a.label for a in manifest.audio], ['positive', 'positive'])
        saved = asdict(manifest)
        self.runtime.samples.delete(positive.id, positive.revision)
        self.assertEqual(asdict(self.service.get_manifest(self.word.id, job.id)), saved)
        self.assertTrue(all(Path(a.path).is_file() for a in manifest.audio))
        self.assertEqual(self.service.counts(self.word.id)['positive'], 1)

    def test_two_workspaces_manual_repeats_archive_all_success(self):
        self.audio()
        self.audio(self.other.id, n=2)
        jobs = [self.run_job(), self.run_job(self.other.id), self.run_job()]
        self.assertTrue(all(j.status == 'complete' for j in jobs))
        versions = self.service.versions(self.word.id)
        self.assertEqual(versions.total, 2)
        for version in versions.items:
            root = Path(version.path)
            for name in ('hello_robot.tflite', 'run-manifest.json', 'config/training_parameters.yaml', 'logs/training.log'):
                self.assertTrue((root / name).is_file(), name)
            self.assertEqual(version.metrics['recall'], .8)
        self.assertEqual(len({next(a for a in call if a.startswith('--data-dir=')) for call in self.runner.calls}), 3)

    def test_skip_only_scheduled_unchanged_successful_fingerprint(self):
        sample = self.audio()
        first = self.run_job()
        skipped = self.run_job(trigger='scheduled')
        self.assertEqual(skipped.result, {'run_id': skipped.id, 'skipped': True})
        self.assertEqual(len(self.runner.calls), 1)
        self.runtime.samples.set_label(sample.id, 'negative', sample.revision)
        self.audio(n=2)
        self.assertEqual(self.run_job(trigger='scheduled').status, 'complete')
        self.assertEqual(len(self.runner.calls), 2)
        self.assertNotEqual(first.result['version_id'], self.service.versions(self.word.id).items[0].id)

    def test_identical_imports_stable_family_splits(self):
        original = self.audio()
        self.audio(self.other.id)
        a = self.service.snapshot(self.word.id, 'a' * 32)
        b = self.service.snapshot(self.other.id, 'b' * 32)
        self.assertEqual(a.audio[0].family_id, b.audio[0].family_id)
        self.assertEqual(a.audio[0].split, b.audio[0].split)
        self.audio(n=2)
        later = self.service.snapshot(self.word.id, 'c' * 32)
        self.assertEqual(next(x.split for x in later.audio if x.audio_id == original.audio_id), b.audio[0].split)

    def test_missing_failed_cancelled_interrupted_never_publishable(self):
        self.audio()
        self.assertEqual(self.run_job().status, 'complete')
        for mode in ('missing', 'crash', 'unvalidated'):
            self.runner.mode = mode
            self.assertEqual(self.run_job().status, 'failed')
        self.runner.mode = 'valid'
        self.runner.hook = lambda ctx: ctx.queue.cancel(ctx.job.id)
        self.assertEqual(self.run_job().status, 'cancelled')
        self.assertEqual(self.service.versions(self.word.id).total, 1)
        queued = self.service.enqueue(self.word.id, 'manual')
        running = self.runtime.jobs.claim('gpu', self.runtime.clock())
        self.service.snapshot(self.word.id, running.id)
        self.runtime.jobs.abandon()
        self.runtime.jobs.recover()
        self.assertEqual(self.runtime.jobs.get(queued.id).status, 'interrupted')
        self.assertEqual(self.service.versions(self.word.id).total, 1)

    def test_no_positive_actionable_and_owned_context(self):
        job = self.service.enqueue(self.word.id, 'manual')
        with self.assertRaises(Conflict):
            self.service.execute(job)
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'failed')
        self.assertIn('No usable positive', self.runtime.jobs.log_tail(job.id))

    def test_settings_history_http_counts(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from studio.api import create_router
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        with TestClient(app) as client:
            base = f'/api/studio/wakewords/{self.word.id}/training'
            self.assertEqual(client.put(base + '/settings', json={'training_steps': 123}).status_code, 200)
            self.assertEqual(client.get(base + '/settings').json(), {'training_steps': 123})
            self.assertEqual(client.put(base + '/settings', json={'training_steps': 123, 'train_openwakeword': True}).status_code, 422)
            self.assertEqual(client.get(base + '/counts').json()['positive'], 0)
            self.assertEqual(client.post(base + '/jobs').status_code, 201)
            self.assertEqual(client.get(base + '/runs').json()['total'], 1)
            self.assertEqual(client.get(f'/api/studio/wakewords/{self.word.id}/models').json()['total'], 0)

    def test_real_scheduler_scope_skips_unchanged_without_payload_flag(self):
        self.audio()
        self.run_job()
        schedule = self.runtime.schedules.save('train:' + self.word.id, '* * * * *', 'UTC', True)
        from datetime import datetime
        admitted = self.runtime.schedules.tick(datetime.fromisoformat(schedule.next_run_at) + timedelta(seconds=1))
        self.runtime.workers.run_once('gpu')
        self.assertTrue(self.runtime.jobs.get(admitted[0].id).result.get('skipped'))
        self.assertEqual(len(self.runner.calls), 1)

    def test_selected_complete_batch_is_pinned_not_regenerated(self):
        from studio.models import GenerationRecipe
        from test_studio_generation import FixtureRunner
        self.runtime.workers.runner = FixtureRunner()
        self.runtime.generation.save_recipe(self.word.id, GenerationRecipe('en', 'mixed', 'modern', 3, 1))
        batch_job = self.runtime.generation.enqueue(self.word.id)
        self.runtime.workers.run_once('gpu')
        self.runtime.generation.select_batches(self.word.id, [batch_job.id])
        self.runtime.workers.runner = self.runner
        self.runner.hook = lambda ctx: self.runtime.generation.select_batches(self.word.id, [])
        job = self.run_job()
        manifest = self.service.get_manifest(self.word.id, job.id)
        self.assertEqual(manifest.selected_batches, (batch_job.id,))
        self.assertEqual(len(manifest.audio), 3)
        self.assertTrue(all(a.batch_id == batch_job.id for a in manifest.audio))
        self.assertEqual(len(self.runner.calls), 1)
        self.assertEqual(self.service.counts(self.word.id)['artificial'], 0)

    def test_derivatives_and_identical_reimports_keep_heldout_assignment(self):
        original = self.audio()
        initial = self.service.snapshot(self.word.id, '1' * 32)
        trimmed = self.runtime.samples.trim(original.id, .02, .08, original.revision)
        later = self.service.snapshot(self.word.id, '2' * 32)
        self.assertEqual(later.audio[0].family_id, initial.audio[0].family_id)
        self.assertEqual(later.audio[0].split, initial.audio[0].split)
        self.runtime.samples.import_audio(self.other.id, 'positive', io.BytesIO(self.runtime.blobs.read(trimmed.normalized_hash)))
        imported = self.service.snapshot(self.other.id, '3' * 32)
        self.assertEqual(imported.audio[0].family_id, initial.audio[0].family_id)
        self.assertEqual(imported.audio[0].split, initial.audio[0].split)

    def test_archive_not_visible_until_worker_complete_and_success_hook_failure_retains_it(self):
        self.audio()
        seen = []
        def completed(job):
            seen.append(self.service.successful_version(job.id))
            raise RuntimeError('deployment failed')
        self.runtime.workers.register_completion('train', completed)
        job = self.run_job()
        self.assertEqual(job.status, 'complete')
        self.assertEqual(seen[0].run_id, job.id)
        self.assertEqual(self.service.versions(self.word.id).total, 1)

    def test_crash_after_archive_before_job_completion_is_not_publishable(self):
        from studio.jobs import JobContext
        import threading
        self.audio()
        self.service.enqueue(self.word.id)
        job = self.runtime.jobs.claim('gpu', self.runtime.clock())
        result = self.service.execute(job, JobContext(self.runtime.jobs, job, threading.Event(), self.runner))
        self.assertTrue(Path(result.path).is_dir())
        self.assertIsNone(self.service.successful_version(job.id))
        self.assertEqual(self.service.versions(self.word.id).total, 0)
        self.runtime.jobs.abandon()
        self.runtime.jobs.recover()
        self.assertIsNone(self.service.successful_version(job.id))

    def test_actual_v7_upgrade_preserves_words(self):
        import sqlite3
        from studio.db import Store
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'studio').mkdir()
            with sqlite3.connect(root / 'studio/studio.sqlite3') as db:
                for name in ('schema.sql', 'schema_samples.sql', 'schema_devices.sql', 'schema_collection.sql',
                             'schema_jobs.sql', 'schema_datasets.sql', 'schema_generation.sql'):
                    db.executescript((Path('studio') / name).read_text())
                db.execute("INSERT INTO wakewords VALUES ('old','Old','en','old','then','then')")
                db.execute('PRAGMA user_version=7')
            store = Store.open(root)
            try:
                with store.transaction() as db:
                    self.assertEqual(db.execute('PRAGMA user_version').fetchone()[0], 12)
                    self.assertEqual(db.execute('SELECT phrase FROM wakewords').fetchone()[0], 'Old')
            finally:
                store.close()

    def test_dataset_versions_pinned_at_start_and_mww_settings_reused(self):
        import zipfile
        from studio.models import TrainingSettings
        self.audio()
        archive = self.root / 'dataset.zip'
        with zipfile.ZipFile(archive, 'w') as handle:
            handle.writestr('speech/training/a.ninja', b'original features')
        installed = self.runtime.datasets.install_archive('speech', archive)
        job = self.service.enqueue(self.word.id)
        self.runtime.datasets.select(self.word.id, ['speech'])
        self.runner.hook = lambda ctx: self.runtime.datasets.select(self.word.id, [])
        self.runtime.workers.run_once('gpu')
        manifest = self.service.get_manifest(self.word.id, job.id)
        self.assertEqual(manifest.datasets, (installed,))
        self.assertTrue(Path(installed.path).is_dir())
        self.assertEqual(self.runtime.datasets.snapshot(self.word.id), [])
        self.runner.hook = None
        self.runtime.datasets.select(self.word.id, ['speech'])
        self.service.save_settings(self.word.id, TrainingSettings(123))
        completed = self.run_job()
        self.assertEqual(completed.status, 'complete')
        self.assertEqual(len(self.runner.calls), 2)
        self.assertEqual(asdict(self.service.get_manifest(self.word.id, completed.id).config), {'training_steps': 123})

    def test_quarantined_source_is_not_an_effective_training_input(self):
        from studio.models import DiagnosticClip, SampleQuery
        self.runtime.samples.ingest('device', DiagnosticClip('conflicting'), io.BytesIO(wav(1)), self.word.id)
        sample = self.runtime.samples.list(self.word.id, SampleQuery()).items[0]
        self.runtime.samples.set_label(sample.id, 'positive', sample.revision)
        self.runtime.samples.ingest('device', DiagnosticClip('conflicting'), io.BytesIO(wav(2)), self.word.id)
        manifest = self.service.snapshot(self.word.id, '4' * 32)
        self.assertEqual(manifest.audio, ())
        self.assertEqual(self.service.counts(self.word.id)['positive'], 0)
