from dataclasses import replace
import io
import pytest

from studio.runtime import StudioRuntime
from studio_harness import augmentation_fixture
from test_studio_deployment import VersionedTrainingRunner
from test_studio_generation import wav


@pytest.fixture
def prepared(tmp_path):
    augmentation_fixture(tmp_path)
    runtime = StudioRuntime(tmp_path, runner=VersionedTrainingRunner())
    word = runtime.workspaces.create('Hello robot', 'en', 'hello_robot')
    runtime.samples.import_audio(word.id, 'positive', io.BytesIO(wav(1)))
    yield runtime, word
    runtime.shutdown()


def train(runtime, word):
    job = runtime.training.enqueue(word.id)
    runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job.id).status == 'complete'
    return runtime.training.successful_version(job.id)


def intent(runtime, word):
    with runtime.jobs.store.transaction() as db:
        return db.execute('SELECT * FROM deployment_intents WHERE word_id=?', (word.id,)).fetchone()


def test_training_archives_without_publication_by_default(prepared):
    runtime, word = prepared
    version = train(runtime, word)
    assert version is not None
    assert intent(runtime, word) is None


def test_after_training_opt_in_only_new_versions(prepared):
    runtime, word = prepared
    old = train(runtime, word)
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, deployment_policy=replace(settings.deployment_policy, after_training=True)))
    runtime.deployment.reconcile()
    assert intent(runtime, word) is None
    new = train(runtime, word)
    assert intent(runtime, word)['version_id'] == new.id
    revision = intent(runtime, word)['revision']
    runtime.deployment.reconcile()
    assert intent(runtime, word)['revision'] == revision


def test_scheduled_deployment_independent_of_training_and_preserves_rollback(prepared):
    runtime, word = prepared
    old, new = train(runtime, word), train(runtime, word)
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, deployment=replace(settings.deployment, enabled=True)))
    job = runtime.jobs.enqueue('deploy', word.id, {})
    runtime.workers.run_once('collection')
    assert runtime.jobs.get(job.id).status == 'complete'
    assert intent(runtime, word)['version_id'] == new.id
    runtime.deployment.rollback(word.id, old.id)
    runtime.jobs.enqueue('deploy', word.id, {})
    runtime.workers.run_once('collection')
    runtime.deployment.reconcile()
    assert intent(runtime, word)['version_id'] == old.id


def test_skip_unchanged_can_be_disabled_for_scheduled_training(prepared):
    runtime, word = prepared
    train(runtime, word)
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, skip_unchanged=False))
    job = runtime.jobs.enqueue('train', word.id, {'trigger': 'scheduled'})
    runtime.workers.run_once('gpu')
    assert runtime.training.successful_version(job.id) is not None
    assert runtime.training.versions(word.id).total == 2


def test_manual_publication_preserves_inherited_training_schedule(prepared):
    runtime, word = prepared
    runtime.schedules.save('train:' + word.id, '0 3 * * *', 'Europe/Berlin', True)
    before = runtime.automation.get(word.id).settings
    version = train(runtime, word)
    runtime.deployment.publish(version.id)
    assert runtime.automation.get(word.id).settings == before
    runtime.automation.save(word.id, runtime.automation.get(word.id).settings)
    actual = next(s for s in runtime.schedules.list() if s.scope == 'train:' + word.id)
    assert actual.enabled
    assert actual.cron == '0 3 * * *'
    assert actual.timezone == 'Europe/Berlin'
