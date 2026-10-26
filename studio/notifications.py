"""Scoped notification preferences and a credential-safe Apprise boundary."""
import logging
import threading
from contextvars import ContextVar
from datetime import timedelta

from studio.models import RemoteRejected, ValidationError, aware_utc
from studio.storage import flock
from studio.workspaces import require_word


logger = logging.getLogger(__name__)
_sending = ContextVar('notification_sending', default=False)


class _TransportLogFilter(logging.Filter):
    def filter(self, record):
        # urllib3 DEBUG/retry messages include URL paths (often service tokens).
        # Only suppress notification transport, not unrelated application HTTP.
        return not _sending.get()


for _name in ('urllib3.connectionpool', 'urllib3.util.retry', 'urllib3.poolmanager'):
    logging.getLogger(_name).addFilter(_TransportLogFilter())
WORKSPACE_KINDS = ('scrape', 'classify', 'train', 'deploy')
LABELS = {'scrape': 'Collection', 'classify': 'Classification', 'train': 'Training',
          'deploy': 'Deployment', 'download': 'Dataset download'}


def enabled_in(db, kind, word_id):
    settings = db.execute('SELECT * FROM notification_settings WHERE id=1').fetchone()
    if not settings['apprise_url']:
        return False
    if kind == 'download' and word_id is None:
        return bool(settings['download'])
    if kind not in WORKSPACE_KINDS or word_id is None:
        return False
    row = db.execute('SELECT * FROM workspace_notifications WHERE word_id=?', (word_id,)).fetchone()
    return bool(row and row[kind])


def enqueue_in(db, key, kind, word_id, body, failed, now):
    if not enabled_in(db, kind, word_id):
        return
    word = require_word(db, word_id) if word_id is not None else None
    subject = word['phrase'] if word else 'Global'
    title = f'microWakeWord · {subject}: {LABELS[kind]} {"failed" if failed else "completed"}'
    db.execute('INSERT OR IGNORE INTO notification_outbox(event_key,word_id,kind,title,body,failed,next_retry) '
               'VALUES (?,?,?,?,?,?,?)', (key, word_id, kind, title, body, failed, now))


def job_finished_in(db, job):
    """Called in the terminal job transaction; never sends or scans old history."""
    if (job.kind not in LABELS or job.status not in ('complete', 'failed', 'interrupted')
            or job.result.get('skipped') or (job.kind == 'deploy' and job.status == 'complete')):
        return
    failed = job.status != 'complete'
    if job.kind == 'scrape':
        devices = db.execute('SELECT status FROM collection_devices WHERE run_id=?',
                             (job.result.get('run_id'),)).fetchall()
        # Device-level errors (e.g. credentials or fleet refresh) can occur before
        # any clip is attempted. Deliberately inactive/disabled sources aren't failures.
        collection_failed = (any(row['status'] not in ('complete', 'inactive', 'diagnostics_disabled') for row in devices)
                             if devices else job.result.get('status') not in (None, 'complete'))
        failed = failed or bool(job.result.get('failed')) or collection_failed
    body = f'Job: {job.id}\nStatus: {"failed" if failed else "completed"}\nFinished: {job.finished_at}'
    if job.run_number is not None:
        body += f'\nTraining run: {job.run_number}'
    if job.kind == 'download':
        identity = job.payload.get('dataset_id') or job.payload.get('augmentation_id') or job.result.get('dataset_id') or job.result.get('augmentation_id')
        if isinstance(identity, str):
            body += f'\nDataset: {identity[:200]}'
    enqueue_in(db, 'job:' + job.id, job.kind, job.word_id, body, failed, job.finished_at)


def publication_finished_in(db, publication):
    """One event per target/revision/outcome, not per retry or scheduler tick."""
    success = publication.state in ('published', 'synced')
    failed = publication.state in ('exhausted', 'staging_blocked', 'role_changed', 'archive_invalid')
    if not success and not failed:
        return
    key = f'publication:{publication.word_id}:{publication.device_id}:{publication.revision}:{"failed" if failed else "complete"}'
    body = (f'Target: {publication.device_id}\nArchive: {publication.desired_version}\n'
            f'Delivery: {publication.state}\nFinished: {publication.updated_at}')
    enqueue_in(db, key, 'deploy', publication.word_id, body, failed, publication.updated_at)


def client(url):
    if (not isinstance(url, str) or not url or len(url) > 4096
            or any(c.isspace() or ord(c) < 32 for c in url)):
        raise ValidationError('Invalid notification URL')
    try:
        # Apprise belongs to the UI environment, not the separate training/CLI
        # environments which also import JobQueue. Load only at the boundary.
        import apprise
        # Plugin diagnostics may contain URLs, remote bodies and credentials.
        apprise.logger.disabled = True
        manager = apprise.Apprise(asset=apprise.AppriseAsset(
            service_timeout=10, async_mode=False, allow_templates=False))
        if not manager.add(url) or len(manager) != 1:
            raise ValueError()
        return manager
    except Exception:
        raise ValidationError('Invalid notification URL') from None


def send(url, title, body, failed=False):
    import apprise
    token = _sending.set(True)
    try:
        return client(url).notify(title=title, body=body,
                                 notify_type=apprise.NotifyType.FAILURE if failed else apprise.NotifyType.SUCCESS)
    finally:
        _sending.reset(token)


class NotificationService:
    def __init__(self, store, *, clock):
        self.store, self.clock = store, clock
        self._stop = threading.Event()
        self._thread = None

    def settings(self):
        with self.store.transaction() as db:
            row = db.execute('SELECT * FROM notification_settings WHERE id=1').fetchone()
            return {'configured': bool(row['apprise_url']), 'download': bool(row['download'])}

    def save(self, *, download, apprise_url=None):
        if type(download) is not bool:
            raise ValidationError('Invalid notification preferences')
        if apprise_url is not None and apprise_url != '':
            client(apprise_url)
        with self.store.transaction() as db:
            db.execute('UPDATE notification_settings SET download=? WHERE id=1', (download,))
            if apprise_url is not None:
                db.execute('UPDATE notification_settings SET apprise_url=? WHERE id=1', (apprise_url,))
            if apprise_url == '':
                db.execute("UPDATE notification_outbox SET state='discarded' WHERE state='pending'")
            elif not download:
                db.execute("UPDATE notification_outbox SET state='discarded' WHERE kind='download' AND state='pending'")
        return self.settings()

    def workspace_settings(self, word_id):
        with self.store.transaction() as db:
            require_word(db, word_id)
            row = db.execute('SELECT * FROM workspace_notifications WHERE word_id=?', (word_id,)).fetchone()
            return {kind: bool(row[kind]) if row else False for kind in WORKSPACE_KINDS}

    def save_workspace(self, word_id, preferences):
        if set(preferences) != set(WORKSPACE_KINDS) or any(type(v) is not bool for v in preferences.values()):
            raise ValidationError('Invalid notification preferences')
        with self.store.transaction() as db:
            require_word(db, word_id)
            db.execute('INSERT INTO workspace_notifications(word_id,scrape,classify,train,deploy) VALUES (?,?,?,?,?) '
                       'ON CONFLICT(word_id) DO UPDATE SET scrape=excluded.scrape,classify=excluded.classify,'
                       'train=excluded.train,deploy=excluded.deploy',
                       (word_id, *(preferences[k] for k in WORKSPACE_KINDS)))
            for kind, enabled in preferences.items():
                if not enabled:
                    db.execute("UPDATE notification_outbox SET state='discarded' WHERE word_id=? AND kind=? AND state='pending'",
                               (word_id, kind))
        return self.workspace_settings(word_id)

    def test(self, word_id=None):
        with self.store.transaction() as db:
            word = require_word(db, word_id) if word_id is not None else None
            url = db.execute('SELECT apprise_url FROM notification_settings WHERE id=1').fetchone()[0]
        if not url:
            raise ValidationError('Configure notifications first')
        try:
            if send(url, 'microWakeWord: test notification',
                    'Notifications are working' + (f' for {word["phrase"]}.' if word else '.')):
                return {'sent': True}
        except Exception:
            pass
        raise RemoteRejected('Notification delivery failed')

    def dispatch_once(self):
        # Cross-process ownership without keeping a SQL transaction open over HTTP.
        with flock(self.store.root / 'notification-locks', 'dispatch', blocking=False) as owned:
            if not owned:
                return False
            now = aware_utc(self.clock())
            with self.store.transaction() as db:
                row = db.execute("SELECT * FROM notification_outbox WHERE state='pending' AND next_retry<=? ORDER BY rowid LIMIT 1",
                                 (now.isoformat(),)).fetchone()
                if row is None:
                    return False
                if not enabled_in(db, row['kind'], row['word_id']) or row['attempts'] >= 3:
                    db.execute('UPDATE notification_outbox SET state=? WHERE event_key=?',
                               ('failed' if row['attempts'] >= 3 else 'discarded', row['event_key']))
                    return True
                url = db.execute('SELECT apprise_url FROM notification_settings WHERE id=1').fetchone()[0]
                attempt = row['attempts'] + 1
                retry = (now + timedelta(seconds=30 * 2 ** (attempt - 1))).isoformat()
                # Reserve the retry before network I/O, including crash recovery.
                db.execute('UPDATE notification_outbox SET attempts=?,next_retry=? WHERE event_key=?',
                           (attempt, retry, row['event_key']))
            try:
                delivered = bool(send(url, row['title'], row['body'], bool(row['failed'])))
            except Exception:
                delivered = False
            with self.store.transaction() as db:
                db.execute("UPDATE notification_outbox SET state=? WHERE event_key=? AND state='pending'",
                           ('sent' if delivered else 'failed' if attempt >= 3 else 'pending', row['event_key']))
            if not delivered:
                logger.warning('Notification delivery failed (attempt %s/3)', attempt)
            return True

    def _loop(self):
        while not self._stop.is_set():
            try:
                if self.dispatch_once():
                    continue
            except Exception:
                # No arbitrary exceptions: the transport may include credentials.
                logger.warning('Notification worker unavailable')
            self._stop.wait(1)

    def start(self):
        if self._thread is not None:
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._loop, name='studio-notifications', daemon=True)
        self._thread.start()

    def stop(self):
        self._stop.set()
        if self._thread is not None:
            self._thread.join()
            self._thread = None
