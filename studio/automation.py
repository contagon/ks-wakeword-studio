"""Workspace policy persistence and durable follow-up admission."""
from dataclasses import asdict, replace
import json

from studio.models import (AutomationSettings, AutomationSchedule, AutomationStatus,
                           ClassificationPolicy, DeploymentPolicy, ValidationError)
from studio.workspaces import require_word


def settings_from_dict(data):
    try:
        values = dict(data)
        for key in ('collection', 'classification_schedule', 'training', 'deployment'):
            values[key] = AutomationSchedule(**values[key])
        # Parakeet was removed; older saved settings still carry the engine choice.
        values['classification'] = ClassificationPolicy(**{k: v for k, v in values['classification'].items() if k != 'engine'})
        values['deployment_policy'] = DeploymentPolicy(**values['deployment_policy'])
        return AutomationSettings(**values)
    except (TypeError, KeyError, ValueError) as exc:
        raise ValidationError('Invalid automation settings') from exc


class AutomationService:
    def __init__(self, store, jobs, schedules, deployment):
        self.store, self.jobs, self.schedules, self.deployment = store, jobs, schedules, deployment

    @staticmethod
    def settings_in(db, word_id):
        require_word(db, word_id)
        row = db.execute('SELECT settings FROM workspace_automation WHERE word_id=?', (word_id,)).fetchone()
        if row:
            return settings_from_dict(json.loads(row[0]))
        settings = AutomationSettings()
        train = db.execute('SELECT * FROM studio_schedules WHERE scope=?', ('train:' + word_id,)).fetchone()
        scrape = db.execute("SELECT * FROM studio_schedules WHERE scope='scrape'").fetchone()
        if train:
            settings = replace(settings, training=AutomationSchedule(bool(train['enabled']), train['cron'], train['timezone']))
        if scrape:
            settings = replace(settings, collection=AutomationSchedule(False, scrape['cron'], scrape['timezone']))
        return settings

    def get(self, word_id):
        with self.store.transaction() as db:
            settings = self.settings_in(db, word_id)
            schedules = [self.schedules.record(r) for r in db.execute(
                'SELECT * FROM studio_schedules WHERE scope IN (?,?,?,?)',
                tuple(kind + ':' + word_id for kind in ('scrape', 'classify', 'train', 'deploy')))]
            last = {}
            for kind in ('scrape', 'classify', 'train', 'deploy'):
                row = db.execute('SELECT * FROM studio_jobs WHERE word_id=? AND kind=? ORDER BY rowid DESC LIMIT 1', (word_id, kind)).fetchone()
                last[kind] = self.jobs.record(row) if row else None
        return AutomationStatus(settings, schedules, last)

    def save(self, word_id, settings):
        if not isinstance(settings, AutomationSettings):
            raise ValidationError('Invalid automation settings')
        policy = settings.classification
        if (policy.trigger not in ('after_collection', 'schedule')
                or any(type(value) is not bool for value in (policy.enabled, policy.confirm_activations, policy.auto_negatives,
                    policy.promote_close_misses, policy.near_miss_negatives, settings.skip_unchanged, settings.deployment_policy.after_training))):
            raise ValidationError('Invalid automation policy')
        with self.store.transaction() as db:
            self.settings_in(db, word_id)
            stages = {'scrape': settings.collection, 'classify': replace(settings.classification_schedule,
                enabled=policy.enabled and policy.trigger == 'schedule'), 'train': settings.training, 'deploy': settings.deployment}
            for kind, schedule in stages.items():
                self.schedules.save_in(db, kind + ':' + word_id, schedule.cron, schedule.timezone, schedule.enabled)
            cursor = db.execute('SELECT COALESCE(MAX(rowid),0) FROM model_versions WHERE word_id=?', (word_id,)).fetchone()[0]
            db.execute('INSERT INTO workspace_automation(word_id,settings,archive_cursor) VALUES (?,?,?) '
                       'ON CONFLICT(word_id) DO UPDATE SET settings=excluded.settings',
                       (word_id, json.dumps(asdict(settings)), cursor))
        return self.get(word_id)

    def scheduled_disabled(self, job):
        with self.store.transaction() as db:
            row = db.execute('SELECT schedule_scope FROM studio_jobs WHERE id=?', (job.id,)).fetchone()
            if not row or not row[0]:
                return False
            schedule = db.execute('SELECT enabled FROM studio_schedules WHERE scope=?', (row[0],)).fetchone()
            return not schedule or not schedule[0]

    def reconcile(self):
        with self.store.transaction() as db:
            rows = db.execute("SELECT * FROM studio_jobs WHERE kind='scrape' AND status='complete' AND word_id IS NOT NULL "
                "AND NOT EXISTS (SELECT 1 FROM automation_events WHERE event_key='collection:'||studio_jobs.id)").fetchall()
            for row in rows:
                settings = self.settings_in(db, row['word_id'])
                result = json.loads(row['result'])
                if (settings.classification.enabled and settings.classification.trigger == 'after_collection'
                        and result.get('new_mapped', 0) > 0 and not result.get('skipped')):
                    pending = db.execute("SELECT 1 FROM samples WHERE word_id=? AND label='pending' AND deleted=0 LIMIT 1", (row['word_id'],)).fetchone()
                    if pending:
                        self.jobs.enqueue_in(db, 'classify', row['word_id'], {}, 'collection:' + row['id'], None, self.jobs.clock())
                db.execute('INSERT INTO automation_events(event_key,word_id) VALUES (?,?)', ('collection:' + row['id'], row['word_id']))

    def handle_deploy(self, job, context):
        context.log('Checking deployment policy and available archives')
        if context.cancelled() or self.scheduled_disabled(job) or not self.get(job.word_id).settings.deployment.enabled:
            return {'skipped': True, 'reason': 'disabled'}
        with self.store.transaction() as db:
            policy = db.execute('SELECT deployment_cursor FROM workspace_automation WHERE word_id=?', (job.word_id,)).fetchone()
            row = db.execute("SELECT v.id FROM model_versions v JOIN studio_jobs j ON j.id=v.run_id "
                "WHERE v.word_id=? AND v.rowid>? AND j.status='complete' AND j.kind='train' "
                "AND NOT EXISTS (SELECT 1 FROM migration_model_provenance p WHERE p.version_id=v.id) ORDER BY v.rowid DESC LIMIT 1",
                (job.word_id, policy[0] if policy else 0)).fetchone()
        if not row:
            return {'skipped': True, 'reason': 'no_new_archive'}
        self.deployment.publish(row['id'], automatic=True)
        context.log('Model archive published; target delivery reconciliation requested')
        return {'version_id': row['id']}
