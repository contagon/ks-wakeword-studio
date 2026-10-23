import io
import json
import sqlite3
import tempfile
import unittest
import wave
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


from studio.db import Store
from studio.models import Conflict, DiagnosticClip, NotFound, SampleQuery, ValidationError
from studio.runtime import StudioRuntime
from studio.samples import SampleService
from studio.storage import BlobStore
from studio.workspaces import WorkspaceService
from studio_harness import api_client, wav


class SampleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.store = Store.open(self.root)
        self.addCleanup(lambda: self.store.close())
        self.blobs = BlobStore(self.store.root / 'blobs')
        self.service = SampleService(self.store, self.blobs)
        self.words = WorkspaceService(self.store)
        self.word = self.words.create('Hello', 'en', 'hello')
        self.other = self.words.create('Other', 'en', 'other')

    def ingest(self, device='a', clip='1', content=None, word=True):
        return self.service.ingest(device, DiagnosticClip(
            id=clip, timestamp='2026-10-17T10:00:00+00:00', phrase='Hello',
            engine='mww', near_miss=True, scores={'score': 0.3}, metadata={'duration': 1}),
            io.BytesIO(content or wav()), self.word.id if word else None)

    def test_audio_conversion_never_holds_a_write_transaction(self):
        from unittest.mock import patch
        import studio.samples
        original = studio.samples.normalize_audio
        def checked(*args, **kwargs):
            self.assertFalse(self.store._connection.in_transaction, 'ffmpeg ran inside a store transaction')
            return original(*args, **kwargs)
        with patch.object(studio.samples, 'normalize_audio', side_effect=checked) as convert:
            self.ingest()
            self.service.import_audio(self.word.id, 'positive', io.BytesIO(wav()))
            self.service.capture_audio(self.word.id, 'negative', io.BytesIO(wav()), 0, 0.05, 'none')
        self.assertEqual(convert.call_count, 3)

    def test_source_identity_device_scope_and_tombstones(self):
        first = self.ingest()
        self.assertEqual(first.id, self.ingest().id)
        self.assertNotEqual(first.id, self.ingest(device='b').id)
        page = self.service.list(self.word.id, SampleQuery())
        self.assertEqual(page.total, 2)
        sample = next(s for s in page.items if s.recording_id == first.id)
        self.service.set_label(sample.id, 'discarded', 0)
        self.ingest()
        self.assertEqual(self.service.queue(self.word.id, SampleQuery()).total, 1)
        self.service.delete(sample.id, 1)
        self.ingest()
        self.assertEqual(self.service.list(self.word.id, SampleQuery()).total, 1)
        self.assertEqual(self.service.unmapped(SampleQuery()).total, 0)

    def test_conflicting_identity_is_quarantined_without_replacing_original(self):
        first = self.ingest()
        changed = self.ingest(content=wav(300))
        self.assertEqual(changed.id, first.id)
        self.assertTrue(changed.quarantined)
        self.assertEqual(changed.original_hash, first.original_hash)
        self.assertEqual(self.blobs.read(first.original_hash), wav())
        self.assertEqual(self.service.queue(self.word.id, SampleQuery()).total, 0)
        with self.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM recording_conflicts').fetchone()[0], 1)

    def test_unknown_mapping_and_explicit_assignment_are_idempotent(self):
        recording = self.ingest(word=False)
        self.assertEqual(self.service.list(self.word.id, SampleQuery()).total, 0)
        self.assertEqual(self.service.unmapped(SampleQuery()).items[0].id, recording.id)
        sample = self.service.assign(recording.id, self.word.id)
        self.assertEqual(self.service.assign(recording.id, self.word.id), sample)
        with self.assertRaises(Conflict):
            self.service.assign(recording.id, self.other.id)
        self.assertEqual(self.service.unmapped(SampleQuery()).total, 0)

    def test_labels_undo_and_stale_revisions(self):
        self.ingest()
        sample = self.service.queue(self.word.id, SampleQuery()).items[0]
        updated = self.service.set_label(sample.id, 'positive', 0)
        self.assertEqual((updated.label, updated.revision), ('positive', 1))
        with self.assertRaises(Conflict):
            self.service.set_label(sample.id, 'negative', 0)
        undone = self.service.undo(sample.id, 1)
        self.assertEqual((undone.label, undone.revision), ('pending', 2))
        with self.assertRaises(Conflict):
            self.service.undo(sample.id, 1)
        for label in ('skip', 'pending', 'artificial', ''):
            with self.assertRaises(ValidationError):
                self.service.set_label(sample.id, label, 2)

    def test_assigned_queue_exposes_source_diagnostics(self):
        self.ingest()
        sample = self.service.queue(self.word.id, SampleQuery()).items[0]
        self.assertEqual(sample.recording.device_id, 'a')
        self.assertEqual(sample.recording.metadata, {'duration': 1})
        self.assertEqual(sample.recording.scores, {'score': 0.3})
        self.assertTrue(sample.recording.near_miss)
        imported = self.service.import_audio(self.word.id, 'negative', io.BytesIO(wav()))
        self.assertIsNone(imported.recording)

    def test_public_metadata_only_contains_bounded_diagnostic_numbers(self):
        metadata = {'duration': 1.5, 'sample_rate': 16000, 'channels': 1,
                    'duration_ms': -1, 'duration_s': {'token': 'nested-secret'},
                    'frames': 10 ** 100, 'token': 'top-secret',
                    'unknown': {'Authorization': 'Bearer deep-secret'}}
        recording = self.service.ingest('a', DiagnosticClip(id='1', metadata=metadata), io.BytesIO(wav()), None)
        self.assertEqual(recording.metadata, {'duration': 1.5, 'sample_rate': 16000, 'channels': 1})
        with self.store.transaction() as db:
            retained = json.loads(db.execute('SELECT metadata FROM recordings WHERE id=?', (recording.id,)).fetchone()[0])
        self.assertEqual(retained, metadata)
        self.assertEqual(self.service.unmapped(SampleQuery()).items[0].metadata, recording.metadata)

    def test_families_normalization_trim_and_retained_blobs(self):
        sample = self.service.import_audio(self.word.id, 'positive', io.BytesIO(wav(rate=8000, channels=2)))
        duplicate = self.service.import_audio(self.other.id, 'negative', io.BytesIO(wav(rate=8000, channels=2)))
        self.assertEqual(sample.family_id, duplicate.family_id)
        original = self.blobs.read(sample.original_hash)
        with wave.open(io.BytesIO(self.blobs.read(sample.normalized_hash))) as stream:
            self.assertEqual((stream.getframerate(), stream.getnchannels(), stream.getsampwidth()), (16000, 1, 2))
        trimmed = self.service.trim(sample.id, 0.1, 0.7, 0)
        self.assertEqual(trimmed.family_id, sample.family_id)
        self.assertEqual(trimmed.original_hash, sample.original_hash)
        self.assertNotEqual(trimmed.audio_id, sample.audio_id)
        with self.store.transaction() as db:
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute('UPDATE audio_records SET family_id = ? WHERE id = ?', ('bad', sample.audio_id))
        self.service.delete(trimmed.id, 1)
        for digest in (sample.original_hash, sample.normalized_hash, trimmed.normalized_hash):
            self.assertTrue(self.blobs.read(digest))
        self.assertEqual(self.blobs.read(sample.original_hash), original)
        with self.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM sample_history').fetchone()[0], 1)

    def test_library_filters_pagination_and_validation(self):
        self.ingest()
        self.ingest(device='b', clip='kz-2')
        self.service.import_audio(self.word.id, 'negative', io.BytesIO(wav(400)))
        query = SampleQuery(device_id='b', near_miss=True, search='Hello', limit=1)
        self.assertEqual(self.service.list(self.word.id, query).total, 1)
        self.assertEqual(self.service.list(self.word.id, SampleQuery(search='KZ-')).total, 1)
        imported = self.service.list(self.word.id, SampleQuery(source='import')).items[0]
        self.assertEqual([s.id for s in self.service.list(self.word.id, SampleQuery(search=imported.id[:12])).items], [imported.id])
        self.assertEqual(self.service.list(self.word.id, SampleQuery(label='negative', source='import')).total, 1)
        self.assertEqual(self.service.queue(self.word.id, SampleQuery(offset=1, limit=1)).total, 2)
        for query in (SampleQuery(limit=101), SampleQuery(label='skip'), SampleQuery(after='bad')):
            with self.assertRaises(ValidationError):
                self.service.list(self.word.id, query)
        with self.assertRaises(NotFound):
            self.service.list('missing', SampleQuery())
        for data in (b'', b'not audio', wav()[:-20]):
            with self.assertRaises(ValidationError):
                self.service.import_audio(self.word.id, 'positive', io.BytesIO(data))
        with self.assertRaises(ValidationError):
            self.service.import_audio(self.word.id, 'pending', io.BytesIO(wav()))
        with self.assertRaises(ValidationError):
            self.service.ingest('a', DiagnosticClip(id='bad', metadata={'x': 'a' * 20000}), io.BytesIO(wav()), None)

    def test_upgrade_existing_v1_database_and_restart(self):
        self.store.close()
        old_root = self.root / 'old'
        (old_root / 'studio').mkdir(parents=True)
        connection = sqlite3.connect(old_root / 'studio/studio.sqlite3')
        connection.executescript(Path('studio/schema.sql').read_text())
        connection.execute("INSERT INTO wakewords VALUES ('existing','Old','en','old','now','now')")
        connection.execute('PRAGMA user_version = 1')
        connection.commit()
        connection.close()
        store = Store.open(old_root)
        try:
            service = SampleService(store, BlobStore(store.root / 'blobs'))
            sample = service.import_audio('existing', 'positive', io.BytesIO(wav()))
        finally:
            store.close()
        store = Store.open(old_root)
        try:
            self.assertEqual(SampleService(store, BlobStore(store.root / 'blobs')).list('existing', SampleQuery()).items[0], sample)
            self.assertEqual(WorkspaceService(store).get('existing').model_id, 'old')
        finally:
            store.close()

    def test_quarantine_blocks_undo_without_changing_history(self):
        self.ingest()
        sample = self.service.queue(self.word.id, SampleQuery()).items[0]
        self.service.set_label(sample.id, 'positive', 0)
        self.ingest(content=wav(300))
        with self.assertRaises(Conflict):
            self.service.undo(sample.id, 1)
        self.assertEqual(self.service.get(sample.id).revision, 1)

    def test_concurrent_claim_and_revision_have_one_winner(self):
        with ThreadPoolExecutor(max_workers=2) as pool:
            recordings = list(pool.map(lambda _: self.ingest(), range(2)))
        self.assertEqual(recordings[0].id, recordings[1].id)
        sample = self.service.queue(self.word.id, SampleQuery()).items[0]
        def label(value):
            try:
                self.service.set_label(sample.id, value, 0)
                return 'saved'
            except Conflict:
                return 'conflict'
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(label, ('positive', 'negative')))
        self.assertCountEqual(results, ['saved', 'conflict'])

    def test_normalized_and_trimmed_reimports_share_family_and_trim_undo(self):
        sample = self.service.import_audio(self.word.id, 'positive', io.BytesIO(wav(rate=8000)))
        normalized = self.service.import_audio(self.other.id, 'negative', io.BytesIO(self.blobs.read(sample.normalized_hash)))
        self.assertEqual(normalized.family_id, sample.family_id)
        trimmed = self.service.trim(sample.id, 0.2, 0.6, 0)
        reimport = self.service.import_audio(self.other.id, 'negative', io.BytesIO(self.blobs.read(trimmed.normalized_hash)))
        self.assertEqual(reimport.family_id, sample.family_id)
        undone = self.service.undo(sample.id, 1)
        self.assertEqual(undone.audio_id, sample.audio_id)
        self.assertTrue(self.blobs.read(trimmed.normalized_hash))


class SampleAPITests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.runtime = StudioRuntime(Path(self.temp.name))
        self.addCleanup(self.runtime.shutdown)
        self.client = api_client(self.runtime)
        self.word = self.runtime.workspaces.create('Hello', 'en', 'hello')
        self.other = self.runtime.workspaces.create('Other', 'en', 'other')
        self.base = f'/api/studio/wakewords/{self.word.id}'

    def upload(self, filename='voice.wav', mime='audio/wav', content=None):
        return self.client.post(self.base + '/samples/import', data={'label': 'positive'},
                                files={'audio': (filename, content or wav(), mime)})

    def test_import_malicious_filename_and_mime_limits(self):
        response = self.upload('../../outside.wav')
        self.assertEqual(response.status_code, 201, response.text)
        self.assertNotIn('outside', response.text)
        self.assertFalse((Path(self.temp.name) / 'outside.wav').exists())
        self.assertEqual(self.upload(mime='text/html').status_code, 422)
        self.assertEqual(self.upload(content=b'not audio').status_code, 422)
        self.runtime.blobs.max_bytes = 10
        self.assertEqual(self.upload().status_code, 422)

    def test_routes_revision_ownership_audio_trim_delete(self):
        sample = self.upload().json()
        url = self.base + '/samples/' + sample['id']
        other_url = f'/api/studio/wakewords/{self.other.id}/samples/{sample["id"]}'
        self.assertEqual(self.client.get(other_url + '/audio').status_code, 404)
        self.assertEqual(self.client.post(other_url + '/label', json={'label': 'negative', 'expected_revision': 0}).status_code, 404)
        self.assertEqual(self.client.get(url + '/audio?original=true').content, wav())
        self.assertEqual(self.client.post(url + '/label', json={'label': 'negative', 'expected_revision': 0}).status_code, 200)
        self.assertEqual(self.client.post(url + '/label', json={'label': 'positive', 'expected_revision': 0}).status_code, 409)
        self.assertEqual(self.client.post(url + '/undo', json={'expected_revision': 1}).json()['label'], 'positive')
        self.assertEqual(self.client.post(url + '/undo', json={'expected_revision': 1}).status_code, 409)
        self.assertEqual(self.client.post(url + '/trim', json={'start_s': 0.1, 'end_s': 0.8, 'expected_revision': 2}).status_code, 200)
        self.assertEqual(self.client.post(url + '/trim', json={'start_s': 0.9, 'end_s': 0.1, 'expected_revision': 3}).status_code, 422)
        self.assertEqual(self.client.delete(url + '?expected_revision=2').status_code, 409)
        self.assertEqual(self.client.delete(url + '?expected_revision=3').status_code, 204)
        self.assertEqual(self.client.get(url + '/audio').status_code, 404)
        self.assertEqual(self.client.get(self.base + '/samples').json()['total'], 0)

    def test_unmapped_assignment_queue_and_bad_requests(self):
        recording = self.runtime.samples.ingest('a', DiagnosticClip(id='1'), io.BytesIO(wav()), None)
        self.assertEqual(self.client.get('/api/studio/recordings/unmapped').json()['total'], 1)
        response = self.client.post(f'/api/studio/recordings/{recording.id}/assign', json={'word_id': self.word.id})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(self.client.get(self.base + '/queue').json()['total'], 1)
        self.assertEqual(self.client.get(self.base + '/samples?limit=101').status_code, 422)
        sample_id = response.json()['id']
        url = self.base + '/samples/' + sample_id
        self.assertEqual(self.client.post(url + '/label', json={'label': 'skip', 'expected_revision': 0}).status_code, 422)
        self.assertEqual(self.client.post(url + '/label', json={'label': 'negative', 'expected_revision': True}).status_code, 422)

    def test_raw_metadata_secrets_never_reach_unmapped_queue_or_library(self):
        secret = 'private-admin-token-should-not-leak'
        metadata = {'duration': 1, 'token': secret, 'unrecognized_future_key': secret,
                    'nested': {'credentials': [{'authorization': secret}]},
                    'sample_rate': {'token': secret}, 'channels': [secret],
                    'frames': secret, 'duration_s': secret}
        recording = self.runtime.samples.ingest('a', DiagnosticClip(id='1', metadata=metadata), io.BytesIO(wav()), None)
        unmapped = self.client.get('/api/studio/recordings/unmapped')
        self.assertEqual(unmapped.status_code, 200, unmapped.text)
        self.assertEqual(unmapped.json()['items'][0]['metadata'], {'duration': 1})
        assigned = self.client.post(f'/api/studio/recordings/{recording.id}/assign', json={'word_id': self.word.id})
        self.assertEqual(assigned.status_code, 200, assigned.text)
        sample_id = assigned.json()['id']
        responses = [assigned, self.client.get(self.base + '/queue'),
                     self.client.get(self.base + '/samples'),
                     self.client.get(self.base + '/samples/' + sample_id),
                     self.client.post(self.base + '/samples/' + sample_id + '/label',
                                      json={'label': 'positive', 'expected_revision': 0}),
                     self.client.get(self.base + '/samples?label=positive')]
        for response in [unmapped] + responses:
            with self.subTest(url=str(response.request.url)):
                self.assertEqual(response.status_code, 200, response.text)
                self.assertNotIn(secret, response.text)
                self.assertNotIn('unrecognized_future_key', response.text)
        for response in responses:
            payload = response.json()
            sample = payload['items'][0] if 'items' in payload else payload
            self.assertEqual(sample['recording']['metadata'], {'duration': 1})
        with self.runtime.samples.store.transaction() as db:
            raw = db.execute('SELECT metadata FROM recordings WHERE id=?', (recording.id,)).fetchone()[0]
        self.assertEqual(json.loads(raw), metadata)


if __name__ == '__main__':
    unittest.main()
