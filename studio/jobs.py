"""Durable SQL resource claims backed by live-owner flocks and owned child groups.

Only registered handlers execute. Handler inputs are resolved when claimed, not
when queued. A running/cancelling row owns its resource until both handler and
child group are gone; elapsed time alone is never evidence of process death.
"""

import fcntl
import json
import logging
import math
import os
import re
import signal
import subprocess
import sys
import threading
import time
import uuid
import traceback
from dataclasses import replace
from pathlib import Path

from studio.models import (Conflict, Job, LoopHealth, NotFound, Page, ValidationError, WorkerHealth,
                           aware_utc, check_page, iso_now, utc_now)
from studio.storage import open_directory
from studio.errors import MESSAGES, child_error, failure_code
from studio.diagnostics import ChildDiagnostics, retain

logger = logging.getLogger(__name__)
# Automation reconcile and deployment retries; their backoffs are 30 s or longer.
MAINTENANCE_INTERVAL = 5.0

RESOURCES = {'train': 'gpu', 'generation': 'gpu', 'preview': 'gpu', 'classify': 'gpu',
             'benchmark': 'gpu', 'deploy': 'collection', 'scrape': 'collection', 'download': 'download'}
ACTIVE = ('running', 'cancelling')
LOG_LIMIT = 65536
# Bounded numeric training metrics a child may report: (label, maximum, shown as percentage).
TRAINING_METRICS = {'loss': ('loss', 1e6, False), 'accuracy': ('accuracy', 1, True), 'recall': ('recall', 1, True),
                    'precision': ('precision', 1, True), 'false_accepts_per_hour': ('false accepts/hour', 1e9, False)}


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
    def record(row):
        return Job(row['id'], row['kind'], row['word_id'], row['resource'], json.loads(row['payload']),
                   row['status'], row['created_at'], row['started_at'], row['finished_at'], json.loads(row['result']),
                   row['run_number'])

    def fetch(self, db, job_id):
        row = db.execute('SELECT * FROM studio_jobs WHERE id=?', (job_id,)).fetchone()
        if row is None:
            raise NotFound('Job not found')
        return row

    def enqueue_in(self, db, kind, word_id, payload, dedupe_key, scope, now):
        if kind not in RESOURCES or (kind in ('train', 'generation', 'preview', 'classify', 'deploy') and word_id is None):
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
                return self.record(old)
        job_id = uuid.uuid4().hex
        run_number = None
        if kind == 'train':
            run_number = db.execute("SELECT coalesce(max(run_number),0)+1 FROM studio_jobs WHERE word_id=? AND kind='train'",
                                    (word_id,)).fetchone()[0]
        db.execute('INSERT INTO studio_jobs(id,kind,word_id,resource,payload,dedupe_key,schedule_scope,status,created_at,run_number) '
                   "VALUES (?,?,?,?,?,?,?,'queued',?,?)",
                   (job_id, kind, word_id, RESOURCES[kind], encoded, dedupe_key, scope, aware_utc(now).isoformat(), run_number))
        return self.record(self.fetch(db, job_id))

    def enqueue(self, kind: str, word_id: str | None, payload: dict, dedupe_key: str | None = None) -> Job:
        if isinstance(dedupe_key, str) and dedupe_key.startswith('schedule:'):
            raise ValidationError('Reserved dedupe namespace')
        with self.store.transaction() as db:
            return self.enqueue_in(db, kind, word_id, payload, dedupe_key, None, self.clock())

    def get(self, job_id):
        with self.store.transaction() as db:
            return self.record(self.fetch(db, job_id))

    def list(self, offset=0, limit=50, *, state=None):
        check_page(offset, limit)
        if state not in (None, 'active', 'history'):
            raise ValidationError('Invalid job state filter')
        active = "status IN ('queued','running','cancelling')"
        where = '' if state is None else ' WHERE ' + (active if state == 'active' else 'NOT ' + active)
        order = 'rowid DESC' if state == 'history' else 'rowid'
        with self.store.transaction() as db:
            total = db.execute('SELECT count(*) FROM studio_jobs' + where).fetchone()[0]
            rows = db.execute('SELECT * FROM studio_jobs' + where + ' ORDER BY ' + order + ' LIMIT ? OFFSET ?', (limit, offset)).fetchall()
            return Page([self.record(row) for row in rows], total, offset, limit)

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

    def claim(self, resource, now, *, kinds=None, job_id=None):
        if resource not in ('gpu', 'collection', 'download'):
            raise ValidationError('Invalid resource')
        if job_id is not None and (not isinstance(job_id, str) or not re.fullmatch('[0-9a-f]{32}', job_id)):
            raise ValidationError('Invalid job identifier')
        now = aware_utc(now)
        with self._lock, self.store.transaction() as db:
            if db.execute("SELECT 1 FROM studio_jobs WHERE resource=? AND status IN ('running','cancelling')", (resource,)).fetchone():
                return None
            rows = db.execute("SELECT * FROM studio_jobs WHERE resource=? AND status='queued' "
                              "AND (? IS NULL OR id=?) ORDER BY rowid", (resource, job_id, job_id))
            row = next((row for row in rows if kinds is None or row['kind'] in kinds), None)
            if row is None:
                return None
            fd = self._owner_lock(row['id'])
            if fd is None:
                return None
            try:
                db.execute("UPDATE studio_jobs SET status='running',started_at=? WHERE id=?", (now.isoformat(), row['id']))
                self._owners[row['id']] = fd
                return self.record(self.fetch(db, row['id']))
            except BaseException:
                os.close(fd)
                raise

    def attach_child(self, job_id, identity):
        if (set(identity) != {'pid', 'start', 'boot', 'token'} or type(identity['pid']) is not int
                or identity['pid'] <= 1 or not re.fullmatch('[0-9a-f]{32}', identity['token'])):
            raise ValidationError('Invalid child identity')
        with self._lock, self.store.transaction() as db:
            row = self.fetch(db, job_id)
            if job_id not in self._owners or row['status'] not in ACTIVE or row['child']:
                raise Conflict('Job does not admit a child')
            db.execute('UPDATE studio_jobs SET child=? WHERE id=?', (json.dumps(identity), job_id))

    def _child_gone(self, row):
        return not row['child'] or self.groups.stop(json.loads(row['child']))

    def _release(self, job_id):
        fd = self._owners.pop(job_id, None)
        if fd is not None:
            os.close(fd)

    def release(self, job_id):
        """Drop this process's owner flock only; the SQL claim stays for recovery."""
        with self._lock:
            self._release(job_id)

    def owns(self, job_id):
        return job_id in self._owners

    def finish(self, job_id: str, result: dict, status: str = 'complete') -> Job:
        encoded = safe_json(result)
        with self._lock:
            with self.store.transaction() as db:
                row = self.fetch(db, job_id)
                if row['status'] not in ACTIVE or job_id not in self._owners or not self._child_gone(row):
                    raise Conflict('Job still owns work or belongs to another worker')
                status = 'cancelled' if row['status'] == 'cancelling' else status
                db.execute('UPDATE studio_jobs SET status=?,result=?,finished_at=? WHERE id=?',
                           (status, encoded, iso_now(self.clock), job_id))
                if status == 'complete' and row['kind'] == 'train':
                    # Durable outbox in the same transaction as success. A
                    # crashed/failed completion callback is recovered on startup.
                    db.execute('INSERT OR IGNORE INTO deployment_events(version_id) '
                               'SELECT id FROM model_versions WHERE run_id=?', (job_id,))
                job = self.record(self.fetch(db, job_id))
            self._release(job_id)
            return job

    def cancel(self, job_id: str) -> Job:
        with self.store.transaction() as db:
            row = self.fetch(db, job_id)
            if row['status'] == 'queued':
                db.execute("UPDATE studio_jobs SET status='cancelled',finished_at=? WHERE id=?",
                           (iso_now(self.clock), job_id))
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
                        row = self.fetch(db, job_id)
                        if row['status'] in ACTIVE and self._child_gone(row):
                            status = 'cancelled' if row['status'] == 'cancelling' else 'interrupted'
                            db.execute('UPDATE studio_jobs SET status=?,finished_at=? WHERE id=?',
                                       (status, iso_now(self.clock), job_id))
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
            self.fetch(db, job_id)
            db.execute('UPDATE studio_jobs SET log=substr(log || ?, -?) WHERE id=?', (text + '\n', LOG_LIMIT, job_id))

    def log_tail(self, job_id, limit=8192):
        if type(limit) is not int or not 1 <= limit <= LOG_LIMIT:
            raise ValidationError('Invalid log bound')
        with self.store.transaction() as db:
            return self.fetch(db, job_id)['log'][-limit:]


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
    @staticmethod
    def _progress(context, raw):
        # The child can submit only enumerated stages and bounded counters, never
        # free-form messages, paths, exception text or model responses.
        try:
            event = json.loads(raw)
            if not isinstance(event, dict) or set(event) - {'stage', 'engine', 'completed', 'total', 'reason', *TRAINING_METRICS}:
                return
            stage = event.get('stage')
            if stage not in ('preparing', 'loading', 'generating', 'qualifying', 'qualified',
                              'normalizing', 'validating', 'saved', 'staging', 'augmenting', 'training', 'evaluating', 'incomplete'):
                return
            engine = event.get('engine')
            if engine is not None and engine not in ('omnivoice', 'qwen3', 'moss', 'piper'):
                return
            if stage == 'incomplete':
                reasons = {'candidate_budget': 'candidate budget exhausted', 'time_budget': 'time budget exhausted',
                           'no_progress': 'repeated rounds made no progress', 'engine_error': 'repeated engine failures'}
                reason = event.get('reason')
                done, total = event.get('completed'), event.get('total')
                if (not isinstance(reason, str) or reason not in reasons or type(done) is not int
                        or type(total) is not int or not 0 <= done < total <= 100000000
                        or engine is not None or set(event) != {'stage', 'completed', 'total', 'reason'}):
                    return
                context.log(f'Generation incomplete: retained {done}/{total}; missing {total - done}; '
                            f'{reasons[reason]}. Retained clips are preserved; local-admin recovery is available '
                            'for failed OmniVoice-only jobs. Do not rerun in place.')
                return True
            if 'reason' in event:
                return
            count = ''
            if 'completed' in event or 'total' in event:
                done, total = event.get('completed'), event.get('total')
                if type(done) is not int or type(total) is not int or not 0 <= done <= total <= 100000000:
                    return
                count = f' {done}/{total}'
            metrics = []
            for name, (label, upper, percent) in TRAINING_METRICS.items():
                if name not in event:
                    continue
                value = event[name]
                if type(value) not in (int, float) or not math.isfinite(value) or not 0 <= value <= upper:
                    return
                metrics.append(f'{label} {value * 100:.2f}%' if percent else f'{label} {value:.4f}')
            if metrics and stage not in ('training', 'evaluating'):
                return
            name = 'Validation' if stage == 'evaluating' else stage.capitalize()
            context.log(f'{name}{" " + engine if engine else ""}{count}{"".join(" · " + m for m in metrics)}')
            return True
        except (ValueError, UnicodeError, RecursionError):
            return

    def run(self, context, argv, *, cwd=None):
        if not isinstance(argv, (list, tuple)) or not argv or not all(isinstance(a, str) for a in argv):
            raise ValidationError('Expected argument vector')
        if context.cancelled():
            raise Conflict('Cancelled')
        read_fd, write_fd = os.pipe()
        progress_read, progress_write = os.pipe()
        os.set_blocking(progress_read, False)
        process = None
        diagnostics = None
        opened = False
        token = uuid.uuid4().hex
        gate = ('import os,sys; fd=int(sys.argv[1]); ready=os.read(fd,1); os.close(fd); '
                'ready == b"1" or sys.exit(125); os.execvpe(sys.argv[2],sys.argv[2:],os.environ)')
        try:
            process = subprocess.Popen([sys.executable, '-c', gate, str(read_fd), *argv],
                                       cwd=cwd, env={**os.environ, 'STUDIO_JOB_TOKEN': token,
                                                     'STUDIO_PROGRESS_FD': str(progress_write)},
                                       start_new_session=True, pass_fds=(read_fd, progress_write),
                                       stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            diagnostics = ChildDiagnostics(process.stdout)
            identity = {'pid': process.pid, 'start': ChildGroups().process(process.pid)[3],
                        'boot': ChildGroups().boot(), 'token': token}
            context.queue.attach_child(context.job.id, identity)
            os.write(write_fd, b'1')
            opened = True
        finally:
            os.close(read_fd)
            os.close(write_fd)
            os.close(progress_write)
            # If attachment failed, EOF makes the gate exit, without executing argv.
            if process is not None and not opened:
                process.wait()
                if diagnostics is not None:
                    retain(context.queue.store, context.job.id, diagnostics.finish())
            if not opened:
                os.close(progress_read)
        pending = b''
        dropping = False
        started = heartbeat = time.monotonic()

        def drain():
            nonlocal pending, dropping, heartbeat
            try:
                data = os.read(progress_read, 65536)
            except BlockingIOError:
                return
            for part in data.splitlines(keepends=True):
                end = part.endswith(b'\n')
                if not dropping:
                    pending += part
                    if len(pending) > 2048:
                        pending, dropping = b'', True
                if end:
                    if not dropping and self._progress(context, pending):
                        # Fresh structured progress replaces the generic heartbeat.
                        heartbeat = time.monotonic()
                    pending, dropping = b'', False
        try:
            while True:
                drain()
                now = time.monotonic()
                if now - heartbeat >= 15:
                    context.log(f'Child operation still running ({int(now - started)}s elapsed)')
                    heartbeat = now
                if context.cancelled():
                    context.queue.groups.stop(identity)
                try:
                    code = process.wait(timeout=0.1)
                    drain()
                    if code != 0:
                        context.log(f'Child operation exited with code {code}')
                        output = diagnostics.finish()
                        raise child_error(output.decode('utf-8', errors='replace'))
                    return code
                except subprocess.TimeoutExpired:
                    continue
        finally:
            os.close(progress_read)
            context.queue.groups.stop(identity)
            if diagnostics is not None:
                retain(context.queue.store, context.job.id, diagnostics.finish())


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
            timestamp = iso_now(self.clock)
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

    def run_once(self, resource, *, job_id=None):
        if self.stop_event.is_set():
            return False
        self.queue.recover()
        job = self.queue.claim(resource, self.clock(), kinds=self.handlers,
                               **({'job_id': job_id} if job_id is not None else {}))
        if job is None:
            return False
        context = JobContext(self.queue, job, self.stop_event, self.runner)
        try:
            context.log(f'{job.kind} started')
            result = self.handlers[job.kind](job, context)
            if self.stop_event.is_set():
                self.queue.cancel(job.id)
            completed = self.queue.finish(job.id, result or {})
            context.log(f'{job.kind} {completed.status}' + (' (skipped)' if (result or {}).get('skipped') else ''))
            if completed.status == 'complete' and job.kind in self.completion_hooks:
                try:
                    self.completion_hooks[job.kind](completed)
                except Exception:
                    logger.exception('%s completion hook failed for job %s', job.kind, job.id)
                    context.log('completion_hook_failed')
        except Exception as exc:
            code = failure_code(exc)
            try:
                retain(self.queue.store, job.id, traceback.format_exc().encode())
            except (OSError, ValidationError):
                pass  # Reporting must not leave a failed job owning a resource.
            context.log(f'{job.kind} handler_failed')
            context.log(MESSAGES[code])
            try:
                completed = self.queue.finish(job.id, {'error': 'handler_failed', 'error_code': code,
                                                       'message': MESSAGES[code]}, 'failed')
                context.log(f'{job.kind} {completed.status}')
            except Conflict:
                # The handler exited but a surviving/unknown child still owns
                # the resource. Release only the flock, never the SQL claim.
                self.queue.release(job.id)
        return True

    def _loop(self, resource):
        while not self.stop_event.is_set():
            try:
                worked = self.run_once(resource)
            except Exception:
                logger.exception('%s worker loop failed', resource)
                self._record_loop_result(resource, failed=True)
            else:
                self._record_loop_result(resource, failed=False)
                if worked:
                    continue
            self.stop_event.wait(0.25)

    def _schedule_loop(self):
        next_maintenance = 0.0
        while not self.stop_event.is_set():
            try:
                self.schedules.tick(self.clock())
                if self.maintenance is not None and time.monotonic() >= next_maintenance:
                    next_maintenance = time.monotonic() + MAINTENANCE_INTERVAL
                    self.maintenance(self.clock())
            except Exception:
                logger.exception('scheduler tick failed')
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
