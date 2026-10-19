"""Durable SQL resource claims backed by live-owner flocks and owned child groups.

Only registered handlers execute. Handler inputs are resolved when claimed, not
when queued. A running/cancelling row owns its resource until both handler and
child group are gone; elapsed time alone is never evidence of process death.
"""

import fcntl
import json
import os
import re
import signal
import subprocess
import sys
import threading
import uuid
from dataclasses import replace
from datetime import datetime, timezone
from pathlib import Path

from studio.models import Conflict, Job, LoopHealth, NotFound, Page, ValidationError, WorkerHealth
from studio.storage import open_directory

RESOURCES = {'train': 'gpu', 'generation': 'gpu', 'preview': 'gpu', 'scrape': 'collection', 'download': 'download'}
ACTIVE = ('running', 'cancelling')
LOG_LIMIT = 65536


def utc_now():
    return datetime.now(timezone.utc)


def aware_utc(value):
    if not isinstance(value, datetime) or value.tzinfo is None or value.utcoffset() is None:
        raise ValidationError('Timezone-aware time required')
    return value.astimezone(timezone.utc)


def safe_json(value):
    # No credentials, arbitrary exception strings, or command output in metadata.
    def check(item):
        if isinstance(item, dict):
            for key, child in item.items():
                if not isinstance(key, str) or re.search(r'token|secret|password|authorization|credential', key, re.I):
                    raise ValidationError('Unsafe job metadata')
                check(child)
        elif isinstance(item, list):
            for child in item:
                check(child)
    if not isinstance(value, dict):
        raise ValidationError('Job metadata must be an object')
    try:
        check(value)
        data = json.dumps(value, allow_nan=False, separators=(',', ':'))
        if len(data.encode()) > 16384:
            raise ValueError()
        return data
    except (TypeError, ValueError, RecursionError) as exc:
        raise ValidationError('Invalid job metadata') from exc


class ChildGroups:
    """Linux /proc ownership proof. Unverifiable groups are quarantined, not killed.

    All members must retain the random inherited marker, original session/group,
    and boot identity. A reused leader PID fails closed. Zombies are not running.
    """
    def __init__(self, *, proc_root=Path('/proc')):
        self.proc_root = proc_root

    def process(self, pid):
        raw = (self.proc_root / str(pid) / 'stat').read_text()
        fields = raw[raw.rfind(')') + 2:].split()
        return fields[0], int(fields[2]), int(fields[3]), fields[19]

    def boot(self):
        return (self.proc_root / 'sys/kernel/random/boot_id').read_text().strip()

    def _members(self, identity):
        if identity['boot'] != self.boot():
            return []
        pid = identity['pid']
        try:
            leader = self.process(pid)
            if leader[3] != identity['start']:
                return None
        except FileNotFoundError:
            pass
        except (OSError, ValueError, IndexError):
            return None
        members = []
        try:
            for entry in self.proc_root.iterdir():
                if not entry.name.isdigit():
                    continue
                try:
                    state, group, session, start = self.process(int(entry.name))
                    if group != pid or state == 'Z':
                        continue
                    environment = (entry / 'environ').read_bytes().split(b'\0')
                    marker = ('STUDIO_JOB_TOKEN=' + identity['token']).encode()
                    if session != pid or int(start) < int(identity['start']) or marker not in environment:
                        return None
                    members.append((int(entry.name), start))
                except FileNotFoundError:
                    continue
                except (PermissionError, OSError, ValueError, IndexError):
                    # Inaccessible nonmember processes need not block all work;
                    # inaccessible stat means membership cannot be ruled out.
                    return None
        except OSError:
            return None
        return members

    def inspect(self, identity):
        members = self._members(identity)
        return 'unknown' if members is None else ('owned' if members else 'gone')

    def stop(self, identity):
        members = self._members(identity)
        if members is None:
            return False
        for pid, start in members:
            fd = None
            try:
                # Pin this process before revalidating. Signal the pinned member,
                # not a numeric group/PID that could have been recycled.
                fd = os.pidfd_open(pid)
                current = self.process(pid)
                marker = ('STUDIO_JOB_TOKEN=' + identity['token']).encode()
                environment = (self.proc_root / str(pid) / 'environ').read_bytes().split(b'\0')
                if (current[1:3] != (identity['pid'], identity['pid'])
                        or current[3] != start or marker not in environment):
                    return False
                signal.pidfd_send_signal(fd, signal.SIGKILL)
            except ProcessLookupError:
                pass
            except (OSError, ValueError, IndexError):
                return False
            finally:
                if fd is not None:
                    os.close(fd)
        return self.inspect(identity) == 'gone'


class JobQueue:
    def __init__(self, store, *, clock=utc_now, groups=None):
        self.store, self.clock = store, clock
        self.groups = groups or ChildGroups()
        self._owners = {}
        self._lock = threading.RLock()

    @staticmethod
    def _record(row):
        return Job(row['id'], row['kind'], row['word_id'], row['resource'], json.loads(row['payload']),
                   row['status'], row['created_at'], row['started_at'], row['finished_at'], json.loads(row['result']))

    def _row(self, db, job_id):
        row = db.execute('SELECT * FROM studio_jobs WHERE id=?', (job_id,)).fetchone()
        if row is None:
            raise NotFound('Job not found')
        return row

    def _enqueue(self, db, kind, word_id, payload, dedupe_key, scope, now):
        if kind not in RESOURCES or (kind in ('train', 'generation', 'preview') and word_id is None):
            raise ValidationError('Invalid job kind or workspace')
        encoded = safe_json(payload)
        if dedupe_key is not None and (not isinstance(dedupe_key, str) or not 1 <= len(dedupe_key) <= 512):
            raise ValidationError('Invalid dedupe key')
        if word_id is not None and not db.execute('SELECT 1 FROM wakewords WHERE id=?', (word_id,)).fetchone():
            raise NotFound('Wakeword not found')
        if dedupe_key is not None:
            old = db.execute('SELECT * FROM studio_jobs WHERE dedupe_key=?', (dedupe_key,)).fetchone()
            if old:
                if (old['kind'], old['word_id'], old['payload']) != (kind, word_id, encoded):
                    raise Conflict('Dedupe key belongs to different work')
                return self._record(old)
        job_id = uuid.uuid4().hex
        db.execute('INSERT INTO studio_jobs(id,kind,word_id,resource,payload,dedupe_key,schedule_scope,status,created_at) '
                   "VALUES (?,?,?,?,?,?,?,'queued',?)",
                   (job_id, kind, word_id, RESOURCES[kind], encoded, dedupe_key, scope, aware_utc(now).isoformat()))
        return self._record(self._row(db, job_id))

    def enqueue(self, kind: str, word_id: str | None, payload: dict, dedupe_key: str | None = None) -> Job:
        if isinstance(dedupe_key, str) and dedupe_key.startswith('schedule:'):
            raise ValidationError('Reserved dedupe namespace')
        with self.store.transaction() as db:
            return self._enqueue(db, kind, word_id, payload, dedupe_key, None, self.clock())

    def get(self, job_id):
        with self.store.transaction() as db:
            return self._record(self._row(db, job_id))

    def list(self, offset=0, limit=50):
        if type(offset) is not int or type(limit) is not int or offset < 0 or not 1 <= limit <= 100:
            raise ValidationError('Invalid pagination')
        with self.store.transaction() as db:
            total = db.execute('SELECT count(*) FROM studio_jobs').fetchone()[0]
            rows = db.execute('SELECT * FROM studio_jobs ORDER BY rowid LIMIT ? OFFSET ?', (limit, offset)).fetchall()
            return Page([self._record(row) for row in rows], total, offset, limit)

    def _owner_lock(self, job_id):
        path = self.store.scoped_directory('jobs', job_id)
        with open_directory(path) as directory:
            fd = os.open('owner.lock', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600, dir_fd=directory)
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            os.close(fd)
            return None
        return fd

    def claim(self, resource, now, *, kinds=None):
        if resource not in ('gpu', 'collection', 'download'):
            raise ValidationError('Invalid resource')
        now = aware_utc(now)
        with self._lock, self.store.transaction() as db:
            if db.execute("SELECT 1 FROM studio_jobs WHERE resource=? AND status IN ('running','cancelling')", (resource,)).fetchone():
                return None
            rows = db.execute("SELECT * FROM studio_jobs WHERE resource=? AND status='queued' ORDER BY rowid", (resource,))
            row = next((row for row in rows if kinds is None or row['kind'] in kinds), None)
            if row is None:
                return None
            fd = self._owner_lock(row['id'])
            if fd is None:
                return None
            try:
                db.execute("UPDATE studio_jobs SET status='running',started_at=? WHERE id=?", (now.isoformat(), row['id']))
                self._owners[row['id']] = fd
                return self._record(self._row(db, row['id']))
            except BaseException:
                os.close(fd)
                raise

    def attach_child(self, job_id, identity):
        if (set(identity) != {'pid', 'start', 'boot', 'token'} or type(identity['pid']) is not int
                or identity['pid'] <= 1 or not re.fullmatch('[0-9a-f]{32}', identity['token'])):
            raise ValidationError('Invalid child identity')
        with self._lock, self.store.transaction() as db:
            row = self._row(db, job_id)
            if job_id not in self._owners or row['status'] not in ACTIVE or row['child']:
                raise Conflict('Job does not admit a child')
            db.execute('UPDATE studio_jobs SET child=? WHERE id=?', (json.dumps(identity), job_id))

    def _child_gone(self, row):
        return not row['child'] or self.groups.stop(json.loads(row['child']))

    def _release(self, job_id):
        fd = self._owners.pop(job_id, None)
        if fd is not None:
            os.close(fd)

    def finish(self, job_id: str, result: dict) -> Job:
        return self._finish(job_id, result, 'complete')

    def _finish(self, job_id, result, status):
        encoded = safe_json(result)
        with self._lock:
            with self.store.transaction() as db:
                row = self._row(db, job_id)
                if row['status'] not in ACTIVE or job_id not in self._owners or not self._child_gone(row):
                    raise Conflict('Job still owns work or belongs to another worker')
                status = 'cancelled' if row['status'] == 'cancelling' else status
                db.execute('UPDATE studio_jobs SET status=?,result=?,finished_at=? WHERE id=?',
                           (status, encoded, aware_utc(self.clock()).isoformat(), job_id))
                if status == 'complete' and row['kind'] == 'train':
                    # Durable outbox in the same transaction as success. A
                    # crashed/failed completion callback is recovered on startup.
                    db.execute('INSERT OR IGNORE INTO deployment_events(version_id) '
                               'SELECT id FROM model_versions WHERE run_id=?', (job_id,))
                job = self._record(self._row(db, job_id))
            self._release(job_id)
            return job

    def cancel(self, job_id: str) -> Job:
        with self.store.transaction() as db:
            row = self._row(db, job_id)
            if row['status'] == 'queued':
                db.execute("UPDATE studio_jobs SET status='cancelled',finished_at=? WHERE id=?",
                           (aware_utc(self.clock()).isoformat(), job_id))
            elif row['status'] == 'running':
                db.execute("UPDATE studio_jobs SET status='cancelling' WHERE id=?", (job_id,))
        # Live handlers observe cancellation; a dead owner is recovered safely.
        self.recover()
        return self.get(job_id)

    def recover(self) -> None:
        with self._lock:
            with self.store.transaction() as db:
                ids = [row[0] for row in db.execute("SELECT id FROM studio_jobs WHERE status IN ('running','cancelling')")]
            for job_id in ids:
                if job_id in self._owners:
                    continue
                fd = self._owner_lock(job_id)
                if fd is None:
                    continue
                try:
                    with self.store.transaction() as db:
                        row = self._row(db, job_id)
                        if row['status'] in ACTIVE and self._child_gone(row):
                            status = 'cancelled' if row['status'] == 'cancelling' else 'interrupted'
                            db.execute('UPDATE studio_jobs SET status=?,finished_at=? WHERE id=?',
                                       (status, aware_utc(self.clock()).isoformat(), job_id))
                finally:
                    os.close(fd)

    def abandon(self):
        """Release local owner descriptors only, preserving SQL claims for recovery.

        Call only after this queue's handlers have exited. Process exit performs
        the same release automatically; never use this as cancellation.
        """
        with self._lock:
            for job_id in list(self._owners):
                self._release(job_id)

    def append_log(self, job_id, text):
        # Only trusted handler progress text belongs here, never raw child output.
        if not isinstance(text, str):
            raise ValidationError('Invalid log')
        text = text[-4096:]
        with self.store.transaction() as db:
            self._row(db, job_id)
            db.execute('UPDATE studio_jobs SET log=substr(log || ?, -?) WHERE id=?', (text + '\n', LOG_LIMIT, job_id))

    def log_tail(self, job_id, limit=8192):
        if type(limit) is not int or not 1 <= limit <= LOG_LIMIT:
            raise ValidationError('Invalid log bound')
        with self.store.transaction() as db:
            return self._row(db, job_id)['log'][-limit:]


class JobContext:
    def __init__(self, queue, job, stop_event, runner):
        self.queue, self.job, self.stop_event, self.runner = queue, job, stop_event, runner

    def cancelled(self):
        return self.stop_event.is_set() or self.queue.get(self.job.id).status == 'cancelling'

    def log(self, text):
        self.queue.append_log(self.job.id, text)

    def run(self, argv, *, cwd=None):
        return self.runner.run(self, argv, cwd=cwd)


class ProcessRunner:
    """Gate exec until ownership metadata commits; EOF before commit exits safely."""
    def run(self, context, argv, *, cwd=None):
        if not isinstance(argv, (list, tuple)) or not argv or not all(isinstance(a, str) for a in argv):
            raise ValidationError('Expected argument vector')
        if context.cancelled():
            raise Conflict('Cancelled')
        read_fd, write_fd = os.pipe()
        process = None
        opened = False
        token = uuid.uuid4().hex
        gate = ('import os,sys; fd=int(sys.argv[1]); ready=os.read(fd,1); os.close(fd); '
                'ready == b"1" or sys.exit(125); os.execvpe(sys.argv[2],sys.argv[2:],os.environ)')
        try:
            process = subprocess.Popen([sys.executable, '-c', gate, str(read_fd), *argv],
                                       cwd=cwd, env={**os.environ, 'STUDIO_JOB_TOKEN': token},
                                       start_new_session=True, pass_fds=(read_fd,),
                                       stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            identity = {'pid': process.pid, 'start': ChildGroups().process(process.pid)[3],
                        'boot': ChildGroups().boot(), 'token': token}
            context.queue.attach_child(context.job.id, identity)
            os.write(write_fd, b'1')
            opened = True
        finally:
            os.close(read_fd)
            os.close(write_fd)
            # If attachment failed, EOF makes the gate exit, without executing argv.
            if process is not None and not opened:
                process.wait()
        try:
            while True:
                if context.cancelled():
                    context.queue.groups.stop(identity)
                try:
                    code = process.wait(timeout=0.1)
                    if code != 0:
                        raise Conflict('Child command failed')
                    return code
                except subprocess.TimeoutExpired:
                    continue
        finally:
            context.queue.groups.stop(identity)


class WorkerPool:
    """One thread per resource; SQL arbitration also bounds multiple runtimes.

    Unknown future kinds stay queued until their owning service registers a
    handler. No synthetic generation/training/download implementation lives here.
    """
    def __init__(self, queue, *, clock=utc_now, runner=None, schedules=None, maintenance=None):
        self.queue, self.clock, self.schedules = queue, clock, schedules
        self.runner = runner or ProcessRunner()
        self.maintenance = maintenance
        self.handlers = {}
        self.completion_hooks = {}
        self.stop_event = threading.Event()
        self.threads = []
        self._health_lock = threading.Lock()
        components = ['gpu', 'collection', 'download'] + (['scheduler'] if schedules is not None else [])
        self._health = {component: LoopHealth(component) for component in components}

    def health(self) -> WorkerHealth:
        """Process-local snapshot, independent of SQLite availability.

        Pending/stopped workers are not a readiness guarantee. Failure history
        survives successful retries, but resets with a new runtime/process.
        """
        with self._health_lock:
            loops = list(self._health.values())
            return WorkerHealth(bool(self.threads), any(loop.status == 'error' for loop in loops), loops)

    def _record_loop_result(self, component, *, failed):
        try:
            timestamp = aware_utc(self.clock()).isoformat()
        except Exception:
            # A broken injected clock must not take down error reporting too.
            timestamp = utc_now().isoformat()
        with self._health_lock:
            previous = self._health[component]
            if failed:
                code = 'scheduler_tick_failed' if component == 'scheduler' else 'resource_loop_failed'
                self._health[component] = replace(previous, status='error', last_error_code=code,
                                                 failure_count=min(previous.failure_count + 1, 2147483647),
                                                 consecutive_failures=min(previous.consecutive_failures + 1, 2147483647),
                                                 last_failure_at=timestamp)
            else:
                self._health[component] = replace(previous, status='ok', consecutive_failures=0,
                                                 last_success_at=timestamp)

    def register(self, kind, resource, handler):
        if RESOURCES.get(kind) != resource or not callable(handler):
            raise ValidationError('Invalid handler registration')
        if self.threads:
            raise Conflict('Register handlers before starting workers')
        self.handlers[kind] = handler

    def register_completion(self, kind, callback):
        """Post-commit seam for publication. Failure cannot invalidate training."""
        if kind not in self.handlers or not callable(callback):
            raise ValidationError('Invalid completion hook')
        if self.threads:
            raise Conflict('Register completion hooks before starting workers')
        self.completion_hooks[kind] = callback

    def run_once(self, resource):
        if self.stop_event.is_set():
            return False
        self.queue.recover()
        job = self.queue.claim(resource, self.clock(), kinds=self.handlers)
        if job is None:
            return False
        context = JobContext(self.queue, job, self.stop_event, self.runner)
        try:
            context.log('started')
            result = self.handlers[job.kind](job, context)
            if self.stop_event.is_set():
                self.queue.cancel(job.id)
            completed = self.queue.finish(job.id, result or {})
            if completed.status == 'complete' and job.kind in self.completion_hooks:
                try:
                    self.completion_hooks[job.kind](completed)
                except Exception:
                    context.log('completion_hook_failed')
        except Exception:
            context.log('handler_failed')
            try:
                self.queue._finish(job.id, {'error': 'handler_failed'}, 'failed')
            except Conflict:
                # The handler exited but a surviving/unknown child still owns
                # the resource. Release only the flock, never the SQL claim.
                with self.queue._lock:
                    self.queue._release(job.id)
        return True

    def _loop(self, resource):
        while not self.stop_event.is_set():
            try:
                worked = self.run_once(resource)
            except Exception:
                self._record_loop_result(resource, failed=True)
            else:
                self._record_loop_result(resource, failed=False)
                if worked:
                    continue
            self.stop_event.wait(0.25)

    def _schedule_loop(self):
        while not self.stop_event.is_set():
            try:
                self.schedules.tick(self.clock())
                if self.maintenance is not None:
                    self.maintenance(self.clock())
            except Exception:
                self._record_loop_result('scheduler', failed=True)
            else:
                self._record_loop_result('scheduler', failed=False)
            self.stop_event.wait(0.25)

    def start(self):
        if self.threads:
            return
        self.stop_event.clear()
        self.queue.recover()
        self.threads = [threading.Thread(target=self._loop, args=(resource,), name='studio-' + resource, daemon=True)
                        for resource in ('gpu', 'collection', 'download')]
        if self.schedules is not None:
            self.threads.append(threading.Thread(target=self._schedule_loop, name='studio-scheduler', daemon=True))
        for thread in self.threads:
            thread.start()

    def stop(self):
        self.stop_event.set()
        # Do not close SQLite or release claims beneath a still-running handler.
        # Network handlers already have bounded transport timeouts.
        for thread in self.threads:
            thread.join()
        self.threads = []
        self.queue.abandon()
