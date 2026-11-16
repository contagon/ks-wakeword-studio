"""Scraped positives retain their originals and enter training only after trim review."""
from dataclasses import replace
import io
import json
from pathlib import Path
import wave

import pytest

from studio.models import DiagnosticClip, SampleQuery, ValidationError
from studio.runtime import StudioRuntime
from studio_harness import api_client, augmentation_fixture, wav


class TrimRunner:
    words = [dict(word='Hey', start=.4, end=.6, probability=.95),
             dict(word='Cedar', start=.7, end=1, probability=.95),
             dict(word='lights', start=1.5, end=1.8, probability=.95)]
    before_result = None
    speech_segments = [dict(start=.4, end=1), dict(start=1.5, end=1.8)]
    prompted_words = []

    def run(self, context, argv, **kwargs):
        args = dict(a[2:].split('=', 1) for a in argv if a.startswith('--'))
        manifest = json.loads(Path(args['input-manifest']).read_text())
        if self.before_result:
            self.before_result()
        Path(args['output-json']).write_text(json.dumps([
            dict(id=s['id'], speech=True, transcript='Hey Cedar lights', guided_transcript='',
                 model='fixture', words=self.words, speech_segments=self.speech_segments,
                 prompted_words=self.prompted_words) for s in manifest['samples']]))


@pytest.fixture
def fixture(tmp_path):
    runner = TrimRunner()
    runtime = StudioRuntime(tmp_path, runner=runner)
    word = runtime.workspaces.create('Hey Cedar', 'en')
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, trimming=replace(settings.trimming, enabled=True)))
    yield runtime, word, runner
    runtime.shutdown()


def scraped(runtime, word, clip='clip'):
    recording = runtime.samples.ingest('fixture', DiagnosticClip(clip, phrase=word.phrase, engine='mww'),
                                       io.BytesIO(wav(seconds=3)), word.id)
    return next(s for s in runtime.samples.list(word.id, SampleQuery(limit=100)).items if s.recording_id == recording.id)


def seconds(runtime, sample):
    with wave.open(io.BytesIO(runtime.blobs.read(sample.normalized_hash)), 'rb') as audio:
        return audio.getnframes() / audio.getframerate()


def test_manual_positive_queues_trim_preserves_original_and_undo(fixture):
    runtime, word, _ = fixture
    sample = scraped(runtime, word)
    positive = runtime.samples.set_label(sample.id, 'positive', sample.revision)
    assert positive.trim_status == 'needs_review'
    assert runtime.workers.run_once('gpu')
    trimmed = runtime.samples.get(sample.id)
    assert (trimmed.label, trimmed.labelled_by, trimmed.trim_status) == ('positive', 'manual', 'auto')
    assert seconds(runtime, trimmed) == pytest.approx(.9)
    assert runtime.samples.audio(sample.id, word.id, original=True) == wav(seconds=3)
    assert trimmed.family_id == sample.family_id
    with runtime.jobs.store.transaction() as db:
        audio = db.execute('SELECT start_s,end_s,parent_id FROM audio_records WHERE id=?', (trimmed.audio_id,)).fetchone()
        assert tuple(audio) == (.25, 1.15, sample.audio_id)
    undone = runtime.samples.undo(sample.id, trimmed.revision)
    assert (undone.label, undone.trim_status, undone.audio_id) == ('positive', 'needs_review', sample.audio_id)
    assert not runtime.workers.run_once('gpu')


@pytest.mark.parametrize('manual', [False, True])
def test_classification_queues_trimming_as_a_separate_enabled_step(fixture, manual):
    runtime, word, runner = fixture
    runner.words = [{**w, 'probability': .01} for w in runner.words]
    sample = scraped(runtime, word)
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, classification=replace(settings.classification,
        enabled=not manual, confirm_activations=True), trimming=replace(settings.trimming, enabled=True)))
    job = runtime.jobs.enqueue('classify', word.id, {'manual': manual})
    runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job.id).status == 'complete'
    assert runtime.samples.get(sample.id).trim_status == 'needs_review'
    runtime.automation.reconcile()
    runtime.automation.reconcile()
    followups = [j for j in runtime.jobs.list().items if j.payload.get('trim_only')]
    assert len(followups) == 1
    assert runtime.workers.run_once('gpu')
    updated = runtime.samples.get(sample.id)
    assert (updated.label, updated.trim_status, updated.labelled_by) == ('positive', 'auto', 'auto')
    assert seconds(runtime, updated) == pytest.approx(.9)
    assert len(runtime.jobs.list().items) == 2
    assert runtime.automation.get(word.id).last_jobs['classify'].id == job.id
    assert runtime.automation.get(word.id).last_jobs['trim'].id == followups[0].id
    runtime.automation.reconcile()
    assert len(runtime.jobs.list().items) == 2


@pytest.mark.parametrize('words', [[], [dict(word='Hey Cedar', start=0, end=3, probability=.99)],
                                    [dict(word='Hey Cedar', start=-1, end=1, probability=.99)]])
def test_uncertain_positive_stays_full_length_for_review(fixture, words):
    runtime, word, runner = fixture
    runner.words = words
    sample = scraped(runtime, word)
    runtime.samples.set_label(sample.id, 'positive', sample.revision)
    runtime.workers.run_once('gpu')
    updated = runtime.samples.get(sample.id)
    assert (updated.label, updated.trim_status, updated.audio_id) == ('positive', 'needs_review', sample.audio_id)
    assert runtime.samples.list(word.id, SampleQuery(trim_status='needs_review')).total == 1


@pytest.mark.parametrize('automatic_label', [False, True])
def test_positive_trim_can_use_prompted_fallback_without_relabelling(fixture, tmp_path, automatic_label):
    runtime, word, runner = fixture
    runner.prompted_words = runner.words
    runner.words = []
    sample = scraped(runtime, word)
    if automatic_label:
        settings = runtime.automation.get(word.id).settings
        runtime.automation.save(word.id, replace(settings, classification=replace(settings.classification,
            enabled=True, confirm_activations=True), trimming=replace(settings.trimming, enabled=True)))
        runtime.jobs.enqueue('classify', word.id, {})
        runtime.workers.run_once('gpu')
    else:
        runtime.samples.set_label(sample.id, 'positive', sample.revision)
    runtime.workers.run_once('gpu')
    trimmed = runtime.samples.get(sample.id)
    assert (trimmed.label, trimmed.labelled_by, trimmed.trim_status) == (
        'positive', 'auto' if automatic_label else 'manual', 'auto')
    assert seconds(runtime, trimmed) == pytest.approx(.9)
    assert runtime.samples.audio(sample.id, word.id, original=True) == wav(seconds=3)
    job, = [j for j in runtime.jobs.list().items if j.payload.get('trim_only')]
    manifest = json.loads((tmp_path / 'studio/jobs' / job.id / 'classify-0.json').read_text())
    assert manifest['positive'] is True


def test_successful_unprompted_crop_wins_over_prompted_alternative(fixture):
    runtime, word, runner = fixture
    runner.prompted_words = [dict(word='Hey', start=2.2, end=2.4), dict(word='Cedar', start=2.5, end=2.8)]
    runner.speech_segments = [*runner.speech_segments, dict(start=2.2, end=2.8)]
    sample = scraped(runtime, word)
    runtime.samples.set_label(sample.id, 'positive', sample.revision)
    runtime.workers.run_once('gpu')
    assert seconds(runtime, runtime.samples.get(sample.id)) == pytest.approx(.9)


def test_prompted_crop_still_cannot_end_inside_detected_speech(fixture):
    runtime, word, runner = fixture
    runner.words = []
    runner.prompted_words = [dict(word='Hey', start=1.5, end=1.8), dict(word='Cedar', start=1.8, end=2.2)]
    runner.speech_segments = [dict(start=2.2, end=2.7)]
    sample = scraped(runtime, word)
    runtime.samples.set_label(sample.id, 'positive', sample.revision)
    runtime.workers.run_once('gpu')
    updated = runtime.samples.get(sample.id)
    assert (updated.label, updated.trim_status, updated.audio_id) == ('positive', 'needs_review', sample.audio_id)


def test_manual_trim_during_inference_wins(fixture):
    runtime, word, runner = fixture
    sample = scraped(runtime, word)
    positive = runtime.samples.set_label(sample.id, 'positive', sample.revision)
    runner.before_result = lambda: runtime.samples.trim(sample.id, .1, .3, positive.revision)
    runtime.workers.run_once('gpu')
    updated = runtime.samples.get(sample.id)
    assert updated.trim_status == 'manual'
    assert seconds(runtime, updated) == pytest.approx(.2)


def test_undone_manual_trim_is_never_automatically_reprocessed(fixture):
    runtime, word, _ = fixture
    sample = scraped(runtime, word)
    with runtime.jobs.store.transaction() as db:
        db.execute("UPDATE samples SET label='positive' WHERE id=?", (sample.id,))
    manual = runtime.samples.trim(sample.id, .1, .3, sample.revision)
    restored = runtime.samples.undo(sample.id, manual.revision)
    assert restored.trim_status == 'needs_review'
    job = runtime.jobs.enqueue('classify', word.id, {'trim_only': True, 'manual': True})
    assert runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job.id).result == dict(trimmed=0, needs_review=0, conflicts=0)
    assert runtime.samples.get(sample.id).audio_id == sample.audio_id


def test_even_an_overlong_manual_selection_is_not_automatically_overwritten(fixture):
    runtime, word, _ = fixture
    sample = scraped(runtime, word)
    manual = runtime.samples.trim(sample.id, 0, 3, sample.revision)
    positive = runtime.samples.set_label(sample.id, 'positive', manual.revision)
    assert positive.trim_status == 'needs_review'
    assert not runtime.jobs.list().items
    job = runtime.jobs.enqueue('classify', word.id, {'trim_only': True})
    runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job.id).status == 'complete'
    assert runtime.samples.get(sample.id).audio_id == manual.audio_id


def test_run_now_is_scoped_and_skips_manual_trims_and_imports(fixture):
    runtime, word, _ = fixture
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, trimming=replace(settings.trimming, enabled=False)))
    sample = scraped(runtime, word)
    # Simulate an existing positive from before this feature, without triggering new-label processing.
    with runtime.jobs.store.transaction() as db:
        db.execute("UPDATE samples SET label='positive' WHERE id=?", (sample.id,))
    imported = runtime.samples.import_audio(word.id, 'positive', io.BytesIO(wav(2)))
    other_word = runtime.workspaces.create('Hey Maple', 'en')
    other = scraped(runtime, other_word, 'other')
    with runtime.jobs.store.transaction() as db:
        db.execute("UPDATE samples SET label='positive' WHERE id=?", (other.id,))
    negative = scraped(runtime, word, 'negative')
    runtime.samples.set_label(negative.id, 'negative', negative.revision)
    manual = scraped(runtime, word, 'manual')
    manual = runtime.samples.trim(manual.id, 0, .8, manual.revision)
    runtime.samples.set_label(manual.id, 'positive', manual.revision)
    assert not runtime.jobs.list().items
    with api_client(runtime) as api:
        path = f'/api/studio/wakewords/{word.id}/samples'
        assert api.get(path, params={'trim_status': 'needs_review'}).json()['total'] == 1
        response = api.post(f'/api/studio/wakewords/{word.id}/trimming/jobs')
        assert response.status_code == 201
        job_id = response.json()['id']
        assert api.post('/api/studio/wakewords/missing/trimming/jobs').status_code == 404
        assert api.post(path + '/trim/jobs').status_code == 404
        assert api.get(path, params={'trim_status': 'bogus'}).status_code == 422
    runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job_id).status == 'complete'
    assert runtime.samples.get(sample.id).trim_status == 'auto'
    assert runtime.samples.get(manual.id).trim_status == 'manual'
    assert runtime.samples.get(imported.id).audio_id == imported.audio_id
    assert runtime.samples.get(negative.id).audio_id == negative.audio_id
    assert runtime.samples.get(other.id).audio_id == other.audio_id


def test_training_excludes_unresolved_scraped_positives_but_not_other_audio(fixture, tmp_path):
    runtime, word, runner = fixture
    augmentation_fixture(tmp_path)
    runtime.datasets.select(word.id, [])
    sample = scraped(runtime, word)
    with runtime.jobs.store.transaction() as db:
        db.execute("UPDATE samples SET label='positive' WHERE id=?", (sample.id,))
    imported = runtime.samples.import_audio(word.id, 'positive', io.BytesIO(wav(2)))
    negative = scraped(runtime, word, 'negative')
    runtime.samples.set_label(negative.id, 'negative', negative.revision)
    before = runtime.training.snapshot(word.id, 'a' * 32)
    assert {a.sample_id for a in before.audio} == {imported.id, negative.id}
    assert runtime.training.counts(word.id)['positive'] == 1
    trimmed = runtime.samples.trim(sample.id, .25, 1.15, sample.revision)
    after = runtime.training.snapshot(word.id, 'b' * 32)
    admitted = next(a for a in after.audio if a.sample_id == sample.id)
    assert admitted.audio_id == trimmed.audio_id
    assert admitted.family_id == sample.family_id
    assert runtime.training.counts(word.id)['positive'] == 2


def test_backfill_runs_multiple_batches_through_real_child_processes(fixture, tmp_path):
    import sys
    from studio.jobs import ProcessRunner
    runtime, word, _ = fixture
    stub = tmp_path / 'speech_fixture.py'
    stub.write_text('''import json,sys
from pathlib import Path
args = dict(a[2:].split('=', 1) for a in sys.argv[1:])
manifest = json.loads(Path(args['input-manifest']).read_text())
words = ''' + json.dumps(TrimRunner.words) + '''
Path(args['output-json']).write_text(json.dumps([
    dict(id=s['id'], speech=True, transcript='Hey Cedar lights', guided_transcript='', model='fixture', words=words,
         speech_segments=[dict(start=.4, end=1), dict(start=1.5, end=1.8)])
    for s in manifest['samples']]))
''')

    class LocalSpeechRunner(ProcessRunner):
        def run(self, context, argv, **kwargs):
            return super().run(context, [sys.executable, str(stub), *argv[2:]], **kwargs)

    runtime.workers.runner = LocalSpeechRunner()
    for i in range(51):
        scraped(runtime, word, str(i))
    with runtime.jobs.store.transaction() as db:
        db.execute("UPDATE samples SET label='positive' WHERE word_id=?", (word.id,))
    job = runtime.jobs.enqueue('classify', word.id, {'trim_only': True})
    runtime.workers.run_once('gpu')
    completed = runtime.jobs.get(job.id)
    assert completed.status == 'complete', runtime.jobs.log_tail(job.id)
    assert completed.result == dict(trimmed=51, needs_review=0, conflicts=0)
    assert runtime.samples.list(word.id, SampleQuery(trim_status='auto')).total == 51


@pytest.mark.parametrize('changes', [dict(phrase='Hello Juniper'), dict(language='de')])
def test_classification_discards_results_for_a_changed_workspace(fixture, changes):
    from studio.models import WakewordUpdate
    runtime, word, runner = fixture
    sample = scraped(runtime, word)
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, classification=replace(settings.classification,
        enabled=True, confirm_activations=True)))
    runner.before_result = lambda: runtime.workspaces.update(word.id, WakewordUpdate(**changes))
    runtime.jobs.enqueue('classify', word.id, {})
    runtime.workers.run_once('gpu')
    updated = runtime.samples.get(sample.id)
    assert (updated.label, updated.audio_id, updated.revision) == ('pending', sample.audio_id, sample.revision)
    assert runtime.training.counts(word.id)['positive'] == 0


@pytest.mark.parametrize('previous_policy', [None, 2])
def test_legacy_automatic_crops_are_not_reprocessed_and_still_need_manual_review(fixture, tmp_path, previous_policy):
    runtime, word, runner = fixture
    augmentation_fixture(tmp_path)
    runtime.datasets.select(word.id, [])
    sample = scraped(runtime, word)
    runtime.samples.set_label(sample.id, 'positive', sample.revision)
    runtime.workers.run_once('gpu')
    legacy = runtime.samples.get(sample.id)
    assert legacy.trim_status == 'auto'
    with runtime.jobs.store.transaction() as db:
        if previous_policy is None:
            db.execute('DELETE FROM audio_trim_validation WHERE audio_id=?', (legacy.audio_id,))
        else:
            db.execute('UPDATE audio_trim_validation SET policy=? WHERE audio_id=?', (previous_policy, legacy.audio_id))
    assert runtime.samples.get(sample.id).trim_status == 'needs_review'
    assert runtime.training.counts(word.id)['positive'] == 0
    job = runtime.jobs.enqueue('classify', word.id, {'trim_only': True})
    runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job.id).result == dict(trimmed=0, needs_review=0, conflicts=0)
    assert runtime.samples.get(sample.id).audio_id == legacy.audio_id
    assert runtime.samples.get(sample.id).trim_status == 'needs_review'
    assert runtime.samples.audio(sample.id, word.id, original=True) == wav(seconds=3)


def test_run_now_never_reprocesses_automatic_crops_even_after_undo(fixture):
    runtime, word, runner = fixture
    sample = scraped(runtime, word)
    runtime.samples.set_label(sample.id, 'positive', sample.revision)
    runtime.workers.run_once('gpu')
    previous = runtime.samples.get(sample.id)
    with api_client(runtime) as api:
        response = api.post(f'/api/studio/wakewords/{word.id}/trimming/jobs')
        assert response.status_code == 201
        job = response.json()
        assert 'force' not in job['payload']
    runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job['id']).result == dict(trimmed=0, needs_review=0, conflicts=0)
    assert runtime.samples.get(sample.id).audio_id == previous.audio_id
    runtime.samples.undo(sample.id, previous.revision)
    # Persisted jobs from the retired migration path cannot force another attempt.
    job = runtime.jobs.enqueue('classify', word.id, {'trim_only': True, 'force': True})
    runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job.id).result == dict(trimmed=0, needs_review=0, conflicts=0)
    assert runtime.samples.get(sample.id).audio_id == sample.audio_id


def test_failed_trim_is_not_retried_after_restart_but_new_samples_are_processed(fixture, tmp_path):
    runtime, word, runner = fixture
    sample = scraped(runtime, word)
    runner.words = []
    runtime.samples.set_label(sample.id, 'positive', sample.revision)
    runtime.workers.run_once('gpu')
    assert runtime.samples.get(sample.id).trim_status == 'needs_review'
    runtime.shutdown()
    runtime = StudioRuntime(tmp_path, runner=TrimRunner())
    try:
        fresh = scraped(runtime, word, 'fresh')
        with runtime.jobs.store.transaction() as db:
            db.execute("UPDATE samples SET label='positive' WHERE id=?", (fresh.id,))
        with api_client(runtime) as api:
            job = api.post(f'/api/studio/wakewords/{word.id}/trimming/jobs').json()
        runtime.workers.run_once('gpu')
        assert runtime.jobs.get(job['id']).result == dict(trimmed=1, needs_review=0, conflicts=0)
        assert runtime.samples.get(fresh.id).trim_status == 'auto'
        assert runtime.samples.get(sample.id).audio_id == sample.audio_id
        assert runtime.samples.get(sample.id).trim_status == 'needs_review'
    finally:
        runtime.shutdown()


def test_interrupted_trim_attempt_is_not_retried(fixture):
    runtime, word, runner = fixture
    sample = scraped(runtime, word)
    runtime.samples.set_label(sample.id, 'positive', sample.revision)

    def fail():
        raise RuntimeError('Speech process failed')

    runner.before_result = fail
    runtime.workers.run_once('gpu')
    runner.before_result = None
    with api_client(runtime) as api:
        job = api.post(f'/api/studio/wakewords/{word.id}/trimming/jobs').json()
    runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job['id']).result == dict(trimmed=0, needs_review=0, conflicts=0)
    assert runtime.samples.get(sample.id).audio_id == sample.audio_id
    assert runtime.training.counts(word.id)['positive'] == 0


def test_classification_leaves_positives_for_trim_when_automation_is_disabled(fixture):
    runtime, word, _ = fixture
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, trimming=replace(settings.trimming, enabled=False)))
    sample = scraped(runtime, word)
    runtime.jobs.enqueue('classify', word.id, {'manual': True})
    runtime.workers.run_once('gpu')
    assert runtime.samples.get(sample.id).label == 'positive'
    assert runtime.samples.get(sample.id).trim_status == 'needs_review'
    assert len(runtime.jobs.list().items) == 1


def test_manual_label_does_not_queue_trimming_when_disabled(fixture):
    runtime, word, _ = fixture
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, trimming=replace(settings.trimming, enabled=False)))
    sample = scraped(runtime, word)
    positive = runtime.samples.set_label(sample.id, 'positive', sample.revision)
    assert positive.trim_status == 'needs_review'
    assert not runtime.jobs.list().items


def test_manual_label_followup_respects_disabling_before_execution(fixture):
    runtime, word, _ = fixture
    sample = scraped(runtime, word)
    runtime.samples.set_label(sample.id, 'positive', sample.revision)
    job, = runtime.jobs.list().items
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, trimming=replace(settings.trimming, enabled=False)))
    assert runtime.workers.run_once('gpu')
    assert runtime.jobs.get(job.id).result == {'skipped': True, 'reason': 'disabled'}
    assert runtime.samples.get(sample.id).audio_id == sample.audio_id


def test_legacy_manual_label_followup_respects_disabled_policy_after_restart(fixture, tmp_path):
    runtime, word, _ = fixture
    sample = scraped(runtime, word)
    settings = runtime.automation.get(word.id).settings
    runtime.automation.save(word.id, replace(settings, trimming=replace(settings.trimming, enabled=False)))
    with runtime.jobs.store.transaction() as db:
        db.execute("UPDATE samples SET label='positive' WHERE id=?", (sample.id,))
    legacy = runtime.jobs.enqueue('classify', word.id,
        {'trim_only': True, 'sample_id': sample.id, 'revision': sample.revision})
    runtime.shutdown()
    runtime = StudioRuntime(tmp_path, runner=TrimRunner())
    try:
        assert runtime.workers.run_once('gpu')
        assert runtime.jobs.get(legacy.id).result == {'skipped': True, 'reason': 'disabled'}
        assert runtime.samples.get(sample.id).audio_id == sample.audio_id
        with api_client(runtime) as api:
            manual = api.post(f'/api/studio/wakewords/{word.id}/trimming/jobs').json()
        assert runtime.workers.run_once('gpu')
        assert runtime.jobs.get(manual['id']).result == dict(trimmed=1, needs_review=0, conflicts=0)
    finally:
        runtime.shutdown()


def test_full_length_editor_uses_absolute_bounds_and_can_expand_nested_crops(fixture):
    runtime, word, _ = fixture
    pcm = b''.join(value.to_bytes(2, 'little', signed=True) * 8000 for value in (100, 200, 300, 400, 500, 600))
    output = io.BytesIO()
    with wave.open(output, 'wb') as audio:
        audio.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
        audio.writeframes(pcm)
    original = output.getvalue()
    sample = runtime.samples.import_audio(word.id, 'positive', io.BytesIO(original))
    first = runtime.samples.trim(sample.id, .5, 2.5, sample.revision)
    nested = runtime.samples.trim(sample.id, .25, 1.25, first.revision)
    assert (nested.trim_start_s, nested.trim_end_s) == (.75, 1.75)
    with api_client(runtime) as api:
        path = f'/api/studio/wakewords/{word.id}/samples/{sample.id}'
        assert api.get(path + '/audio', params={'full': True}).content == original
        assert api.get(path + '/audio').content == runtime.blobs.read(nested.normalized_hash)
        other = runtime.workspaces.create('Other', 'en')
        assert api.get(f'/api/studio/wakewords/{other.id}/samples/{sample.id}/audio?full=true').status_code == 404
        invalid = dict(start_s=0, end_s=3.5, expected_revision=nested.revision, from_original=True)
        assert api.post(path + '/trim', json=invalid).status_code == 422
        body = dict(start_s=.25, end_s=2.75, expected_revision=nested.revision, from_original=True)
        assert api.post(path + '/trim', json={**body, 'expected_revision': first.revision}).status_code == 409
        response = api.post(path + '/trim', json=body)
        assert response.status_code == 200
        assert (response.json()['trim_start_s'], response.json()['trim_end_s']) == (.25, 2.75)
    expanded = runtime.samples.get(sample.id)
    with wave.open(io.BytesIO(runtime.blobs.read(expanded.normalized_hash)), 'rb') as audio:
        assert audio.readframes(audio.getnframes()) == pcm[4000 * 2:44000 * 2]
    with runtime.jobs.store.transaction() as db:
        assert db.execute('SELECT parent_id FROM audio_records WHERE id=?', (expanded.audio_id,)).fetchone()[0] == sample.audio_id
    assert expanded.family_id == sample.family_id
    assert runtime.samples.audio(sample.id, word.id, original=True) == original
    restored = runtime.samples.undo(sample.id, expanded.revision)
    assert (restored.audio_id, restored.trim_start_s, restored.trim_end_s) == (nested.audio_id, .75, 1.75)


def test_full_length_editor_can_expand_an_automatic_crop_without_undo(fixture):
    runtime, word, _ = fixture
    sample = scraped(runtime, word)
    runtime.samples.set_label(sample.id, 'positive', sample.revision)
    runtime.workers.run_once('gpu')
    current = runtime.samples.get(sample.id)
    with api_client(runtime) as api:
        path = f'/api/studio/wakewords/{word.id}/samples/{sample.id}'
        assert api.get(path + '/audio?full=true').content == wav(seconds=3)
        updated = api.post(path + '/trim', json=dict(start_s=.1, end_s=1.5,
            expected_revision=current.revision, from_original=True))
        assert updated.status_code == 200
    edited = runtime.samples.get(sample.id)
    assert edited.trim_status == 'manual'
    assert seconds(runtime, edited) == pytest.approx(1.4, abs=1 / 16000)
    assert runtime.samples.undo(sample.id, edited.revision).audio_id == current.audio_id


def test_manual_trim_at_exact_duration_limit_uses_retained_pcm_frames(fixture):
    runtime, word, _ = fixture
    recording = runtime.samples.ingest('fixture',
        DiagnosticClip('limit', phrase=word.phrase, engine='mww'),
        io.BytesIO(wav(seconds=5)), word.id)
    sample = next(s for s in runtime.samples.list(word.id, SampleQuery()).items
                  if s.recording_id == recording.id)
    positive = runtime.samples.set_label(sample.id, 'positive', sample.revision)
    trimmed = runtime.samples.trim(sample.id, .3, 3.2, positive.revision, from_original=True)
    assert trimmed.trim_status == 'manual'
    assert runtime.samples.list(word.id, SampleQuery(trim_status='needs_review')).total == 0
    assert runtime.training.counts(word.id)['positive'] == 1
    with wave.open(io.BytesIO(runtime.blobs.read(trimmed.normalized_hash)), 'rb') as audio:
        assert audio.getnframes() == 46400
    with pytest.raises(ValidationError, match='2.9 seconds'):
        runtime.samples.trim(sample.id, .3, 3.2000625, trimmed.revision, from_original=True)


def test_manual_trim_rejects_finite_but_unbounded_times(fixture):
    runtime, word, _ = fixture
    sample = scraped(runtime, word)
    positive = runtime.samples.set_label(sample.id, 'positive', sample.revision)
    with pytest.raises(ValidationError):
        runtime.samples.trim(sample.id, 0, 1e308, positive.revision, from_original=True)
