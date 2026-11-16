from dataclasses import replace
import io
import json

from studio.models import DiagnosticClip, SampleQuery
from studio.runtime import StudioRuntime
from studio_harness import api_client, wav
import pytest


class SpeechRunner:
    transcript = 'turn the lights off'
    before_result = None

    def run(self, context, argv, **kwargs):
        args = dict(a[2:].split('=', 1) for a in argv if a.startswith('--'))
        manifest = json.loads(open(args['input-manifest']).read())
        results = [{'id': s['id'], 'speech': True, 'transcript': self.transcript, 'guided_transcript': self.transcript,
                    'model': 'small.en'} for s in manifest['samples']]
        if self.before_result:
            self.before_result()
        with open(args['output-json'], 'w') as file:
            json.dump(results, file)


def setup_runtime(tmp_path):
    runner = SpeechRunner()
    runtime = StudioRuntime(tmp_path, runner=runner)
    word = runtime.workspaces.create('Hey Cedar', 'en')
    assert hasattr(runtime, 'classification'), 'Queued classification service is missing'
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, classification=replace(settings.classification, enabled=True)))
    return runtime, word, runner


def add_sample(runtime, word, near=False):
    runtime.samples.ingest('fixture', DiagnosticClip('clip', phrase='Hey Cedar', engine='mww', near_miss=near), io.BytesIO(wav()), word.id)
    return runtime.samples.queue(word.id, SampleQuery()).items[0]


def test_auto_negative_and_undo_not_immediately_reclassified(tmp_path):
    runtime, word, runner = setup_runtime(tmp_path)
    try:
        sample = add_sample(runtime, word)
        job = runtime.jobs.enqueue('classify', word.id, {})
        runtime.workers.run_once('gpu')
        assert runtime.jobs.get(job.id).status == 'complete'
        updated = runtime.samples.get(sample.id)
        assert (updated.label, updated.labelled_by) == ('negative', 'auto')
        assert 'turn the lights' not in json.dumps(runtime.jobs.get(job.id).result)
        by = lambda who: [s.id for s in runtime.samples.list(word.id, SampleQuery(labelled_by=who)).items]
        assert (by('auto'), by('manual')) == ([sample.id], [])
        runtime.samples.undo(sample.id, updated.revision)
        runtime.jobs.enqueue('classify', word.id, {})
        runtime.workers.run_once('gpu')
        assert runtime.samples.get(sample.id).label == 'pending'
    finally:
        runtime.shutdown()



def test_manual_relabel_to_automation_label_counts_as_manual(tmp_path):
    runtime, word, runner = setup_runtime(tmp_path)
    try:
        sample = add_sample(runtime, word)
        runtime.jobs.enqueue('classify', word.id, {})
        runtime.workers.run_once('gpu')
        auto = runtime.samples.get(sample.id)
        flipped = runtime.samples.set_label(sample.id, 'positive', auto.revision)
        back = runtime.samples.set_label(sample.id, 'negative', flipped.revision)
        assert (back.label, back.labelled_by) == ('negative', 'manual')
        assert runtime.samples.list(word.id, SampleQuery(labelled_by='auto')).total == 0
        undone = runtime.samples.undo(sample.id, runtime.samples.undo(sample.id, back.revision).revision)
        assert (undone.label, undone.labelled_by) == ('negative', 'auto')
        assert runtime.samples.list(word.id, SampleQuery(labelled_by='auto')).total == 1
    finally:
        runtime.shutdown()

def test_manual_revision_wins(tmp_path):
    runtime, word, runner = setup_runtime(tmp_path)
    try:
        sample = add_sample(runtime, word)
        runner.before_result = lambda: runtime.samples.set_label(sample.id, 'positive', sample.revision)
        runtime.jobs.enqueue('classify', word.id, {})
        runtime.workers.run_once('gpu')
        assert runtime.samples.get(sample.id).label == 'positive'
        assert runtime.samples.list(word.id, SampleQuery(labelled_by='manual')).total == 1
        assert runtime.samples.get(sample.id).labelled_by == 'manual'
        assert runtime.samples.list(word.id, SampleQuery(labelled_by='auto')).total == 0
    finally:
        runtime.shutdown()


def test_collection_followup_recovers_commit_callback_gap(tmp_path):
    runtime, word, runner = setup_runtime(tmp_path)
    try:
        add_sample(runtime, word)
        runtime.jobs.enqueue('scrape', word.id, {})
        claimed = runtime.jobs.claim('collection', runtime.clock(), kinds={'scrape'})
        runtime.jobs.finish(claimed.id, {'run_id': 'fixture-run', 'new': 1, 'new_mapped': 1, 'status': 'partial'})
        runtime.automation.reconcile()
        runtime.automation.reconcile()
        jobs = runtime.jobs.list().items
        assert len([j for j in jobs if j.kind == 'classify']) == 1
    finally:
        runtime.shutdown()


def test_only_unmapped_imports_do_not_trigger_classification(tmp_path):
    runtime, word, runner = setup_runtime(tmp_path)
    try:
        add_sample(runtime, word)
        job = runtime.jobs.enqueue('scrape', word.id, {})
        runtime.jobs.claim('collection', runtime.clock(), kinds={'scrape'})
        runtime.jobs.finish(job.id, {'run_id': 'unknown-only', 'new': 1, 'new_mapped': 0, 'status': 'complete'})
        runtime.automation.reconcile()
        assert not any(j.kind == 'classify' for j in runtime.jobs.list().items)
    finally:
        runtime.shutdown()


def test_manual_run_applies_saved_rules_while_automatic_runs_are_disabled(tmp_path):
    runtime, word, runner = setup_runtime(tmp_path)
    try:
        settings = runtime.automation.get(word.id).settings
        runtime.automation.save(word.id, replace(settings, classification=replace(settings.classification, enabled=False)))
        sample = add_sample(runtime, word)
        runtime.jobs.enqueue('classify', word.id, {})
        runtime.workers.run_once('gpu')
        assert runtime.samples.get(sample.id).label == 'pending'
        with api_client(runtime) as api:
            assert api.post(f'/api/studio/wakewords/{word.id}/classification/jobs').status_code == 201
        runtime.workers.run_once('gpu')
        assert runtime.samples.get(sample.id).label == 'negative'
    finally:
        runtime.shutdown()


def test_classification_followup_recovers_commit_callback_gap_without_recursing(tmp_path):
    runtime, word, _ = setup_runtime(tmp_path)
    try:
        settings = runtime.automation.get(word.id).settings
        runtime.automation.save(word.id, replace(settings, trimming=replace(settings.trimming, enabled=True)))
        job = runtime.jobs.enqueue('classify', word.id, {'manual': True})
        runtime.jobs.claim('gpu', runtime.clock())
        runtime.jobs.finish(job.id, {'reviewed': 1, 'positive': 1})
        runtime.automation.reconcile()
        runtime.automation.reconcile()
        trims = [j for j in runtime.jobs.list().items if j.payload.get('trim_only')]
        assert len(trims) == 1
        runtime.jobs.claim('gpu', runtime.clock())
        runtime.jobs.finish(trims[0].id, {'trimmed': 1})
        runtime.automation.reconcile()
        assert len(runtime.jobs.list().items) == 2
    finally:
        runtime.shutdown()


def test_enabling_trimming_does_not_replay_historical_classification_jobs(tmp_path):
    runtime, word, _ = setup_runtime(tmp_path)
    try:
        job = runtime.jobs.enqueue('classify', word.id, {})
        runtime.jobs.claim('gpu', runtime.clock())
        runtime.jobs.finish(job.id, {'reviewed': 1, 'positive': 1})
        settings = runtime.automation.get(word.id).settings
        runtime.automation.save(word.id, replace(settings, trimming=replace(settings.trimming, enabled=True)))
        runtime.automation.reconcile()
        assert len(runtime.jobs.list().items) == 1
    finally:
        runtime.shutdown()


@pytest.mark.parametrize('state,result', [
    ('failed', {'positive': 1}),
    ('cancelled', {'positive': 1}),
    ('interrupted', {'positive': 1}),
    ('complete', {'positive': 1, 'skipped': True}),
    ('complete', {'reviewed': 1, 'negative': 1}),
])
def test_unsuccessful_or_nonpositive_classification_does_not_trigger_trimming(tmp_path, state, result):
    runtime, word, _ = setup_runtime(tmp_path)
    try:
        settings = runtime.automation.get(word.id).settings
        runtime.automation.save(word.id, replace(settings, trimming=replace(settings.trimming, enabled=True)))
        job = runtime.jobs.enqueue('classify', word.id, {})
        runtime.jobs.claim('gpu', runtime.clock())
        runtime.jobs.finish(job.id, result, status=state)
        runtime.automation.reconcile()
        assert len(runtime.jobs.list().items) == 1
    finally:
        runtime.shutdown()
