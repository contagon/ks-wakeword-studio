"""No LAN: exercise durable deployment with the real kiosk protocol adapter."""
import hashlib
import io
import json
import tempfile
import threading
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

from studio.deployment import DeploymentService
from studio.kiosk import KioskClient
from studio.models import Conflict, RemoteUnavailable, ValidationError
from studio.runtime import StudioRuntime
from studio_harness import VersionedTrainingRunner, api_client, wav


def digest(data):
    return hashlib.sha256(data).hexdigest()


class InProcessKiosk(KioskClient):
    def __init__(self):
        super().__init__(lambda _: 'fixture-admin')
        self.calls, self.staged, self.files, self.offline = [], {}, {}, set()
        self.roles = {'leader': (True, None), 'solo': (False, None), 'follow': (False, 'leader'),
                      'excluded': (False, 'leader'), 'locked': (False, 'leader')}
        self.reject, self.bad_hash, self.refresh_fail = False, False, False
        self.slots = ['hello_robot', 'ok_nabu']
        self.loaded = {}
        self.upload_hook = None
        self.refresh_hook = None
        self.commit_hook = None
        self.after_upload_hook = None

    def _request(self, device, path, body):
        self.calls.append((device.id, path, body))
        if device.id in self.offline:
            raise RemoteUnavailable('offline')
        if path.startswith('voice/wake-models/upload?name='):
            if self.upload_hook:
                self.upload_hook()
            name = path.split('=', 1)[1]
            self.staged.setdefault(device.id, {})[name] = body
            if self.after_upload_hook:
                self.after_upload_hook(device.id, name)
            return {}
        name = path.split('/')[-1]
        if name == 'fleetIdentity':
            leader, follows = self.roles[device.id]
            return {'id': device.id, 'leader': leader, 'follows': follows}
        if name == 'commitCustomWakeModels':
            if self.commit_hook:
                self.commit_hook(device.id)
            staged = self.staged.pop(device.id, {})
            if self.reject:
                return {'added': [], 'rejected': [{'file': n} for n in staged]}
            added = []
            for stem in sorted({n.rsplit('.', 1)[0] for n in staged}):
                engine = 'microwakeword' if stem + '.json' in staged else 'openwakeword'
                added.append({'engine': engine, 'id': stem})
                for n, data in staged.items():
                    if n.rsplit('.', 1)[0] == stem:
                        self.files.setdefault(device.id, {})[engine + '/' + n] = data
            return {'added': added, 'rejected': []}
        if name == 'customWakeModelsManifest':
            return {'files': {n: ('0' * 64 if self.bad_hash else digest(b))
                              for n, b in self.files.get(device.id, {}).items()}}
        if name == 'clearWakeWordModels':
            if self.refresh_hook:
                self.refresh_hook(device.id)
            if self.refresh_fail:
                raise RemoteUnavailable('refresh offline')
            self.loaded[device.id] = dict(self.files.get(device.id, {}))
            return {'removed': 3, 'bytesFreed': 100, 'restarted': True}
        raise AssertionError('Forbidden/unexpected command: ' + name)

    def uploads(self, device=None):
        return [(d, p.split('=', 1)[1], b) for d, p, b in self.calls
                if 'upload?' in p and (device is None or d == device)]

    def refreshes(self):
        return [d for d, p, _ in self.calls if p.endswith('/clearWakeWordModels')]


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.now = datetime(2026, 10, 18, tzinfo=timezone.utc)
        self.runner = VersionedTrainingRunner()
        from studio_harness import augmentation_fixture
        augmentation_fixture(Path(self.temp.name))
        self.runtime = StudioRuntime(Path(self.temp.name), runner=self.runner, clock=lambda: self.now)
        self.word = self.runtime.workspaces.create('Hello robot', 'en', 'hello_robot')
        self.runtime.datasets.select(self.word.id, [])
        from dataclasses import replace
        policy = self.runtime.automation.get(self.word.id).settings
        self.runtime.automation.save(self.word.id, replace(policy, deployment_policy=replace(policy.deployment_policy, after_training=True)))
        self.runtime.samples.import_audio(self.word.id, 'positive', io.BytesIO(wav(1, 0.1)))
        self.client = InProcessKiosk()
        self.runtime.devices.client = self.client
        with self.runtime.devices.store.transaction() as db:
            for id, role, leader, eligible, credential in [
                ('leader', 'leader', None, 1, 'fixture'), ('solo', 'standalone', None, 1, 'fixture'),
                ('follow', 'follower', 'leader', 1, 'fixture'), ('excluded', 'follower', 'leader', 0, 'fixture'),
                ('locked', 'follower', 'leader', 1, None)]:
                db.execute('INSERT INTO devices(id,url,role,leader_id,model_eligible,credential_ref) VALUES (?,?,?,?,?,?)',
                           (id, 'http://fixture.invalid', role, leader, eligible, credential))
        self.service = self.runtime.deployment

    def tearDown(self):
        self.runtime.shutdown()
        self.temp.cleanup()

    def train(self):
        # Distinct actual weight bytes per archive: stale retry assertions must
        # not accidentally pass because both versions contain identical bytes.
        job = self.runtime.training.enqueue(self.word.id)
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'complete')
        return self.runtime.training.versions(self.word.id).items[0]

    def status(self):
        return {p.device_id: p for p in self.service.status(self.word.id)}

    def test_archive_and_delivery_run_numbers_follow_the_training_job(self):
        old = self.train()
        new = self.train()
        archived = self.runtime.training.versions(self.word.id, limit=1)
        self.assertEqual(archived.items[0].id, new.id)
        self.assertEqual(archived.items[0].run_number, 2)
        self.service.publish(old.id)
        self.assertEqual(self.status()['leader'].run_number, 1)
        self.assertEqual(self.status()['leader'].desired_version, old.id)

    def test_automatic_complete_only_leader_and_standalone_preserve_slots_and_unrelated(self):
        self.client.files['solo'] = {'openwakeword/unrelated.onnx': b'keep'}
        before = list(self.client.slots)
        version = self.train()
        self.assertEqual({d for d, _, _ in self.client.uploads()}, {'leader', 'solo'})
        self.assertEqual(self.client.slots, before)
        self.assertEqual(self.client.files['solo']['openwakeword/unrelated.onnx'], b'keep')
        for d in ('leader', 'solo'):
            self.assertEqual(self.status()[d].desired_version, version.id)
            self.assertEqual(self.status()[d].state, 'published')
            self.assertEqual(self.status()[d].refresh_state, 'acknowledged')
            self.assertEqual(self.status()[d].runtime_state, 'unverified')
            metadata = json.loads(self.client.files[d]['microwakeword/hello_robot.json'])
            self.assertIn('microwakeword/' + metadata['model'], self.client.loaded[d])
        self.assertEqual(self.status()['excluded'].state, 'not_covered')
        self.assertEqual(self.status()['locked'].state, 'credentials_required')
        self.assertEqual(self.status()['follow'].state, 'sync_pending')

    def test_offline_retry_durable_bounded_and_rollback_suppresses_old_bytes(self):
        self.client.offline.add('solo')
        old = self.train()
        new = self.train()
        self.service.publish(old.id)
        revision = self.status()['solo'].revision
        self.client.offline.clear()
        self.client.calls.clear()
        other = DeploymentService(self.runtime.devices.store, self.runtime.devices, self.runtime.training, clock=lambda: self.now)
        other.retry_due(self.now + timedelta(days=1))
        self.assertTrue(self.client.uploads('solo'))
        self.assertEqual(self.status()['solo'].desired_version, old.id)
        self.assertEqual(self.status()['solo'].revision, revision)
        self.assertEqual(self.client.files['solo']['microwakeword/hello_robot.tflite'],
                         (Path(old.path) / 'hello_robot.tflite').read_bytes())
        self.assertNotEqual(old.id, new.id)
        self.client.offline.add('solo')
        self.service.publish(new.id)
        for n in range(12):
            self.service.retry_due(self.now + timedelta(days=n + 1))
        self.assertEqual(self.status()['solo'].state, 'exhausted')
        calls = len(self.client.calls)
        self.service.retry_due(self.now + timedelta(days=100))
        self.assertEqual(len(self.client.calls), calls)

    def test_role_drift_blocks_pending_upload(self):
        self.client.offline.add('solo')
        self.train()
        self.client.offline.clear()
        self.client.roles['solo'] = (False, 'leader')
        self.client.calls.clear()
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertEqual(self.client.uploads('solo'), [])
        self.assertEqual(self.status()['solo'].state, 'role_changed')

    def test_rejection_or_hash_mismatch_never_refreshes(self):
        self.client.reject = True
        version = self.train()
        self.assertEqual(self.client.refreshes(), [])
        self.assertEqual(self.status()['leader'].state, 'rejected')
        self.client.reject = False
        self.client.bad_hash = True
        self.service.publish(version.id)
        self.assertEqual(self.client.refreshes(), [])
        self.assertEqual(self.status()['leader'].state, 'hash_mismatch')

    def test_followers_only_refresh_after_matching_manifest_and_never_upload(self):
        old = self.train()
        self.client.files['follow'] = dict(self.client.files['leader'])
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertEqual(self.status()['follow'].state, 'synced')
        self.assertIn('follow', self.client.refreshes())
        self.assertEqual(self.client.uploads('follow'), [])
        new = self.train()
        self.service.publish(old.id)
        self.client.calls.clear()
        self.client.files['follow']['microwakeword/hello_robot.tflite'] = b'wrong'
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertNotIn('follow', self.client.refreshes())
        self.assertEqual(self.status()['follow'].desired_version, old.id)
        self.assertNotEqual(old.id, new.id)

    def test_hashes_checked_before_any_upload_and_running_archive_not_publishable(self):
        version = self.train()
        self.client.calls.clear()
        (Path(version.path) / 'hello_robot.tflite').write_bytes(b'tampered')
        with self.assertRaises(ValidationError):
            self.service.publish(version.id)
        self.assertEqual(self.client.uploads(), [])
        with self.runtime.devices.store.transaction() as db:
            db.execute("UPDATE studio_jobs SET status='cancelled' WHERE id=?", (version.run_id,))
        with self.assertRaises(Conflict):
            self.service.publish(version.id)

    def test_recovery_does_not_replay_old_version_over_manual_rollback(self):
        old = self.train()
        new = self.train()
        self.service.publish(old.id)
        revision = self.status()['leader'].revision
        self.service.reconcile()
        self.service.reconcile()
        self.assertEqual(self.status()['leader'].desired_version, old.id)
        self.assertEqual(self.status()['leader'].revision, revision)
        with self.runtime.devices.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM deployment_events').fetchone()[0], 2)
        self.assertNotEqual(new.id, old.id)

    def test_refresh_failure_retries_without_reupload_and_inactive_slots_unchanged(self):
        self.client.slots = ['ok_nabu', 'hey_jarvis']
        self.client.refresh_fail = True
        self.train()
        self.assertEqual(self.status()['solo'].refresh_state, 'pending')
        before = len(self.client.uploads())
        self.client.refresh_fail = False
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertEqual(len(self.client.uploads()), before)
        self.assertEqual(self.client.slots, ['ok_nabu', 'hey_jarvis'])
        self.assertEqual(self.status()['solo'].refresh_state, 'acknowledged')

    def test_atomic_outbox_survives_missing_callback_and_new_service_recovers(self):
        self.runtime.workers.completion_hooks.clear()
        version = self.train()
        self.assertEqual(self.client.uploads(), [])
        with self.runtime.devices.store.transaction() as db:
            self.assertEqual(db.execute('SELECT consumed FROM deployment_events WHERE version_id=?', (version.id,)).fetchone()[0], 0)
        other = DeploymentService(self.runtime.devices.store, self.runtime.devices, self.runtime.training, clock=lambda: self.now)
        other.retry_due(self.now)
        self.assertEqual(self.status()['solo'].state, 'published')
        calls = len(self.client.calls)
        other.retry_due(self.now + timedelta(seconds=1))
        self.assertEqual(len(self.client.calls), calls)

    def test_target_lock_serializes_active_publish_then_rollback_last_bytes_win(self):
        old = self.train()
        new = self.train()
        entered, release = threading.Event(), threading.Event()
        def hold():
            self.client.upload_hook = None
            entered.set()
            self.assertTrue(release.wait(5))
        # Force the new version's bytes to be absent so publish must upload.
        self.client.files['leader'] = {}
        self.client.upload_hook = hold
        other = DeploymentService(self.runtime.devices.store, self.runtime.devices, self.runtime.training, clock=lambda: self.now)
        with ThreadPoolExecutor(max_workers=2) as pool:
            publishing = pool.submit(self.service.publish, new.id)
            self.assertTrue(entered.wait(5))
            rollback = pool.submit(other.publish, old.id)
            release.set()
            publishing.result(5)
            rollback.result(5)
        for device in ('leader', 'solo'):
            self.assertEqual(self.status()[device].desired_version, old.id)
            self.assertEqual(self.client.loaded[device]['microwakeword/hello_robot.tflite'],
                             (Path(old.path) / 'hello_robot.tflite').read_bytes())

    def test_new_targets_and_newly_eligible_followers_reconciled_without_new_training(self):
        self.train()
        self.client.files['excluded'] = dict(self.client.files['leader'])
        with self.runtime.devices.store.transaction() as db:
            db.execute("UPDATE devices SET model_eligible=1 WHERE id='excluded'")
            db.execute("INSERT INTO devices(id,url,role,credential_ref) VALUES ('new','http://fixture.invalid','standalone','fixture')")
        self.client.roles['new'] = (False, None)
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertEqual(self.status()['new'].state, 'published')
        self.assertEqual(self.status()['excluded'].state, 'synced')
        self.assertEqual(self.client.uploads('excluded'), [])

    def test_historical_companion_artifacts_are_never_uploaded(self):
        from studio.models import TrainingResult
        class Adapter:
            def run(self, manifest, root, on_log, cancel):
                contents = {'hello_robot.json': b'{"type":"micro","model":"hello_robot.tflite"}',
                            'hello_robot.tflite': b'fixture-mww', 'hello_robot.oww.onnx': b'fixture-oww',
                            'hello_robot.oww.json': b'{"not":"a kiosk manifest"}'}
                for n, b in contents.items():
                    (root / n).write_bytes(b)
                return TrainingResult({n: str(root / n) for n in contents}, {n: digest(b) for n, b in contents.items()}, {}, True)
        self.runtime.training.adapter_factory = lambda context: Adapter()
        self.train()
        names = {n for _, n, _ in self.client.uploads()}
        self.assertEqual(names, {'hello_robot.json', 'hello_robot.tflite'})
        self.assertEqual(self.status()['solo'].state, 'published')
        self.assertNotIn('openwakeword/hello_robot.oww.onnx', self.client.loaded['solo'])

    def test_api_archive_publish_and_cross_word_validation(self):
        import zipfile
        version = self.train()
        base = '/api/studio/wakewords/' + self.word.id
        with api_client(self.runtime) as api:
            self.assertEqual(api.get(base + '/deployment/status').status_code, 200)
            archive = api.get(base + '/models/' + version.id + '/archive')
            self.assertEqual(archive.status_code, 200)
            with zipfile.ZipFile(io.BytesIO(archive.content)) as bundle:
                self.assertIn('run-manifest.json', bundle.namelist())
                self.assertIn('hello_robot.tflite', bundle.namelist())
            self.assertEqual(api.post(base + '/deployment/publish', json={'version_id': version.id}).status_code, 200)
            self.assertEqual(api.post(base + '/deployment/publish', json={'version_id': version.id, 'token': 'secret'}).status_code, 422)
            other = self.runtime.workspaces.create('Other', 'en', 'other')
            self.assertEqual(api.post('/api/studio/wakewords/' + other.id + '/deployment/publish', json={'version_id': version.id}).status_code, 409)

    def test_cancel_after_archive_before_worker_completion_never_publishes(self):
        original = self.runtime.training.handle
        def cancel_after_archive(job, context):
            result = original(job, context)
            self.runtime.jobs.cancel(job.id)
            return result
        self.runtime.workers.handlers['train'] = cancel_after_archive
        job = self.runtime.training.enqueue(self.word.id)
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'cancelled')
        with self.runtime.devices.store.transaction() as db:
            version_id = db.execute('SELECT id FROM model_versions WHERE run_id=?', (job.id,)).fetchone()[0]
            self.assertEqual(db.execute('SELECT count(*) FROM deployment_events').fetchone()[0], 0)
        self.service.retry_due(self.now)
        self.assertEqual(self.client.uploads(), [])
        with self.assertRaises(Conflict):
            self.service.publish(version_id)

    def test_follower_loses_synced_bytes_while_refresh_pending_is_unverified_again(self):
        self.train()
        self.client.files['follow'] = dict(self.client.files['leader'])
        self.client.refresh_fail = True
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertEqual(self.status()['follow'].manifest_state, 'verified')
        self.client.files['follow'] = {}
        self.client.refresh_fail = False
        self.service.retry_due(self.now + timedelta(days=2))
        self.assertEqual(self.status()['follow'].manifest_state, 'unverified')
        self.assertEqual(self.status()['follow'].state, 'sync_pending')

    def test_inflight_follower_refresh_cannot_run_after_rollback_claim(self):
        old = self.train()
        new = self.train()
        self.client.files['follow'] = dict(self.client.files['leader'])
        entered, release = threading.Event(), threading.Event()
        def hold(device_id):
            if device_id == 'follow':
                entered.set()
                self.assertTrue(release.wait(5))
        self.client.refresh_hook = hold
        with ThreadPoolExecutor(max_workers=2) as pool:
            retry = pool.submit(self.service.retry_due, self.now + timedelta(days=1))
            self.assertTrue(entered.wait(5))
            rollback = pool.submit(self.service.publish, old.id)
            release.set()
            retry.result(5)
            rollback.result(5)
        self.client.refresh_hook = None
        self.assertEqual(self.status()['follow'].desired_version, old.id)
        self.assertEqual(self.status()['follow'].state, 'sync_pending')
        self.client.files['follow'] = dict(self.client.files['leader'])
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertEqual(self.status()['follow'].state, 'synced')
        self.assertEqual(self.client.loaded['follow']['microwakeword/hello_robot.tflite'],
                         (Path(old.path) / 'hello_robot.tflite').read_bytes())
        self.assertNotEqual(old.id, new.id)

    def test_actual_v8_upgrade_retains_workspace_and_adds_deployment_schema(self):
        import sqlite3
        from studio.db import Store
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'studio').mkdir()
            with sqlite3.connect(root / 'studio/studio.sqlite3') as db:
                for name in ('schema.sql', 'schema_samples.sql', 'schema_devices.sql', 'schema_collection.sql',
                             'schema_jobs.sql', 'schema_datasets.sql', 'schema_generation.sql', 'schema_training.sql'):
                    db.executescript((Path('studio') / name).read_text())
                db.execute("INSERT INTO wakewords VALUES ('retained','Retained','en','retained','then','then')")
                db.execute('PRAGMA user_version=8')
            store = Store.open(root)
            try:
                with store.transaction() as db:
                    self.assertEqual(db.execute('PRAGMA user_version').fetchone()[0], 19)
                    self.assertEqual(db.execute('SELECT phrase FROM wakewords').fetchone()[0], 'Retained')
                    self.assertEqual(db.execute('SELECT count(*) FROM publications').fetchone()[0], 0)
            finally:
                store.close()

    def test_crash_during_retry_claim_is_recovered_instead_of_stranded(self):
        class Crash(BaseException):
            pass
        self.client.offline.update(('leader', 'solo'))
        self.train()
        self.client.offline.clear()
        def crash():
            self.client.upload_hook = None
            raise Crash()
        self.client.upload_hook = crash
        with self.assertRaises(Crash):
            self.service.retry_due(self.now + timedelta(days=1))
        self.service.retry_due(self.now + timedelta(days=2))
        self.assertEqual(self.status()['leader'].state, 'published')

    def test_crash_after_hash_verification_before_refresh_is_recovered(self):
        class Crash(BaseException):
            pass
        self.runtime.workers.completion_hooks.clear()
        self.train()
        def crash(device_id):
            self.client.refresh_hook = None
            raise Crash()
        self.client.refresh_hook = crash
        with self.assertRaises(Crash):
            self.service.retry_due(self.now)
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertIn('leader', self.client.loaded)
        self.assertEqual(self.status()['leader'].refresh_state, 'acknowledged')

    def other_version(self):
        """An actual completed second-word archive, no automatic upload yet."""
        from studio.models import TrainingResult
        word = self.runtime.workspaces.create('Other robot', 'en', 'other_robot')
        self.runtime.datasets.select(word.id, [])
        class Adapter:
            def run(self, manifest, root, on_log, cancel):
                contents = {'other_robot.json': b'{"type":"micro","model":"other_robot.tflite"}',
                            'other_robot.tflite': b'other-fixture-weights'}
                for n, b in contents.items():
                    (root / n).write_bytes(b)
                return TrainingResult({n: str(root / n) for n in contents}, {n: digest(b) for n, b in contents.items()}, {}, True)
        self.runtime.training.adapter_factory = lambda context: Adapter()
        self.runtime.workers.completion_hooks.clear()
        job = self.runtime.training.enqueue(word.id)
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'complete')
        return self.runtime.training.versions(word.id).items[0]

    def stage_new_version_then_crash(self):
        class Crash(BaseException):
            pass
        old = self.train()
        self.runtime.workers.completion_hooks.clear()
        new = self.train()
        def crash(device_id):
            self.client.commit_hook = None
            raise Crash()
        self.client.commit_hook = crash
        with self.assertRaises(Crash):
            self.service.publish(new.id)
        self.assertEqual(self.client.staged['leader']['hello_robot.tflite'],
                         (Path(new.path) / 'hello_robot.tflite').read_bytes())
        return old, new

    def test_crash_staging_rollback_then_other_word_commit_cannot_reinstall_newer_bytes(self):
        old, new = self.stage_new_version_then_crash()
        # New service, same persisted store: in-memory locks/ownership aren't
        # enough. Rollback is to bytes that are *already installed*.
        recovered = DeploymentService(self.runtime.devices.store, self.runtime.devices, self.runtime.training, clock=lambda: self.now)
        recovered.publish(old.id)
        other = self.other_version()
        recovered.publish(other.id)
        self.assertEqual(self.client.files['leader']['microwakeword/hello_robot.tflite'],
                         (Path(old.path) / 'hello_robot.tflite').read_bytes())
        self.assertEqual(self.status()['leader'].desired_version, old.id)
        self.assertEqual(self.client.staged.get('leader', {}), {})
        self.assertEqual(self.client.uploads('follow'), [])
        self.assertNotEqual(old.id, new.id)

    def test_dirty_other_word_is_recovered_before_next_commit_even_when_its_retry_not_due(self):
        old, new = self.stage_new_version_then_crash()
        # Simulate process death immediately after rollback INTENT commit, before
        # rollback's network phase. The other word is the next publisher.
        with self.runtime.devices.store.transaction() as db:
            self.service._intent(db, old)
        other = self.other_version()
        self.service.publish(other.id)
        self.assertEqual(self.client.files['leader']['microwakeword/hello_robot.tflite'],
                         (Path(old.path) / 'hello_robot.tflite').read_bytes())
        self.assertNotEqual(old.id, new.id)

    def test_staging_ownership_is_durable_before_first_upload(self):
        self.runtime.workers.completion_hooks.clear()
        version = self.train()
        seen = []
        def check():
            with self.runtime.devices.store.transaction() as db:
                row = db.execute('SELECT filenames FROM deployment_staging WHERE device_id=? AND word_id=?',
                                 ('leader', self.word.id)).fetchone()
            self.assertIsNotNone(row)
            self.assertEqual(set(json.loads(row[0])), {'hello_robot.json', 'hello_robot.tflite'})
            seen.append(True)
            self.client.upload_hook = None
        self.client.upload_hook = check
        self.service.publish(version.id)
        self.assertTrue(seen)

    def test_unexpected_accepted_model_is_not_success_and_blocks_further_commits(self):
        self.runtime.workers.completion_hooks.clear()
        version = self.train()
        self.client.staged['leader'] = {'unowned.onnx': b'unowned-external-weights'}
        self.service.publish(version.id)
        self.assertEqual(self.status()['leader'].state, 'staging_blocked')
        self.assertNotIn('leader', self.client.refreshes())
        before = len([p for d, p, _ in self.client.calls if d == 'leader' and p.endswith('/commitCustomWakeModels')])
        self.service.publish(version.id)
        after = len([p for d, p, _ in self.client.calls if d == 'leader' and p.endswith('/commitCustomWakeModels')])
        self.assertEqual(before, after)

    def test_synced_follower_losing_profile_or_membership_is_no_longer_success_without_network(self):
        self.train()
        self.client.files['follow'] = dict(self.client.files['leader'])
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertEqual(self.status()['follow'].state, 'synced')
        with self.runtime.devices.store.transaction() as db:
            db.execute("UPDATE devices SET model_eligible=0 WHERE id='follow'")
        self.client.calls.clear()
        self.service.reconcile()
        self.assertEqual(self.status()['follow'].state, 'not_covered')
        self.assertEqual(self.status()['follow'].manifest_state, 'unverified')
        self.assertEqual(self.client.calls, [])
        with self.runtime.devices.store.transaction() as db:
            db.execute("UPDATE devices SET active=0 WHERE id='follow'")
        self.service.reconcile()
        self.assertEqual(self.status()['follow'].state, 'inactive')
        self.assertEqual(self.client.calls, [])

    def test_synced_follower_removed_from_membership_becomes_inactive(self):
        self.train()
        self.client.files['follow'] = dict(self.client.files['leader'])
        self.service.retry_due(self.now + timedelta(days=1))
        with self.runtime.devices.store.transaction() as db:
            db.execute("UPDATE devices SET active=0 WHERE id='follow'")
        self.client.calls.clear()
        self.service.reconcile()
        self.assertEqual(self.status()['follow'].state, 'inactive')
        self.assertEqual(self.status()['follow'].refresh_state, 'pending')
        self.assertEqual(self.client.calls, [])

    def test_no_discard_workaround_for_owned_optional_file_absent_from_current_desired(self):
        version = self.train()
        with self.runtime.devices.store.transaction() as db:
            db.execute('INSERT INTO deployment_staging VALUES (?,?,?,?)',
                       ('leader', self.word.id, json.dumps(['hello_robot.oww.onnx']), 1))
        self.client.staged['leader'] = {'hello_robot.oww.onnx': b'obsolete-companion'}
        self.client.calls.clear()
        self.service.publish(version.id)
        self.assertEqual(self.status()['leader'].state, 'staging_blocked')
        self.assertEqual(self.status()['leader'].error_code, 'staging_artifact_not_desired')
        self.assertFalse(any(d == 'leader' and (('upload?' in p) or p.endswith('/commitCustomWakeModels')
                                              or p.endswith('/clearWakeWordModels')) for d, p, _ in self.client.calls))
        other = self.other_version()
        self.service.publish(other.id)
        self.assertEqual(self.client.staged['leader']['hello_robot.oww.onnx'], b'obsolete-companion')
        self.assertFalse(any(d == 'leader' and p.endswith('/commitCustomWakeModels') for d, p, _ in self.client.calls))

    def test_recovering_dirty_other_word_holds_current_desired_intent_lock(self):
        old, new = self.stage_new_version_then_crash()
        with self.runtime.devices.store.transaction() as db:
            self.service._intent(db, old)
        other = self.other_version()
        entered, release = threading.Event(), threading.Event()
        def hold():
            self.client.upload_hook = None
            entered.set()
            self.assertTrue(release.wait(5))
        self.client.upload_hook = hold
        recovered = DeploymentService(self.runtime.devices.store, self.runtime.devices, self.runtime.training, clock=lambda: self.now)
        with ThreadPoolExecutor(max_workers=2) as pool:
            repair = pool.submit(recovered.publish, other.id)
            self.assertTrue(entered.wait(5))
            newer = pool.submit(self.service.publish, new.id)
            release.set()
            repair.result(5)
            newer.result(5)
        self.assertEqual(self.status()['leader'].desired_version, new.id)
        self.assertEqual(self.client.files['leader']['microwakeword/hello_robot.tflite'],
                         (Path(new.path) / 'hello_robot.tflite').read_bytes())

    def test_unknown_staging_quarantine_invalidates_terminal_other_word_status(self):
        self.train()
        other = self.other_version()
        self.client.staged['leader'] = {'unowned.onnx': b'unknown'}
        self.service.publish(other.id)
        self.client.calls.clear()
        self.service.reconcile()
        self.assertEqual(self.status()['leader'].state, 'staging_blocked')
        self.assertEqual(self.client.calls, [])

    def test_v9_migration_conservatively_recovers_unjournaled_owned_staging(self):
        import sqlite3
        old, new = self.stage_new_version_then_crash()
        with self.runtime.devices.store.transaction() as db:
            self.service._intent(db, old)
        root = Path(self.temp.name)
        self.runtime.shutdown()
        with sqlite3.connect(root / 'studio/studio.sqlite3') as db:
            db.execute('DROP TABLE studio_dataset_preferences')
            db.execute('CREATE TABLE studio_dataset_selections (word_id TEXT NOT NULL REFERENCES wakewords(id), dataset_id TEXT NOT NULL, PRIMARY KEY(word_id, dataset_id))')
            db.execute('DROP TABLE sample_capture_metadata')
            db.execute('DROP TABLE automation_reviews')
            db.execute('DROP TABLE automation_events')
            db.execute('DROP TABLE workspace_automation')
            db.execute('DROP TABLE deployment_staging_blocks')
            db.execute('DROP TABLE deployment_staging')
            db.execute('DROP INDEX one_studio_leader')
            db.execute('ALTER TABLE devices DROP COLUMN url_override')
            db.execute('ALTER TABLE devices DROP COLUMN removed')
            db.execute('ALTER TABLE devices DROP COLUMN name')
            db.execute("CREATE UNIQUE INDEX one_studio_leader ON devices(role) WHERE role='leader'")
            db.execute('DROP INDEX studio_jobs_run_number')
            db.execute('ALTER TABLE studio_jobs DROP COLUMN run_number')
            db.execute('PRAGMA user_version=9')
        self.runtime.startup()
        self.runtime.devices.client = self.client
        self.service = self.runtime.deployment
        with self.runtime.devices.store.transaction() as db:
            names = db.execute("SELECT filenames FROM deployment_staging WHERE device_id='leader' AND word_id=?", (self.word.id,)).fetchone()
            self.assertEqual(set(json.loads(names[0])), {'hello_robot.json', 'hello_robot.tflite'})
            self.assertEqual(db.execute('PRAGMA user_version').fetchone()[0], 19)
        other = self.other_version()
        self.service.publish(other.id)
        self.assertEqual(self.client.files['leader']['microwakeword/hello_robot.tflite'],
                         (Path(old.path) / 'hello_robot.tflite').read_bytes())
        self.assertNotEqual(old.id, new.id)

    def test_quarantined_standalone_cannot_bypass_block_by_becoming_synced_follower(self):
        version = self.train()
        self.client.files['solo'] = {}
        self.client.staged['solo'] = {'unowned.onnx': b'foreign-staging'}
        self.service.publish(version.id)
        self.assertEqual(self.status()['solo'].state, 'staging_blocked')
        with self.runtime.devices.store.transaction() as db:
            db.execute("UPDATE devices SET role='follower',leader_id='leader',model_eligible=1 WHERE id='solo'")
        self.client.roles['solo'] = (False, 'leader')
        self.client.files['solo'] = dict(self.client.files['leader'])
        self.client.calls.clear()
        self.service.publish(version.id)
        self.assertEqual(self.status()['solo'].state, 'staging_blocked')
        self.assertEqual(self.status()['solo'].error_code, 'staging_unowned')
        self.assertEqual(self.status()['solo'].manifest_state, 'unverified')
        self.assertEqual(self.status()['solo'].refresh_state, 'pending')
        self.service.publish(version.id)
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertEqual(self.status()['solo'].state, 'staging_blocked')
        self.assertEqual([p for d, p, _ in self.client.calls if d == 'solo'], [])
        with self.runtime.devices.store.transaction() as db:
            self.assertEqual(db.execute("SELECT reason FROM deployment_staging_blocks WHERE device_id='solo'").fetchone()[0],
                             'staging_unowned')

    def test_quarantine_reconciliation_and_attempt_guard_apply_to_every_role_and_eligibility(self):
        self.train()
        self.client.files['follow'] = dict(self.client.files['leader'])
        self.service.retry_due(self.now + timedelta(days=1))
        self.assertEqual(self.status()['follow'].state, 'synced')
        with self.runtime.devices.store.transaction() as db:
            db.execute("INSERT INTO deployment_staging_blocks VALUES ('follow','staging_unowned')")
        self.client.calls.clear()
        for active, eligible in ((1, 1), (1, 0), (0, 0), (1, 1)):
            with self.subTest(active=active, eligible=eligible):
                with self.runtime.devices.store.transaction() as db:
                    db.execute("UPDATE devices SET active=?,model_eligible=? WHERE id='follow'", (active, eligible))
                self.service.reconcile()
                self.assertEqual(self.status()['follow'].state, 'staging_blocked')
                # Defense in depth at the mutation entrypoint, even if a caller
                # holds an old pending publication snapshot or exhausted budget.
                p = self.status()['follow']
                from dataclasses import replace
                result = self.service._attempt(replace(p, state='pending', attempts=self.service.max_attempts), self.now)
                self.assertEqual(result.state, 'staging_blocked')
                self.assertEqual(result.error_code, 'staging_unowned')
        self.assertEqual(self.client.calls, [])
