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
    [word('Cedar', .2, .6), word('cedar', 1, 1.4)],
    [word('Cedar', .2, .6, .2)],
    [word('Cedar', float('nan'), .6)],
    [word('Cedar', .2, float('inf'))],
    [word('Cedar', -.1, .6)],
    [word('Cedar', .6, .2)],
    [word('Cedar', .6, .6)],
    [word('Cedar', .2, 4)],
    [word('Cedar', .2, .6, float('nan'))],
    [word('Cedar', True, .6)],
    [dict(word='cedar', start=.2, end=.6)],
    [None],
])
def test_phrase_interval_refuses_uncertain_or_unsafe_crops(words):
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


def test_coarse_context_timing_cannot_justify_a_boundary_inside_speech():
    words = [word('Hey', 0, 2.5), word('Janet', 2.5, 2.7)]
    assert speech_module.phrase_interval('Janet', words, 3, [dict(start=2.3, end=2.8)]) is None


def test_contextual_clip_cannot_ignore_unexplained_speech_elsewhere():
    words = [word('Please', .2, .4), word('Janet', .5, .8)]
    assert speech_module.phrase_interval('Janet', words, 3,
        [dict(start=.2, end=.8), dict(start=2.3, end=2.8)]) is None


def test_contextual_crop_must_keep_every_acoustically_supported_phrase_token():
    words = [word('Hey', .2, .4), word('Janet', 2.3, 2.6), word('please', 2.7, 2.9)]
    assert speech_module.phrase_interval('Hey Janet', words, 3, [dict(start=2.3, end=2.9)]) is None


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
