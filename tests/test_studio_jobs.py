import os
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient
from studio.db import Store
from studio.jobs import JobQueue, WorkerPool, ChildGroups, ProcessRunner, JobContext
from studio.models import Conflict, ValidationError
from studio.runtime import StudioRuntime
from studio.workspaces import WorkspaceService


class FakeGroups:
    def __init__(self):
        self.state = 'gone'
        self.stopped = []

    def stop(self, identity):
        if self.state == 'owned':
            self.stopped.append(identity)
        return self.state == 'gone'


class JobTests(unittest.TestCase):
    def test_worker_logs_terminal_status_for_each_kind(self):
        for kind, resource in (('train', 'gpu'), ('generation', 'gpu'), ('preview', 'gpu'),
                               ('classify', 'gpu'), ('scrape', 'collection'),
                               ('deploy', 'collection'), ('download', 'download')):
            with self.subTest(kind=kind):
                job = self.enqueue(kind)
                pool = WorkerPool(self.jobs, clock=lambda: self.now)
                pool.register(kind, resource, lambda job, context: {})
                pool.run_once(resource)
                log = self.jobs.log_tail(job.id)
                self.assertIn(kind, log)
                self.assertIn('complete', log)

    def test_child_progress_is_bounded_and_credential_safe(self):
        import sys
        import threading
        job = self.enqueue('generation')
        self.jobs.claim('gpu', self.now)
        context = JobContext(self.jobs, job, threading.Event(), None)
        # Actual subprocess: neither arbitrary output nor untrusted event fields
        # may enter the log. Valid events must be visible before the child exits.
        script = '''import os,json,time
fd = int(os.environ.get('STUDIO_PROGRESS_FD', '-1'))
print('secret-stdout', flush=True)
if fd >= 0:
 os.write(fd, b'x' * 9000 + b'\\n')
 for event in [{'stage':'secret-token'}, {'stage':'generating','engine':'secret-token'},
               {'stage':'generating','engine':'qwen3','completed':1,'total':4},
               {'stage':'generating','engine':'qwen3','completed':2,'total':4,'secret':'private'}]:
  os.write(fd, (json.dumps(event)+'\\n').encode())
time.sleep(.5)
'''
        with patch.object(self.jobs, 'groups', ChildGroups()):
            thread = threading.Thread(target=lambda: ProcessRunner().run(context, [sys.executable, '-c', script]))
            thread.start()
            try:
                import time
                deadline = time.monotonic() + 3
                while time.monotonic() < deadline and thread.is_alive():
                    if '1/4' in self.jobs.log_tail(job.id):
                        break
                    time.sleep(.01)
                self.assertTrue(thread.is_alive(), 'progress must arrive while child is running')
                log = self.jobs.log_tail(job.id)
                self.assertIn('qwen3', log)
                self.assertIn('1/4', log)
                self.assertNotIn('secret', log)
                self.assertNotIn('private', log)
                self.assertNotIn('2/4', log)
            finally:
                thread.join(5)
                self.assertFalse(thread.is_alive())
        self.jobs.finish(job.id, {})

    def test_global_active_listing_is_complete_and_history_newest_first(self):
        older = self.enqueue()
        with self.store.transaction() as db:
            db.execute("UPDATE studio_jobs SET status='complete' WHERE id=?", (older.id,))
        newer = self.jobs.enqueue('download', None, {})
        with self.store.transaction() as db:
            db.execute("UPDATE studio_jobs SET status='failed' WHERE id=?", (newer.id,))
        other = WorkspaceService(self.store).create('Other', 'en', 'other')
        jobs = [self.jobs.enqueue('scrape', other.id, {'device_ids': ['follower']}) for _ in range(105)]
        first = self.jobs.list(0, 100, state='active')
        second = self.jobs.list(100, 100, state='active')
        self.assertEqual(first.total, 105)
        self.assertEqual([j.id for j in first.items + second.items], [j.id for j in jobs])
        self.assertEqual(first.items[0].payload['device_ids'], ['follower'])
        history = self.jobs.list(state='history')
        self.assertEqual([j.id for j in history.items], [newer.id, older.id])
        self.assertEqual(history.total, 2)
        with self.assertRaises(ValidationError):
            self.jobs.list(state='invalid')

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.store = Store.open(self.root)
        self.addCleanup(self.store.close)
        self.now = datetime(2026, 1, 1, tzinfo=timezone.utc)
        self.groups = FakeGroups()
        self.jobs = JobQueue(self.store, clock=lambda: self.now, groups=self.groups)
        self.word = WorkspaceService(self.store).create('Hello', 'en', 'hello')

    def enqueue(self, kind='train', key=None):
        return self.jobs.enqueue(kind, self.word.id, {}, key)

    def test_training_jobs_get_sequential_per_workspace_run_numbers(self):
        other = WorkspaceService(self.store).create('Other', 'en', 'other')
        first, generation, second = self.enqueue(), self.enqueue('generation'), self.enqueue()
        elsewhere = self.jobs.enqueue('train', other.id, {})
        self.assertEqual((first.run_number, second.run_number, elsewhere.run_number), (1, 2, 1))
        self.assertIsNone(generation.run_number)
        self.assertEqual(self.jobs.get(second.id).run_number, 2)
        self.assertEqual(self.enqueue(key='same').run_number, self.enqueue(key='same').run_number)

    def test_run_number_migration_backfills_existing_training_jobs_in_creation_order(self):
        jobs = [self.enqueue(), self.enqueue('generation'), self.enqueue()]
        with self.store.transaction() as db:
            db.execute('DROP INDEX studio_jobs_run_number')
            db.execute('ALTER TABLE studio_jobs DROP COLUMN run_number')
            db.execute('PRAGMA user_version=17')
        self.store.close()
        self.store = Store.open(self.root)
        self.addCleanup(self.store.close)
        queue = JobQueue(self.store, groups=self.groups)
        self.assertEqual([queue.get(job.id).run_number for job in jobs], [1, None, 2])
        self.assertEqual(queue.enqueue('train', self.word.id, {}).run_number, 3)

    def test_training_progress_metrics_are_bounded_and_formatted(self):
        import json
        job = self.enqueue()
        context = JobContext(self.jobs, job, None, None)
        accepted = [{'stage': 'training', 'completed': 400, 'total': 40000, 'loss': 0.1234, 'accuracy': 0.951},
                    {'stage': 'evaluating', 'completed': 500, 'total': 40000, 'recall': 0.9, 'false_accepts_per_hour': 0.5},
                    {'stage': 'augmenting'}]
        rejected = [{'stage': 'training', 'accuracy': 1.5}, {'stage': 'training', 'loss': True},
                    {'stage': 'generating', 'loss': 0.1}, {'stage': 'training', 'loss': 'secret'},
                    {'stage': 'training', 'learning_rate': 0.001}]
        for event in accepted + rejected:
            ProcessRunner._progress(context, json.dumps(event).encode())
        lines = self.jobs.log_tail(job.id).splitlines()
        self.assertEqual(lines, ['Training 400/40000 · loss 0.1234 · accuracy 95.10%',
                                 'Validation 500/40000 · recall 90.00% · false accepts/hour 0.5000', 'Augmenting'])

    def test_gpu_generation_and_training_share_durable_claim(self):
        train = self.enqueue()
        self.enqueue('generation')
        other_store = Store.open(self.root)
        self.addCleanup(other_store.close)
        other = JobQueue(other_store, groups=self.groups)
        self.assertEqual(self.jobs.claim('gpu', self.now).id, train.id)
        self.assertIsNone(other.claim('gpu', self.now))
        other.recover()  # a live worker's ownership lock cannot be stolen
        self.assertEqual(other.get(train.id).status, 'running')
        self.jobs.finish(train.id, {'ok': True})
        second = other.claim('gpu', self.now)
        self.assertEqual(second.kind, 'generation')
        other.finish(second.id, {})

    def test_distinct_resources_and_deduplication(self):
        first = self.enqueue(key='manual')
        self.assertEqual(self.enqueue(key='manual').id, first.id)
        self.jobs.enqueue('scrape', None, {})
        self.jobs.enqueue('download', None, {})
        claimed = [self.jobs.claim(r, self.now) for r in ('gpu', 'collection', 'download')]
        self.assertEqual(len({j.id for j in claimed}), 3)
        for job in claimed:
            self.jobs.finish(job.id, {})

    def test_recovery_keeps_gpu_blocked_until_child_group_is_gone(self):
        job = self.enqueue()
        self.enqueue('generation')
        self.jobs.claim('gpu', self.now)
        self.jobs.attach_child(job.id, {'pid': 123, 'start': '456', 'boot': 'boot', 'token': 'a' * 32})
        self.jobs.abandon()  # simulate dead worker releasing its flock, not its SQL claim
        self.store.close()
        self.store = Store.open(self.root)
        self.addCleanup(self.store.close)
        for state in ('owned', 'unknown'):
            self.groups.state = state
            restarted = JobQueue(self.store, groups=self.groups)
            restarted.recover()
            self.assertEqual(restarted.get(job.id).status, 'running')
            self.assertIsNone(restarted.claim('gpu', self.now))
        self.assertEqual(len(self.groups.stopped), 1)
        self.groups.state = 'gone'
        restarted.recover()
        self.assertEqual(restarted.get(job.id).status, 'interrupted')
        next_job = restarted.claim('gpu', self.now)
        restarted.finish(next_job.id, {})

    def test_cancellation_does_not_release_running_handler_early(self):
        job = self.enqueue()
        self.enqueue('generation')
        self.jobs.claim('gpu', self.now)
        self.assertEqual(self.jobs.cancel(job.id).status, 'cancelling')
        self.assertIsNone(self.jobs.claim('gpu', self.now))
        self.assertEqual(self.jobs.finish(job.id, {}).status, 'cancelled')
        waiting = self.jobs.list().items[1]
        self.assertEqual(self.jobs.cancel(waiting.id).status, 'cancelled')

    def test_finish_rejects_live_or_unknown_child_and_foreign_owner(self):
        job = self.enqueue()
        self.jobs.claim('gpu', self.now)
        other = JobQueue(self.store, groups=self.groups)
        with self.assertRaises(Conflict):
            other.finish(job.id, {})
        self.jobs.attach_child(job.id, {'pid': 123, 'start': '1', 'boot': 'boot', 'token': 'b' * 32})
        self.groups.state = 'unknown'
        with self.assertRaises(Conflict):
            self.jobs.finish(job.id, {})
        self.groups.state = 'gone'
        self.jobs.finish(job.id, {})

    def test_logs_are_bounded_and_errors_never_persist_exception_text(self):
        job = self.enqueue()
        for _ in range(40):
            self.jobs.append_log(job.id, 'x' * 4000)
        self.assertLessEqual(len(self.jobs.log_tail(job.id, 65536)), 65536)
        pool = WorkerPool(self.jobs, clock=lambda: self.now)
        pool.register('train', 'gpu', lambda job, context: (_ for _ in ()).throw(RuntimeError('secret-token')))
        pool.run_once('gpu')
        self.assertEqual(self.jobs.get(job.id).status, 'failed')
        self.assertNotIn('secret-token', self.jobs.log_tail(job.id))

    def test_registration_and_collection_handler_use_injected_services(self):
        pool = WorkerPool(self.jobs, clock=lambda: self.now)
        seen = []
        pool.register('scrape', 'collection', lambda job, context: seen.append(job.payload) or {'run_id': 'run'})
        job = self.jobs.enqueue('scrape', None, {'device_ids': []})
        self.assertTrue(pool.run_once('collection'))
        self.assertEqual(seen, [{'device_ids': []}])
        self.assertEqual(self.jobs.get(job.id).result, {'run_id': 'run'})
        self.assertFalse(pool.run_once('collection'))

    def test_validation(self):
        for kind, payload in [('unknown', {}), ('scrape', {'token': 'secret'}), ('train', {'x': float('nan')})]:
            with self.subTest(kind=kind), self.assertRaises(ValidationError):
                self.jobs.enqueue(kind, None, payload)
        with self.assertRaises(ValidationError):
            self.jobs.claim('cpu', self.now)

    def test_unregistered_jobs_wait_and_injected_runner_executes_at_claim_time(self):
        from types import SimpleNamespace
        calls = []
        runner = SimpleNamespace(run=lambda context, argv, cwd=None: calls.append((context.job.id, argv)) or 0)
        pool = WorkerPool(self.jobs, clock=lambda: self.now, runner=runner)
        job = self.enqueue()
        self.assertFalse(pool.run_once('gpu'))
        self.assertEqual(self.jobs.get(job.id).status, 'queued')
        pool.register('train', 'gpu', lambda job, context: context.run(['injected-trainer']) or {})
        pool.run_once('gpu')
        self.assertEqual(calls, [(job.id, ['injected-trainer'])])

    def test_failed_child_attachment_closes_gate_and_reaps_without_exec(self):
        import threading
        from unittest.mock import Mock
        job = self.enqueue()
        self.jobs.claim('gpu', self.now)
        process = Mock(pid=123)
        context = JobContext(self.jobs, job, threading.Event(), None)
        with patch('studio.jobs.subprocess.Popen', return_value=process), \
             patch.object(ChildGroups, 'process', return_value=('S', 123, 123, '456')), \
             patch.object(ChildGroups, 'boot', return_value='boot'), \
             patch.object(self.jobs, 'attach_child', side_effect=RuntimeError('DB failure')), \
             patch('studio.jobs.os.write') as gate:
            with self.assertRaises(RuntimeError):
                ProcessRunner().run(context, ['never-executed'])
            gate.assert_not_called()
            process.wait.assert_called_once()
        self.jobs.finish(job.id, {})

    def test_gate_opens_only_after_child_identity_commits(self):
        import threading
        from unittest.mock import Mock
        job = self.enqueue()
        self.jobs.claim('gpu', self.now)
        process = Mock(pid=123)
        process.wait.return_value = 0
        context = JobContext(self.jobs, job, threading.Event(), None)
        def open_gate(fd, data):
            with self.store.transaction() as db:
                import json
                self.assertEqual(json.loads(db.execute('SELECT child FROM studio_jobs WHERE id=?', (job.id,)).fetchone()[0])['pid'], 123)
            return 1
        with patch('studio.jobs.subprocess.Popen', return_value=process) as spawn, \
             patch.object(ChildGroups, 'process', return_value=('S', 123, 123, '456')), \
             patch.object(ChildGroups, 'boot', return_value='boot'), \
             patch('studio.jobs.os.write', side_effect=open_gate):
            self.assertEqual(ProcessRunner().run(context, ['safe-command']), 0)
            self.assertTrue(spawn.call_args.kwargs['start_new_session'])
            self.assertIn('STUDIO_JOB_TOKEN', spawn.call_args.kwargs['env'])
        self.jobs.finish(job.id, {})

    def test_nonzero_child_exit_is_a_failed_job_not_success(self):
        import threading
        from unittest.mock import Mock
        job = self.enqueue()
        self.jobs.claim('gpu', self.now)
        process = Mock(pid=123)
        process.wait.return_value = 7
        context = JobContext(self.jobs, job, threading.Event(), None)
        with patch('studio.jobs.subprocess.Popen', return_value=process), \
             patch.object(ChildGroups, 'process', return_value=('S', 123, 123, '456')), \
             patch.object(ChildGroups, 'boot', return_value='boot'), \
             patch('studio.jobs.os.write'):
            with self.assertRaises(Conflict):
                ProcessRunner().run(context, ['failed-command'])
        self.jobs._finish(job.id, {'error': 'handler_failed'}, 'failed')

    def test_scheduler_dedupe_namespace_cannot_be_forged_by_manual_enqueue(self):
        with self.assertRaises(ValidationError):
            self.enqueue(key='schedule:scrape:2026-01-01T00:00:00+00:00')

    def test_three_bounded_worker_threads_join_before_claims_are_released(self):
        from unittest.mock import Mock
        pool = WorkerPool(self.jobs, clock=lambda: self.now)
        threads = [Mock() for _ in range(3)]
        with patch('studio.jobs.threading.Thread', side_effect=threads) as create:
            pool.start()
            pool.start()
            self.assertEqual(create.call_count, 3)
            self.assertEqual([call.kwargs['args'][0] for call in create.call_args_list], ['gpu', 'collection', 'download'])
            pool.stop()
        self.assertTrue(pool.stop_event.is_set())
        for thread in threads:
            thread.start.assert_called_once()
            thread.join.assert_called_once()

    def test_scheduler_has_its_own_thread_so_slow_collection_cannot_delay_gpu_ticks(self):
        from unittest.mock import Mock
        pool = WorkerPool(self.jobs, schedules=Mock())
        threads = [Mock() for _ in range(4)]
        with patch('studio.jobs.threading.Thread', side_effect=threads) as create:
            pool.start()
            self.assertEqual(create.call_count, 4)
            self.assertIn('studio-scheduler', [call.kwargs['name'] for call in create.call_args_list])
            pool.stop()

    def test_concurrent_gpu_claims_across_connections_have_one_owner(self):
        from concurrent.futures import ThreadPoolExecutor
        from threading import Barrier
        self.enqueue()
        self.enqueue('generation')
        other_store = Store.open(self.root)
        self.addCleanup(other_store.close)
        other = JobQueue(other_store)
        barrier = Barrier(2)
        def claim(queue):
            barrier.wait()
            return queue.claim('gpu', self.now)
        with ThreadPoolExecutor(max_workers=2) as executor:
            owners = list(executor.map(claim, [self.jobs, other]))
        self.assertEqual(sum(job is not None for job in owners), 1)
        for queue, job in zip([self.jobs, other], owners):
            if job:
                queue.finish(job.id, {})

    def test_v4_migration_preserves_workspace_and_device(self):
        import sqlite3
        with tempfile.TemporaryDirectory() as root:
            studio = Path(root) / 'studio'
            studio.mkdir()
            db = sqlite3.connect(studio / 'studio.sqlite3')
            for filename in ('schema.sql', 'schema_samples.sql', 'schema_devices.sql', 'schema_collection.sql'):
                db.executescript((Path('studio') / filename).read_text())
            db.execute("INSERT INTO wakewords VALUES ('word','Hello','en','hello','then','then')")
            db.execute("INSERT INTO devices(id,url,role) VALUES ('device','http://unused.invalid','standalone')")
            db.execute('PRAGMA user_version=4')
            db.commit()
            db.close()
            store = Store.open(Path(root))
            try:
                self.assertEqual(WorkspaceService(store).get('word').model_id, 'hello')
                self.assertEqual(JobQueue(store).list().total, 0)
                with store.transaction() as db:
                    self.assertEqual(db.execute('PRAGMA user_version').fetchone()[0], 18)
                    self.assertEqual(db.execute("SELECT role FROM devices WHERE id='device'").fetchone()[0], 'standalone')
            finally:
                store.close()

    def test_each_background_loop_reports_repeated_failure_then_recovery_at_bounded_cadence(self):
        import sqlite3
        from datetime import timedelta
        from studio.schedules import ScheduleService
        for component in ('gpu', 'collection', 'download', 'scheduler'):
            with self.subTest(component=component):
                self.now = datetime(2026, 1, 1, tzinfo=timezone.utc)
                schedules = ScheduleService(self.store, self.jobs, clock=lambda: self.now)
                pool = WorkerPool(self.jobs, clock=lambda: self.now, schedules=schedules)
                snapshots, delays = [], []
                original_transaction = self.store.transaction
                def transaction():
                    if len(snapshots) < 2:
                        raise sqlite3.OperationalError('Authorization: Bearer private-token')
                    return original_transaction()
                def wait(delay):
                    delays.append(delay)
                    snapshots.append(pool.health())
                    self.now += timedelta(seconds=1)
                    if len(snapshots) == 3:
                        pool.stop_event.set()
                with patch.object(self.store, 'transaction', side_effect=transaction), \
                     patch.object(pool.stop_event, 'wait', side_effect=wait):
                    if component == 'scheduler':
                        pool._schedule_loop()
                    else:
                        pool._loop(component)
                self.assertEqual(delays, [0.25, 0.25, 0.25])
                states = [next(loop for loop in health.loops if loop.component == component) for health in snapshots]
                self.assertEqual([state.status for state in states], ['error', 'error', 'ok'])
                self.assertEqual([state.failure_count for state in states], [1, 2, 2])
                self.assertEqual([state.consecutive_failures for state in states], [1, 2, 0])
                self.assertEqual([health.degraded for health in snapshots], [True, True, False])
                self.assertEqual(states[-1].last_failure_at, '2026-01-01T00:00:01+00:00')
                self.assertEqual(states[-1].last_success_at, '2026-01-01T00:00:02+00:00')
                expected_code = 'scheduler_tick_failed' if component == 'scheduler' else 'resource_loop_failed'
                self.assertEqual(states[-1].last_error_code, expected_code)
                self.assertEqual(len(snapshots[-1].loops), 4)
                self.assertNotIn('private-token', repr(snapshots))
                snapshots[-1].loops.clear()
                self.assertEqual(len(pool.health().loops), 4)

    def test_failure_counters_saturate_without_unbounded_error_history(self):
        from dataclasses import replace
        pool = WorkerPool(self.jobs, clock=lambda: self.now)
        # Model an already long-running failing process without billions of iterations.
        pool._health['gpu'] = replace(pool.health().loops[0], failure_count=2147483646,
                                      consecutive_failures=2147483646)
        count = 0
        def wait(delay):
            nonlocal count
            count += 1
            if count == 3:
                pool.stop_event.set()
        with patch.object(self.jobs, 'recover', side_effect=RuntimeError('secret')), \
             patch.object(pool.stop_event, 'wait', side_effect=wait):
            pool._loop('gpu')
        gpu = pool.health().loops[0]
        self.assertEqual((gpu.failure_count, gpu.consecutive_failures), (2147483647, 2147483647))
        self.assertEqual(len(pool.health().loops), 3)
        self.assertNotIn('secret', repr(pool.health()))

    def test_scheduler_recovery_admits_due_work_and_keeps_failure_history(self):
        import sqlite3
        from datetime import timedelta
        from studio.schedules import ScheduleService
        schedules = ScheduleService(self.store, self.jobs, clock=lambda: self.now)
        schedules.save('scrape', '* * * * *', 'UTC', True)
        self.now += timedelta(minutes=1)
        pool = WorkerPool(self.jobs, clock=lambda: self.now, schedules=schedules)
        original_transaction = self.store.transaction
        attempts = []
        def transaction():
            if not attempts:
                raise sqlite3.OperationalError('secret outage')
            return original_transaction()
        def wait(delay):
            attempts.append(pool.health())
            self.now += timedelta(minutes=1)
            if len(attempts) == 2:
                pool.stop_event.set()
        with patch.object(self.store, 'transaction', side_effect=transaction), \
             patch.object(pool.stop_event, 'wait', side_effect=wait):
            pool._schedule_loop()
        self.assertEqual(self.jobs.list().total, 1)
        self.assertEqual(self.jobs.list().items[0].kind, 'scrape')
        self.assertEqual([health.degraded for health in attempts], [True, False])
        scheduler = attempts[-1].loops[-1]
        self.assertEqual((scheduler.failure_count, scheduler.consecutive_failures), (1, 0))
        self.assertEqual(scheduler.last_failure_at, '2026-01-01T00:01:00+00:00')
        self.assertEqual(scheduler.last_success_at, '2026-01-01T00:02:00+00:00')


class ChildGroupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.proc = Path(self.temp.name)
        (self.proc / 'sys/kernel/random').mkdir(parents=True)
        (self.proc / 'sys/kernel/random/boot_id').write_text('boot')
        self.identity = {'pid': 123, 'start': '456', 'boot': 'boot', 'token': 'a' * 32}

    def member(self, pid, group=123, session=123, start=456, token=None):
        directory = self.proc / str(pid)
        directory.mkdir(exist_ok=True)
        fields = ['S', '1', str(group), str(session)] + ['0'] * 15 + [str(start)]
        (directory / 'stat').write_text(f'{pid} (command with spaces) ' + ' '.join(fields))
        (directory / 'environ').write_bytes(('STUDIO_JOB_TOKEN=' + (token or self.identity['token'])).encode() + b'\0')

    def test_owned_descendants_without_leader_are_safely_signalled_via_pidfds(self):
        self.member(124)
        groups = ChildGroups(proc_root=self.proc)
        with patch('studio.jobs.os.pidfd_open', return_value=987) as opened, \
             patch('studio.jobs.signal.pidfd_send_signal') as sent, \
             patch('studio.jobs.os.close'):
            self.assertFalse(groups.stop(self.identity))  # fixture remains alive
            opened.assert_called_once_with(124)
            sent.assert_called_once_with(987, __import__('signal').SIGKILL)

    def test_reused_leader_or_unmarked_member_is_never_signalled(self):
        groups = ChildGroups(proc_root=self.proc)
        self.member(123, start=999)
        with patch('studio.jobs.os.pidfd_open') as opened:
            self.assertFalse(groups.stop(self.identity))
            opened.assert_not_called()
        self.member(123)
        self.member(124, token='unrelated')
        with patch('studio.jobs.os.pidfd_open') as opened:
            self.assertFalse(groups.stop(self.identity))
            opened.assert_not_called()

    def test_other_boot_and_empty_group_are_gone(self):
        groups = ChildGroups(proc_root=self.proc)
        self.assertTrue(groups.stop(self.identity))
        self.member(123, token='unrelated')
        self.assertTrue(groups.stop({**self.identity, 'boot': 'previous-boot'}))


class JobBoundaryTests(unittest.TestCase):
    def test_health_before_startup_does_not_initialize_storage_or_claim_readiness(self):
        from studio.api import create_router
        with tempfile.TemporaryDirectory() as root:
            runtime = StudioRuntime(Path(root))
            app = FastAPI()
            app.include_router(create_router(runtime))
            with TestClient(app) as api, patch.object(Store, 'open', side_effect=AssertionError('Unexpected DB access')):
                response = api.get('/api/studio/jobs/health')
                self.assertEqual(response.status_code, 200, response.text)
                self.assertEqual(response.json(), {'workers_started': False, 'degraded': False, 'loops': []})
                self.assertFalse((Path(root) / 'studio').exists())

    def test_health_route_remains_readable_during_sql_failure_and_exposes_recovery(self):
        import sqlite3
        from datetime import timedelta
        from studio.api import create_router
        with tempfile.TemporaryDirectory() as root:
            now = datetime(2026, 1, 1, tzinfo=timezone.utc)
            runtime = StudioRuntime(Path(root), clock=lambda: now)
            app = FastAPI()
            app.include_router(create_router(runtime))
            try:
                pool = runtime.workers
                with TestClient(app) as api:
                    # Run one deterministic failed iteration, without real threads or waits.
                    with patch.object(runtime._store, 'transaction', side_effect=sqlite3.OperationalError('Bearer secret-sql')), \
                         patch.object(pool.stop_event, 'wait', side_effect=lambda delay: pool.stop_event.set()):
                        pool._loop('gpu')
                        response = api.get('/api/studio/jobs/health')
                        self.assertEqual(response.status_code, 200, response.text)
                        failed = response.json()
                        self.assertTrue(failed['degraded'])
                        gpu = next(item for item in failed['loops'] if item['component'] == 'gpu')
                        self.assertEqual(gpu['last_error_code'], 'resource_loop_failed')
                        self.assertEqual(gpu['last_failure_at'], now.isoformat())
                        self.assertNotIn('secret-sql', response.text)
                    pool.stop_event.clear()
                    now += timedelta(seconds=1)
                    with patch.object(pool.stop_event, 'wait', side_effect=lambda delay: pool.stop_event.set()):
                        pool._loop('gpu')
                    recovered = api.get('/api/studio/jobs/health').json()
                    self.assertFalse(recovered['degraded'])
                    gpu = next(item for item in recovered['loops'] if item['component'] == 'gpu')
                    self.assertEqual((gpu['status'], gpu['failure_count'], gpu['consecutive_failures']), ('ok', 1, 0))
                    self.assertEqual(gpu['last_success_at'], now.isoformat())
                    self.assertEqual(runtime.health().loops[0].component, 'gpu')
            finally:
                runtime.shutdown()

    def test_runtime_and_http_job_schedule_boundaries(self):
        from studio.api import create_router
        with tempfile.TemporaryDirectory() as root:
            runtime = StudioRuntime(Path(root))
            app = FastAPI()
            app.include_router(create_router(runtime))
            try:
                with TestClient(app) as client:
                    schedule = client.put('/api/studio/schedules/scrape', json={
                        'cron': '*/5 * * * *', 'timezone': 'UTC', 'enabled': True})
                    self.assertEqual(schedule.status_code, 200, schedule.text)
                    self.assertIn('next_run_at', schedule.json())
                    job = client.post('/api/studio/jobs', json={'kind': 'scrape', 'payload': {'device_ids': []}})
                    self.assertEqual(job.status_code, 201, job.text)
                    job_id = job.json()['id']
                    self.assertNotIn('child', job.json())
                    self.assertEqual(client.get('/api/studio/jobs').json()['total'], 1)
                    self.assertEqual(client.get(f'/api/studio/jobs/{job_id}/logs').status_code, 200)
                    self.assertEqual(client.post(f'/api/studio/jobs/{job_id}/cancel').json()['status'], 'cancelled')
                    self.assertEqual(client.put('/api/studio/schedules/scrape', json={
                        'cron': '* * * * * *', 'timezone': 'UTC', 'enabled': True}).status_code, 422)
            finally:
                runtime.shutdown()

    def test_studio_lifespan_never_starts_legacy_stt_tater_worker(self):
        import trainer_server
        with patch.object(trainer_server.STUDIO_RUNTIME, 'startup'), \
             patch.object(trainer_server.STUDIO_RUNTIME, 'start_workers') as start, \
             patch.object(trainer_server, '_start_auto_train_worker') as legacy:
            trainer_server.start_auto_train_worker_event()
            start.assert_called_once()
            legacy.assert_not_called()

    def test_legacy_training_cannot_bypass_studio_gpu_queue(self):
        import trainer_server
        with patch('trainer_server.threading.Thread') as thread:
            with self.assertRaisesRegex(RuntimeError, 'Studio'):
                trainer_server._start_training_thread('hello', 'en', True, False, 'default')
            thread.assert_not_called()

    def test_runtime_collection_handler_uses_existing_service_and_no_network_for_empty_selection(self):
        with tempfile.TemporaryDirectory() as root:
            runtime = StudioRuntime(Path(root))
            try:
                job = runtime.jobs.enqueue('scrape', None, {'device_ids': []})
                runtime.workers.run_once('collection')
                result = runtime.jobs.get(job.id)
                self.assertEqual(result.status, 'complete')
                self.assertEqual(runtime.collection.get_run(result.result['run_id']).devices, [])
            finally:
                runtime.shutdown()
