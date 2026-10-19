"""Loopback-only Studio workflow: no LAN, CUDA, or /data access."""
from __future__ import annotations

import base64
import hashlib
import io
import json
import tempfile
import threading
import unittest
import wave
import zipfile
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from studio.api import create_router
from studio.runtime import StudioRuntime
from studio_harness import FixtureOnlyClient, StubGpuRunner
from studio.models import Device, RemoteRejected

TOKEN = "fixture-admin-token"
PASSWORD = "fixture-admin-password"


def wav_bytes(seed: int = 1) -> bytes:
    output = io.BytesIO()
    with wave.open(output, "wb") as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(16000)
        file.writeframes((seed.to_bytes(2, "little", signed=True)) * 3200)
    return output.getvalue()


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


class FixtureKiosk:
    """Minimal real HTTP kiosk protocol fixture; it binds loopback only."""

    def __init__(self, kiosk_id: str, *, leader: bool, follower: "FixtureKiosk | None" = None):
        self.kiosk_id, self.leader, self.follower = kiosk_id, leader, follower
        self.requests: list[tuple[str, bytes]] = []
        self.files: dict[str, bytes] = {}
        self.staged: dict[str, bytes] = {}
        self.slots = ["fixture-selected-a", "fixture-selected-b"]
        self.audio = wav_bytes(1)
        self.clip_id = 'clip-1'
        owner = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_args):
                pass

            def do_POST(self):
                body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
                owner.requests.append((self.path, body))
                login = self.path == "/api/login" and json.loads(body) == {"password": PASSWORD, "ttl_days": 3650}
                if not login and self.headers.get("Authorization") != f"Bearer {TOKEN}":
                    self.send_response(401); self.end_headers(); return
                command = self.path.rsplit("/", 1)[-1]
                if login:
                    payload = {"token": TOKEN}
                elif self.path.startswith("/api/voice/wake-models/upload?name="):
                    owner.staged[self.path.split("=", 1)[1]] = body
                    payload = {"ok": True, "data": {}}
                elif command == "fleetIdentity":
                    payload = {"ok": True, "data": {"id": owner.kiosk_id, "leader": owner.leader,
                                                      "follows": None if owner.leader else "fixture-leader"}}
                elif command == "fleetStatus":
                    followers = []
                    if owner.follower is not None:
                        followers = [{"id": owner.follower.kiosk_id, "address": "127.0.0.1",
                                      "port": owner.follower.port, "profile": "voice", "phase": "synced"}]
                    payload = {"ok": True, "data": {"self": {"id": owner.kiosk_id}, "leader": True,
                        "following": None, "profiles": [{"id": "voice", "categories": ["Voice Satellite"]}],
                        "followers": followers}}
                elif command == "getWakeWordActivations":
                    payload = {"ok": True, "data": {"enabled": True, "activations": [{"id": owner.clip_id,
                        "at": "2026-10-18T00:00:00+00:00", "wakeWord": "Hello robot", "engine": "mww"}], "nearMisses": []}}
                elif command == "getWakeWordActivationAudio":
                    payload = {"ok": True, "data": {"mimeType": "audio/wav", "base64": base64.b64encode(owner.audio).decode()}}
                elif command == "commitCustomWakeModels":
                    staged = dict(owner.staged); owner.staged.clear()
                    for name, value in staged.items():
                        engine = "microwakeword" if name.endswith((".json", ".tflite")) else "openwakeword"
                        owner.files[f"{engine}/{name}"] = value
                    ids = sorted({name.rsplit(".", 1)[0] for name in staged})
                    payload = {"ok": True, "data": {"added": [{"engine": "microwakeword", "id": name} for name in ids], "rejected": []}}
                elif command == "customWakeModelsManifest":
                    payload = {"ok": True, "data": {"files": {name: sha(value) for name, value in owner.files.items()}}}
                elif command == "clearWakeWordModels":
                    payload = {"ok": True, "data": {"removed": 0, "bytesFreed": 0, "restarted": True}}
                else:
                    self.send_response(404); self.end_headers(); return
                encoded = json.dumps(payload).encode()
                self.send_response(200); self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(encoded))); self.end_headers(); self.wfile.write(encoded)

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.port = self.server.server_port
        self.url = f"http://127.0.0.1:{self.port}"
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def close(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join(timeout=5)

    def command_count(self, name: str) -> int:
        return sum(path.rsplit("/", 1)[-1].split("?", 1)[0] == name for path, _ in self.requests)


class StudioWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir="/tmp/opencode")
        self.now = datetime(2026, 10, 18, tzinfo=timezone.utc)
        self.follower = FixtureKiosk("fixture-follower", leader=False)
        self.leader = FixtureKiosk("fixture-leader", leader=True, follower=self.follower)
        from studio_harness import augmentation_fixture
        augmentation_fixture(Path(self.temp.name))
        self.runtime = StudioRuntime(Path(self.temp.name), runner=StubGpuRunner(), clock=lambda: self.now)
        self.runtime.devices.client = FixtureOnlyClient(self.runtime.devices._token, [self.leader.url, self.follower.url])
        self.app = FastAPI(); self.app.include_router(create_router(self.runtime))
        self.client = TestClient(self.app)

    def tearDown(self):
        self.client.close(); self.runtime.shutdown(); self.leader.close(); self.follower.close(); self.temp.cleanup()

    def test_harness_rejects_any_address_not_owned_by_its_loopback_fixtures(self):
        for url in ('http://192.168.1.2:2324', 'http://localhost:2324', 'http://127.0.0.1:1'):
            with self.subTest(url=url), self.assertRaises(RemoteRejected):
                self.runtime.devices.client.identity(Device('unowned', url, 'standalone'))

    def test_api_workflow_scrapes_labels_schedules_archives_publishes_and_rolls_back(self):
        word = self.client.post("/api/studio/wakewords", json={"phrase": "Hello robot", "language": "en", "model_id": "hello_robot"}).json()
        from dataclasses import replace
        policy = self.runtime.automation.get(word['id']).settings
        self.runtime.automation.save(word['id'], replace(policy, deployment_policy=replace(policy.deployment_policy, after_training=True)))
        second = self.client.post("/api/studio/wakewords", json={"phrase": "Other robot", "language": "en", "model_id": "other_robot"}).json()
        leader = self.client.post("/api/studio/devices", json={"url": self.leader.url, "password": PASSWORD, "role": "leader"}).json()
        discovered = self.client.post(f"/api/studio/devices/{leader['id']}/refresh").json()
        self.assertEqual([device["role"] for device in discovered], ["follower"])
        self.assertEqual(discovered[0]['credentials_status'], 'credentials_required')
        follower = self.client.post(f"/api/studio/devices/{self.follower.kiosk_id}/credentials", json={"password": PASSWORD}).json()
        self.assertEqual(follower["credentials_status"], "ready")
        targets = [device.id for device in self.runtime.devices.publication_targets()]
        self.assertEqual(targets, [leader['id']])
        before_slots = (list(self.leader.slots), list(self.follower.slots))
        for device in (leader, follower):
            self.client.put(f"/api/studio/devices/{device['id']}/source-mappings", json={"engine": "mww", "source_phrase": "Hello robot", "word_id": word["id"]}).raise_for_status()
        first = self.client.post("/api/studio/scrape", json={}).json()
        second_scrape = self.client.post("/api/studio/scrape", json={}).json()
        self.assertEqual(first["new"], 2); self.assertEqual(second_scrape["already_seen"], 2)
        queue = self.client.get(f"/api/studio/wakewords/{word['id']}/queue").json()
        sample = queue["items"][0]
        self.client.post(f"/api/studio/wakewords/{word['id']}/samples/{sample['id']}/label", json={"label": "positive", "expected_revision": sample["revision"]}).raise_for_status()
        self.client.put(f"/api/studio/wakewords/{word['id']}/generation/recipe", json={"language": "en", "english_accent": "mixed", "tts_mode": "modern", "samples": 1, "batch_size": 1}).raise_for_status()
        batch = self.client.post(f"/api/studio/wakewords/{word['id']}/generation/jobs").json()
        self.assertTrue(self.runtime.workers.run_once("gpu"))
        self.client.put(f"/api/studio/wakewords/{word['id']}/generation/batches", json={"batch_ids": [batch["id"]]}).raise_for_status()
        archive = Path(self.temp.name) / "speech.zip"
        with zipfile.ZipFile(archive, "w") as output: output.writestr("speech/example.ninja", b"fixture features")
        self.runtime.datasets.install_archive("speech", archive)
        self.client.put(f"/api/studio/wakewords/{word['id']}/datasets", json={"dataset_ids": ["speech"]}).raise_for_status()
        schedule = self.client.put(f"/api/studio/schedules/train:{word['id']}", json={"cron": "* * * * *", "timezone": "UTC", "enabled": True}).json()
        admitted = self.runtime.schedules.tick(datetime.fromisoformat(schedule["next_run_at"]) + timedelta(seconds=1))
        self.assertEqual(len(admitted), 1); self.assertTrue(self.runtime.workers.run_once("gpu"))
        self.assertEqual(self.runtime.jobs.get(admitted[0].id).status, 'complete')
        version = self.client.get(f"/api/studio/wakewords/{word['id']}/models").json()["items"][0]
        manifest = self.client.get(f"/api/studio/wakewords/{word['id']}/training/runs/{version['run_id']}").json()
        self.assertEqual(manifest['selected_batches'], [batch['id']])
        self.assertEqual([dataset['id'] for dataset in manifest['datasets']], ['speech'])
        archive_path = Path(version['path'])
        retained = {str(path.relative_to(archive_path)): path.read_bytes() for path in archive_path.rglob('*') if path.is_file()}
        for name, checksum in version['checksums'].items():
            self.assertEqual(sha(retained[name]), checksum)
        download = self.client.get(f"/api/studio/wakewords/{word['id']}/models/{version['id']}/archive")
        download.raise_for_status()
        with zipfile.ZipFile(io.BytesIO(download.content)) as bundle:
            self.assertEqual(bundle.read('hello_robot.tflite'), retained['hello_robot.tflite'])
        self.assertIn("microwakeword/hello_robot.tflite", self.leader.files)
        self.follower.files = dict(self.leader.files)
        self.runtime.deployment.retry_due(self.now + timedelta(days=1))
        status = self.client.get(f"/api/studio/wakewords/{word['id']}/deployment/status").json()
        self.assertEqual({row["device_id"] for row in status}, {"fixture-leader", "fixture-follower"})
        self.assertGreater(self.leader.command_count('clearWakeWordModels'), 0)
        self.assertGreater(self.follower.command_count('clearWakeWordModels'), 0)
        # A second real worker run creates different stub bytes under the same stable filename.
        job = self.client.post(f"/api/studio/wakewords/{word['id']}/training/jobs").json()
        self.assertTrue(self.runtime.workers.run_once('gpu'))
        self.assertEqual(self.runtime.jobs.get(job['id']).status, 'complete')
        latest = self.client.get(f"/api/studio/wakewords/{word['id']}/models").json()['items'][0]
        self.assertNotEqual(latest['id'], version['id'])
        self.assertNotEqual(self.leader.files['microwakeword/hello_robot.tflite'], retained['hello_robot.tflite'])
        self.client.post(f"/api/studio/wakewords/{word['id']}/deployment/rollback", json={"version_id": version["id"]}).raise_for_status()
        self.assertEqual(self.leader.files['microwakeword/hello_robot.tflite'], retained['hello_robot.tflite'])
        # The lagging follower is honestly pending until its simulated fleet copy arrives.
        self.follower.files = dict(self.leader.files)
        self.runtime.deployment.retry_due(self.now + timedelta(days=2))
        self.assertEqual(self.follower.command_count('upload'), 0)
        self.assertEqual(self.follower.command_count('commitCustomWakeModels'), 0)
        self.assertEqual((self.leader.slots, self.follower.slots), before_slots)
        self.assertEqual([device.id for device in self.runtime.devices.publication_targets()], targets)
        self.assertEqual({str(path.relative_to(archive_path)): path.read_bytes() for path in archive_path.rglob('*') if path.is_file()}, retained)
        allowed = {'login', 'fleetIdentity', 'fleetStatus', 'getWakeWordActivations', 'getWakeWordActivationAudio',
                   'commitCustomWakeModels', 'customWakeModelsManifest', 'clearWakeWordModels'}
        self.assertTrue(all('upload?name=' in path or path.rsplit('/', 1)[-1] in allowed
                            for path, _ in self.leader.requests + self.follower.requests))
        self.assertEqual(self.client.get(f"/api/studio/wakewords/{second['id']}/models").json()["total"], 0)


if __name__ == "__main__":
    unittest.main()
