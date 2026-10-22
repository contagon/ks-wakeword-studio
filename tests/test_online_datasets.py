import json
import os
import sys
import tempfile
import unittest
import importlib.util
import errno
import threading
from unittest.mock import patch
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
from studio.api import create_router
from studio.jobs import ChildGroups
from studio.runtime import StudioRuntime
from studio_harness import StubGpuRunner, augmentation_fixture


class AugmentationRunner:
    def __init__(self, mode='valid'):
        self.mode, self.calls = mode, []

    def run(self, context, argv, cwd=None):
        self.calls.append(argv)
        options = dict(a.split('=', 1) for a in argv if a.startswith('--') and '=' in a)
        root = Path(options['--stage-dir']) / 'training_datasets' / options['--corpus']
        root.mkdir(parents=True)
        if self.mode == 'crash':
            (root / 'partial.wav').write_bytes(b'partial')
            raise RuntimeError('Authorization: Bearer private-download-secret')
        if self.mode == 'cancel':
            context.queue.cancel(context.job.id)
        if self.mode == 'symlink':
            (root / 'outside.wav').symlink_to('/etc/passwd')
        elif self.mode != 'empty':
            (root / 'fixture.wav').write_bytes(StubGpuRunner._wav())
        if self.mode != 'incomplete':
            (root.parent.parent / 'augmentation-complete.json').write_text(json.dumps({'schema_version': 1, 'corpus': options['--corpus']}))


class OnlineDatasetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.runner = AugmentationRunner()
        self.runtime = StudioRuntime(self.root, runner=self.runner)
        self.addCleanup(self.runtime.shutdown)
        self.word = self.runtime.workspaces.create('Hello', 'en', 'hello')
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        self.client = TestClient(app)

    def test_setup_bridge_reuses_shared_environment_and_sanitizes_cuda_paths(self):
        spec = importlib.util.spec_from_file_location('setup_augmentation', 'cli/setup_augmentation.py')
        bridge = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(bridge)
        stage = self.root / 'stage'
        stage.mkdir()
        calls = []
        def run(argv, **kwargs):
            calls.append((argv, kwargs))
        args = ['setup_augmentation.py', '--corpus=chime_16k', f'--data-dir={self.root}', f'--stage-dir={stage}']
        with patch.object(sys, 'argv', args), patch.dict(os.environ, {'LD_LIBRARY_PATH': f'{self.root}/.recorder-venv/lib:/opt/vendor/lib'}), patch.object(bridge.subprocess, 'run', side_effect=run):
            bridge.main()
        self.assertEqual(len(calls), 2)
        self.assertEqual(calls[-1][1]['env']['LD_LIBRARY_PATH'], '/opt/vendor/lib')
        self.assertEqual(calls[-1][1]['env']['HF_HOME'], str(self.root / '.cache/huggingface'))
        self.assertEqual(calls[-1][0][:3], [str(self.root / '.venv/bin/python'),
                                            str(Path('cli/prepare_corpus.py').resolve()), '--corpus=chime_16k'])
        self.assertIn(f'--data-dir={stage}', calls[-1][0])
        self.assertFalse((stage / '.venv').exists())
        self.assertIn('--cleanup-archives', calls[-1][0])
        self.assertEqual(json.loads((stage / 'augmentation-complete.json').read_text())['corpus'], 'chime_16k')

    def test_augmentation_selection_defaults_and_empty_are_per_wakeword(self):
        path = f'/api/studio/wakewords/{self.word.id}/augmentation/datasets'
        response = self.client.get(path)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(all(row['selected'] for row in response.json()['items']))
        response = self.client.put(path, json={'dataset_ids': []})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['ready'])
        self.assertFalse(any(row['selected'] for row in self.client.get(path).json()['items']))
        other = self.runtime.workspaces.create('Other', 'en', 'other')
        self.assertEqual(len(self.runtime.augmentation.selection(other.id)), 4)
        self.runtime.shutdown()
        self.runtime = StudioRuntime(self.root, runner=self.runner)
        self.assertEqual(self.runtime.augmentation.selection(self.word.id), [])

    def test_augmentation_selection_validates_atomically(self):
        path = f'/api/studio/wakewords/{self.word.id}/augmentation/datasets'
        self.assertEqual(self.client.put(path, json={'dataset_ids': ['fma_16k']}).status_code, 200)
        for ids in (['unknown'], ['fma_16k', 'fma_16k']):
            self.assertGreaterEqual(self.client.put(path, json={'dataset_ids': ids}).status_code, 400)
            self.assertEqual(self.runtime.augmentation.selection(self.word.id), ['fma_16k'])
        self.assertEqual(self.client.get('/api/studio/wakewords/missing/augmentation/datasets').status_code, 404)

    def test_training_ignores_disabled_missing_or_corrupt_corpora(self):
        augmentation_fixture(self.root)
        (self.root / 'training_datasets/fma_16k/fixture.wav').write_bytes(b'corrupt')
        self.runtime.augmentation.select(self.word.id, ['chime_16k'])
        self.runtime.datasets.select(self.word.id, [])
        response = self.client.post(f'/api/studio/wakewords/{self.word.id}/training/jobs')
        self.assertEqual(response.status_code, 201)
        self.runtime.workers.run_once('gpu')
        manifest = self.runtime.training.get_manifest(self.word.id, response.json()['id'])
        self.assertEqual([item.id for item in manifest.augmentation], ['chime_16k'])
        self.runtime.augmentation.select(self.word.id, [])
        self.assertEqual([item.id for item in self.runtime.training.get_manifest(self.word.id, manifest.run_id).augmentation], ['chime_16k'])

    def test_scheduled_training_with_no_augmentation_pins_empty_selection(self):
        self.runtime.augmentation.select(self.word.id, [])
        self.runtime.datasets.select(self.word.id, [])
        job = self.runtime.training.enqueue(self.word.id, 'scheduled')
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.training.get_manifest(self.word.id, job.id).augmentation, ())

    def test_enabled_missing_augmentation_still_blocks_training(self):
        self.runtime.augmentation.select(self.word.id, ['chime_16k'])
        response = self.client.post(f'/api/studio/wakewords/{self.word.id}/training/jobs')
        self.assertEqual(response.json()['code'], 'augmentation_missing')

    def test_default_selected_uninstalled_negatives_block_before_queueing(self):
        self.runtime.augmentation.select(self.word.id, [])
        response = self.client.post(f'/api/studio/wakewords/{self.word.id}/training/jobs')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()['code'], 'negative_datasets_missing')
        self.assertFalse(any(job.kind == 'train' for job in self.runtime.jobs.list().items))

    def test_unreceipted_partial_source_corpus_is_not_published(self):
        self.runner.mode = 'incomplete'
        job = self.runtime.augmentation.download('audioset_16k')
        self.runtime.workers.run_once('download')
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'failed')
        self.assertFalse((self.root / 'training_datasets/audioset_16k').exists())

    def test_corrupt_legacy_wavs_and_partial_directories_report_repair_before_download(self):
        augmentation_fixture(self.root)
        (self.root / 'training_datasets/mit_rirs_16k/fixture.wav').write_bytes(b'not a WAV')
        catalog = self.runtime.augmentation.catalog()
        self.assertFalse(catalog['ready'])
        self.assertEqual(catalog['items'][0]['error_code'], 'augmentation_repair_required')
        for _ in range(2):
            response = self.client.post('/api/studio/augmentation/datasets/mit_rirs_16k/download')
            self.assertEqual(response.status_code, 409)
            self.assertEqual(response.json()['code'], 'augmentation_repair_required')
        self.assertEqual(self.runner.calls, [])
        self.assertEqual(self.runtime.jobs.list().total, 0)
        self.assertEqual((self.root / 'training_datasets/mit_rirs_16k/fixture.wav').read_bytes(), b'not a WAV')

    def test_truncated_legacy_wav_is_not_ready(self):
        augmentation_fixture(self.root)
        (self.root / 'training_datasets/mit_rirs_16k/fixture.wav').write_bytes(StubGpuRunner._wav()[:-100])
        self.assertFalse(self.runtime.augmentation.catalog()['ready'])

    def test_catalog_get_is_read_only_and_training_rejects_missing_corpora(self):
        before = sorted(str(p.relative_to(self.root)) for p in self.root.rglob('*'))
        response = self.client.get('/api/studio/augmentation/datasets')
        self.assertEqual(response.status_code, 200)
        catalog = response.json()
        self.assertEqual({r['id'] for r in catalog['items']},
                         {'mit_rirs_16k', 'audioset_16k', 'fma_16k', 'chime_16k'})
        self.assertFalse(catalog['ready'])
        self.assertGreater(catalog['storage_free_bytes'], 0)
        self.assertEqual(self.runtime.jobs.list().total, 0)
        self.assertEqual(before, sorted(str(p.relative_to(self.root)) for p in self.root.rglob('*')))
        response = self.client.post(f'/api/studio/wakewords/{self.word.id}/training/jobs')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()['code'], 'augmentation_missing')
        self.assertIn('Downloaded', response.json()['detail'])
        self.assertEqual(self.runtime.jobs.list().total, 0)

    def test_shared_owned_download_deduplicates_and_publishes_only_complete_audio(self):
        service = self.runtime.augmentation
        first = service.download('mit_rirs_16k')
        self.assertEqual(first.id, service.download('mit_rirs_16k').id)
        self.assertIsNone(first.word_id)
        self.assertEqual(service.catalog()['items'][0]['status'], 'queued')
        self.runtime.workers.run_once('download')
        self.assertEqual(self.runtime.jobs.get(first.id).status, 'complete')
        target = self.root / 'training_datasets/mit_rirs_16k/fixture.wav'
        self.assertEqual(target.read_bytes(), StubGpuRunner._wav())
        row = service.catalog()['items'][0]
        self.assertEqual(row['status'], 'installed')
        self.assertEqual(row['installed_bytes'], len(StubGpuRunner._wav()))
        self.assertEqual(row['file_count'], 1)
        self.assertIn('fingerprint', self.runtime.jobs.get(first.id).result)
        self.assertEqual(self.runtime.datasets.list(self.word.id).total, 4)
        self.assertEqual(self.runtime.datasets.list(self.word.id, status='selected').total, 4)

    def test_failed_partial_install_can_retry_without_exposing_raw_error(self):
        self.runner.mode = 'crash'
        job = self.runtime.augmentation.download('audioset_16k')
        self.runtime.workers.run_once('download')
        self.assertFalse((self.root / 'training_datasets/audioset_16k').exists())
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'failed')
        public = self.runtime.jobs.log_tail(job.id) + json.dumps(self.runtime.jobs.get(job.id).result)
        self.assertNotIn('private-download-secret', public)
        self.assertIn('private-download-secret', (self.root / f'studio/jobs/{job.id}/diagnostics.log').read_text())
        self.runner.mode = 'valid'
        retry = self.runtime.augmentation.download('audioset_16k')
        self.assertNotEqual(job.id, retry.id)
        self.runtime.workers.run_once('download')
        self.assertEqual(self.runtime.jobs.get(retry.id).status, 'complete')

    def test_empty_symlink_and_cancelled_install_never_publish(self):
        for mode in ('empty', 'symlink', 'cancel'):
            with self.subTest(mode=mode):
                self.runner.mode = mode
                job = self.runtime.augmentation.download('chime_16k')
                self.runtime.workers.run_once('download')
                self.assertIn(self.runtime.jobs.get(job.id).status, ('failed', 'cancelled'))
                self.assertFalse((self.root / 'training_datasets/chime_16k').exists())

    def test_existing_cli_corpora_are_recognized_and_training_can_queue(self):
        augmentation_fixture(self.root)
        response = self.client.get('/api/studio/augmentation/datasets')
        self.assertTrue(response.json()['ready'])
        self.runtime.datasets.select(self.word.id, [])
        self.assertEqual(self.client.post(f'/api/studio/wakewords/{self.word.id}/training/jobs').status_code, 201)

    def test_installed_corpora_cannot_be_reinstalled_during_training(self):
        augmentation_fixture(self.root)
        response = self.client.post('/api/studio/augmentation/datasets/fma_16k/download')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(self.runtime.jobs.list().total, 0)

    def test_scheduled_training_reports_missing_prerequisites_without_a_snapshot(self):
        job = self.runtime.training.enqueue(self.word.id, 'scheduled')
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(job.id).result['error_code'], 'augmentation_missing')
        self.assertIn('Downloaded', self.runtime.jobs.log_tail(job.id))
        self.assertFalse((self.root / f'studio/jobs/{job.id}/training/run-manifest.json').exists())

    def test_parent_disk_and_permission_failures_have_safe_actionable_codes(self):
        for number, code in ((errno.ENOSPC, 'disk_full'), (errno.EACCES, 'permission_denied')):
            with self.subTest(code=code):
                def fail(job, context):
                    raise OSError(number, 'private-filesystem-secret')
                self.runtime.workers.handlers['generation'] = fail
                job = self.runtime.jobs.enqueue('generation', self.word.id, {})
                self.runtime.workers.run_once('gpu')
                result = self.runtime.jobs.get(job.id).result
                self.assertEqual(result['error_code'], code)
                self.assertNotIn('private-filesystem-secret', json.dumps(result) + self.runtime.jobs.log_tail(job.id))

    def test_unsafe_diagnostics_path_does_not_prevent_failed_job_completion(self):
        job = self.runtime.jobs.enqueue('generation', self.word.id, {})
        target = self.root / 'operator-file'
        target.write_text('keep')
        folder = self.runtime.jobs.store.scoped_directory('jobs', job.id)
        (folder / 'diagnostics.log').symlink_to(target)
        def fail(job, context):
            raise RuntimeError('private-secret')
        self.runtime.workers.handlers['generation'] = fail
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'failed')
        self.assertEqual(target.read_text(), 'keep')

    def test_unknown_download_id_is_rejected_without_a_job(self):
        self.assertEqual(self.client.post('/api/studio/augmentation/datasets/unknown/download').status_code, 404)
        self.assertEqual(self.runtime.jobs.list().total, 0)

    def test_child_output_is_bounded_private_and_failure_is_actionable(self):
        self.runtime.runner = None
        pool = self.runtime.workers
        from studio.jobs import ProcessRunner
        pool.runner = ProcessRunner()
        self.runtime.jobs.groups = ChildGroups()
        def handler(job, context):
            context.run([sys.executable, '-c',
                         'import sys; print("x" * 200000); print("private-secret CUDA out of memory", file=sys.stderr); sys.exit(1)'])
        pool.handlers['generation'] = handler
        job = self.runtime.jobs.enqueue('generation', self.word.id, {})
        pool.run_once('gpu')
        result = self.runtime.jobs.get(job.id)
        self.assertEqual(result.status, 'failed')
        self.assertEqual(result.result['error_code'], 'gpu_memory')
        public = self.client.get(f'/api/studio/jobs/{job.id}/logs').text + json.dumps(result.result)
        self.assertNotIn('private-secret', public)
        self.assertIn('GPU memory', public)
        diagnostics = self.root / f'studio/jobs/{job.id}/diagnostics.log'
        self.assertIn('private-secret', diagnostics.read_text())
        self.assertLessEqual(diagnostics.stat().st_size, 131072)
        self.assertEqual(os.stat(diagnostics).st_mode & 0o777, 0o600)

    def test_diagnostic_capture_stops_even_if_a_descendant_keeps_writing(self):
        from studio.diagnostics import ChildDiagnostics
        read_fd, write_fd = os.pipe()
        stream = os.fdopen(read_fd, 'rb')
        release = threading.Event()
        original = os.read
        def read(fd, size):
            if fd == read_fd:
                return b'' if release.is_set() else b'x' * size
            return original(fd, size)
        with patch('studio.diagnostics.os.read', side_effect=read):
            capture = ChildDiagnostics(stream)
            finisher = threading.Thread(target=capture.finish)
            finisher.start()
            try:
                finisher.join(1)
                self.assertFalse(finisher.is_alive(), 'capture must not wait for an endlessly writing descendant')
            finally:
                release.set()
                finisher.join(3)
                os.close(write_fd)
