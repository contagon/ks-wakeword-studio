import pytest

from studio.models import ClassificationPolicy
from studio.speech import classify_transcript, contains_phrase

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
