"""Notification scope, secret handling, durable delivery and job integration."""
from datetime import datetime, timedelta, timezone

import pytest

from studio.runtime import StudioRuntime
from studio_harness import api_client


URL = 'json://127.0.0.1:9999/secret-notification-token'
OFF = {'scrape': False, 'classify': False, 'train': False, 'deploy': False}


def test_notification_settings_global_secret_and_workspace_isolation(tmp_path):
    runtime = StudioRuntime(tmp_path)
    try:
        a = runtime.workspaces.create('Cedar', 'en')
        b = runtime.workspaces.create('Maple', 'en')
        with api_client(runtime) as api:
            global_path = '/api/studio/notifications'
            assert api.get(global_path).status_code == 200
            assert api.get(global_path).json() == {'configured': False, 'download': False}
            saved = api.put(global_path, json={'apprise_url': URL, 'download': True})
            assert saved.json() == {'configured': True, 'download': True}
            assert 'secret-notification-token' not in saved.text
            # Omitted/null URL retains the secret; empty explicitly clears it.
            assert api.put(global_path, json={'download': False}).json()['configured'] is True
            for word in (a, b):
                assert api.get(f'/api/studio/wakewords/{word.id}/notifications').json() == OFF
            a_path = f'/api/studio/wakewords/{a.id}/notifications'
            assert api.put(a_path, json={**OFF, 'train': True}).json() == {**OFF, 'train': True}
            assert api.get(f'/api/studio/wakewords/{b.id}/notifications').json() == OFF
            assert api.get('/api/studio/wakewords/missing/notifications').status_code == 404
            for body in ({**OFF, 'train': 1}, {**OFF, 'generation': True}):
                assert api.put(a_path, json=body).status_code == 422
            for url in ('not-a-url-secret', 'unknown://secret', URL + '\nother'):
                rejected = api.put(global_path, json={'apprise_url': url, 'download': True})
                assert rejected.status_code == 422
                assert url not in rejected.text
                assert api.get(global_path).json() == {'configured': True, 'download': False}
        runtime.shutdown()
        runtime = StudioRuntime(tmp_path)
        with api_client(runtime) as api:
            assert api.get(a_path).json()['train'] is True
            assert api.get(global_path).json()['configured'] is True
            assert api.put(global_path, json={'apprise_url': '', 'download': False}).json()['configured'] is False
        runtime.workspaces.delete(a.id)
        assert runtime.notifications.workspace_settings(b.id) == OFF
    finally:
        runtime.shutdown()


def finish(runtime, kind, word_id, result=None, status='complete'):
    job = runtime.jobs.enqueue(kind, word_id, {})
    assert runtime.jobs.claim(job.resource, runtime.clock(), job_id=job.id)
    return runtime.jobs.finish(job.id, result or {}, status)


def test_durable_notifications_for_manual_and_scheduled_jobs_exclude_generation(tmp_path, monkeypatch):
    runtime = StudioRuntime(tmp_path)
    try:
        a = runtime.workspaces.create('Cedar', 'en')
        b = runtime.workspaces.create('Maple', 'en')
        runtime.notifications.save(apprise_url=URL, download=True)
        runtime.notifications.save_workspace(a.id, {k: True for k in OFF})
        calls = []
        monkeypatch.setattr('studio.notifications.send', lambda *args: calls.append(args) or True)
        finish(runtime, 'train', a.id)
        finish(runtime, 'classify', a.id, {'message': 'do-not-leak-arbitrary-output'}, 'failed')
        finish(runtime, 'scrape', a.id, {'status': 'partial', 'failed': 2})
        finish(runtime, 'download', None, {'dataset_id': 'dataset-a'})
        finish(runtime, 'download', None, {'augmentation_id': 'noise'})
        # Workspace isolation and every explicitly excluded state/kind.
        finish(runtime, 'train', b.id)
        finish(runtime, 'train', a.id, {'skipped': True})
        finish(runtime, 'train', a.id, status='cancelled')
        finish(runtime, 'generation', a.id)
        finish(runtime, 'preview', a.id, status='failed')
        finish(runtime, 'benchmark', None)
        finish(runtime, 'scrape', None)
        # A deployment job requests publication; only actual target delivery
        # earns success notifications, but handler failures must still notify.
        finish(runtime, 'deploy', a.id, {'version_id': 'archive'})
        finish(runtime, 'deploy', a.id, status='failed')
        scheduled = runtime.jobs.enqueue('train', a.id, {'trigger': 'scheduled'})
        runtime.jobs.claim('gpu', runtime.clock(), job_id=scheduled.id)
        runtime.jobs.finish(scheduled.id, {})
        assert calls == [], 'Network delivery must not run inside job finish'
        runtime.shutdown()
        runtime = StudioRuntime(tmp_path)
        for _ in range(8):
            runtime.notifications.dispatch_once()
        assert len(calls) == 7
        assert [call[3] for call in calls] == [False, True, True, False, False, True, False]
        assert all(call[0] == URL for call in calls)
        text = str(calls)
        assert 'Cedar' in text and 'dataset-a' in text and 'noise' in text
        assert 'Maple' not in text and 'do-not-leak-arbitrary-output' not in text
        # Reopening and polling again must not replay delivered events.
        runtime.notifications.dispatch_once()
        assert len(calls) == 7
    finally:
        runtime.shutdown()


def test_delivery_retries_are_bounded_and_do_not_block_other_events(tmp_path, monkeypatch, caplog):
    now = datetime(2026, 10, 25, tzinfo=timezone.utc)
    runtime = StudioRuntime(tmp_path, clock=lambda: now)
    try:
        word = runtime.workspaces.create('Cedar', 'en')
        runtime.notifications.save(apprise_url=URL, download=True)
        runtime.notifications.save_workspace(word.id, {**OFF, 'train': True})
        job = finish(runtime, 'train', word.id)
        attempts = []

        def fail(*args):
            attempts.append(args)
            raise RuntimeError(URL)

        monkeypatch.setattr('studio.notifications.send', fail)
        runtime.notifications.dispatch_once()
        runtime.notifications.dispatch_once()
        assert len(attempts) == 1
        for _ in range(6):
            now += timedelta(hours=1)
            runtime.notifications.dispatch_once()
        assert len(attempts) == 3
        assert runtime.jobs.get(job.id).status == 'complete'
        assert 'secret-notification-token' not in caplog.text
        finish(runtime, 'download', None, {'dataset_id': 'other'})
        delivered = []
        monkeypatch.setattr('studio.notifications.send', lambda *args: delivered.append(args) or True)
        runtime.notifications.dispatch_once()
        assert len(delivered) == 1
        # Nothing replays when notifications were disabled at completion.
        runtime.notifications.save(download=False)
        finish(runtime, 'download', None)
        runtime.notifications.save(download=True)
        runtime.notifications.dispatch_once()
        assert len(delivered) == 1
    finally:
        runtime.shutdown()


def test_disabled_or_deleted_workspace_cancels_pending_notifications(tmp_path, monkeypatch):
    runtime = StudioRuntime(tmp_path)
    try:
        word = runtime.workspaces.create('Cedar', 'en')
        runtime.notifications.save(apprise_url=URL, download=False)
        runtime.notifications.save_workspace(word.id, {**OFF, 'train': True})
        finish(runtime, 'train', word.id)
        runtime.notifications.save_workspace(word.id, OFF)
        calls = []
        monkeypatch.setattr('studio.notifications.send', lambda *args: calls.append(args) or True)
        runtime.notifications.dispatch_once()
        assert not calls
        runtime.notifications.save_workspace(word.id, {**OFF, 'train': True})
        finish(runtime, 'train', word.id)
        runtime.workspaces.delete(word.id)
        runtime.notifications.dispatch_once()
        assert not calls
    finally:
        runtime.shutdown()


def test_test_notification_uses_saved_global_url_and_sanitizes_failure(tmp_path, monkeypatch, caplog):
    runtime = StudioRuntime(tmp_path)
    try:
        assert hasattr(runtime, 'notifications'), 'Notification service is missing'
        with api_client(runtime) as api:
            assert api.post('/api/studio/notifications/test').status_code == 422
            api.put('/api/studio/notifications', json={'apprise_url': URL, 'download': False})
            deliveries = []
            monkeypatch.setattr('studio.notifications.send', lambda *args: deliveries.append(args) or True)
            assert api.post('/api/studio/notifications/test').json() == {'sent': True}
            assert deliveries[0][0] == URL
            assert deliveries[0][1] == 'test notification'

            def fail(*args):
                raise RuntimeError(URL)

            monkeypatch.setattr('studio.notifications.send', fail)
            rejected = api.post('/api/studio/notifications/test')
            assert rejected.status_code == 502
            assert 'secret-notification-token' not in rejected.text + caplog.text
    finally:
        runtime.shutdown()


def test_real_apprise_delivery_and_rejected_endpoint_never_log_secrets(tmp_path, caplog):
    import json
    import logging
    import threading
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    received = []
    status = [200]

    class Endpoint(BaseHTTPRequestHandler):
        def do_POST(self):
            received.append(json.loads(self.rfile.read(int(self.headers['Content-Length']))))
            self.send_response(status[0])
            self.end_headers()
            self.wfile.write(b'remote-secret-response')

        def log_message(self, *args):
            pass

    server = ThreadingHTTPServer(('127.0.0.1', 0), Endpoint)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    runtime = StudioRuntime(tmp_path)
    try:
        caplog.set_level(logging.DEBUG)
        runtime.notifications.save(apprise_url=f'json://127.0.0.1:{server.server_port}/secret-notification-token', download=True)
        with api_client(runtime) as api:
            assert api.post('/api/studio/notifications/test').status_code == 200
            assert 'test notification' in received[0]['title']
            status[0] = 500
            rejected = api.post('/api/studio/notifications/test')
            assert rejected.status_code == 502
            assert 'remote-secret-response' not in rejected.text
        assert 'secret-notification-token' not in caplog.text
        assert 'remote-secret-response' not in caplog.text
    finally:
        runtime.shutdown()
        server.shutdown()
        server.server_close()
        thread.join()


def test_dispatcher_does_not_hold_database_lock_and_serializes_across_runtimes(tmp_path, monkeypatch):
    import threading
    from concurrent.futures import ThreadPoolExecutor

    runtime = StudioRuntime(tmp_path)
    other = StudioRuntime(tmp_path)
    entered, release = threading.Event(), threading.Event()
    try:
        runtime.notifications.save(apprise_url=URL, download=True)
        finish(runtime, 'download', None)
        calls = []

        def slow_send(*args):
            calls.append(args)
            entered.set()
            assert release.wait(5)
            return True

        monkeypatch.setattr('studio.notifications.send', slow_send)
        with ThreadPoolExecutor(1) as pool:
            pending = pool.submit(runtime.notifications.dispatch_once)
            try:
                assert entered.wait(5)
                assert other.notifications.dispatch_once() is False
                # This writes while another runtime owns notification delivery.
                finish(other, 'download', None)
            finally:
                release.set()
            assert pending.result() is True
        assert len(calls) == 1
        other.notifications.dispatch_once()
        assert len(calls) == 2
    finally:
        release.set()
        other.shutdown()
        runtime.shutdown()


def test_upgrade_does_not_notify_historical_jobs_and_recovery_notifies_interrupted(tmp_path, monkeypatch):
    runtime = StudioRuntime(tmp_path)
    try:
        word = runtime.workspaces.create('Cedar', 'en')
        finish(runtime, 'train', word.id)
        with runtime.jobs.store.transaction() as db:
            db.execute('DROP TABLE notification_outbox')
            db.execute('DROP TABLE workspace_notifications')
            db.execute('DROP TABLE notification_settings')
            db.execute('DROP TABLE audio_trim_validation')
            db.execute('PRAGMA user_version=21')
        runtime.shutdown()
        runtime = StudioRuntime(tmp_path)
        runtime.notifications.save(apprise_url=URL, download=False)
        runtime.notifications.save_workspace(word.id, {**OFF, 'train': True})
        calls = []
        monkeypatch.setattr('studio.notifications.send', lambda *args: calls.append(args) or True)
        assert runtime.notifications.dispatch_once() is False
        job = runtime.jobs.enqueue('train', word.id, {})
        runtime.jobs.claim('gpu', runtime.clock(), job_id=job.id)
        runtime.jobs.release(job.id)  # Simulated dead owner, no child process.
        runtime.jobs.recover()
        assert runtime.jobs.get(job.id).status == 'interrupted'
        runtime.notifications.dispatch_once()
        assert len(calls) == 1 and calls[0][3] is True
        runtime.jobs.recover()
        assert runtime.notifications.dispatch_once() is False
    finally:
        runtime.shutdown()


def test_runtime_starts_and_joins_notification_worker(tmp_path, monkeypatch):
    import threading

    runtime = StudioRuntime(tmp_path)
    delivered = threading.Event()
    try:
        runtime.notifications.save(apprise_url=URL, download=True)
        finish(runtime, 'download', None)
        monkeypatch.setattr('studio.notifications.send', lambda *args: delivered.set() or True)
        runtime.start_workers()
        assert delivered.wait(5)
        runtime.shutdown()
        assert not any(t.name == 'studio-notifications' for t in threading.enumerate())
    finally:
        runtime.shutdown()


def test_job_notification_readable_details_and_complete_logs(tmp_path):
    now = datetime(2026, 10, 28, 14, 5, 6, tzinfo=timezone.utc)
    runtime = StudioRuntime(tmp_path, clock=lambda: now)
    try:
        word = runtime.workspaces.create('Cedar', 'en')
        runtime.notifications.save(apprise_url=URL, download=False)
        runtime.notifications.save_workspace(word.id, {**OFF, 'classify': True})
        job = runtime.jobs.enqueue('classify', word.id, {})

        def handler(job, context):
            context.log('First detail')
            context.log('x' * 4000)
            context.log('Last detail')
            return {}

        runtime.workers.register('classify', job.resource, handler)
        runtime.workers.run_once(job.resource)
        with runtime.jobs.store.transaction() as db:
            event = db.execute('SELECT * FROM notification_outbox').fetchone()
            logs = db.execute('SELECT log FROM studio_jobs WHERE id=?', (job.id,)).fetchone()[0]
        assert event['title'] == 'Cedar: Classification completed'
        assert 'Finished: Oct 28, 2026 at 14:05:06 UTC' in event['body']
        assert event['body'].split('\n\n', 1)[1] == logs.rstrip('\n')
        assert logs.endswith('classify complete\n')
    finally:
        runtime.shutdown()


def test_delivery_includes_logs_added_by_completion_hook(tmp_path, monkeypatch):
    runtime = StudioRuntime(tmp_path)
    try:
        word = runtime.workspaces.create('Cedar', 'en')
        runtime.notifications.save(apprise_url=URL, download=False)
        runtime.notifications.save_workspace(word.id, {**OFF, 'train': True})
        job = runtime.jobs.enqueue('train', word.id, {})
        runtime.workers.register('train', job.resource, lambda job, context: {})

        def failed_hook(job):
            raise RuntimeError('completion failure')

        runtime.workers.register_completion('train', failed_hook)
        runtime.workers.run_once(job.resource)
        calls = []
        monkeypatch.setattr('studio.notifications.send', lambda *args: calls.append(args) or True)
        runtime.notifications.dispatch_once()
        assert calls[0][2].endswith('\ncompletion_hook_failed')
    finally:
        runtime.shutdown()


@pytest.mark.parametrize('condition,failed', [('missing_credentials', True), ('fleet_refresh_failed', True),
                                            ('inactive', False), ('diagnostics_disabled', False)])
def test_collection_notification_uses_device_outcomes_not_only_failed_clip_count(tmp_path, monkeypatch, condition, failed):
    from test_studio_collection import FakeKiosk
    from test_studio_deployment import InProcessKiosk

    runtime = StudioRuntime(tmp_path)
    try:
        word = runtime.workspaces.create('Cedar', 'en')
        runtime.notifications.save(apprise_url=URL, download=False)
        runtime.notifications.save_workspace(word.id, {**OFF, 'scrape': True})
        identity = 'leader' if condition == 'fleet_refresh_failed' else 'solo'
        with runtime.jobs.store.transaction() as db:
            db.execute('INSERT INTO devices(id,url,role,active,credential_ref) VALUES (?,?,?,?,?)',
                       (identity, 'http://fixture.invalid', 'leader' if identity == 'leader' else 'standalone',
                        condition != 'inactive', None if condition == 'missing_credentials' else 'fixture'))
        if condition == 'fleet_refresh_failed':
            client = InProcessKiosk()
            client.offline.add('leader')
        else:
            client = FakeKiosk()
            client.enabled = condition != 'diagnostics_disabled'
        runtime.devices.client = client
        job = runtime.jobs.enqueue('scrape', word.id, {})
        runtime.workers.run_once('collection')
        completed = runtime.jobs.get(job.id)
        assert completed.status == 'complete'
        assert completed.result['failed'] == 0  # No individual clip failed.
        calls = []
        monkeypatch.setattr('studio.notifications.send', lambda *args: calls.append(args) or True)
        runtime.notifications.dispatch_once()
        assert len(calls) == 1
        assert calls[0][3] is failed
    finally:
        runtime.shutdown()
