from dataclasses import asdict, replace

import pytest

from studio.db import Store
from studio.models import NotFound, ValidationError
from studio.runtime import StudioRuntime
from fastapi import FastAPI
from fastapi.testclient import TestClient
from studio.api import create_router


def test_new_workspace_automation_defaults(tmp_path):
    runtime = StudioRuntime(tmp_path)
    try:
        word = runtime.workspaces.create('Hey Cedar', 'en')
        assert hasattr(runtime, 'automation'), 'Workspace automation service is missing'
        status = runtime.automation.get(word.id)
        settings = status.settings
        assert settings.collection.cron == '*/30 * * * *'
        assert settings.training.cron == '0 2 * * *'
        assert settings.deployment.cron == '0 4 * * *'
        assert settings.classification.engine == 'faster_whisper'
        assert settings.classification.auto_negatives is True
        assert settings.classification.promote_close_misses is False
        assert not any(s.enabled for s in (settings.collection, settings.training, settings.deployment))
        assert not settings.classification.enabled
        assert not settings.deployment_policy.after_training
        with pytest.raises(NotFound):
            runtime.automation.get('missing')
    finally:
        runtime.shutdown()


def test_settings_roundtrip_isolated_and_strict(tmp_path):
    runtime = StudioRuntime(tmp_path)
    try:
        a = runtime.workspaces.create('Cedar', 'en')
        b = runtime.workspaces.create('Maple', 'de')
        assert hasattr(runtime, 'automation'), 'Workspace automation service is missing'
        original = runtime.automation.get(a.id).settings
        changed = replace(original, collection=replace(original.collection, enabled=True, timezone='Europe/Berlin'),
                          classification=replace(original.classification, enabled=True, engine='parakeet_onnx'))
        runtime.automation.save(a.id, changed)
        assert runtime.automation.get(b.id).settings.collection.enabled is False
        for invalid in (replace(changed, collection=replace(changed.collection, cron='invalid')),
                        replace(changed, classification=replace(changed.classification, engine='unknown')),
                        replace(changed, collection=replace(changed.collection, enabled=1))):
            with pytest.raises(ValidationError):
                runtime.automation.save(a.id, invalid)
        assert runtime.automation.get(a.id).settings == changed
        runtime.shutdown()
        runtime = StudioRuntime(tmp_path)
        assert runtime.automation.get(a.id).settings == changed
    finally:
        runtime.shutdown()


def test_upgrade_preserves_training_disables_global_scrape(tmp_path):
    runtime = StudioRuntime(tmp_path)
    word = runtime.workspaces.create('Cedar', 'en')
    runtime.schedules.save('train:' + word.id, '0 3 * * *', 'UTC', True)
    runtime.schedules.save('scrape', '*/15 * * * *', 'UTC', True)
    queued = runtime.jobs.enqueue('scrape', None, {})
    with runtime.jobs.store.transaction() as db:
        db.execute("UPDATE studio_jobs SET schedule_scope='scrape' WHERE id=?", (queued.id,))
        # Simulate the prior schema while retaining its existing tables.
        db.execute('DROP TABLE IF EXISTS automation_events')
        db.execute('DROP TABLE IF EXISTS automation_reviews')
        db.execute('DROP TABLE IF EXISTS workspace_automation')
        db.execute('PRAGMA user_version=12')
    runtime.shutdown()
    runtime = StudioRuntime(tmp_path)
    try:
        assert hasattr(runtime, 'automation'), 'Workspace automation service is missing'
        settings = runtime.automation.get(word.id).settings
        assert settings.training.enabled
        assert settings.training.cron == '0 3 * * *'
        assert settings.collection.cron == '*/15 * * * *'
        assert not settings.collection.enabled
        assert not next(s for s in runtime.schedules.list() if s.scope == 'scrape').enabled
        assert runtime.jobs.get(queued.id).status == 'cancelled'
    finally:
        runtime.shutdown()


def test_delete_removes_only_target_automation(tmp_path):
    runtime = StudioRuntime(tmp_path)
    try:
        a = runtime.workspaces.create('Cedar', 'en')
        b = runtime.workspaces.create('Maple', 'en')
        assert hasattr(runtime, 'automation'), 'Workspace automation service is missing'
        runtime.automation.save(a.id, runtime.automation.get(a.id).settings)
        runtime.automation.save(b.id, runtime.automation.get(b.id).settings)
        runtime.workspaces.delete(a.id)
        assert runtime.automation.get(b.id).settings.collection.enabled is False
        with runtime.jobs.store.transaction() as db:
            assert not db.execute('SELECT 1 FROM workspace_automation WHERE word_id=?', (a.id,)).fetchone()
            assert not db.execute('SELECT 1 FROM studio_schedules WHERE scope LIKE ?', ('%:' + a.id,)).fetchone()
    finally:
        runtime.shutdown()


def test_automation_api_roundtrip_and_strict_nested_validation(tmp_path):
    runtime = StudioRuntime(tmp_path)
    try:
        word = runtime.workspaces.create('Cedar', 'en')
        app = FastAPI()
        app.include_router(create_router(runtime))
        with TestClient(app) as api:
            path = f'/api/studio/wakewords/{word.id}/automation'
            response = api.get(path)
            assert response.status_code == 200
            settings = response.json()['settings']
            settings['collection']['enabled'] = True
            assert api.put(path, json=settings).status_code == 200
            settings['classification']['engine'] = 'bogus-sensitive-input'
            rejected = api.put(path, json=settings)
            assert rejected.status_code == 422
            assert 'bogus-sensitive-input' not in rejected.text
            assert api.get(path).json()['settings']['classification']['engine'] == 'faster_whisper'
            assert api.get('/api/studio/wakewords/missing/automation').status_code == 404
    finally:
        runtime.shutdown()
