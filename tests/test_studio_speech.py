import importlib.util
import pytest


@pytest.mark.parametrize('text,near,promote,want', [
    ('turn the lights off', False, False, 'negative'),
    ('Hey Cedar please', False, False, 'pending'),
    ('', False, False, 'pending'), ('a', False, False, 'pending'),
    ('hey cedar', True, False, 'pending'), ('hey cedar', True, True, 'positive'),
    ('turn the lights off', True, True, 'pending'),
    ('hey ceedar', False, False, 'pending'),
])
def test_conservative_transcript_decisions(text, near, promote, want):
    assert importlib.util.find_spec('studio.speech'), 'Conservative STT adapter is missing'
    from studio.speech import classify_transcript
    assert classify_transcript(text, 'Hey Cedar', near_miss=near, promote=promote) == want


def test_matching_respects_token_boundaries_and_unicode():
    assert importlib.util.find_spec('studio.speech'), 'Conservative STT adapter is missing'
    from studio.speech import contains_phrase
    assert contains_phrase('HÉY_CÉDAR!', 'héy cédar')
    assert not contains_phrase('cedarwood', 'cedar')
