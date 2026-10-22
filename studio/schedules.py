"""Five-field croniter/zoneinfo schedules, with transactional UTC occurrences.

DST semantics are those of pinned croniter 6.0.0 with an aware ZoneInfo base:
including its gap adjustment and fold selection, not a second wall-clock policy.
Missed ticks are represented by the persisted first due instant and coalesced
directly to the next future instant (no loop over downtime).
"""

from datetime import datetime
import re
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from croniter import croniter

from studio.models import NotFound, Schedule, ValidationError, aware_utc, utc_now


class ScheduleService:
    def __init__(self, store, jobs, *, clock=utc_now):
        self.store, self.jobs, self.clock = store, jobs, clock

    @staticmethod
    def record(row):
        return Schedule(row['scope'], row['cron'], row['timezone'], bool(row['enabled']), row['next_run_at'])

    def save(self, scope: str, cron: str, timezone: str = 'UTC', enabled: bool = True) -> Schedule:
        with self.store.transaction() as db:
            return self.save_in(db, scope, cron, timezone, enabled)

    def save_in(self, db, scope, cron, timezone='UTC', enabled=True):
        if (not isinstance(scope, str) or not isinstance(cron, str) or len(cron) > 256
                or len(cron.split()) != 5 or not isinstance(timezone, str)
                or len(timezone) > 100 or type(enabled) is not bool):
            raise ValidationError('Invalid schedule')
        # Exclude croniter's nonstandard Quartz/random/hashed extensions. Names
        # are allowed only in the conventional month/day fields.
        for index, field in enumerate(cron.split()):
            allowed = r'[0-9*,/\-]+' if index < 3 else r'[0-9A-Za-z*,/\-]+'
            if not re.fullmatch(allowed, field):
                raise ValidationError('Expected standard five-field cron')
            for name in re.findall('[A-Za-z]+', field):
                names = ('jan feb mar apr may jun jul aug sep oct nov dec' if index == 3
                         else 'sun mon tue wed thu fri sat').split()
                if name.lower() not in names:
                    raise ValidationError('Invalid cron name')
        if scope != 'scrape' and (':' not in scope or scope.split(':', 1)[0] not in ('scrape', 'classify', 'train', 'deploy')):
            raise ValidationError('Invalid schedule scope')
        try:
            ZoneInfo(timezone)
            if not croniter.is_valid(cron):
                raise ValueError()
            schedule = Schedule(scope, cron, timezone, enabled, '')
            due = self.next_run(schedule, self.clock()).isoformat()
        except (ValueError, ZoneInfoNotFoundError, OverflowError) as exc:
            raise ValidationError('Invalid schedule') from exc
        if ':' in scope and not db.execute('SELECT 1 FROM wakewords WHERE id=?', (scope.split(':', 1)[1],)).fetchone():
            raise NotFound('Wakeword not found')
        old = db.execute('SELECT * FROM studio_schedules WHERE scope=?', (scope,)).fetchone()
        if old and (old['cron'], old['timezone'], bool(old['enabled'])) == (cron, timezone, enabled):
            return self.record(old)
        db.execute('INSERT INTO studio_schedules VALUES (?,?,?,?,?) ON CONFLICT(scope) DO UPDATE SET '
                   'cron=excluded.cron, timezone=excluded.timezone, enabled=excluded.enabled, next_run_at=excluded.next_run_at',
                   (scope, cron, timezone, int(enabled), due))
        return Schedule(scope, cron, timezone, enabled, due)

    def next_run(self, schedule: Schedule, after: datetime) -> datetime:
        after = aware_utc(after)
        try:
            value = croniter(schedule.cron, after.astimezone(ZoneInfo(schedule.timezone))).get_next(datetime)
            value = aware_utc(value)
            if value <= after:
                raise ValueError('Non-monotonic cron occurrence')
            return value
        except (ValueError, OverflowError) as exc:
            raise ValidationError('Invalid cron occurrence') from exc

    def list(self) -> list[Schedule]:
        with self.store.transaction() as db:
            return [self.record(row) for row in db.execute('SELECT * FROM studio_schedules ORDER BY scope')]

    def tick(self, now: datetime) -> list:
        now = aware_utc(now)
        admitted = []
        with self.store.transaction() as db:
            rows = db.execute('SELECT * FROM studio_schedules WHERE enabled=1 AND next_run_at<=? ORDER BY scope',
                              (now.isoformat(),)).fetchall()
            for row in rows:
                schedule = self.record(row)
                existing = db.execute("SELECT id FROM studio_jobs WHERE schedule_scope=? AND status='queued'",
                                      (schedule.scope,)).fetchone()
                occurrence = db.execute('SELECT 1 FROM studio_schedule_occurrences WHERE scope=? AND scheduled_at=?',
                                        (schedule.scope, schedule.next_run_at)).fetchone()
                if not existing and not occurrence:
                    kind, word = schedule.scope.split(':', 1) if ':' in schedule.scope else ('scrape', None)
                    job = self.jobs.enqueue_in(db, kind, word, {},
                                             'schedule:' + schedule.scope + ':' + schedule.next_run_at,
                                             schedule.scope, now)
                    db.execute('INSERT INTO studio_schedule_occurrences VALUES (?,?,?)',
                               (schedule.scope, schedule.next_run_at, job.id))
                    admitted.append(job)
                db.execute('UPDATE studio_schedules SET next_run_at=? WHERE scope=?',
                           (self.next_run(schedule, now).isoformat(), schedule.scope))
        return admitted
