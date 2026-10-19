"""Workspace policy persistence and durable follow-up admission."""
from dataclasses import asdict, replace
import json

from studio.models import (AutomationSettings, AutomationSchedule, AutomationStatus,
                           ClassificationPolicy, DeploymentPolicy, NotFound, ValidationError)


def settings_from_dict(data):
    try:
        values = dict(data)
        for key in ('collection', 'classification_schedule', 'training', 'deployment'):
            values[key] = AutomationSchedule(**values[key])
        values['classification'] = ClassificationPolicy(**values['classification'])
        values['deployment_policy'] = DeploymentPolicy(**values['deployment_policy'])
        return AutomationSettings(**values)
    except (TypeError, KeyError, ValueError) as exc:
        raise ValidationError('Invalid automation settings') from exc


class AutomationService:
    def __init__(self, store, jobs, schedules):
        self.store, self.jobs, self.schedules = store, jobs, schedules

    def settings_in(self, db, word_id):
        if not db.execute('SELECT 1 FROM wakewords WHERE id=?', (word_id,)).fetchone():
            raise NotFound('Wakeword not found')
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
            schedules = [self.schedules._record(r) for r in db.execute(
                'SELECT * FROM studio_schedules WHERE scope IN (?,?,?,?)',
                tuple(kind + ':' + word_id for kind in ('scrape', 'classify', 'train', 'deploy')))]
            last = {}
            for kind in ('scrape', 'classify', 'train', 'deploy'):
                row = db.execute('SELECT * FROM studio_jobs WHERE word_id=? AND kind=? ORDER BY rowid DESC LIMIT 1', (word_id, kind)).fetchone()
                last[kind] = self.jobs._record(row) if row else None
        return AutomationStatus(settings, schedules, last)

    def save(self, word_id, settings):
        if not isinstance(settings, AutomationSettings):
            raise ValidationError('Invalid automation settings')
        policy = settings.classification
        if (policy.engine not in ('faster_whisper', 'parakeet_onnx')
                or policy.trigger not in ('after_collection', 'schedule')
                or any(type(value) is not bool for value in (policy.enabled, policy.auto_negatives,
                    policy.promote_close_misses, settings.skip_unchanged, settings.deployment_policy.after_training))):
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
