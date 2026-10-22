import json
import os
import tempfile
import unittest
import zipfile
import subprocess
import sys
from dataclasses import asdict
from pathlib import Path
from unittest.mock import patch

from studio.db import Store
from studio.jobs import JobQueue, WorkerPool
from studio.models import Conflict, NotFound, ValidationError
from studio.workspaces import WorkspaceService
from studio.datasets import DatasetService, mww_dataset_features
from studio_harness import api_client


class DatasetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.store = Store.open(self.root)
        self.jobs = JobQueue(self.store)
        self.words = WorkspaceService(self.store)
        self.a = self.words.create('hello a', 'en', 'a').id
        self.b = self.words.create('hello b', 'en', 'b').id
        self.service = DatasetService(self.store, self.jobs)

    def tearDown(self):
        self.jobs.abandon()
        self.store.close()
        self.temp.cleanup()

    def archive(self, name='speech/training/a.ninja', content=b'fixture'):
        path = self.root / 'fixture.zip'
        with zipfile.ZipFile(path, 'w') as archive:
            archive.writestr(name, content)
        return path

    def install(self, dataset='speech', content=b'fixture'):
        archive = self.archive(f'{dataset}/training/a.ninja', content)
        return self.service.install_archive(dataset, archive)

    def test_real_catalog_and_evaluation_split(self):
        rows = {row.id: row for row in self.service.list(self.a).items}
        self.assertEqual(set(rows), {'speech', 'dinner_party', 'no_speech', 'dinner_party_eval'})
        self.assertEqual(rows['dinner_party_eval'].split, 'evaluation')
        self.assertTrue(all(row.representation == 'features' for row in rows.values()))
        self.assertTrue(all(row.purpose == 'classifier_negative' for row in rows.values()))
        self.assertNotIn('wham', json.dumps([asdict(row) for row in rows.values()]).lower())

    def test_default_selection_and_explicit_empty_survive_restart(self):
        self.assertEqual(self.service.list(self.a, status='selected').total, 4)
        self.service.select(self.a, [])
        self.assertEqual(self.service.snapshot(self.a), [])
        self.assertEqual(DatasetService(self.store, self.jobs).list(self.a, status='selected').total, 0)
        self.assertEqual(self.service.list(self.b, status='selected').total, 4)
        self.store.close()
        self.store = Store.open(self.root)
        self.jobs = JobQueue(self.store)
        self.service = DatasetService(self.store, self.jobs)
        self.assertEqual(self.service.list(self.a, status='selected').total, 0)
        self.assertEqual(self.service.list(self.b, status='selected').total, 4)

    def test_installed_sample_count_uses_ragged_metadata_not_shard_files(self):
        import struct
        archive = self.root / 'features.zip'
        with zipfile.ZipFile(archive, 'w') as handle:
            for split, count in [('training', 123), ('validation', 7)]:
                handle.writestr(f'speech/{split}/type.ninja', 'ragged')
                handle.writestr(f'speech/{split}/starts/shape.ninja', struct.pack('<Q', count))
                handle.writestr(f'speech/{split}/starts/data.ninja', b'\0' * count * 8)
        self.service.install_archive('speech', archive)
        self.assertEqual(self.service.list(self.a, search='speech').items[-1].sample_count, 130)
        self.install('no_speech')
        row = next(row for row in self.service.list(self.a).items if row.id == 'no_speech')
        self.assertIsNone(row.sample_count)

    def test_registry_scales_searches_and_paginates_200_entries(self):
        base = json.loads(Path('studio/dataset_catalog.json').read_text())[0]
        catalog = [dict(base, id=f'dataset_{i:03}', name=f'Corpus {i:03}') for i in range(200)]
        service = DatasetService(self.store, self.jobs, catalog=catalog)
        pages = [service.list(self.a, offset=i, limit=50) for i in range(0, 200, 50)]
        self.assertTrue(all(page.total == 200 for page in pages))
        self.assertEqual(len({row.id for page in pages for row in page.items}), 200)
        self.assertEqual(service.list(self.a, search='Corpus 199').items[0].id, 'dataset_199')
        self.assertEqual(service.list(self.a, status='installed').total, 0)

    def test_shared_install_per_word_selection_restart_and_pinned_snapshots(self):
        self.install()
        self.service.select(self.a, ['speech'])
        self.service.select(self.b, [])
        old = self.service.snapshot(self.a)
        self.assertEqual(self.service.snapshot(self.b), [])
        self.assertEqual(self.service.list(self.b, status='installed').total, 1)
        self.assertFalse(self.service.list(self.b, search='speech').items[0].selected)
        self.install(content=b'new version')
        new = self.service.snapshot(self.a)
        self.assertNotEqual(old[0].fingerprint, new[0].fingerprint)
        self.assertEqual((Path(old[0].path) / 'training/a.ninja').read_bytes(), b'fixture')
        self.service.select(self.a, [])
        self.assertEqual(self.service.snapshot(self.a), [])
        self.assertTrue(Path(old[0].path).is_dir())
        self.assertEqual(DatasetService(self.store, self.jobs).list(self.b, status='installed').total, 1)

    def test_invalid_selection_is_atomic_and_uninstalled_snapshot_fails(self):
        self.service.select(self.a, ['speech'])
        with self.assertRaises(NotFound):
            self.service.select(self.a, ['invalid'])
        with self.assertRaises(Conflict):
            self.service.snapshot(self.a)
        with self.assertRaises(ValidationError):
            self.service.select(self.a, ['speech', 'speech'])
        for kwargs in ({'limit': 101}, {'offset': -1}, {'status': 'imaginary'}):
            with self.assertRaises(ValidationError):
                self.service.list(self.a, **kwargs)
        with self.assertRaises(NotFound):
            self.service.download('../escape')

    def test_retry_download_uses_owned_runner_and_shared_inflight_job(self):
        calls = []
        archive = self.archive()

        class Runner:
            def run(inner, context, argv, cwd=None):
                calls.append(argv)
                if len(calls) == 1:
                    raise RuntimeError('remote secret')
                Path(argv[argv.index('--output') + 1]).write_bytes(archive.read_bytes())

        pool = WorkerPool(self.jobs, runner=Runner())
        pool.register('download', 'download', self.service.execute)
        first = self.service.download('speech')
        self.assertEqual(self.service.download('speech').id, first.id)
        pool.run_once('download')
        self.assertEqual(self.jobs.get(first.id).status, 'failed')
        self.assertEqual(self.service.list(self.a, status='failed').total, 1)
        second = self.service.download('speech')
        self.assertNotEqual(first.id, second.id)
        pool.run_once('download')
        self.assertEqual(self.jobs.get(second.id).status, 'complete')
        self.assertEqual(self.service.list(self.a, status='installed').total, 1)
        self.assertNotIn('secret', self.jobs.log_tail(first.id))
        self.assertIn('speech.zip', calls[1][-1])

    def test_archives_reject_traversal_links_duplicates_and_bad_content(self):
        for name in ('../escape.npy', '/absolute.npy', 'x/../../escape.npy', 'x\\..\\escape.npy'):
            with self.subTest(name=name), self.assertRaises(ValidationError):
                self.service.install_archive('speech', self.archive(name))
        path = self.archive()
        with zipfile.ZipFile(path, 'a') as archive:
            link = zipfile.ZipInfo('link')
            link.create_system = 3
            link.external_attr = 0o120777 << 16
            archive.writestr(link, '/outside')
        with self.assertRaises(ValidationError):
            self.service.install_archive('speech', path)
        with self.assertRaises(ValidationError):
            self.service.install_archive('speech', self.archive('readme.txt'))
        self.assertEqual(self.service.list(self.a, status='installed').total, 0)

    def test_cancel_during_large_member_stops_before_copying_remaining_bytes(self):
        archive = self.archive(content=b'x' * (5 * 1024 * 1024))
        original = zipfile.ZipExtFile.read
        copied = 0

        def read(reader, *args, **kwargs):
            nonlocal copied
            block = original(reader, *args, **kwargs)
            copied += len(block)
            return block

        with patch.object(zipfile.ZipExtFile, 'read', read):
            with self.assertRaisesRegex(Conflict, 'cancelled'):
                self.service.install_archive('speech', archive, cancelled=lambda: copied >= 1024 * 1024)
        self.assertLessEqual(copied, 1024 * 1024)
        self.assertEqual(self.service.list(self.a, status='installed').total, 0)
        self.assertEqual(list((self.store.root / 'datasets/staging').iterdir()), [])

    def test_explicit_mww_inputs_omit_defaults_and_evaluation_is_zero_weight(self):
        self.install()
        self.install('dinner_party_eval')
        self.service.select(self.a, ['speech', 'dinner_party_eval'])
        rows = mww_dataset_features(self.service.snapshot(self.a))
        self.assertEqual(len(rows), 2)
        self.assertEqual([r['sampling_weight'] for r in rows], [0.0, 12.0])
        self.assertEqual(rows[0]['truncation_strategy'], 'split')
        self.assertFalse(any('no_speech' in row['features_dir'] for row in rows))
        self.assertEqual(mww_dataset_features([]), [])

    def test_mww_rejects_incompatible_embeddings_and_raw_audio(self):
        rows = [dict(id='incompatible', path='/selected/train.npy', representation='features',
                     adapter='oww_embeddings_npy', split='train', fingerprint='a' * 64)]
        with self.assertRaisesRegex(ValidationError, 'microWakeWord'):
            mww_dataset_features(rows)
        with self.assertRaises(ValidationError):
            mww_dataset_features([dict(rows[0], representation='audio', adapter='wav')])

    def test_cli_config_replaces_stock_negative_blocks_even_for_empty_selection(self):
        import yaml
        manifest = self.root / 'inputs.json'
        manifest.write_text(json.dumps({'schema_version': 1, 'datasets': []}))
        config = self.root / 'config.yaml'
        result = subprocess.run([sys.executable, 'cli/dataset_config.py', f'--output={config}', f'--work-dir={self.root}',
                                 '--training-steps=10', '--eval-step-interval=5', '--personal-dir=/positive',
                                 f'--dataset-manifest={manifest}'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual([row['features_dir'] for row in yaml.safe_load(config.read_text())['features']], ['/positive'])
        text = Path('cli/wake_word_sample_trainer').read_text()
        self.assertIn('--dataset-manifest', text)
        self.assertIn('dataset_config.py', text)

    def test_real_mww_shell_config_path_accepts_only_selected_installs(self):
        import yaml
        self.install()
        self.service.select(self.a, ['speech'])
        manifest = self.root / 'inputs.json'
        manifest.write_text(json.dumps({'schema_version': 1, 'datasets': [asdict(row) for row in self.service.snapshot(self.a)]}))
        positive_features = self.root / 'work/wake_word_samples_augmented/training/wakeword_mmap'
        positive_features.mkdir(parents=True)
        (positive_features / 'data.ninja').write_bytes(b'positive-feature-fixture')
        (self.root / '.venv/bin').mkdir(parents=True)
        (self.root / '.venv/bin/activate').write_text('')
        stub = self.root / '.venv/bin/nvidia-smi'
        stub.write_text('#!/bin/sh\nexit 1\n')
        stub.chmod(0o700)
        # Execute the real configuration section only, before any ML/environment setup.
        script_path = Path('cli/wake_word_sample_trainer').resolve()
        script = script_path.read_text().split('echo "   Wrote training_parameters.yaml"')[0]
        env = dict(os.environ, DATA_DIR=str(self.root), PATH=str(stub.parent) + ':' + os.environ['PATH'])
        result = subprocess.run(['bash', '-c', script, str(script_path), 'hello', '--dataset-manifest=' + str(manifest)], env=env, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        config = yaml.safe_load((self.root / 'work/trained_models/training_parameters.yaml').read_text())
        negatives = [row for row in config['features'] if row['truth'] is False]
        self.assertEqual(negatives, mww_dataset_features(self.service.snapshot(self.a)))

    def test_api_selection_and_download_routes(self):
        from studio.runtime import StudioRuntime
        runtime = StudioRuntime(self.root)
        try:
            client = api_client(runtime)
            base = f'/api/studio/wakewords/{self.a}/datasets'
            self.assertEqual(client.get(base).json()['total'], 4)
            self.assertEqual(client.put(base, json={'dataset_ids': ['speech']}).status_code, 200)
            self.assertEqual(client.get(base, params={'status': 'selected'}).json()['total'], 1)
            self.assertEqual(client.post('/api/studio/datasets/speech/download').json()['kind'], 'download')
            self.assertEqual(client.put(base, json={'dataset_ids': ['missing']}).status_code, 404)
        finally:
            runtime.shutdown()

    def test_duplicate_archive_members_and_symlink_storage_are_rejected(self):
        import warnings
        path = self.archive()
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', UserWarning)
            with zipfile.ZipFile(path, 'a') as archive:
                archive.writestr('speech/training/a.ninja', b'duplicate')
        with self.assertRaises(ValidationError):
            self.service.install_archive('speech', path)
        (self.store.root / 'datasets/staging').rmdir()
        (self.store.root / 'datasets/staging').symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(ValidationError):
            self.install()

    def test_failed_or_cancelled_install_preserves_previous_version(self):
        old = self.install()
        self.service.select(self.a, ['speech'])
        with self.assertRaises(ValidationError):
            self.service.install_archive('speech', self.archive('../escape'))
        with self.assertRaises(Conflict):
            self.service.install_archive('speech', self.archive(), cancelled=lambda: True)
        self.assertEqual(self.service.snapshot(self.a), [old])

    def test_existing_fingerprint_directory_symlink_is_never_trusted(self):
        value = self.install()
        destination = Path(value.path).parent
        destination.rename(destination.with_name(destination.name + '-saved'))
        destination.symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(ValidationError):
            self.install()

    def test_archive_expansion_limit_is_enforced_before_publication(self):
        with patch('studio.datasets.MAX_EXTRACTED_BYTES', 3):
            with self.assertRaises(ValidationError):
                self.install(content=b'too much data')
        self.assertEqual(self.service.list(self.a, status='installed').total, 0)

    def test_removed_embedding_adapter_cannot_be_installed(self):
        base = json.loads(Path('studio/dataset_catalog.json').read_text())[0]
        service = DatasetService(self.store, self.jobs, catalog=[dict(base, id='oww', adapter='oww_embeddings_npy')])
        with self.assertRaisesRegex(ValidationError, 'supported'):
            service.install_archive('oww', self.archive('oww/features.npy'))

    def test_additive_v5_migration_preserves_words_and_jobs(self):
        import sqlite3
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'studio').mkdir()
            with sqlite3.connect(root / 'studio/studio.sqlite3') as db:
                for filename in ('schema.sql', 'schema_samples.sql', 'schema_devices.sql', 'schema_collection.sql', 'schema_jobs.sql'):
                    db.executescript((Path('studio') / filename).read_text())
                db.execute("INSERT INTO wakewords VALUES ('word','Hello','en','hello','then','then')")
                db.execute('PRAGMA user_version=5')
            store = Store.open(root)
            try:
                self.assertEqual(WorkspaceService(store).get('word').phrase, 'Hello')
                self.assertEqual(DatasetService(store, JobQueue(store)).list('word').total, 4)
                with store.transaction() as db:
                    self.assertEqual(db.execute('PRAGMA user_version').fetchone()[0], 19)
            finally:
                store.close()


if __name__ == '__main__':
    unittest.main()
