"""Loopback-only Studio workflow: no LAN, CUDA, or /data access."""
from __future__ import annotations

import io
import tempfile
import unittest
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path


from studio.runtime import StudioRuntime
from kiosk_fixture import PASSWORD, StatefulKiosk, sha
from studio_harness import FixtureOnlyClient, StubGpuRunner, api_client
from studio.models import Device, RemoteRejected





class StudioWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.now = datetime(2026, 10, 18, tzinfo=timezone.utc)
        self.follower = StatefulKiosk("fixture-follower", leader=False)
        self.leader = StatefulKiosk("fixture-leader", leader=True, follower=self.follower)
        from studio_harness import augmentation_fixture
        augmentation_fixture(Path(self.temp.name))
        self.runtime = StudioRuntime(Path(self.temp.name), runner=StubGpuRunner(), clock=lambda: self.now)
        self.runtime.devices.client = FixtureOnlyClient(self.runtime.devices._token, [self.leader.url, self.follower.url])
        self.client = api_client(self.runtime)

    def tearDown(self):
        self.client.close(); self.runtime.shutdown(); self.leader.close(); self.follower.close(); self.temp.cleanup()

    def test_harness_rejects_any_address_not_owned_by_its_loopback_fixtures(self):
        for url in ('http://192.168.1.2:2324', 'http://localhost:2324', 'http://127.0.0.1:1'):
            with self.subTest(url=url), self.assertRaises(RemoteRejected):
                self.runtime.devices.client.identity(Device('unowned', url, 'standalone'))

    def test_api_workflow_collects_labels_schedules_archives_publishes_and_rolls_back(self):
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
        def collect():
            job = self.client.post(f"/api/studio/wakewords/{word['id']}/collection/jobs", json={}).json()
            self.assertTrue(self.runtime.workers.run_once("collection"))
            return self.runtime.collection.get_run(self.runtime.jobs.get(job["id"]).result["run_id"])
        first, second_scrape = collect(), collect()
        self.assertEqual(first.new, 2); self.assertEqual(second_scrape.already_seen, 2)
        queue = self.client.get(f"/api/studio/wakewords/{word['id']}/queue").json()
        sample = queue["items"][0]
        self.client.post(f"/api/studio/wakewords/{word['id']}/samples/{sample['id']}/label", json={"label": "positive", "expected_revision": sample["revision"]}).raise_for_status()
        submission = self.client.post(f"/api/studio/wakewords/{word['id']}/generation/submissions", json={"language": "en", "english_accent": "mixed", "tts_mode": "modern", "samples": 1, "batch_size": 1, "engines": ["qwen3"]})
        submission.raise_for_status()
        [batch] = submission.json()["jobs"]
        self.assertTrue(self.runtime.workers.run_once("gpu"))
        self.client.put(f"/api/studio/wakewords/{word['id']}/generation/batches", json={"batch_ids": [batch["id"]]}).raise_for_status()
        archive = Path(self.temp.name) / "speech.zip"
        with zipfile.ZipFile(archive, "w") as output: output.writestr("speech/example.ninja", b"fixture features")
        self.runtime.datasets.install_archive("speech", archive)
        self.client.put(f"/api/studio/wakewords/{word['id']}/datasets", json={"dataset_ids": ["speech"]}).raise_for_status()
        schedule = self.runtime.schedules.save(f"train:{word['id']}", "* * * * *", "UTC", True)
        admitted = self.runtime.schedules.tick(datetime.fromisoformat(schedule.next_run_at) + timedelta(seconds=1))
        self.assertEqual(len(admitted), 1); self.assertTrue(self.runtime.workers.run_once("gpu"))
        self.assertEqual(self.runtime.jobs.get(admitted[0].id).status, 'complete')
        version = self.client.get(f"/api/studio/wakewords/{word['id']}/models").json()["items"][0]
        manifest = self.runtime.training.get_manifest(word['id'], version['run_id'])
        self.assertEqual(list(manifest.selected_batches), [batch['id']])
        self.assertEqual([dataset.id for dataset in manifest.datasets], ['speech'])
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
        self.client.post(f"/api/studio/wakewords/{word['id']}/deployment/publish", json={"version_id": version["id"]}).raise_for_status()
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
