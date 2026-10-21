import io
import fcntl
import base64
import json
import sqlite3
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient
from kiosk_fixture import KioskServer, TOKEN

from studio.api import create_router
from studio.collection import CollectionService
from studio.db import Store
from studio.devices import DeviceService
from studio.models import DiagnosticClip, DiagnosticListing, IdentityMismatch, RemoteRejected, RemoteUnavailable, SampleQuery
from studio.runtime import StudioRuntime
from studio.samples import SampleService
from studio.storage import BlobStore
from studio.workspaces import WorkspaceService
from test_studio_samples import wav


class FakeKiosk:
    def __init__(self):
        self.clips = {}
        self.enabled = True
        self.calls = []
        self.failures = {}
        self.before_audio = None

    def diagnostics(self, device):
        self.calls.append(('listing', device.id))
        failure = self.failures.get(device.id)
        if failure:
            raise failure
        return DiagnosticListing(self.enabled, list(self.clips.get(device.id, [])))

    def audio(self, device, clip_id):
        self.calls.append(('audio', device.id, clip_id))
        if self.before_audio:
            self.before_audio(device, clip_id)
        failure = self.failures.get((device.id, clip_id))
        if failure:
            raise failure
        return wav()


class CollectionTests(unittest.TestCase):
    def test_global_collection_revalidates_inference_atomically_at_admission(self):
        from studio.models import WakewordUpdate
        self.words.update(self.word.id, WakewordUpdate(phrase='Hey Cedar'))
        self.client.clips['a'] = [self.clip('race', 'Hey Cedar')]
        original = self.samples.ingest
        def introduce_duplicate(*args, **kwargs):
            self.words.create('HEY  CEDAR', 'en', 'duplicate')
            return original(*args, **kwargs)
        with patch.object(self.samples, 'ingest', side_effect=introduce_duplicate):
            result = self.service.run()
        self.assertEqual((result.new, result.unmapped), (1, 1))
        self.assertEqual(self.samples.queue(self.word.id, SampleQuery()).total, 0)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.store = Store.open(self.root)
        self.addCleanup(lambda: self.store.close())
        self.now = datetime(2026, 10, 17, tzinfo=timezone.utc)
        self.client = FakeKiosk()
        self.devices = DeviceService(self.store, self.client)
        self.words = WorkspaceService(self.store)
        self.word = self.words.create('Hello', 'en', 'hello')
        self.other = self.words.create('Hello', 'en', 'other')
        self.samples = SampleService(self.store, BlobStore(self.store.root / 'blobs'))
        self.service = self.make_service()
        self.add_device('a')

    def make_service(self):
        return CollectionService(self.store, self.samples, self.devices, clock=lambda: self.now)

    def add_device(self, name, role='standalone', active=True, credentials=True, leader=None):
        with self.store.transaction() as db:
            db.execute('INSERT INTO devices (id,url,role,active,credential_ref,leader_id) VALUES (?,?,?,?,?,?)',
                       (name, 'http://fixture.invalid', role, active, 'fixture' if credentials else None, leader))

    def clip(self, clip_id='1', phrase='Hello', near=False):
        return DiagnosticClip(clip_id, phrase=phrase, engine='mww', near_miss=near)

    def mapped(self):
        self.words.set_source_mapping('a', 'mww', 'Hello', self.word.id)

    def test_mixed_activation_near_miss_explicit_routing_not_selected_word(self):
        self.mapped()
        self.words.set_source_mapping('a', 'mww', 'Other', self.other.id)
        self.client.clips['a'] = [self.clip(), self.clip('2', 'Other', True), self.clip('3', 'Unknown')]
        result = self.service.run()
        self.assertEqual((result.listed, result.new, result.unmapped, result.failed), (3, 3, 1, 0))
        self.assertFalse(self.samples.queue(self.word.id, SampleQuery()).items[0].recording.near_miss)
        self.assertTrue(self.samples.queue(self.other.id, SampleQuery()).items[0].recording.near_miss)
        self.assertEqual(self.samples.unmapped(SampleQuery()).total, 1)

    def test_repeat_discard_delete_tombstone_never_downloads_or_resurrects(self):
        self.mapped()
        self.client.clips['a'] = [self.clip()]
        self.service.run()
        sample = self.samples.queue(self.word.id, SampleQuery()).items[0]
        self.samples.set_label(sample.id, 'discarded', 0)
        self.samples.delete(sample.id, 1)
        result = self.service.run()
        self.assertEqual((result.new, result.already_seen), (0, 1))
        self.assertEqual(len([c for c in self.client.calls if c[0] == 'audio']), 1)
        self.assertEqual(self.samples.queue(self.word.id, SampleQuery()).total, 0)

    def test_failed_download_durable_bounded_retry_then_success(self):
        self.client.clips['a'] = [self.clip()]
        self.client.failures['a', '1'] = RemoteUnavailable('Bearer PRIVATE')
        first = self.service.run()
        self.assertEqual(first.failed, 1)
        self.assertNotIn('PRIVATE', json.dumps(self.service.list_runs().__dict__, default=lambda x: x.__dict__))
        self.assertEqual(self.service.run().devices[0].status, 'partial')
        self.assertEqual(len([c for c in self.client.calls if c[0] == 'audio']), 1)
        self.now += timedelta(minutes=10)
        del self.client.failures['a', '1']
        self.assertEqual(self.service.run().new, 1)
        self.assertEqual(self.service.run().already_seen, 1)

    def test_eviction_confirmed_by_relisting_not_remote_error_text(self):
        self.client.clips['a'] = [self.clip()]
        def evict(device, clip_id):
            self.client.clips['a'] = []
            raise RemoteRejected('secret arbitrary remote error')
        self.client.before_audio = evict
        result = self.service.run()
        self.assertEqual((result.evicted, result.failed, result.new), (1, 0, 0))
        self.assertEqual(result.status, 'partial')

    def test_rejected_audio_still_listed_is_failure_not_eviction(self):
        self.client.clips['a'] = [self.clip()]
        self.client.failures['a', '1'] = RemoteRejected('no such clip PRIVATE')
        result = self.service.run()
        self.assertEqual((result.evicted, result.failed), (0, 1))

    def test_disabled_diagnostics_still_collect_retained_history_with_warning(self):
        self.client.enabled = False
        self.client.clips['a'] = [self.clip()]
        result = self.service.run().devices[0]
        self.assertEqual((result.new, result.status), (1, 'diagnostics_disabled'))

    def test_unknown_duplicate_display_phrases_not_guessed(self):
        self.client.clips['a'] = [self.clip()]
        self.assertEqual(self.service.run().unmapped, 1)
        self.assertEqual(self.samples.queue(self.word.id, SampleQuery()).total, 0)
        self.mapped()
        self.assertEqual(self.service.run().already_seen, 1)
        self.assertEqual(self.samples.unmapped(SampleQuery()).total, 1)

    def test_same_clip_id_on_different_devices_distinct(self):
        self.add_device('b')
        self.client.clips = {'a': [self.clip()], 'b': [self.clip()]}
        self.assertEqual(self.service.run().new, 2)
        self.assertEqual(self.samples.unmapped(SampleQuery()).total, 2)

    def test_offline_identity_mismatch_and_missing_credentials_do_not_block(self):
        self.add_device('b')
        self.add_device('c', 'follower', credentials=False)
        self.add_device('d', active=False)
        self.client.clips['b'] = [self.clip()]
        self.client.failures['a'] = IdentityMismatch('PRIVATE')
        result = self.service.run()
        self.assertEqual(result.new, 1)
        self.assertEqual([d.status for d in result.devices], ['identity_mismatch', 'complete', 'credentials_required', 'inactive'])
        self.assertFalse(any(c[1] in ('c', 'd') for c in self.client.calls))
        self.client.failures['a'] = RemoteUnavailable('PRIVATE')
        self.assertEqual(self.service.run().new, 0)
        self.assertEqual(self.service.list_runs().items[0].devices[0].status, 'unavailable')

    def test_full_run_refreshes_fleet_before_selecting_sources(self):
        self.add_device('leader', 'leader')
        events = []
        def refresh(leader):
            events.append(leader)
            self.add_device('new', 'follower', credentials=False, leader=leader)
        self.devices.refresh_fleet = refresh
        result = self.service.run()
        self.assertEqual(events, ['leader'])
        self.assertEqual(result.devices[-1].status, 'credentials_required')
        events.clear()
        self.service.run(['a'])
        self.assertEqual(events, [])

    def test_failed_refresh_skips_stale_followers_but_not_standalone(self):
        self.add_device('leader', 'leader')
        self.add_device('follower', 'follower', leader='leader')
        self.client.clips['a'] = [self.clip()]
        def refresh(_):
            raise RemoteUnavailable('PRIVATE')
        self.devices.refresh_fleet = refresh
        result = self.service.run()
        self.assertEqual(result.new, 1)
        self.assertEqual(result.devices[-1].status, 'fleet_refresh_failed')
        self.assertFalse(any(c[1] == 'follower' for c in self.client.calls))

    def test_uncredentialed_leader_cannot_authorize_stale_follower_collection(self):
        self.add_device('leader', 'leader', credentials=False)
        self.add_device('follower', 'follower', leader='leader')
        result = self.service.run()
        self.assertEqual(result.devices[-1].status, 'fleet_refresh_failed')
        self.assertFalse(any(c[1] == 'follower' for c in self.client.calls))

    def test_corrupt_audio_retry_state_is_bounded_and_not_success(self):
        self.client.clips['a'] = [self.clip()]
        self.client.audio = lambda device, clip_id: b'corrupt wav'
        for _ in range(18):
            result = self.service.run()
            self.assertEqual((result.new, result.failed), (0, 1))
            self.now += timedelta(minutes=10)
        with self.store.transaction() as db:
            row = db.execute('SELECT * FROM collection_attempts').fetchone()
            self.assertEqual(row['attempts'], 16)
            self.assertEqual(row['state'], 'failed')
            self.assertEqual(db.execute('SELECT count(*) FROM recordings').fetchone()[0], 0)
        self.assertEqual(list((self.store.root / 'collection-staging').iterdir()), [])

    def test_offline_device_does_not_prevent_next_device_import(self):
        self.add_device('b')
        self.client.failures['a'] = RemoteUnavailable('PRIVATE')
        self.client.clips['b'] = [self.clip()]
        result = self.service.run()
        self.assertEqual((result.new, result.failed), (1, 1))

    def test_mapping_replacement_is_explicit_exact_and_does_not_reassign_history(self):
        self.mapped()
        self.client.clips['a'] = [self.clip()]
        self.service.run()
        self.words.set_source_mapping('a', 'mww', 'Hello', self.other.id)
        self.client.clips['a'] = [self.clip(), self.clip('2'), self.clip('3', 'hello')]
        self.assertEqual(self.service.run().unmapped, 1)
        self.assertEqual(self.samples.queue(self.word.id, SampleQuery()).total, 1)
        self.assertEqual(self.samples.queue(self.other.id, SampleQuery()).total, 1)

    def test_real_client_stored_admin_identity_before_audio_and_fleet_refresh(self):
        server = KioskServer()
        self.addCleanup(server.close)
        devices = DeviceService(self.store)
        leader = devices.add(server.url, TOKEN, 'leader')
        server.responses['/kiosk/api/commands/getWakeWordActivationAudio'] = {
            'ok': True, 'data': {'mimeType': 'audio/wav', 'base64': base64.b64encode(wav()).decode()}}
        service = CollectionService(self.store, self.samples, devices)
        # The existing fake-only standalone has no real credentials; explicitly
        # target the real loopback leader, then exercise full refresh below.
        server.requests.clear()
        result = service.run([leader.id])
        self.assertEqual(result.new, 2)
        commands = [r[0].rsplit('/', 1)[-1] for r in server.requests]
        self.assertEqual(commands, ['fleetIdentity', 'getWakeWordActivations',
                                    'fleetIdentity', 'getWakeWordActivationAudio',
                                    'fleetIdentity', 'getWakeWordActivationAudio'])
        self.assertTrue(all(r[1] == f'Bearer {TOKEN}' for r in server.requests))
        server.identity['data']['id'] = 'replacement-device'
        server.requests.clear()
        self.assertEqual(service.run([leader.id]).devices[0].status, 'identity_mismatch')
        self.assertEqual(len(server.requests), 1)
        server.identity['data']['id'] = leader.id
        server.requests.clear()
        result = service.run()
        self.assertEqual([r[0].rsplit('/', 1)[-1] for r in server.requests[:2]], ['fleetIdentity', 'fleetStatus'])
        self.assertEqual([d.status for d in result.devices[-2:]], ['credentials_required', 'credentials_required'])
        self.assertNotIn(TOKEN, json.dumps(service.list_runs().__dict__, default=lambda x: x.__dict__))

    def test_overlapping_services_serialize_device_across_store_connections(self):
        self.client.clips['a'] = [self.clip()]
        entered, release = threading.Event(), threading.Event()
        def wait(device, clip_id):
            entered.set()
            self.assertTrue(release.wait(5))
        self.client.before_audio = wait
        second_store = Store.open(self.root)
        self.addCleanup(second_store.close)
        second = CollectionService(second_store, SampleService(second_store, self.samples.blobs),
                                   DeviceService(second_store, self.client))
        contended = threading.Event()
        flock = fcntl.flock
        second_thread = None

        def observe_lock(fd, operation):
            if threading.get_ident() == second_thread and operation == fcntl.LOCK_EX:
                # Prove the second collector reached an actually held OS lock.
                try:
                    flock(fd, operation | fcntl.LOCK_NB)
                except BlockingIOError:
                    contended.set()
            return flock(fd, operation)

        def collect_second():
            nonlocal second_thread
            second_thread = threading.get_ident()
            return second.collect_device('a')

        with patch('studio.collection.fcntl.flock', observe_lock), ThreadPoolExecutor(2) as pool:
            first = pool.submit(self.service.collect_device, 'a')
            self.assertTrue(entered.wait(5))
            other = pool.submit(collect_second)
            try:
                self.assertTrue(contended.wait(5))
            finally:
                release.set()
            results = [first.result(), other.result()]
        self.assertEqual(sum(r.new for r in results), 1)
        self.assertEqual(sum(r.already_seen for r in results), 1)
        self.assertEqual(len([c for c in self.client.calls if c[0] == 'audio']), 1)

    def test_restart_during_download_retains_incomplete_then_retries(self):
        self.client.clips['a'] = [self.clip()]
        def crash(device, clip_id):
            raise SystemExit('simulated process death')
        self.client.before_audio = crash
        with self.assertRaises(SystemExit):
            self.service.run()
        self.store.close()
        self.store = Store.open(self.root)
        self.samples = SampleService(self.store, BlobStore(self.store.root / 'blobs'))
        self.devices = DeviceService(self.store, self.client)
        self.client.before_audio = None
        self.service = self.make_service()
        self.assertEqual(self.service.run().new, 1)
        history = self.service.list_runs()
        self.assertEqual(history.items[1].devices[0].status, 'interrupted')
        self.assertEqual(self.service.run().already_seen, 1)

    def test_restart_after_identity_commit_recovers_success_counters_without_refetch(self):
        self.client.clips['a'] = [self.clip()]
        ingest = self.samples.ingest
        def committed_then_crash(*args, **kwargs):
            ingest(*args, **kwargs)
            raise SystemExit('crash after durable sample claim')
        self.samples.ingest = committed_then_crash
        with self.assertRaises(SystemExit):
            self.service.run()
        self.samples.ingest = ingest
        self.assertEqual(self.make_service().run().already_seen, 1)
        interrupted = self.service.list_runs().items[1]
        self.assertEqual((interrupted.new, interrupted.unmapped, interrupted.status), (1, 1, 'interrupted'))
        self.assertEqual(len([c for c in self.client.calls if c[0] == 'audio']), 1)

    def test_restart_marks_queued_sources_of_dead_run_interrupted_not_running_forever(self):
        self.add_device('b')
        self.client.clips['a'] = [self.clip()]
        def crash(device, clip_id):
            raise SystemExit('dead run')
        self.client.before_audio = crash
        with self.assertRaises(SystemExit):
            self.service.run()
        self.client.before_audio = None
        self.service.run(['a'])
        previous = self.service.list_runs().items[1]
        self.assertEqual(previous.status, 'interrupted')
        self.assertEqual([d.status for d in previous.devices], ['interrupted', 'interrupted'])

    def test_routes_global_history_and_mapping_validation(self):
        runtime = StudioRuntime(self.root)
        self.addCleanup(runtime.shutdown)
        runtime.startup()
        runtime._devices.client = self.client
        app = FastAPI()
        app.include_router(create_router(runtime))
        with TestClient(app) as api:
            body = {'engine': 'mww', 'source_phrase': 'Hello', 'word_id': self.word.id}
            self.assertEqual(api.put('/api/studio/devices/a/source-mappings', json=body).status_code, 200)
            self.assertEqual(len(api.get('/api/studio/devices/a/source-mappings').json()), 1)
            self.client.clips['a'] = [self.clip()]
            self.assertEqual(api.post('/api/studio/scrape', json={}).json()['new'], 1)
            self.assertEqual(api.get('/api/studio/scrape/runs').json()['total'], 1)
            self.assertEqual(api.post('/api/studio/scrape', json={'word_id': self.other.id}).status_code, 422)
            self.assertEqual(api.get('/api/studio/scrape/runs?limit=0').status_code, 422)
            self.assertEqual(api.put('/api/studio/devices/missing/source-mappings', json=body).status_code, 404)

    def test_additive_upgrade_existing_v3_keeps_words_and_recordings(self):
        recording = self.samples.ingest('a', self.clip(), io.BytesIO(wav()), self.word.id)
        self.store.close()
        path = self.root / 'studio/studio.sqlite3'
        with sqlite3.connect(path) as db:
            # Reconstruct an actual v3 schema, including removal of later v5-v10
            # tables now created by setUp's Store.open().
            for table in ('studio_dataset_preferences', 'sample_capture_metadata', 'automation_reviews', 'automation_events', 'workspace_automation',
                          'deployment_staging_blocks', 'deployment_staging',
                          'publication_history', 'publications', 'deployment_intents', 'deployment_events',
                          'model_versions', 'training_runs', 'training_family_splits', 'training_seed', 'training_settings',
                          'generation_selection', 'generation_batch_audio', 'generation_batches', 'generation_recipes',
                          'studio_dataset_selections', 'studio_dataset_installations',
                          'studio_schedule_occurrences', 'studio_schedules', 'studio_jobs',
                          'collection_attempts', 'collection_devices', 'collection_runs', 'source_mappings'):
                db.execute('DROP TABLE ' + table)
            db.execute('DROP INDEX one_studio_leader')
            db.execute('ALTER TABLE devices DROP COLUMN url_override')
            db.execute('ALTER TABLE devices DROP COLUMN removed')
            db.execute('ALTER TABLE devices DROP COLUMN name')
            db.execute("CREATE UNIQUE INDEX one_studio_leader ON devices(role) WHERE role='leader'")
            db.execute('PRAGMA user_version=3')
        self.store = Store.open(self.root)
        self.assertEqual(WorkspaceService(self.store).get(self.word.id).phrase, 'Hello')
        self.assertEqual(DeviceService(self.store).get('a').id, 'a')
        with self.store.transaction() as db:
            self.assertEqual(db.execute('PRAGMA user_version').fetchone()[0], 17)
            self.assertEqual(db.execute('SELECT id FROM recordings').fetchone()[0], recording.id)
