import io
import json
import os
import sqlite3
import tempfile
import unittest
from unittest.mock import patch
from dataclasses import asdict
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
from kiosk_fixture import KioskServer, PASSWORD, TOKEN
from studio.api import create_router
from studio.db import Store
from studio.devices import DeviceService
from studio.models import Conflict, CredentialsRequired, IdentityMismatch, RemoteRejected, NotFound, ValidationError
from studio.runtime import StudioRuntime


class DeviceTests(unittest.TestCase):
    def test_pending_roster_cannot_restore_followers_after_leader_removal(self):
        leader = self.service.add(self.server.url, TOKEN, 'leader')
        self.service.refresh_fleet(leader.id)
        command = self.service.client.command
        def remove_before_response(*args, **kwargs):
            result = command(*args, **kwargs)
            if args[1] == 'fleetStatus':
                self.service.remove(leader.id)
            return result
        with patch.object(self.service.client, 'command', side_effect=remove_before_response):
            with self.assertRaises(Conflict):
                self.service.refresh_fleet(leader.id)
        self.assertEqual(self.service.list(), [])
        with self.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM devices WHERE active=1 OR removed=0').fetchone()[0], 0)

    def test_address_edit_is_local_preserves_roles_and_survives_refresh(self):
        leader = self.service.add(self.server.url, TOKEN, 'leader')
        self.service.refresh_fleet(leader.id)
        self.server.identity['data'].update(id='standalone', leader=False)
        standalone = self.service.add(self.server.url, TOKEN, 'standalone')
        before = len(self.server.requests)
        for identity in (leader.id, standalone.id, 'kiosk-follower'):
            original = self.service.get(identity)
            changed = self.service.update_address(identity, 'http://10.8.0.42:2324/')
            self.assertEqual(changed.url, 'http://10.8.0.42:2324')
            self.assertEqual((changed.role, changed.credentials_status, changed.active),
                             (original.role, original.credentials_status, original.active))
        self.assertEqual(len(self.server.requests), before)
        self.service.update_address(leader.id, self.server.url)
        self.server.identity['data'].update(id=leader.id, leader=True)
        self.service.refresh_fleet(leader.id)
        self.service.refresh_fleet(leader.id)
        self.assertEqual(self.service.get('kiosk-follower').url, 'http://10.8.0.42:2324')
        with self.assertRaises(ValidationError):
            self.service.update_address(leader.id, 'file:///etc/passwd')
        with self.assertRaises(NotFound):
            self.service.update_address('missing', self.server.url)

    def test_removal_keeps_history_rejects_stale_credentials_and_allows_rediscovery(self):
        leader = self.service.add(self.server.url, TOKEN, 'leader')
        followers = self.service.refresh_fleet(leader.id)
        with self.store.transaction() as db:
            db.execute("INSERT INTO collection_runs VALUES ('run','now',NULL,'running')")
            db.execute("INSERT INTO collection_devices VALUES ('run',?,'complete','{}')", (followers[0].id,))
        self.service.remove(followers[0].id)
        with self.assertRaises(NotFound):
            self.service.get(followers[0].id)
        self.service.refresh_fleet(leader.id)
        self.assertTrue(self.service.get(followers[0].id).active)
        before = len(self.server.requests)
        self.service.remove(leader.id)
        self.assertEqual(self.service.list(), [])
        self.assertEqual(self.service.publication_targets(), [])
        with self.assertRaises(RemoteRejected):
            self.service.client.diagnostics(leader)
        self.assertEqual(len(self.server.requests), before)
        with self.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM collection_devices').fetchone()[0], 1)
            self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(), [])
        # A new leader can be registered without deleting the removed leader's history.
        self.server.identity['data']['id'] = 'new-leader'
        self.server.fleet['data']['self']['id'] = 'new-leader'
        self.assertEqual(self.service.add(self.server.url, TOKEN, 'leader').id, 'new-leader')

    def test_address_and_removal_routes_are_strict_and_sanitized(self):
        device = self.service.add(self.server.url, TOKEN, 'leader')
        runtime = StudioRuntime(self.root)
        self.addCleanup(runtime.shutdown)
        app = FastAPI()
        app.include_router(create_router(runtime))
        with TestClient(app) as client:
            path = f'/api/studio/devices/{device.id}'
            self.assertEqual(client.patch(path, json={'url': 'http://10.8.0.9:2324'}).status_code, 200)
            self.assertEqual(client.patch(path, json={'url': 'http://host', 'role': 'standalone'}).status_code, 422)
            self.assertEqual(client.delete(path).status_code, 204)
            self.assertEqual(client.patch(path, json={'url': self.server.url}).status_code, 404)

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

    def test_retained_nonmember_rows_disable_credentialed_follower_without_losing_history(self):
        leader = self.service.add(self.server.url, TOKEN, "leader")
        self.service.refresh_fleet(leader.id)
        self.server.identity["data"].update(id="kiosk-follower", leader=False)
        cached = self.service.add(self.server.url, TOKEN, "standalone")
        self.assertEqual(cached.credentials_status, "ready")
        with self.store.transaction() as db:
            ref = db.execute("SELECT credential_ref FROM devices WHERE id=?", (cached.id,)).fetchone()[0]
        self.server.identity["data"].update(id=leader.id, leader=True)
        for phase in ("left", "pending", "declined"):
            with self.subTest(phase=phase):
                self.server.fleet["data"]["followers"][0]["phase"] = phase
                followers = self.service.refresh_fleet(leader.id)
                retained = self.service.get(cached.id)
                self.assertIn(retained, followers)
                self.assertFalse(retained.active)
                self.assertEqual((retained.role, retained.credentials_status, retained.leader_id),
                                 ("follower", "ready", leader.id))
                with self.store.transaction() as db:
                    self.assertEqual(db.execute("SELECT credential_ref FROM devices WHERE id=?", (cached.id,)).fetchone()[0], ref)
                self.assertEqual([d.id for d in self.service.publication_targets()], [leader.id])
                request_count = len(self.server.requests)
                for device in (retained, cached):
                    for operation in (lambda: self.service.client.diagnostics(device),
                                      lambda: self.service.client.audio(device, "clip-1")):
                        with self.assertRaises(RemoteRejected):
                            operation()
                self.assertEqual(len(self.server.requests), request_count)
        # Rediscovery as an actual member reactivates the same retained record.
        self.server.fleet["data"]["followers"][0]["phase"] = "synced"
        self.service.refresh_fleet(leader.id)
        self.assertTrue(self.service.get(cached.id).active)
        self.assertEqual(self.service.get(cached.id).credentials_status, "ready")

    def test_member_phases_remain_active_even_offline_or_in_error(self):
        leader = self.service.add(self.server.url, TOKEN, "leader")
        for phase in ("offline", "updating", "error", "version", "synced", "syncing"):
            with self.subTest(phase=phase):
                self.server.fleet["data"]["followers"][0].update(phase=phase, online=False)
                followers = self.service.refresh_fleet(leader.id)
                self.assertTrue(followers[0].active)

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

    def test_inactive_explicit_credentials_verify_identity_without_enabling_actions(self):
        self.server.identity["data"].update(leader=False, follows="Kitchen")
        cached = self.service.add(self.server.url, TOKEN, "standalone")
        obsolete = self.service.credentials.put("obsolete-admin-token")
        with self.store.transaction() as db:
            db.execute("UPDATE devices SET active=0, credential_ref=? WHERE id=?", (obsolete, cached.id))
        before = len(self.server.requests)
        updated = self.service.set_credentials(cached.id, TOKEN)
        self.assertEqual(self.server.requests[before:], [
            ("/kiosk/api/commands/fleetIdentity", f"Bearer {TOKEN}", b"{}")])
        self.assertFalse(updated.active)
        self.assertEqual((updated.role, updated.credentials_status), ("follower", "ready"))
        with self.store.transaction() as db:
            saved = db.execute("SELECT credential_ref FROM devices WHERE id=?", (cached.id,)).fetchone()[0]
        self.assertNotEqual(saved, obsolete)
        self.assertEqual(self.service.credentials.get(saved), TOKEN)
        self.assertEqual(self.service.publication_targets(), [])
        before = len(self.server.requests)
        for device in (updated, cached):
            for operation in (lambda: self.service.client.diagnostics(device),
                              lambda: self.service.client.audio(device, "clip-1"),
                              lambda: self.service.client.stage_model(device, "a.tflite", io.BytesIO(b"a")),
                              lambda: self.service.client.commit_models(device)):
                with self.assertRaises(RemoteRejected):
                    operation()
        self.assertEqual(len(self.server.requests), before)

    def test_inactive_credentials_route_still_rejects_identity_mismatch_and_bad_token(self):
        self.server.identity["data"].update(leader=False, follows="Kitchen")
        device = self.service.add(self.server.url, TOKEN, "standalone")
        with self.store.transaction() as db:
            db.execute("UPDATE devices SET active=0, credential_ref=NULL WHERE id=?", (device.id,))
        runtime = StudioRuntime(self.root)
        self.addCleanup(runtime.shutdown)
        app = FastAPI()
        app.include_router(create_router(runtime))
        with TestClient(app) as client:
            path = f"/api/studio/devices/{device.id}/credentials"
            self.server.identity["data"]["id"] = "different-kiosk"
            response = client.post(path, json={"password": PASSWORD})
            self.assertEqual(response.status_code, 409)
            self.assertEqual(self.service.get(device.id).credentials_status, "credentials_required")
            self.server.identity["data"]["id"] = device.id
            response = client.post(path, json={"password": "invalid-private-admin-token"})
            self.assertEqual(response.status_code, 403)
            self.assertNotIn("invalid-private-admin-token", response.text)
            self.assertEqual(self.service.get(device.id).credentials_status, "credentials_required")
            response = client.post(path, json={"password": PASSWORD})
            self.assertEqual(response.status_code, 200)
            self.assertFalse(response.json()["active"])
            self.assertEqual(response.json()["role"], "follower")
            self.assertEqual(response.json()["credentials_status"], "ready")
            self.assertNotIn(TOKEN, response.text)

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
            response = client.post("/api/studio/devices", json={"url": self.server.url, "password": PASSWORD, "role": "leader"})
            self.assertEqual(response.status_code, 201)
            device_id = response.json()["id"]
            self.assertEqual(client.post(f"/api/studio/devices/{device_id}/refresh").status_code, 200)
            listing = client.get("/api/studio/devices")
            self.assertEqual(len(listing.json()), 3)
            self.assertNotIn("token", listing.text)
            self.assertNotIn(TOKEN, response.text + listing.text)
            updated = client.post(f"/api/studio/devices/{device_id}/credentials", json={"password": PASSWORD})
            self.assertEqual(updated.status_code, 200)
            bad = client.post("/api/studio/devices", json={"url": self.server.url, "password": {"secret": TOKEN}, "role": "leader"})
            self.assertEqual(bad.status_code, 422)
            self.assertNotIn(TOKEN, bad.text)
            self.server.responses["/kiosk/api/commands/fleetIdentity"] = {"ok": False, "error": TOKEN}
            failed = client.post(f"/api/studio/devices/{device_id}/credentials", json={"password": PASSWORD})
            self.assertEqual(failed.status_code, 502)
            self.assertNotIn(TOKEN, failed.text)
