import io
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from studio.api import create_router
from studio.models import Conflict, SampleQuery, ValidationError
from studio.runtime import StudioRuntime
from tests.test_studio_samples import wav


class CapturePreviewTests(unittest.TestCase):
    def analyze(self, segments, content=None):
        from studio.capture import analyze_capture
        with patch('studio.capture.detect_speech', return_value=segments):
            return analyze_capture(content or wav(), 1024 * 1024)

    def test_uses_first_to_last_speech_with_padding_not_first_segment(self):
        result = self.analyze([{'start': 0.2, 'end': 0.3}, {'start': 0.6, 'end': 0.8}])
        self.assertAlmostEqual(result.start_s, 0.12)
        self.assertAlmostEqual(result.end_s, 0.88)
        self.assertEqual((result.duration_s, result.trim_method, result.warning), (1, 'silero', None))

    def test_padding_clamps_to_clip(self):
        result = self.analyze([{'start': 0.02, 'end': 0.99}])
        self.assertEqual((result.start_s, result.end_s), (0, 1))

    def test_no_speech_preserves_noise_clip(self):
        result = self.analyze([])
        self.assertEqual((result.start_s, result.end_s, result.trim_method, result.warning), (0, 1, 'none', 'no_speech'))

    def test_vad_unavailable_preserves_full_clip(self):
        from studio.capture import analyze_capture
        with patch('studio.capture.detect_speech', side_effect=ImportError('private path')):
            result = analyze_capture(wav(), 1024 * 1024)
        self.assertEqual((result.start_s, result.end_s, result.warning), (0, 1, 'vad_unavailable'))

    def test_bad_audio_and_size_are_not_vad_fallbacks(self):
        from studio.capture import analyze_capture
        for data, size in [(b'bad', 1024), (wav(), 10), (wav()[:-5], 1024 * 1024)]:
            with self.subTest(size=size), self.assertRaises(ValidationError):
                analyze_capture(data, size)

    def test_delayed_browser_stop_is_bounded_without_losing_original(self):
        from studio.capture import analyze_capture
        # A browser timer can fire late, producing 600.05 seconds at Stop.
        out = io.BytesIO()
        with wave.open(out, 'wb') as audio:
            audio.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
            audio.writeframes(b'\x00\x00' * 9600800)
        original = out.getvalue()
        with patch('studio.capture.detect_speech', return_value=[]):
            preview = analyze_capture(original, 64 * 1024 * 1024)
        self.assertEqual((preview.duration_s, preview.end_s), (600, 600))
        self.assertTrue(preview.duration_limited)
        from studio.db import Store
        from studio.samples import SampleService
        from studio.storage import BlobStore, normalize_audio
        from studio.workspaces import WorkspaceService
        with tempfile.TemporaryDirectory() as root:
            store = Store.open(Path(root))
            try:
                blobs = BlobStore(store.root / 'blobs')
                service = SampleService(store, blobs)
                word = WorkspaceService(store).create('Limit', 'en', 'limit')
                sample = service.capture_audio(word.id, 'negative', io.BytesIO(original), 0, 600, 'none')
                self.assertEqual(blobs.read(sample.original_hash), original)
                with wave.open(io.BytesIO(blobs.read(sample.normalized_hash)), 'rb') as audio:
                    self.assertEqual(audio.getnframes(), 9600000)
            finally:
                store.close()
        # The recovery applies only to capture; ordinary imports stay strict.
        with self.assertRaises(ValidationError):
            normalize_audio(original, 64 * 1024 * 1024)


class CaptureAPITests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.runtime = StudioRuntime(Path(self.temp.name))
        self.addCleanup(self.runtime.shutdown)
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        self.client = TestClient(app)
        self.word = self.runtime.workspaces.create('Hello', 'en', 'hello')
        self.base = f'/api/studio/wakewords/{self.word.id}/samples/capture'

    def test_preview_is_stateless_and_scoped(self):
        with patch('studio.capture.detect_speech', return_value=[]):
            response = self.client.post(self.base + '/preview', files={'audio': ('../../private.wav', wav(), 'audio/wav')})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()['warning'], 'no_speech')
        self.assertNotIn('private', response.text)
        with self.runtime.samples.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM samples').fetchone()[0], 0)
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 0)
        self.assertEqual(list(self.runtime.blobs.root.rglob('*')), [])
        self.assertEqual(self.client.post('/api/studio/wakewords/missing/samples/capture/preview', files={'audio': ('x.wav', wav(), 'audio/wav')}).status_code, 404)

    def test_preview_rejects_invalid_mime_audio_and_size(self):
        for data, mime in [(wav(), 'text/html'), (b'bad', 'audio/wav')]:
            self.assertEqual(self.client.post(self.base + '/preview', files={'audio': ('x', data, mime)}).status_code, 422)
        self.runtime.blobs.max_bytes = 10
        self.assertEqual(self.client.post(self.base + '/preview', files={'audio': ('x', wav(), 'audio/wav')}).status_code, 422)

    def save(self, **overrides):
        data = {'label': 'negative', 'start_s': '0.2', 'end_s': '0.8', 'trim_method': 'silero'} | overrides
        return self.client.post(self.base, data=data, files={'audio': ('../../secret.wav', wav(), 'audio/wav')})

    def test_saves_original_and_trimmed_derivative_with_capture_provenance(self):
        response = self.save()
        self.assertEqual(response.status_code, 201, response.text)
        sample = response.json()
        self.assertEqual((sample['label'], sample['source'], sample['recording']), ('negative', 'microphone', None))
        self.assertEqual(sample['capture'], {'trim_method': 'silero', 'start_s': 0.2, 'end_s': 0.8, 'duration_s': 1})
        url = f'/api/studio/wakewords/{self.word.id}/samples/{sample["id"]}'
        self.assertEqual(self.client.get(url + '/audio?original=true').content, wav())
        with wave.open(io.BytesIO(self.client.get(url + '/audio').content), 'rb') as audio:
            self.assertEqual(audio.getnframes(), 9600)
        self.assertEqual(self.client.get(self.base.rsplit('/capture', 1)[0] + '?source=microphone').json()['total'], 1)
        self.assertEqual(self.client.get(self.base.rsplit('/capture', 1)[0] + '?source=import').json()['total'], 0)
        undone = self.client.post(url + '/undo', json={'expected_revision': sample['revision']})
        self.assertEqual(undone.status_code, 200, undone.text)
        self.assertEqual(undone.json()['normalized_hash'], sample['family_id'])

    def test_full_clip_positive_and_import_are_distinct_and_survive_restart(self):
        response = self.save(label='positive', start_s='0', end_s='1', trim_method='none')
        self.assertEqual(response.status_code, 201, response.text)
        captured = response.json()
        imported = self.runtime.samples.import_audio(self.word.id, 'negative', io.BytesIO(wav()))
        self.assertEqual(imported.family_id, captured['family_id'])
        self.assertEqual(imported.source, 'import')
        store = self.runtime.samples.store
        from studio.db import Store
        from studio.samples import SampleService
        from studio.storage import BlobStore
        reopened = Store.open(Path(self.temp.name))
        try:
            service = SampleService(reopened, BlobStore(store.root / 'blobs'))
            self.assertEqual(service.get(captured['id']).source, 'microphone')
            self.assertEqual(service.list(self.word.id, SampleQuery(source='import')).total, 1)
            self.assertEqual(service.get(imported.id).source, 'import')
        finally:
            reopened.close()

    def test_capture_rejects_invalid_bounds_labels_methods_without_partial_samples(self):
        for overrides in [{'label': 'discarded'}, {'label': 'pending'}, {'trim_method': 'fake'},
                          {'start_s': '-1'}, {'end_s': '2'}, {'end_s': '0.1'},
                          {'start_s': 'nan'}, {'end_s': 'inf'}, {'end_s': '0.200001'}]:
            with self.subTest(overrides=overrides):
                self.assertEqual(self.save(**overrides).status_code, 422)
        self.assertEqual(self.runtime.samples.list(self.word.id, SampleQuery()).total, 0)
        with self.runtime.samples.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 0)

    def test_capture_preserves_cross_family_collision_rejection(self):
        # Register a cropped clip first as an independent evaluation family.
        out = io.BytesIO()
        with wave.open(out, 'wb') as audio:
            audio.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
            audio.writeframes((200).to_bytes(2, 'little', signed=True) * 9600)
        self.runtime.samples.import_audio(self.word.id, 'negative', io.BytesIO(out.getvalue()))
        self.assertEqual(self.save().status_code, 409)
        self.assertEqual(self.runtime.samples.list(self.word.id, SampleQuery()).total, 1)

    def test_workspace_deletion_removes_capture_metadata(self):
        self.assertEqual(self.save().status_code, 201)
        response = self.client.delete(f'/api/studio/wakewords/{self.word.id}')
        self.assertEqual(response.status_code, 204, response.text)
        with self.runtime.samples.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM sample_capture_metadata').fetchone()[0], 0)

    def test_import_filter_retains_existing_legacy_membership_but_excludes_microphone(self):
        imported = self.runtime.samples.import_audio(self.word.id, 'positive', io.BytesIO(wav()))
        with self.runtime.samples.store.transaction() as db:
            db.execute('INSERT INTO migration_sample_provenance VALUES (?,?,?,?)', (imported.id, 'legacy', 'opaque', 'fingerprint'))
        self.assertEqual(self.save(start_s='0', end_s='1').status_code, 201)
        self.assertEqual(self.runtime.samples.list(self.word.id, SampleQuery(source='import')).total, 1)
        self.assertEqual(self.runtime.samples.list(self.word.id, SampleQuery(source='legacy')).total, 1)

    def test_browser_codec_mime_parameters_are_allowed_but_content_is_sniffed(self):
        files = {'audio': ('microphone.webm', wav(), 'audio/webm;codecs=opus')}
        with patch('studio.capture.detect_speech', return_value=[]):
            response = self.client.post(self.base + '/preview', files=files)
        self.assertEqual(response.status_code, 200, response.text)
        response = self.client.post(self.base, data={'label': 'positive', 'start_s': 0, 'end_s': 1, 'trim_method': 'none'}, files=files)
        self.assertEqual(response.status_code, 201, response.text)
        upload = self.client.post(f'/api/studio/wakewords/{self.word.id}/samples/import', data={'label': 'positive'}, files=files)
        self.assertEqual(upload.status_code, 201, upload.text)
