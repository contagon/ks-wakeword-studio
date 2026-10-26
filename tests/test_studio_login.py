"""Password exchange exercises real HTTP, but only against a loopback fixture."""
import json
import tempfile
import time
import unittest
from pathlib import Path

from kiosk_fixture import KioskServer, PASSWORD, TOKEN
from studio.kiosk import KioskClient
from studio.models import CredentialsRequired, Device, RemoteRejected, RemoteUnavailable, ValidationError
from studio.runtime import StudioRuntime
from studio_harness import api_client


class LoginTests(unittest.TestCase):
    def setUp(self):
        self.server = KioskServer()
        self.addCleanup(self.server.close)
        self.device = Device("kiosk-leader", self.server.url, "leader")
        self.client = KioskClient(lambda _: self.fail("Login must not read stored credentials"), max_body=1024)

    def test_login_exchanges_exact_password_for_long_lived_token_without_bearer(self):
        self.assertEqual(self.client.login(self.device, PASSWORD), TOKEN)
        path, authorization, body = self.server.requests[0]
        self.assertEqual(path, "/kiosk/api/login")
        self.assertIsNone(authorization)
        self.assertEqual(json.loads(body), {"password": PASSWORD, "ttl_days": 3650})

    def test_login_rejects_invalid_password_before_network(self):
        for password in ("", None, 123, "x" * 8193):
            with self.subTest(password_type=type(password)), self.assertRaises(ValidationError):
                self.client.login(self.device, password)
        self.assertEqual(self.server.requests, [])

    def test_login_rejects_malformed_or_unsafe_tokens(self):
        for data in ({}, {"token": ""}, {"token": 123}, {"token": "bad\ntoken"},
                     {"token": "h.eyJmbGVldCI6ImxlYWRlciJ9.s"},
                     {"ok": True, "data": {"token": TOKEN}}, [], {"token": "x" * 2048}):
            self.server.responses["/kiosk/api/login"] = data
            with self.subTest(data_type=type(data)), self.assertRaises(RemoteRejected):
                self.client.login(self.device, PASSWORD)

    def test_login_errors_are_safe_and_redirects_are_not_followed(self):
        for status in (401, 403, 429, 302, 500):
            self.server.responses["/kiosk/api/login"] = (
                status, {"Location": self.server.url + "/stolen"},
                json.dumps({"error": PASSWORD + TOKEN}).encode())
            before = len(self.server.requests)
            with self.subTest(status=status), self.assertRaises((CredentialsRequired, RemoteRejected)) as caught:
                self.client.login(self.device, PASSWORD)
            self.assertNotIn(PASSWORD, str(caught.exception))
            self.assertNotIn(TOKEN, str(caught.exception))
            self.assertEqual(len(self.server.requests), before + 1)

    def test_login_obeys_transport_timeout(self):
        def slow():
            time.sleep(0.2)
            return {"token": TOKEN}
        self.server.responses["/kiosk/api/login"] = slow
        self.client.timeout = 0.05
        with self.assertRaises(RemoteUnavailable):
            self.client.login(self.device, PASSWORD)

    def test_password_api_persists_only_token_and_rejects_token_input(self):
        with tempfile.TemporaryDirectory() as root:
            runtime = StudioRuntime(Path(root))
            self.addCleanup(runtime.shutdown)
            with api_client(runtime) as api:
                payload = {"url": self.server.url, "password": PASSWORD, "role": "leader"}
                created = api.post("/api/studio/devices", json=payload)
                self.assertEqual(created.status_code, 201, created.text)
                path = "/api/studio/devices/kiosk-leader/credentials"
                updated = api.post(path, json={"password": PASSWORD})
                self.assertEqual(updated.status_code, 200, updated.text)
                for body in ({"token": TOKEN}, {"password": {"secret": PASSWORD}}):
                    rejected = api.post(path, json=body)
                    self.assertEqual(rejected.status_code, 422)
                    self.assertNotIn(PASSWORD, rejected.text)
                    self.assertNotIn(TOKEN, rejected.text)
                bad = api.post(path, json={"password": "wrong-" + PASSWORD})
                self.assertEqual(bad.status_code, 403)
                self.assertNotIn(PASSWORD, bad.text)
                self.assertNotIn(PASSWORD, created.text + updated.text)
                self.assertNotIn(TOKEN, created.text + updated.text)
                credentials = list((runtime.devices.store.root / "credentials").iterdir())
                self.assertTrue(credentials)
                self.assertTrue(all(file.read_text() == TOKEN for file in credentials))
                for file in Path(root).rglob("*"):
                    if file.is_file():
                        self.assertNotIn(PASSWORD.encode(), file.read_bytes(), str(file))
