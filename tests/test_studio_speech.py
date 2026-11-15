import pytest

from studio.models import ClassificationPolicy
from studio.speech import classify_transcript, contains_phrase
from studio import speech as speech_module

ALL_ON = ClassificationPolicy(confirm_activations=True, auto_negatives=True,
                              promote_close_misses=True, near_miss_negatives=True)


# Real Hey Doof cases: primed Whisper writes the phrase over silence, noise and unrelated speech.
@pytest.mark.parametrize('speech,text,primed,want', [
    (False, '', '', 'negative'),                       # no speech cannot be the wake word
    (False, 'Hey doof', '', 'negative'),               # VAD wins over a transcript
    (True, 'Hey, Doof.', '', 'positive'),              # plain Whisper heard it
    (True, 'hey doof please', '', 'positive'),
    (True, 'Thank you.', 'thank you', 'negative'),     # even primed, something else
    (True, '', '', 'negative'),                        # even primed, nothing
    (True, 'Hey, dude.', 'hey doof', 'pending'),       # only primed hears it: unclear
    (True, 'Mom', 'Hey doof mommy', 'pending'),
])
def test_four_step_rule(speech, text, primed, want):
    for near in (False, True):
        assert classify_transcript('Hey Doof', ALL_ON, near_miss=near, speech=speech, text=text, primed=primed) == want


def test_each_grid_cell_has_its_own_toggle():
    only_near_negatives = ClassificationPolicy(auto_negatives=False, near_miss_negatives=True)
    assert classify_transcript('Hey Cedar', only_near_negatives, speech=False) == 'pending'
    assert classify_transcript('Hey Cedar', only_near_negatives, near_miss=True, speech=False) == 'negative'
    assert classify_transcript('Hey Cedar', ClassificationPolicy(), speech=True, text='hey cedar') == 'pending'
    assert classify_transcript('Hey Cedar', ClassificationPolicy(confirm_activations=True), speech=True,
                               text='hey cedar') == 'positive'


def test_matching_respects_token_boundaries_and_unicode():
    assert contains_phrase('HÉY_CÉDAR!', 'héy cédar')
    assert not contains_phrase('cedarwood', 'cedar')


def word(text, start, end, probability=.95):
    return dict(word=text, start=start, end=end, probability=probability)


def test_phrase_interval_isolates_phrase_not_following_command():
    words = [word('Hey,', .4, .6), word('Cedar!', .65, 1.0), word('lights', 1.5, 1.8)]
    assert speech_module.phrase_interval('hey cedar', words, 3, [dict(start=.4, end=1), dict(start=1.5, end=1.8)]) == pytest.approx((.25, 1.15))


def test_phrase_interval_clamps_padding_to_recording_edges():
    assert speech_module.phrase_interval('Cedar', [word('cedar', .05, .9)], 1, [dict(start=.05, end=.9)]) == (0, 1)


def test_phrase_padding_does_not_include_neighboring_words():
    words = [word('please', .1, .35), word('Cedar', .4, 1), word('stop', 1.05, 1.5)]
    assert speech_module.phrase_interval('Cedar', words, 3, [dict(start=.1, end=1.5)]) == (.35, 1.05)


@pytest.mark.parametrize('words', [
    [],
    [word('cedarwood', .2, .6)],
    [word('Cedar', float('nan'), .6)],
    [word('Cedar', .2, float('inf'))],
    [word('Cedar', -.1, .6)],
    [word('Cedar', .6, .2)],
    [word('Cedar', .6, .6)],
    [word('Cedar', .2, 4)],
    [word('Cedar', True, .6)],
    [None],
])
def test_phrase_interval_refuses_unlocatable_or_invalid_crops(words):
    assert speech_module.phrase_interval('Cedar', words, 3, [dict(start=.2, end=.6)]) is None


def test_phrase_interval_rejects_reversed_word_order_and_handles_unicode():
    assert speech_module.phrase_interval('Hey Cedar', [word('hey', 1, 1.2), word('cedar', .5, .8)], 3, [dict(start=.3, end=1.2)]) is None
    assert speech_module.phrase_interval('HÉY CÉDAR', [word('héy', .3, .5), word('cédar', .6, 1)], 3, [dict(start=.3, end=1)]) == pytest.approx((.15, 1.15))


def test_phrase_interval_refuses_a_phrase_without_independent_word_boundaries():
    assert speech_module.phrase_interval('Cedar', [word('Cedar please', .2, 1)], 3, [dict(start=.2, end=1)]) is None


def test_phrase_only_clip_uses_vad_edges_not_whispers_leading_silence():
    # Observed real Janet clip: Whisper ended the word before VAD found the actual utterance.
    assert speech_module.phrase_interval('Janet', [word('Janet.', 0, 2, .67)], 3,
        [dict(start=2.3, end=2.8)]) == pytest.approx((2.15, 2.95))


def test_phrase_only_clip_with_unexplained_other_speech_needs_review():
    assert speech_module.phrase_interval('Janet', [word('Janet', 0, 2.5)], 3,
        [dict(start=.3, end=.8), dict(start=2.2, end=2.8)]) is None


def test_phrase_at_end_of_speech_uses_vad_to_preserve_its_tail():
    words = [word('Please', .3, .8), word('hey', 1.9, 2), word('Janet', 2.16, 2.22)]
    assert speech_module.phrase_interval('Janet', words, 3,
        [dict(start=.3, end=.8), dict(start=1.9, end=2.5)]) == pytest.approx((2.01, 2.65))


def test_unverified_word_timestamps_alone_cannot_authorize_a_crop():
    assert speech_module.phrase_interval('Janet', [word('Janet', .3, .8)], 3) is None


def test_unrelated_coarse_context_does_not_reject_a_positive():
    words = [word('Hey', 0, 2.5), word('Janet', 2.5, 2.7)]
    assert speech_module.phrase_interval('Janet', words, 3, [dict(start=2.3, end=2.8)]) == pytest.approx((2.5, 2.95))


def test_contextual_crop_does_not_need_to_explain_separate_speech():
    words = [word('Please', .2, .4), word('Janet', .5, .8)]
    assert speech_module.phrase_interval('Janet', words, 3,
        [dict(start=.2, end=.8), dict(start=2.3, end=2.8)]) == pytest.approx((.4, .95))


def test_contextual_crop_preserves_the_whole_phrase_even_when_vad_misses_a_word():
    words = [word('Hey', .2, .4), word('Janet', 2.3, 2.6), word('please', 2.7, 2.9)]
    assert speech_module.phrase_interval('Hey Janet', words, 3,
        [dict(start=2.3, end=2.9)]) == pytest.approx((.05, 2.7))


@pytest.mark.parametrize('probability', [0, .349, float('nan'), None])
def test_positive_trim_does_not_use_phrase_confidence(probability):
    assert speech_module.phrase_interval('Janet', [word('Janet', 0, 2.54, probability)], 3,
        [dict(start=2.3, end=2.7)]) == pytest.approx((2.15, 2.85))


def test_positive_trim_does_not_require_probability_metadata():
    assert speech_module.phrase_interval('Janet', [dict(word='Janet', start=.2, end=.6)], 1,
        [dict(start=.2, end=.6)]) == pytest.approx((.05, .75))


@pytest.mark.parametrize('context', [word("planner's", .02, .16), word('noise', 0, 0),
                                    word('noise', float('nan'), 1), word('noise', .8, .2)])
def test_unrelated_word_problems_do_not_reject_a_timed_phrase(context):
    words = [context, word('Janet', 2.1, 2.44)]
    assert speech_module.phrase_interval('Janet', words, 3,
        [dict(start=.1, end=1.6), dict(start=2.3, end=2.8)]) == pytest.approx((1.95, 2.95))


def test_repeated_phrase_selects_latest_valid_occurrence():
    words = [word('Janet', .2, .6), word('Janet', 2.2, 2.5)]
    assert speech_module.phrase_interval('Janet', words, 3,
        [dict(start=.2, end=.6), dict(start=2.2, end=2.8)]) == pytest.approx((2.05, 2.95))


def test_repeated_phrase_can_skip_an_occurrence_with_invalid_timestamps():
    words = [word('Janet', .2, .6), word('Janet', 2.5, 2.5)]
    assert speech_module.phrase_interval('Janet', words, 3,
        [dict(start=.2, end=.6), dict(start=2.3, end=2.8)]) == pytest.approx((.05, .75))


def test_phrase_can_span_speech_regions_and_preserve_quiet_hey():
    words = [word('Hey', 1.8, 2), word('Doof', 2.2, 2.6)]
    assert speech_module.phrase_interval('Hey Doof', words, 3,
        [dict(start=1.9, end=2), dict(start=2.2, end=2.7)]) == pytest.approx((1.65, 2.85))


@pytest.mark.parametrize('words,segments', [
    ([word('Am I the worst?', 0, 1.7), word('Janet', 2.34, 2.5)], [dict(start=2.6, end=2.8)]),
    ([word('Okay', 0, .22), word('Janet', 1.5, 2.2)], [dict(start=.2, end=.4), dict(start=2.2, end=2.7)]),
])
@pytest.mark.parametrize('following', [None, '...', '', '_'])
def test_positive_trim_refuses_to_end_inside_detected_speech(words, segments, following):
    if following is not None:
        words = [*words, word(following, 2.65, 2.7)]
    assert speech_module.phrase_interval('Janet', words, 3, segments) is None


@pytest.mark.parametrize('segments', [[], [dict(start=0, end=3)], [dict(start=-1, end=1)],
                                    [dict(start=.2, end=float('nan'))], [None]])
def test_invalid_or_overlong_speech_segments_need_review(segments):
    assert speech_module.phrase_interval('Janet', [word('Janet', .3, .8)], 3, segments) is None


@pytest.mark.parametrize('plain', ['Hey Cedar', 'Thank you'])
def test_transcriber_returns_only_unprompted_word_timestamps(tmp_path, monkeypatch, plain):
    from types import SimpleNamespace
    from studio_harness import wav
    monkeypatch.setattr('studio.capture.detect_speech', lambda data: [dict(start=0, end=1)])

    class Model:
        def transcribe(self, audio, **kwargs):
            text = 'Hey Cedar' if 'initial_prompt' in kwargs else plain
            words = [SimpleNamespace(**word(text, .2, .8))] if kwargs.get('word_timestamps') else None
            return iter([SimpleNamespace(text=text, words=words)]), None

    path = tmp_path / 'audio.wav'
    path.write_bytes(wav())
    transcriber = speech_module.SpeechTranscriber(tmp_path)
    transcriber.model = Model()
    result = transcriber.transcribe(path, language='en', phrase='Hey Cedar')
    assert result['words'] == [word(plain, .2, .8)]
    assert result['transcript'] == plain
    assert result['speech_segments'] == [dict(start=0, end=1)]


@pytest.fixture
def positive_transcriber(tmp_path, monkeypatch):
    from types import SimpleNamespace
    from studio_harness import wav
    monkeypatch.setattr('studio.capture.detect_speech', lambda data: [dict(start=.4, end=1)])

    class Model:
        plain = 'Hey Cedar'
        plain_words = [word('Hey', .4, .6), word('Cedar', .7, 1)]
        prompted_words = [word('Hey', .4, .6, .01), word('Cedar', .7, 1, .01)]
        calls = None

        def transcribe(self, audio, **kwargs):
            self.calls.append(kwargs)
            prompted = 'initial_prompt' in kwargs
            text = 'Hey Cedar' if prompted else self.plain
            words = self.prompted_words if prompted else self.plain_words
            return iter([SimpleNamespace(text=text, words=[SimpleNamespace(**w) for w in words]
                         if kwargs.get('word_timestamps') else None)]), None

    path = tmp_path / 'audio.wav'
    path.write_bytes(wav(seconds=3))
    transcriber = speech_module.SpeechTranscriber(tmp_path)
    transcriber.model = Model()
    transcriber.model.calls = []
    return transcriber, path


def test_known_positive_can_retry_a_missing_unprompted_phrase(positive_transcriber):
    transcriber, path = positive_transcriber
    transcriber.model.plain = 'Hey dude'
    transcriber.model.plain_words = [word('Hey', .4, .6), word('dude', .7, 1)]
    result = transcriber.transcribe(path, language='en', phrase='Hey Cedar', positive=True)
    assert result['transcript'] == 'Hey dude'
    assert result['words'] == transcriber.model.plain_words
    assert result['prompted_words'] == transcriber.model.prompted_words
    assert len(transcriber.model.calls) == 2
    prompted = transcriber.model.calls[-1]
    assert prompted['beam_size'] == 1 and prompted['temperature'] == 0
    assert prompted['word_timestamps'] is True
    assert prompted['initial_prompt'] == 'The wake phrase is "hey cedar".'
    assert prompted['hotwords'] == 'hey cedar'


@pytest.mark.parametrize('positive', [False, True])
def test_invalid_unprompted_timing_triggers_fallback_even_when_text_matches(positive_transcriber, positive):
    transcriber, path = positive_transcriber
    transcriber.model.plain_words = [word('Hey', .4, .6), word('Cedar', 1, 1)]
    result = transcriber.transcribe(path, language='en', phrase='Hey Cedar', positive=positive)
    assert result['transcript'] == 'Hey Cedar'
    assert result['words'] == transcriber.model.plain_words
    assert result['prompted_words'] == transcriber.model.prompted_words
    assert speech_module.phrase_interval('Hey Cedar', result['prompted_words'], 3,
        result['speech_segments']) == pytest.approx((.25, 1.15))


def test_valid_unprompted_trim_does_not_run_prompted_fallback(positive_transcriber):
    transcriber, path = positive_transcriber
    result = transcriber.transcribe(path, language='en', phrase='Hey Cedar', positive=True)
    assert result['words'] == transcriber.model.plain_words
    assert result.get('prompted_words', []) == []
    assert len(transcriber.model.calls) == 1
    assert 'initial_prompt' not in transcriber.model.calls[0]


def test_numpy_whisper_timestamps_do_not_trigger_unnecessary_fallback(positive_transcriber):
    import numpy as np
    transcriber, path = positive_transcriber
    transcriber.model.plain_words = [
        word('Hey', np.float64(.4), np.float64(.6)), word('Cedar', np.float64(.7), np.float64(1))]
    result = transcriber.transcribe(path, language='en', phrase='Hey Cedar', positive=True)
    assert result.get('prompted_words', []) == []
    assert len(transcriber.model.calls) == 1
    assert speech_module.phrase_interval('Hey Cedar', result['words'], 3,
        result['speech_segments']) == pytest.approx((.25, 1.15))


def test_pending_classification_does_not_use_prompted_trim_timestamps(positive_transcriber):
    transcriber, path = positive_transcriber
    transcriber.model.plain = 'Hey dude'
    transcriber.model.plain_words = [word('Hey', .4, .6), word('dude', .7, 1)]
    result = transcriber.transcribe(path, language='en', phrase='Hey Cedar')
    assert result.get('prompted_words', []) == []
    assert classify_transcript('Hey Cedar', ALL_ON, speech=result['speech'], text=result['transcript'],
        primed=result['guided_transcript']) == 'pending'
    assert transcriber.model.calls[-1]['beam_size'] == 5
    assert not transcriber.model.calls[-1].get('word_timestamps')


def test_known_positive_without_speech_does_not_attempt_prompted_decode(positive_transcriber, monkeypatch):
    transcriber, path = positive_transcriber
    monkeypatch.setattr('studio.capture.detect_speech', lambda data: [])
    result = transcriber.transcribe(path, language='en', phrase='Hey Cedar', positive=True)
    assert result['speech'] is False
    assert result.get('prompted_words', []) == []
    assert transcriber.model.calls == []


def test_classify_cli_passes_known_positive_context_to_transcriber(positive_transcriber, tmp_path, monkeypatch):
    import json
    from cli import studio_classify
    transcriber, path = positive_transcriber
    transcriber.model.plain = 'Hey dude'
    transcriber.model.plain_words = [word('Hey', .4, .6), word('dude', .7, 1)]
    monkeypatch.setattr(studio_classify, 'SpeechTranscriber', lambda cache: transcriber)
    manifest, output = tmp_path / 'input.json', tmp_path / 'output.json'
    manifest.write_text(json.dumps(dict(phrase='Hey Cedar', language='en', cache_dir=str(tmp_path),
        positive=True, samples=[dict(id='sample', path=str(path))])))
    monkeypatch.setattr('sys.argv', ['studio_classify', f'--input-manifest={manifest}', f'--output-json={output}'])
    studio_classify.main()
    result, = json.loads(output.read_text())
    assert result['id'] == 'sample' and result['transcript'] == 'Hey dude'
    assert result['prompted_words'] == transcriber.model.prompted_words
