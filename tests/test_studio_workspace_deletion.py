import io
import json
import tempfile
import unittest
import wave
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from uuid import uuid4

from studio.models import Conflict, DiagnosticClip, NotFound
from studio.runtime import StudioRuntime


def wav(value=0):
    output = io.BytesIO()
    with wave.open(output, 'wb') as audio:
        audio.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
        audio.writeframes(int(value).to_bytes(2, 'little') * 16000)
    return io.BytesIO(output.getvalue())


class WorkspaceDeletionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.runtime = StudioRuntime(Path(self.temp.name))
        self.addCleanup(self.runtime.shutdown)
        self.words = self.runtime.workspaces
        self.word = self.words.create('Delete me', 'en', 'delete_me')
        self.other = self.words.create('Keep me', 'en', 'keep_me')
        self.store = self.runtime._store

    def job(self, status='complete'):
        job_id = uuid4().hex
        with self.store.transaction() as db:
            db.execute("INSERT INTO studio_jobs(id,kind,word_id,resource,payload,status,created_at) VALUES (?,'train',?,'gpu','{}',?,'now')",
                       (job_id, self.word.id, status))
        return job_id

    def test_active_jobs_block_without_removing_anything(self):
        for status in ('queued', 'running', 'cancelling'):
            job_id = self.job(status)
            with self.assertRaises(Conflict):
                self.words.delete(self.word.id)
            self.assertEqual(self.words.get(self.word.id), self.word)
            with self.store.transaction() as db:
                db.execute("UPDATE studio_jobs SET status='cancelled' WHERE id=?", (job_id,))
        self.words.delete(self.word.id)
        with self.assertRaises(NotFound):
            self.words.get(self.word.id)

    def test_failed_deletion_does_not_tombstone_surviving_recordings_after_restart(self):
        from unittest.mock import patch
        clip = DiagnosticClip('clip-rollback', None, 'Delete me', 'mww', False, {}, {})
        original = self.runtime.samples.ingest('device', clip, wav(1), self.word.id)
        with patch('studio.workspace_deletion._audio_gc', side_effect=RuntimeError('rollback')):
            with self.assertRaises(RuntimeError):
                self.words.delete(self.word.id)
        self.assertEqual(self.runtime.samples.ingest('device', clip, wav(1), self.word.id).id, original.id)
        self.runtime.shutdown()
        self.runtime.startup()
        self.assertEqual(self.runtime.samples.ingest('device', clip, wav(1), self.word.id).id, original.id)

    def test_audio_lineage_scoped_gc_preserves_shared_and_unrelated_blobs(self):
        samples = self.runtime.samples
        owned = samples.import_audio(self.word.id, 'positive', wav(1))
        trimmed = samples.trim(owned.id, 0, .5, 0)
        # A blob shared through a distinct audio record must survive.
        shared = samples.import_audio(self.word.id, 'negative', wav(2))
        survivor = samples.import_audio(self.other.id, 'positive', wav(2))
        unrelated = self.runtime.blobs.put(io.BytesIO(b'unrelated orphan'))
        self.words.delete(self.word.id)
        self.assertTrue(samples.audio(survivor.id, self.other.id))
        self.assertEqual(self.runtime.blobs.read(unrelated.sha256), b'unrelated orphan')
        self.assertTrue((self.runtime.blobs.root / shared.normalized_hash).exists())
        for digest in (owned.original_hash, owned.normalized_hash, trimmed.normalized_hash):
            self.assertFalse((self.runtime.blobs.root / digest).exists())
        with self.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 1)
            self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(), [])

    def test_blob_gc_waits_for_inflight_same_content_import_reference(self):
        from unittest.mock import patch
        samples = self.runtime.samples
        owned = samples.import_audio(self.word.id, 'positive', wav(1))
        prepared, release, deleted = threading.Event(), threading.Event(), threading.Event()
        prepare = samples._prepare

        def pause(audio):
            result = prepare(audio)
            prepared.set()
            if not release.wait(3):
                raise RuntimeError('test writer was not released')
            return result

        def remove():
            self.words.delete(self.word.id)
            deleted.set()

        with ThreadPoolExecutor(max_workers=2) as pool, patch.object(samples, '_prepare', side_effect=pause):
            writer = pool.submit(samples.import_audio, self.other.id, 'positive', wav(1))
            self.assertTrue(prepared.wait(3))
            deletion = pool.submit(remove)
            try:
                self.assertFalse(deleted.wait(.05), 'GC must not remove a blob awaiting its metadata commit')
            finally:
                release.set()
                survivor = writer.result(timeout=3)
                deletion.result(timeout=3)
        self.assertEqual(survivor.normalized_hash, owned.normalized_hash)
        self.assertTrue(samples.audio(survivor.id, self.other.id))

    def test_all_metadata_and_owned_files_removed_without_trusting_archive_paths(self):
        sample = self.runtime.samples.import_audio(self.word.id, 'positive', wav(3))
        job_id = self.job()
        version_id = uuid4().hex
        outsider = Path(self.temp.name) / 'kiosk-deployed'
        outsider.mkdir()
        (outsider / 'model.tflite').write_bytes(b'deployed')
        for category, identity in (('jobs', job_id), ('runs', job_id), ('models', self.word.id)):
            directory = self.store.root / category / identity
            directory.mkdir(parents=True)
            (directory / 'owned').write_bytes(b'owned')
            (directory / 'escape').symlink_to(outsider, target_is_directory=True)
        with self.store.transaction() as db:
            db.execute("INSERT INTO devices(id,url,role) VALUES ('device','http://kiosk','standalone')")
            db.execute("INSERT INTO source_mappings VALUES ('device','micro','Delete me',?)", (self.word.id,))
            db.execute("INSERT INTO training_runs VALUES (?,?, '{}')", (job_id, self.word.id))
            db.execute('INSERT INTO model_versions VALUES (?,?,?,?)', (version_id, self.word.id, job_id, json.dumps({'path': str(outsider)})))
            db.execute('INSERT INTO deployment_events VALUES (?,1)', (version_id,))
            db.execute('INSERT INTO deployment_intents VALUES (?,?,1)', (self.word.id, version_id))
            db.execute("INSERT INTO publications(word_id,device_id,desired_version,revision,state,updated_at) VALUES (?,'device',?,1,'published','now')", (self.word.id, version_id))
            db.execute("INSERT INTO publication_history(word_id,record) VALUES (?,'{}')", (self.word.id,))
            db.execute("INSERT INTO deployment_staging VALUES ('device',?,'[\"delete_me.tflite\"]',1)", (self.word.id,))
            db.execute("INSERT INTO migration_imports VALUES ('fp',?,'now','{}')", (self.word.id,))
            db.execute("INSERT INTO migration_sample_provenance VALUES (?,'legacy','old.wav','fp')", (sample.id,))
            db.execute("INSERT INTO migration_model_provenance VALUES (?,'old-model','fp')", (version_id,))
            db.execute("INSERT INTO migration_source_claims VALUES (?,'old.wav','hash',?)", (self.word.id, sample.id))
            db.execute("INSERT INTO legacy_model_validations VALUES (?,'now')", (version_id,))
            db.execute("INSERT INTO training_settings VALUES (?,'{}')", (self.word.id,))
            db.execute("INSERT INTO generation_recipes VALUES (?,'{}')", (self.word.id,))
            db.execute("INSERT INTO generation_batches VALUES (?,?,'Delete me','{}','now')", (job_id, self.word.id))
            db.execute('INSERT INTO generation_batch_audio VALUES (?,0,?)', (job_id, sample.audio_id))
            db.execute('INSERT INTO generation_selection VALUES (?,?)', (self.word.id, job_id))
            db.execute("INSERT INTO studio_dataset_installations VALUES ('shared','fp','{}')")
            db.execute("INSERT INTO studio_dataset_selections VALUES (?,'shared')", (self.word.id,))
            db.execute("INSERT INTO studio_dataset_selections VALUES (?,'shared')", (self.other.id,))
            db.execute("INSERT INTO studio_schedules VALUES (?,'0 2 * * *','UTC',1,'now')", ('train:' + self.word.id,))
            db.execute("INSERT INTO studio_schedule_occurrences VALUES (?,'now',?)", ('train:' + self.word.id, job_id))
        self.words.delete(self.word.id)
        for category, identity in (('jobs', job_id), ('runs', job_id), ('models', self.word.id)):
            self.assertFalse((self.store.root / category / identity).exists())
        self.assertEqual((outsider / 'model.tflite').read_bytes(), b'deployed')
        with self.store.transaction() as db:
            self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(), [])
            self.assertEqual(db.execute('SELECT count(*) FROM wakewords').fetchone()[0], 1)
            self.assertEqual(db.execute('SELECT count(*) FROM studio_dataset_installations').fetchone()[0], 1)
            self.assertEqual(db.execute('SELECT count(*) FROM studio_dataset_selections').fetchone()[0], 1)
            self.assertEqual(db.execute('SELECT reason FROM deployment_staging_blocks').fetchone()[0], 'workspace_deleted')

    def test_diagnostic_source_tombstone_retained_without_audio(self):
        from studio.collection import CollectionService
        clip = DiagnosticClip(id='clip', phrase='Delete me', engine='micro', near_miss=False, scores={}, metadata={})
        recording = self.runtime.samples.ingest('device', clip, wav(4), self.word.id)
        self.words.delete(self.word.id)
        self.assertTrue(CollectionService(self.store, self.runtime.samples, self.runtime.devices)._seen('device', 'clip'))
        with self.store.transaction() as db:
            self.assertIsNone(db.execute('SELECT 1 FROM recordings WHERE id=?', (recording.id,)).fetchone())
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 0)

    def test_inflight_collection_cannot_reimport_deleted_source_as_unmapped(self):
        clip = DiagnosticClip(id='clip', phrase='Delete me', engine='micro', near_miss=False, scores={}, metadata={})
        self.runtime.samples.ingest('device', clip, wav(4), self.word.id)
        self.words.delete(self.word.id)
        with self.assertRaises(Conflict):
            self.runtime.samples.ingest('device', clip, wav(4), None)
        with self.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM recordings').fetchone()[0], 0)

    def test_conflicting_recording_original_and_normalized_orphans_are_collected(self):
        import hashlib
        clip = DiagnosticClip(id='clip', phrase='Delete me', engine='micro', near_miss=False, scores={}, metadata={})
        self.runtime.samples.ingest('device', clip, wav(1), self.word.id)
        normalized = wav(2).getvalue()
        conflicting = normalized + b'ignored container metadata'
        self.runtime.samples.ingest('device', clip, io.BytesIO(conflicting), self.word.id)
        original_hash = hashlib.sha256(conflicting).hexdigest()
        normalized_hash = hashlib.sha256(normalized).hexdigest()
        self.assertNotEqual(original_hash, normalized_hash)
        self.assertTrue((self.runtime.blobs.root / normalized_hash).exists())
        self.words.delete(self.word.id)
        self.assertFalse((self.runtime.blobs.root / original_hash).exists())
        self.assertFalse((self.runtime.blobs.root / normalized_hash).exists())

    def test_interrupted_physical_cleanup_is_retried_at_startup(self):
        from unittest.mock import patch
        sample = self.runtime.samples.import_audio(self.word.id, 'positive', wav(5))
        directory = self.store.root / 'models' / self.word.id
        directory.mkdir(parents=True)
        (directory / 'owned').write_bytes(b'owned')
        with patch('studio.workspace_deletion._remove_tree', side_effect=OSError('interrupted')):
            with self.assertRaises(OSError):
                self.words.delete(self.word.id)
        self.runtime.shutdown()
        self.runtime.startup()
        self.assertFalse(directory.exists())
        self.assertFalse((self.runtime.blobs.root / sample.normalized_hash).exists())
        self.assertEqual(self.runtime.workspaces.get(self.other.id), self.other)

    def test_deletion_waits_for_publication_intent_gate(self):
        import threading
        from studio.deployment import DeploymentService
        started, done = threading.Event(), threading.Event()
        errors = []
        def delete():
            started.set()
            try:
                self.words.delete(self.word.id)
            except Exception as exc:
                errors.append(exc)
            finally:
                done.set()
        with DeploymentService(self.store, None, None)._lock('intent'):
            thread = threading.Thread(target=delete)
            thread.start()
            self.assertTrue(started.wait(1))
            self.assertFalse(done.wait(.05))
            self.assertEqual(self.words.get(self.word.id), self.word)
        thread.join(2)
        self.assertTrue(done.is_set())
        self.assertEqual(errors, [])

    def test_symlinked_storage_parent_is_rejected_before_database_changes(self):
        from studio.models import ValidationError
        outside = Path(self.temp.name) / 'outside'
        outside.mkdir()
        (outside / 'keep').write_bytes(b'keep')
        (self.store.root / 'models').symlink_to(outside, target_is_directory=True)
        with self.assertRaises(ValidationError):
            self.words.delete(self.word.id)
        self.assertEqual(self.words.get(self.word.id), self.word)
        self.assertEqual((outside / 'keep').read_bytes(), b'keep')

    def test_surviving_training_manifest_retains_referenced_audio_and_ancestors(self):
        original = self.runtime.samples.import_audio(self.word.id, 'positive', wav(6))
        trimmed = self.runtime.samples.trim(original.id, 0, .5, 0)
        # Retained snapshots are immutable references even without SQL audio FKs.
        with self.store.transaction() as db:
            db.execute('INSERT INTO training_runs VALUES (?,?,?)', (uuid4().hex, self.other.id, json.dumps({'audio': [{'audio_id': trimmed.audio_id}]})))
        self.words.delete(self.word.id)
        self.assertTrue(self.runtime.blobs.read(original.normalized_hash))
        self.assertTrue(self.runtime.blobs.read(trimmed.normalized_hash))
        with self.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 2)
            self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(), [])

    def test_publication_validation_is_also_inside_deletion_gate(self):
        import threading
        from unittest.mock import patch
        entered, release, deleted = threading.Event(), threading.Event(), threading.Event()
        errors = []
        def version(_):
            entered.set()
            release.wait(2)
            raise NotFound('No version')
        def publish():
            try:
                self.runtime.deployment.publish('version')
            except NotFound:
                pass
        def delete():
            try:
                self.words.delete(self.word.id)
            except Exception as exc:
                errors.append(exc)
            finally:
                deleted.set()
        with patch.object(self.runtime.deployment, 'version', side_effect=version):
            publisher = threading.Thread(target=publish)
            publisher.start()
            self.assertTrue(entered.wait(1))
            deleter = threading.Thread(target=delete)
            deleter.start()
            try:
                self.assertFalse(deleted.wait(.05))
            finally:
                release.set()
                publisher.join(2)
                deleter.join(2)
        self.assertTrue(deleted.is_set())
        self.assertEqual(errors, [])
