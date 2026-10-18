import io
import http.client
import json
import ssl
import subprocess
import tempfile
import time
import unittest
from dataclasses import replace
from pathlib import Path
from unittest.mock import patch

from kiosk_fixture import KioskServer, TOKEN
from studio.kiosk import KioskClient, normalize_url
from studio.models import Device, IdentityMismatch, RemoteRejected, RemoteUnavailable, ValidationError


class KioskTests(unittest.TestCase):
    def setUp(self):
        self.server = KioskServer()
        self.addCleanup(self.server.close)
        self.client = KioskClient(lambda device: TOKEN, timeout=0.1, max_body=8192, max_upload=1024)
        self.device = Device("kiosk-leader", self.server.url, "leader")

    def test_real_command_envelope_auth_basepath_and_identity(self):
        identity = self.client.identity(self.device)
        self.assertEqual(identity.id, "kiosk-leader")
        self.assertTrue(identity.leader)
        self.assertEqual(self.server.requests[0], ("/kiosk/api/commands/fleetIdentity", f"Bearer {TOKEN}", b"{}"))

    def test_diagnostics_audio_upload_commit_manifest_protocol(self):
        listing = self.client.diagnostics(self.device)
        self.assertTrue(listing.enabled)
        self.assertEqual([(c.id, c.near_miss) for c in listing.clips], [("clip-1", False), ("clip-2", True)])
        self.assertEqual(listing.clips[0].phrase, "Hey kitchen")
        self.assertEqual(listing.clips[0].scores, {"score": 0.95, "threshold": 0.8})
        self.assertEqual(self.client.audio(self.device, "clip-1"), b"RIFF")
        self.client.stage_model(self.device, "hey_kitchen.onnx", io.BytesIO(b"model-bytes"))
        self.assertIn(("/kiosk/api/voice/wake-models/upload?name=hey_kitchen.onnx", f"Bearer {TOKEN}", b"model-bytes"), self.server.requests)
        audio_request = [r for r in self.server.requests if r[0].endswith("getWakeWordActivationAudio")][0]
        self.assertEqual(json.loads(audio_request[2]), {"id": "clip-1"})
        self.assertEqual(self.client.commit_models(self.device).added, [{"engine": "openwakeword", "id": "hey_kitchen"}])

    def test_manifest_exact_files_protocol(self):
        self.assertEqual(self.client.model_manifest(self.device), {"openwakeword/hey_kitchen.onnx": "a" * 64})

    def test_identity_mismatch_prevents_audio_upload_and_commit(self):
        self.server.identity["data"]["id"] = "replacement-kiosk"
        for operation in (lambda: self.client.audio(self.device, "clip-1"),
                          lambda: self.client.stage_model(self.device, "a.onnx", io.BytesIO(b"a")),
                          lambda: self.client.commit_models(self.device)):
            with self.assertRaises(IdentityMismatch):
                operation()
        self.assertTrue(all(r[0].endswith("fleetIdentity") for r in self.server.requests))

    def test_follower_role_drift_blocks_direct_upload(self):
        self.server.identity["data"].update(leader=False, follows="Kitchen")
        with self.assertRaises(RemoteRejected):
            self.client.stage_model(self.device, "a.onnx", io.BytesIO(b"a"))
        self.assertFalse(any("upload" in r[0] for r in self.server.requests))

    def test_inactive_device_cannot_trigger_transport_requests(self):
        device = replace(self.device, active=False)
        for operation in (lambda: self.client.diagnostics(device),
                          lambda: self.client.audio(device, "clip-1"),
                          lambda: self.client.stage_model(device, "a.onnx", io.BytesIO(b"a")),
                          lambda: self.client.commit_models(device),
                          lambda: self.client.command(device, "fleetStatus", {})):
            with self.subTest(operation=operation), self.assertRaises(RemoteRejected):
                operation()
        self.assertEqual(self.server.requests, [])

    def test_domain_failure_redirect_and_remote_errors_never_reflect_secrets(self):
        for response in ({"ok": False, "error": TOKEN},
                         (302, {"Location": f"http://127.0.0.1:1/{TOKEN}"}, TOKEN.encode()),
                         (500, {}, TOKEN.encode())):
            self.server.responses["/kiosk/api/commands/fleetStatus"] = response
            with self.assertRaises((RemoteRejected, RemoteUnavailable)) as caught:
                self.client.command(self.device, "fleetStatus", {})
            self.assertNotIn(TOKEN, str(caught.exception))
            self.assertIsNone(caught.exception.__cause__)
        self.assertEqual(len(self.server.requests), 3)

    def test_timeout_and_body_limit(self):
        def slow():
            time.sleep(0.25)
            return {"ok": True}
        self.server.responses["/kiosk/api/commands/fleetStatus"] = slow
        with self.assertRaises(RemoteUnavailable):
            self.client.command(self.device, "fleetStatus", {})
        self.server.responses["/kiosk/api/commands/fleetStatus"] = (200, {}, b"x" * 8193)
        with self.assertRaises(RemoteRejected):
            self.client.command(self.device, "fleetStatus", {})
        with self.assertRaises(ValidationError):
            self.client.stage_model(self.device, "a.onnx", io.BytesIO(b"a" * 1025))

    def test_rejected_response_is_closed_even_when_connection_releases_http10_socket(self):
        original = http.client.HTTPConnection.getresponse
        responses = []

        def capture(connection):
            response = original(connection)
            responses.append(response)
            return response

        for result in ((500, {}, b'rejected'), (200, {}, b'x' * 8193)):
            with self.subTest(result=result[0]):
                self.server.responses['/kiosk/api/commands/fleetStatus'] = result
                with patch.object(http.client.HTTPConnection, 'getresponse', capture):
                    with self.assertRaises(RemoteRejected):
                        self.client.command(self.device, 'fleetStatus', {})
                self.assertTrue(responses[-1].isclosed())

    def test_upload_rejection_even_when_ok_true(self):
        self.server.responses["/kiosk/api/voice/wake-models/upload?name=a.onnx"] = {"ok": True, "data": {"rejected": {"file": "a.onnx", "reason": TOKEN}}}
        with self.assertRaises(RemoteRejected) as caught:
            self.client.stage_model(self.device, "a.onnx", io.BytesIO(b"a"))
        self.assertNotIn(TOKEN, str(caught.exception))

    def test_success_data_redacts_credentials_and_commit_reasons(self):
        self.server.responses["/kiosk/api/commands/fleetStatus"] = {"ok": True, "data": {"token": "unknown-secret", "nested": {"password": "other-secret"}, "message": TOKEN}}
        data = self.client.command(self.device, "fleetStatus", {})
        self.assertNotIn("secret", json.dumps(data))
        self.assertNotIn(TOKEN, json.dumps(data))
        self.server.responses["/kiosk/api/commands/commitCustomWakeModels"] = {"ok": True, "data": {"added": [], "rejected": [{"file": "a.onnx", "reason": TOKEN, "values": {"token": "hidden"}}]}}
        result = self.client.commit_models(self.device)
        self.assertEqual(result.rejected, [{"file": "a.onnx"}])

    def test_url_validation_ipv6_private_hosts_and_no_credentials(self):
        self.assertEqual(normalize_url("http://[fd00::1]:2324/base/"), "http://[fd00::1]:2324/base")
        self.assertEqual(normalize_url("http://kitchen.local:2324"), "http://kitchen.local:2324")
        for url in ("http://user:secret@localhost", "file:///etc/passwd", "http://localhost/?token=secret", "http://localhost/#secret", "http://localhost/../x", "http://localhost:bad"):
            with self.subTest(url=url), self.assertRaises(ValidationError):
                normalize_url(url)

    def test_unavailable_native_identity_is_not_a_stable_pin(self):
        self.server.identity["data"]["id"] = "unknown"
        with self.assertRaises(RemoteRejected):
            self.client.identity(replace(self.device, id=""))

    def test_token_like_values_in_unexpected_success_fields_are_redacted(self):
        jwt = "eyJhbGciOiJIUzI1NiJ9.eyJmbGVldCI6ImxlYWRlciJ9.c2lnbmF0dXJl"
        self.server.responses["/kiosk/api/commands/fleetStatus"] = {"ok": True, "data": {
            "message": "Authorization: Bearer unrelated-private-token", "debug": jwt}}
        result = json.dumps(self.client.command(self.device, "fleetStatus", {}))
        self.assertNotIn("unrelated-private-token", result)
        self.assertNotIn(jwt, result)

    def test_real_self_signed_https_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            cert, key = Path(temp) / "cert.pem", Path(temp) / "key.pem"
            subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", str(key), "-out", str(cert), "-days", "1", "-subj", "/CN=localhost"], check=True, capture_output=True)
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain(cert, key)
            self.server.server.socket = context.wrap_socket(self.server.server.socket, server_side=True)
            with self.assertRaises(RemoteUnavailable):
                self.client.identity(replace(self.device, url=self.server.url.replace("http:", "https:")))
