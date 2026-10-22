"""Model versions imported by the retired legacy migration must stay safe to deploy.

The importer is gone, so `insert_legacy_version` writes the same rows and files it
used to (studio/migration.py `_import_model`, removed in 2026-10).
"""
import hashlib
import json
import os
import sys
import tempfile
import unittest
from dataclasses import asdict
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

from studio.models import ModelVersion, ValidationError
from studio.runtime import StudioRuntime


def insert_legacy_version(runtime, word, weights: bytes, metadata: dict | None = None) -> str:
    version_id, run_id, now = uuid4().hex, uuid4().hex, '2026-01-01T00:00:00+00:00'
    destination = runtime.training.store.root / 'models' / word.id / version_id
    destination.mkdir(parents=True)
    (destination / f'{word.model_id}.tflite').write_bytes(weights)
    data = dict(metadata or {})
    data.update({'type': data.get('type', 'micro'), 'model': f'{word.model_id}.tflite', 'wake_word': word.phrase})
    (destination / f'{word.model_id}.json').write_text(json.dumps(data, sort_keys=True))
    run = {'schema_version': 1, 'run_id': run_id, 'word_id': word.id, 'model_id': word.model_id, 'phrase': word.phrase,
           'language': word.language, 'audio': [], 'datasets': [], 'selected_batches': [], 'fingerprint': 'f' * 64,
           'created_at': now, 'legacy_identity': 'unknown', 'kind': 'legacy'}
    (destination / 'run-manifest.json').write_text(json.dumps(run, sort_keys=True))
    checksums = {path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in destination.iterdir()}
    version = ModelVersion(version_id, word.id, word.model_id, run_id, now, str(destination), 'f' * 64, checksums,
                           {'source': 'legacy'}, 'legacy', 'unvalidated')
    with runtime.training.store.transaction() as db:
        db.execute("INSERT INTO studio_jobs(id,kind,word_id,resource,payload,status,created_at,started_at,finished_at,result) "
                   "VALUES (?,?,?,?,?,'complete',?,?,?,?)",
                   (run_id, 'legacy_import', word.id, 'gpu', '{}', now, now, now, json.dumps({'legacy': True, 'validation': 'unvalidated'})))
        db.execute('INSERT INTO training_runs VALUES (?,?,?)', (run_id, word.id, json.dumps(run, sort_keys=True)))
        db.execute('INSERT INTO model_versions VALUES (?,?,?,?)', (version_id, word.id, run_id, json.dumps(asdict(version), sort_keys=True)))
        db.execute('INSERT INTO migration_model_provenance VALUES (?,?,?)', (version_id, 'trained_wake_words/unknown.tflite', 'f' * 64))
    return version_id


class LegacyVersionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.runtime = StudioRuntime(self.root)
        self.word = self.runtime.workspaces.create('Hello legacy', 'en', 'hello_legacy')

    def tearDown(self):
        self.runtime.shutdown()
        self.temp.cleanup()

    def test_import_is_not_a_training_success_or_automatic_publication(self):
        version_id = insert_legacy_version(self.runtime, self.word, b'TFL3legacy')
        version = self.runtime.training.versions(self.word.id).items[0]
        self.assertEqual(version.id, version_id)
        self.runtime.deployment.reconcile()
        with self.runtime.training.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM deployment_events').fetchone()[0], 0)
            self.assertEqual(db.execute('SELECT count(*) FROM deployment_intents').fetchone()[0], 0)
        self.assertIsNone(self.runtime.training.successful_version(version.run_id))
        with self.assertRaisesRegex(ValidationError, 'validat'):
            self.runtime.deployment.publish(version.id)
        self.assertTrue(b''.join(self.runtime.deployment.archive(version.id, self.word.id)))

    def test_explicit_legacy_publication_uses_engine_validator(self):
        interpreter = self.root / '.venv/bin/python'
        interpreter.parent.mkdir(parents=True)
        interpreter.symlink_to(sys.executable)
        (self.root / 'tensorflow.py').write_text('''from pathlib import Path
class Interpreter:
    def __init__(self, model_path, **kwargs): self.path = Path(model_path)
    def allocate_tensors(self):
        if self.path.read_bytes() != b'engine-approved': raise ValueError('corrupt')
    def get_input_details(self): return [{}]
    def get_output_details(self): return [{}]
class lite: pass
lite.Interpreter = Interpreter
''')
        corrupt = insert_legacy_version(self.runtime, self.word, b'TFL3legacy')
        approved = insert_legacy_version(self.runtime, self.word, b'engine-approved')
        with patch.dict(os.environ, {'PYTHONPATH': str(self.root)}):
            with self.assertRaisesRegex(ValidationError, 'validation'):
                self.runtime.deployment.publish(corrupt)
            self.runtime.deployment.publish(approved)
        insert_legacy_version(self.runtime, self.word, b'older-corrupt-history')
        self.runtime.deployment.reconcile()
        with self.runtime.training.store.transaction() as db:
            self.assertEqual(db.execute('SELECT version_id FROM deployment_intents').fetchone()[0], approved)
            self.assertEqual(db.execute('SELECT count(*) FROM deployment_events').fetchone()[0], 0)
        self.assertEqual(self.runtime.deployment.version(approved).validation_state, 'validated')

    def test_incompatible_legacy_metadata_remains_downloadable_but_not_publishable(self):
        version_id = insert_legacy_version(self.runtime, self.word, b'TFL3legacy', {'type': 'unsupported'})
        self.assertTrue(b''.join(self.runtime.deployment.archive(version_id, self.word.id)))
        with self.assertRaises(ValidationError):
            self.runtime.deployment.publish(version_id)


if __name__ == '__main__':
    unittest.main()
