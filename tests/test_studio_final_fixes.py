import tempfile
import json
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

from studio.models import SampleQuery, ValidationError
from studio.runtime import StudioRuntime
import test_studio_migration as legacy_tests


def augmentation_fixture(root):
    for name in ('mit_rirs_16k', 'audioset_16k', 'fma_16k', 'chime_16k'):
        path = root / 'training_datasets' / name
        path.mkdir(parents=True, exist_ok=True)
        (path / 'fixture.wav').write_bytes(legacy_tests.wav())


class AugmentationTests(unittest.TestCase):
    def test_corpus_retention_does_not_hold_metadata_write_lock(self):
        from studio.db import Store
        from studio import augmentation
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            augmentation_fixture(root)
            runtime = StudioRuntime(root)
            self.addCleanup(runtime.shutdown)
            word = runtime.workspaces.create('Robot', 'en', 'robot')
            runtime.datasets.select(word.id, [])
            observer = Store.open(root)
            self.addCleanup(observer.close)
            original = augmentation.snapshot
            def retain(store, selected_ids=None):
                with observer.transaction() as db:
                    db.execute('SELECT 1')
                return original(store, selected_ids)
            with patch.object(augmentation, 'snapshot', side_effect=retain):
                self.assertEqual(len(runtime.training.snapshot(word.id, 'a' * 32).augmentation), 4)

    def test_snapshot_pins_backgrounds_separately_and_replacement_changes_fingerprint(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            augmentation_fixture(root)
            runtime = StudioRuntime(root)
            self.addCleanup(runtime.shutdown)
            word = runtime.workspaces.create('Robot', 'en', 'robot')
            runtime.datasets.select(word.id, [])
            first = runtime.training.snapshot(word.id, 'a' * 32)
            self.assertEqual(len(first.augmentation), 4)
            self.assertEqual(first.datasets, ())
            retained = Path(first.augmentation[0].path) / 'fixture.wav'
            original = retained.read_bytes()
            (root / 'training_datasets' / first.augmentation[0].id / 'fixture.wav').write_bytes(b'replaced')
            second = runtime.training.snapshot(word.id, 'b' * 32)
            self.assertNotEqual(first.fingerprint, second.fingerprint)
            self.assertEqual(retained.read_bytes(), original)
            self.assertEqual(runtime.training.get_manifest(word.id, first.run_id), first)

    def test_missing_augmentation_fails_before_manifest_commit_with_setup_instructions(self):
        with tempfile.TemporaryDirectory() as directory:
            runtime = StudioRuntime(Path(directory))
            self.addCleanup(runtime.shutdown)
            word = runtime.workspaces.create('Robot', 'en', 'robot')
            with self.assertRaisesRegex(ValidationError, 'setup_mit_audio'):
                runtime.training.snapshot(word.id, 'a' * 32)
            self.assertEqual(runtime.training.store._connection.execute('SELECT count(*) FROM training_runs').fetchone()[0], 0)


class MigrationBoundaryTests(unittest.TestCase):
    setUp = legacy_tests.MigrationTests.setUp
    tearDown = legacy_tests.MigrationTests.tearDown
    selection = legacy_tests.MigrationTests.selection
    def test_import_is_not_a_training_success_or_automatic_publication(self):
        self.runtime.migration.import_into(self.word.id, self.selection())
        version = self.runtime.training.versions(self.word.id).items[0]
        self.runtime.deployment.reconcile()
        with self.runtime.training.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM deployment_events').fetchone()[0], 0)
            self.assertEqual(db.execute('SELECT count(*) FROM deployment_intents').fetchone()[0], 0)
        self.assertIsNone(self.runtime.training.successful_version(version.run_id))
        with self.assertRaisesRegex(ValidationError, 'validat'):
            self.runtime.deployment.publish(version.id)
        self.assertTrue(b''.join(self.runtime.deployment.archive(version.id, self.word.id)))

    def test_explicit_legacy_publication_uses_engine_validator_and_never_auto_replaces_desired(self):
        import os
        import sys
        interpreter = self.root / '.venv/bin/python'
        interpreter.parent.mkdir(parents=True)
        interpreter.symlink_to(sys.executable)
        engine = self.root / 'tensorflow.py'
        engine.write_text('''from pathlib import Path
class Interpreter:
    def __init__(self, model_path, **kwargs): self.path = Path(model_path)
    def allocate_tensors(self):
        if self.path.read_bytes() != b'engine-approved': raise ValueError('corrupt')
    def get_input_details(self): return [{}]
    def get_output_details(self): return [{}]
class lite: pass
lite.Interpreter = Interpreter
''')
        self.runtime.migration.import_into(self.word.id, self.selection())
        corrupt = self.runtime.training.versions(self.word.id).items[0]
        with patch.dict(os.environ, {'PYTHONPATH': str(self.root)}):
            with self.assertRaisesRegex(ValidationError, 'validation'):
                self.runtime.deployment.publish(corrupt.id)
            (self.models / 'unknown.tflite').write_bytes(b'engine-approved')
            self.runtime.migration.import_into(self.word.id, self.selection())
            chosen = self.runtime.training.versions(self.word.id).items[0]
            self.runtime.deployment.publish(chosen.id)
        (self.models / 'unknown.tflite').write_bytes(b'older-corrupt-history')
        self.runtime.migration.import_into(self.word.id, self.selection())
        self.runtime.deployment.reconcile()
        with self.runtime.training.store.transaction() as db:
            self.assertEqual(db.execute('SELECT version_id FROM deployment_intents').fetchone()[0], chosen.id)
            self.assertEqual(db.execute('SELECT count(*) FROM deployment_events').fetchone()[0], 0)
        self.assertEqual(self.runtime.deployment.version(chosen.id).validation_state, 'validated')

    def test_legacy_manifest_endpoint_is_readable(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from studio.api import create_router
        self.runtime.migration.import_into(self.word.id, self.selection())
        version = self.runtime.training.versions(self.word.id).items[0]
        with self.runtime.training.store.transaction() as db:
            historical = json.loads(db.execute('SELECT manifest FROM training_runs WHERE id=?', (version.run_id,)).fetchone()[0])
            historical.pop('kind', None)
            historical['run_id'] = 'legacy-before-fix'
            db.execute('INSERT INTO training_runs VALUES (?,?,?)', ('legacy-before-fix', self.word.id, json.dumps(historical)))
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        with TestClient(app) as client:
            response = client.get(f'/api/studio/wakewords/{self.word.id}/training/runs/{version.run_id}')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['kind'], 'legacy')
            self.assertEqual(response.json()['legacy_identity'], 'unknown')
            old_response = client.get(f'/api/studio/wakewords/{self.word.id}/training/runs/legacy-before-fix')
            self.assertEqual(old_response.status_code, 200)
            self.assertEqual(old_response.json()['kind'], 'legacy')

    def test_incompatible_legacy_metadata_remains_downloadable_but_not_publishable(self):
        (self.models / 'unknown.json').write_text('{"type":"unsupported","wake_word":"unknown phrase"}')
        self.runtime.migration.import_into(self.word.id, self.selection())
        version = self.runtime.training.versions(self.word.id).items[0]
        self.assertTrue(b''.join(self.runtime.deployment.archive(version.id, self.word.id)))
        with self.assertRaises(ValidationError):
            self.runtime.deployment.publish(version.id)

    def test_interrupted_import_resumes_without_duplicate_sources(self):
        original = self.runtime.migration._import_audio
        calls = []
        def fail_second(*args, **kwargs):
            calls.append(1)
            if len(calls) == 2:
                raise ValidationError('conversion failed')
            return original(*args, **kwargs)
        with patch.object(self.runtime.migration, '_import_audio', side_effect=fail_second):
            with self.assertRaisesRegex(ValidationError, 'conversion failed'):
                self.runtime.migration.import_into(self.word.id, self.selection())
        self.assertEqual(self.runtime.samples.list(self.word.id, SampleQuery()).total, 1)
        self.runtime.migration.import_into(self.word.id, self.selection())
        self.assertEqual(self.runtime.samples.list(self.word.id, SampleQuery()).total, 3)
        self.assertEqual(self.runtime.training.versions(self.word.id).total, 1)

    def test_interrupted_model_import_and_concurrent_retry_do_not_duplicate(self):
        (self.models / 'second.tflite').write_bytes(b'corrupt second')
        selection = self.selection()
        selection.model_assignments['second'] = self.word.id
        original = self.runtime.migration._import_model
        calls = []
        def fail_second(*args, **kwargs):
            calls.append(1)
            if len(calls) == 2:
                raise ValidationError('interrupted')
            return original(*args, **kwargs)
        with patch.object(self.runtime.migration, '_import_model', side_effect=fail_second):
            with self.assertRaises(ValidationError):
                self.runtime.migration.import_into(self.word.id, selection)
        with self.runtime.training.store.transaction() as db:
            db.execute('DELETE FROM migration_source_claims')
        second = StudioRuntime(self.root)
        self.addCleanup(second.shutdown)
        services = [self.runtime.migration, second.migration]
        with ThreadPoolExecutor(max_workers=2) as pool:
            reports = list(pool.map(lambda service: service.import_into(self.word.id, selection), services))
        self.assertEqual(self.runtime.samples.list(self.word.id, SampleQuery()).total, 3)
        self.assertEqual(self.runtime.training.versions(self.word.id).total, 2)
        self.assertEqual(sum(report.imported_models for report in reports), 1)

    def test_admission_and_source_claim_roll_back_together(self):
        original = self.runtime.samples._new_sample
        def fail_after_admission(*args, **kwargs):
            original(*args, **kwargs)
            raise ValidationError('before claim commit')
        with patch.object(self.runtime.samples, '_new_sample', side_effect=fail_after_admission):
            with self.assertRaises(ValidationError):
                self.runtime.migration.import_into(self.word.id, self.selection())
        with self.runtime.training.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM samples').fetchone()[0], 0)
            self.assertEqual(db.execute('SELECT count(*) FROM migration_source_claims').fetchone()[0], 0)
        self.runtime.migration.import_into(self.word.id, self.selection())
        self.assertEqual(self.runtime.samples.list(self.word.id, SampleQuery()).total, 3)

    def test_pre_claim_upgrade_resumes_using_existing_path_and_original_content_provenance(self):
        original = self.runtime.migration._import_audio
        calls = []
        def fail_second(*args, **kwargs):
            calls.append(1)
            if len(calls) == 2:
                raise ValidationError('interrupted old inventory')
            return original(*args, **kwargs)
        with patch.object(self.runtime.migration, '_import_audio', side_effect=fail_second):
            with self.assertRaises(ValidationError):
                self.runtime.migration.import_into(self.word.id, self.selection())
        # A v11 partial inventory has provenance but no v12 source claim.
        with self.runtime.training.store.transaction() as db:
            db.execute('DELETE FROM migration_source_claims')
        self.runtime.migration.import_into(self.word.id, self.selection())
        self.assertEqual(self.runtime.samples.list(self.word.id, SampleQuery()).total, 3)
