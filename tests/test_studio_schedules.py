import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from studio.db import Store
from studio.jobs import JobQueue
from studio.schedules import ScheduleService
from studio.models import ValidationError, NotFound
from studio.workspaces import WorkspaceService


def utc(value):
    return datetime.fromisoformat(value).replace(tzinfo=timezone.utc)


class ScheduleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.store = Store.open(self.root)
        self.addCleanup(lambda: self.store.close())
        self.now = utc('2026-01-01T00:00:00')
        self.jobs = JobQueue(self.store, clock=lambda: self.now)
        self.service = ScheduleService(self.store, self.jobs, clock=lambda: self.now)
        self.word = WorkspaceService(self.store).create('Hello', 'en', 'hello')

    def test_five_fields_and_iana_zone_are_required(self):
        for cron, zone in [('0 */5 * * * *', 'UTC'), ('bad', 'UTC'),
                           ('61 * * * *', 'UTC'), ('* * * * *', 'Mars/Base'),
                           ('@daily', 'UTC'), ('0 2 ? * *', 'UTC'), ('0 2 L * *', 'UTC')]:
            with self.subTest(cron=cron, zone=zone), self.assertRaises(ValidationError):
                self.service.save('scrape', cron, zone, True)
        with self.assertRaises(ValidationError):
            self.service.save('other', '* * * * *', 'UTC', True)
        with self.assertRaises(NotFound):
            self.service.save('train:missing', '* * * * *', 'UTC', True)

    def test_utc_next_run_and_independent_scopes(self):
        scrape = self.service.save('scrape', '*/5 * * * *', 'UTC', True)
        train = self.service.save('train:' + self.word.id, '0 2 * * *', 'UTC', True)
        self.assertEqual(self.service.next_run(scrape, self.now), utc('2026-01-01T00:05:00'))
        self.assertEqual(self.service.next_run(train, self.now), utc('2026-01-01T02:00:00'))
        self.assertEqual([j.kind for j in self.service.tick(utc('2026-01-01T00:05:00'))], ['scrape'])
        self.assertEqual(len(self.service.list()), 2)

    def test_restart_coalesces_downtime_and_ticks_are_unique(self):
        self.service.save('scrape', '* * * * *', 'UTC', True)
        self.store.close()
        self.store = Store.open(self.root)
        jobs = JobQueue(self.store, clock=lambda: self.now)
        service = ScheduleService(self.store, jobs, clock=lambda: self.now)
        later = utc('2026-10-01T00:00:00')
        self.assertEqual(len(service.tick(later)), 1)
        self.assertEqual(service.tick(later), [])
        self.assertEqual(service.tick(utc('2026-10-02T00:00:00')), [])
        self.assertEqual(jobs.list().total, 1)
        self.assertGreater(datetime.fromisoformat(service.list()[0].next_run_at), later)

    def test_dst_matches_pinned_croniter_and_unique_utc_occurrences(self):
        from croniter import croniter
        from zoneinfo import ZoneInfo
        for start in ['2026-03-28T01:00:00', '2026-10-24T00:00:00']:
            self.now = utc(start)
            schedule = self.service.save('scrape', '30 2 * * *', 'Europe/Berlin', True)
            iterator = croniter(schedule.cron, self.now.astimezone(ZoneInfo(schedule.timezone)))
            after = self.now
            instants = []
            for _ in range(4):
                expected = iterator.get_next(datetime).astimezone(timezone.utc)
                actual = self.service.next_run(schedule, after)
                self.assertEqual(actual, expected)
                self.assertGreater(actual, after)
                admitted = self.service.tick(actual)
                self.assertEqual(len(admitted), 1)
                self.assertEqual(self.service.tick(actual), [])
                job = self.jobs.claim('collection', actual)
                self.jobs.finish(job.id, {})
                instants.append(actual)
                after = actual
            self.assertEqual(len(set(instants)), 4)
            # Pin the surprising croniter gap/fold adjustment, including the
            # post-fold 03:30 local occurrence, rather than inventing a policy.
            expected_days = (['2026-03-28T01:30:00', '2026-03-29T01:30:00',
                              '2026-03-30T00:30:00', '2026-03-31T00:30:00']
                             if start.startswith('2026-03') else
                             ['2026-10-24T00:30:00', '2026-10-25T00:30:00',
                              '2026-10-26T02:30:00', '2026-10-27T01:30:00'])
            self.assertEqual(instants, [utc(day) for day in expected_days])

    def test_disabled_and_edited_schedule_does_not_cancel_active_job(self):
        self.service.save('scrape', '* * * * *', 'UTC', True)
        job = self.service.tick(utc('2026-01-01T00:01:00'))[0]
        self.jobs.claim('collection', self.now)
        self.service.save('scrape', '0 2 * * *', 'UTC', False)
        self.assertEqual(self.service.tick(utc('2026-01-03T00:00:00')), [])
        self.assertEqual(self.jobs.get(job.id).status, 'running')
        self.jobs.finish(job.id, {})

    def test_running_schedule_has_at_most_one_pending_successor(self):
        self.service.save('train:' + self.word.id, '* * * * *', 'UTC', True)
        self.service.tick(utc('2026-01-01T00:01:00'))
        active = self.jobs.claim('gpu', self.now)
        self.assertEqual(len(self.service.tick(utc('2026-01-01T00:02:00'))), 1)
        self.assertEqual(self.service.tick(utc('2026-01-02T00:00:00')), [])
        self.assertEqual(self.jobs.list().total, 2)
        self.jobs.finish(active.id, {})

    def test_concurrent_ticks_across_store_connections_admit_one_occurrence(self):
        from concurrent.futures import ThreadPoolExecutor
        from threading import Barrier
        self.service.save('scrape', '* * * * *', 'UTC', True)
        other_store = Store.open(self.root)
        self.addCleanup(other_store.close)
        other = ScheduleService(other_store, JobQueue(other_store))
        barrier = Barrier(2)
        def tick(service):
            barrier.wait()
            return service.tick(utc('2026-01-01T00:01:00'))
        with ThreadPoolExecutor(max_workers=2) as executor:
            runs = list(executor.map(tick, [self.service, other]))
        self.assertEqual(sum(map(len, runs)), 1)
        self.assertEqual(self.jobs.list().total, 1)
