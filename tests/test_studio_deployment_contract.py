"""Default tests use loopback/source only. Live mutation is a separate opt-in."""
import hashlib
import io
import json
import os
from pathlib import Path
import unittest

from kiosk_fixture import KioskServer, TOKEN
from studio.kiosk import KioskClient
from studio.models import Device, RemoteRejected, ValidationError

FIXTURE = json.loads((Path(__file__).parent / 'fixtures/kiosk/refresh_contract.json').read_text())


class PublicationContractTests(unittest.TestCase):
    def test_commit_result_retains_unexpected_accepted_models_for_exact_validation(self):
        server = KioskServer()
        self.addCleanup(server.close)
        client = KioskClient(lambda _: TOKEN, timeout=1)
        device = Device('kiosk-leader', server.url, 'leader')
        accepted = [{'engine': 'microwakeword', 'id': 'intended'}, {'engine': 'openwakeword', 'id': 'unowned'}]
        server.responses['/kiosk/api/commands/commitCustomWakeModels'] = {
            'ok': True, 'data': {'added': accepted, 'rejected': [{'file': 'foreign.json', 'reason': TOKEN}]}}
        result = client.commit_models(device)
        self.assertEqual(result.added, accepted)
        self.assertEqual(result.rejected, [{'file': 'foreign.json'}])
        self.assertNotIn(TOKEN, json.dumps(result.rejected))

    def test_real_http_refresh_envelope_and_malformed_or_domain_rejection(self):
        server = KioskServer()
        self.addCleanup(server.close)
        client = KioskClient(lambda _: TOKEN, timeout=1)
        device = Device('kiosk-leader', server.url, 'leader')
        path = '/kiosk/api/commands/clearWakeWordModels'
        server.responses[path] = FIXTURE['refresh_response']
        result = client.refresh_models(device)
        self.assertTrue(result['restarted'])
        self.assertEqual(server.requests[-1], (path, 'Bearer ' + TOKEN, b'{}'))
        self.assertEqual([r[0].split('/')[-1] for r in server.requests], ['fleetIdentity', 'clearWakeWordModels'])
        for data in ({'ok': False}, {'ok': True, 'data': {'restarted': True}},
                     {'ok': True, 'data': {'removed': True, 'bytesFreed': 0, 'restarted': True}}):
            server.responses[path] = data
            with self.subTest(data=data), self.assertRaises(RemoteRejected):
                client.refresh_models(device)

    def test_upload_domain_failure_200_and_filename_contract(self):
        server = KioskServer()
        self.addCleanup(server.close)
        client = KioskClient(lambda _: TOKEN, timeout=1)
        device = Device('kiosk-leader', server.url, 'leader')
        server.responses['/kiosk/api/voice/wake-models/upload?name=x.onnx'] = {'ok': False}
        with self.assertRaises(RemoteRejected):
            client.stage_model(device, 'x.onnx', io.BytesIO(b'weights'))
        before = len(server.requests)
        with self.assertRaises(ValidationError):
            client.stage_model(device, 'x.zip', io.BytesIO(b'archive is not a model'))
        self.assertEqual(len(server.requests), before)

    def test_source_refresh_loads_local_bytes_without_changing_settings(self):
        # Read-only source contract; no Dart execution or hardware claim. CI can
        # point to its sibling checkout, or skip this source cross-check while
        # retaining the default HTTP and service fixture tests.
        root = Path(os.environ.get('STUDIO_KIOSK_SOURCE', '/home/contagon/PersonalProjects/kiosk-satellite')) / 'app/lib/managers'
        if not root.is_dir():
            self.skipTest('Sibling kiosk source unavailable; set STUDIO_KIOSK_SOURCE')
        for relative, evidence in FIXTURE['source_evidence'].items():
            source = (root / relative).read_text()
            for text in evidence:
                self.assertIn(text, source, relative)
        manager = (root / 'wake_word/wake_word_manager.dart').read_text()
        refresh = manager.split("name: 'clearWakeWordModels',", 1)[1].split("name: 'startAudioStream',", 1)[0]
        self.assertLess(refresh.index('await _engine.stop()'), refresh.index('await WakeModelCache.clear()'))
        self.assertLess(refresh.index('await WakeModelCache.clear()'), refresh.index('await _sync()'))
        self.assertNotIn('_settings.set', refresh)
        self.assertNotIn('deleteCustomWakeModel', refresh)
        cache = (root / 'wake_word/model_cache.dart').read_text()
        self.assertNotIn('custom_wake_words', cache)
        for directory in FIXTURE['cache_directories']:
            self.assertIn(directory, cache)


@unittest.skipUnless(os.environ.get('STUDIO_TEST_KIOSK_URL') and os.environ.get('STUDIO_TEST_KIOSK_TOKEN')
                     and os.environ.get('STUDIO_TEST_KIOSK_MUTATE') == '1'
                     and os.environ.get('STUDIO_TEST_KIOSK_MODEL_DIR') and os.environ.get('STUDIO_TEST_KIOSK_MODEL_ID'),
                     'Live mutation requires URL, TOKEN, MUTATE=1, MODEL_DIR and disposable MODEL_ID')
class LivePublicationContractTests(unittest.TestCase):
    def test_explicit_disposable_selected_stable_id_refresh_and_two_slots(self):
        # Operator must preselect this disposable MWW model in either slot.
        # Never change selections or delete the test model to clean up.
        token = os.environ['STUDIO_TEST_KIOSK_TOKEN']
        client = KioskClient(lambda _: token)
        probe = Device('', os.environ['STUDIO_TEST_KIOSK_URL'], 'standalone')
        identity = client.identity(probe)
        self.assertFalse(identity.follows, 'Live upload target must not be a follower')
        device = Device(identity.id, probe.url, 'leader' if identity.leader else 'standalone')
        before = client.command(device, 'voiceStatus', {})
        model_id = os.environ['STUDIO_TEST_KIOSK_MODEL_ID']
        self.assertIn(model_id, before['wakeWords'], 'Preselect the disposable stable-ID model yourself')
        self.assertEqual(len(before['wakeWords']), 2, 'Configure both slots before opting in')
        root = Path(os.environ['STUDIO_TEST_KIOSK_MODEL_DIR'])
        contents = {model_id + ext: (root / (model_id + ext)).read_bytes() for ext in ('.json', '.tflite')}
        self.assertEqual(json.loads(contents[model_id + '.json'])['model'], model_id + '.tflite')
        expected = {'microwakeword/' + n: hashlib.sha256(b).hexdigest() for n, b in contents.items()}
        previous = client.model_manifest(device)
        self.assertTrue(any(previous.get(n) != h for n, h in expected.items()), 'Supply changed disposable weights')
        for n, b in contents.items():
            client.stage_model(device, n, io.BytesIO(b))
        result = client.commit_models(device)
        self.assertEqual(result.rejected, [])
        self.assertIn({'engine': 'microwakeword', 'id': model_id}, result.added)
        remote = client.model_manifest(device)
        self.assertTrue(all(remote.get(n) == h for n, h in expected.items()))
        refreshed = client.refresh_models(device)
        self.assertTrue(refreshed['restarted'], 'Live selected-model test requires running native inference')
        after = client.command(device, 'voiceStatus', {})
        self.assertEqual(after['wakeWords'], before['wakeWords'])
        self.assertEqual(after['engine'], before['engine'])
        state = client.command(device, 'getWakeWordState', {})
        self.assertTrue(state['listening'])
        observed = next(m for m in state['models'] if m['id'] == model_id)
        self.assertTrue(observed['manifestUrl'].startswith('file:'))
        self.assertIsNotNone(observed['precision'])
        # Runtime exposes loaded model ID/path/precision, not a loaded digest.
        # This is restart + local-file-load evidence, not hash-attested inference.
