from dataclasses import replace
import io
import json

from studio.models import DiagnosticClip, SampleQuery
from studio.runtime import StudioRuntime
from studio_harness import wav


class SpeechRunner:
    transcript = 'turn the lights off'
    before_result = None

    def run(self, context, argv, **kwargs):
        args = dict(a[2:].split('=', 1) for a in argv if a.startswith('--'))
        manifest = json.loads(open(args['input-manifest']).read())
        results = [{'id': s['id'], 'transcript': self.transcript, 'engine': manifest['engine'],
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
        assert updated.label == 'negative'
        assert 'turn the lights' not in json.dumps(runtime.jobs.get(job.id).result)
        runtime.samples.undo(sample.id, updated.revision)
        runtime.jobs.enqueue('classify', word.id, {})
        runtime.workers.run_once('gpu')
        assert runtime.samples.get(sample.id).label == 'pending'
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
