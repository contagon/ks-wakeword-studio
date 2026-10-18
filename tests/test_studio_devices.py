import io
import json
import os
import sqlite3
import tempfile
import unittest
from dataclasses import asdict
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
from kiosk_fixture import KioskServer, TOKEN
from studio.api import create_router
from studio.db import Store
from studio.devices import DeviceService
from studio.models import Conflict, CredentialsRequired, IdentityMismatch, RemoteRejected
from studio.runtime import StudioRuntime


class DeviceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.store = Store.open(self.root)
        self.addCleanup(lambda: self.store.close())
        self.server = KioskServer()
        self.addCleanup(self.server.close)
        self.service = DeviceService(self.store)

    def test_fleet_discovery_credentials_profiles_and_upload_targets(self):
        leader = self.service.add(self.server.url, TOKEN, "leader")
        followers = self.service.refresh_fleet(leader.id)
        self.assertEqual([d.id for d in followers], ["kiosk-follower", "kiosk-updates"])
        self.assertEqual(followers[0].url, "http://192.168.1.30:2324")
        self.assertEqual(followers[1].url, "http://[fd00::23]:2325")
        self.assertTrue(all(d.role == "follower" and d.credentials_status == "credentials_required" for d in followers))
        self.assertEqual([d.model_eligible for d in followers], [True, False])
        with self.assertRaises(CredentialsRequired):
            self.service.client.audio(followers[0], "clip-1")
        self.assertEqual([d.id for d in self.service.publication_targets()], [leader.id])
        self.assertNotIn(TOKEN, json.dumps([asdict(d) for d in self.service.list()]))

    def test_manual_add_follower_cannot_bypass_role_and_removed_history_survives(self):
        leader = self.service.add(self.server.url, TOKEN, "leader")
        self.service.refresh_fleet(leader.id)
        self.server.identity["data"].update(id="kiosk-follower", leader=False, follows=None)
        follower = self.service.add(self.server.url, TOKEN, "standalone")
        self.assertEqual(follower.role, "follower")
        self.assertNotIn(follower.id, [d.id for d in self.service.publication_targets()])
        self.server.identity["data"].update(id="kiosk-leader", leader=True)
        self.server.fleet["data"]["followers"] = []
        self.service.refresh_fleet(leader.id)
        self.assertFalse(self.service.get(follower.id).active)
        self.assertEqual(self.service.get(follower.id).role, "follower")

    def test_second_leader_and_following_device_are_not_standalone_targets(self):
        leader = self.service.add(self.server.url, TOKEN, "leader")
        self.server.identity["data"]["id"] = "another-leader"
        with self.assertRaises(Conflict):
            self.service.add(self.server.url, TOKEN, "leader")
        self.server.identity["data"].update(leader=False, follows="Kitchen")
        follower = self.service.add(self.server.url, TOKEN, "standalone")
        self.assertEqual(follower.role, "follower")
        self.assertEqual([d.id for d in self.service.publication_targets()], [leader.id])

    def test_standalone_and_leader_shared_registry_and_secure_credentials_restart(self):
        leader = self.service.add(self.server.url, TOKEN, "leader")
        self.server.identity["data"].update(id="standalone", leader=False)
        standalone = self.service.add(self.server.url, TOKEN, "standalone")
        self.assertEqual({d.id for d in self.service.publication_targets()}, {leader.id, standalone.id})
        self.assertNotIn(TOKEN, repr(standalone))
        self.assertNotIn(TOKEN.encode(), (self.store.root / "studio.sqlite3").read_bytes())
        secrets = list((self.store.root / "credentials").iterdir())
        self.assertEqual(len(secrets), 2)
        for file in secrets:
            self.assertEqual(file.stat().st_mode & 0o777, 0o600)
        self.assertEqual((self.store.root / "credentials").stat().st_mode & 0o777, 0o700)
        self.store.close()
        self.store = Store.open(self.root)
        service = DeviceService(self.store)
        self.assertEqual(service.client.identity(service.get(standalone.id)).id, "standalone")

    def test_credentials_update_pins_identity_and_never_uses_fleet_token(self):
        leader = self.service.add(self.server.url, TOKEN, "leader")
        self.server.identity["data"]["id"] = "wrong-device"
        with self.assertRaises(IdentityMismatch):
            self.service.set_credentials(leader.id, TOKEN)
        self.server.identity["data"]["id"] = leader.id
        device = self.service.set_credentials(leader.id, TOKEN)
        self.assertEqual(device.credentials_status, "ready")
        self.assertTrue(all("fleet/export" not in r[0] for r in self.server.requests))

    def test_additive_upgrade_v2_retains_workspace(self):
        self.store.close()
        other = self.root / "old"
        (other / "studio").mkdir(parents=True)
        db = sqlite3.connect(other / "studio/studio.sqlite3")
        db.executescript(Path("studio/schema.sql").read_text())
        db.executescript(Path("studio/schema_samples.sql").read_text())
        db.execute("INSERT INTO wakewords VALUES ('w','Phrase','en','phrase','now','now')")
        db.execute("PRAGMA user_version = 2")
        db.commit()
        db.close()
        migrated = Store.open(other)
        self.addCleanup(migrated.close)
        service = DeviceService(migrated)
        device = service.add(self.server.url, TOKEN, "leader")
        self.assertEqual(service.get(device.id).id, "kiosk-leader")
        with migrated.transaction() as db:
            self.assertEqual(db.execute("SELECT phrase FROM wakewords").fetchone()[0], "Phrase")

    def test_role_drift_credentials_refresh_disables_standalone_publication(self):
        self.server.identity["data"].update(leader=False)
        standalone = self.service.add(self.server.url, TOKEN, "standalone")
        self.server.identity["data"].update(follows="New leader")
        updated = self.service.set_credentials(standalone.id, TOKEN)
        self.assertEqual(updated.role, "follower")
        self.assertEqual(self.service.publication_targets(), [])
        self.server.identity["data"].update(follows=None)
        self.assertEqual(self.service.add(self.server.url, TOKEN, "standalone").role, "follower")

    def test_bad_roster_keeps_active_followers_and_mismatched_self_rejected(self):
        leader = self.service.add(self.server.url, TOKEN, "leader")
        self.service.refresh_fleet(leader.id)
        self.server.fleet["data"]["followers"][0]["port"] = True
        with self.assertRaises(RemoteRejected):
            self.service.refresh_fleet(leader.id)
        self.assertTrue(self.service.get("kiosk-follower").active)
        self.server.fleet["data"]["self"]["id"] = "wrong-id"
        with self.assertRaises(IdentityMismatch):
            self.service.refresh_fleet(leader.id)
        self.assertTrue(self.service.get("kiosk-follower").active)

    def test_fleet_scoped_jwt_rejected_before_network_or_credential_write(self):
        import base64
        payload = base64.urlsafe_b64encode(b'{"fleet":"leader-id"}').decode().rstrip("=")
        from studio.models import ValidationError
        with self.assertRaises(ValidationError):
            self.service.add(self.server.url, f"header.{payload}.signature", "leader")
        self.assertEqual(self.server.requests, [])
        self.assertFalse((self.store.root / "credentials").exists())

    def test_credential_symlink_and_world_readable_file_rejected(self):
        leader = self.service.add(self.server.url, TOKEN, "leader")
        path = next((self.store.root / "credentials").iterdir())
        path.chmod(0o644)
        with self.assertRaises(CredentialsRequired):
            self.service.client.identity(leader)
        path.unlink()
        outside = self.root / "outside-secret"
        outside.write_text(TOKEN)
        path.symlink_to(outside)
        with self.assertRaises(CredentialsRequired):
            self.service.client.identity(leader)
        self.assertEqual(outside.read_text(), TOKEN)

    def test_http_registry_routes_and_sanitized_validation_remote_errors(self):
        runtime = StudioRuntime(self.root)
        self.addCleanup(runtime.shutdown)
        app = FastAPI()
        app.include_router(create_router(runtime))
        with TestClient(app) as client:
            response = client.post("/api/studio/devices", json={"url": self.server.url, "token": TOKEN, "role": "leader"})
            self.assertEqual(response.status_code, 201)
            device_id = response.json()["id"]
            self.assertEqual(client.post(f"/api/studio/devices/{device_id}/refresh").status_code, 200)
            listing = client.get("/api/studio/devices")
            self.assertEqual(len(listing.json()), 3)
            self.assertNotIn("token", listing.text)
            self.assertNotIn(TOKEN, response.text + listing.text)
            updated = client.post(f"/api/studio/devices/{device_id}/credentials", json={"token": TOKEN})
            self.assertEqual(updated.status_code, 200)
            bad = client.post("/api/studio/devices", json={"url": self.server.url, "token": {"secret": TOKEN}, "role": "leader"})
            self.assertEqual(bad.status_code, 422)
            self.assertNotIn(TOKEN, bad.text)
            self.server.responses["/kiosk/api/commands/fleetIdentity"] = {"ok": False, "error": TOKEN}
            failed = client.post(f"/api/studio/devices/{device_id}/credentials", json={"token": TOKEN})
            self.assertEqual(failed.status_code, 502)
            self.assertNotIn(TOKEN, failed.text)
