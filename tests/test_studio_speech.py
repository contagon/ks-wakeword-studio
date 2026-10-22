import pytest

from studio.speech import classify_transcript, contains_phrase


@pytest.mark.parametrize('text,near,promote,want', [
    ('turn the lights off', False, False, 'negative'),
    ('Hey Cedar please', False, False, 'pending'),
    ('', False, False, 'pending'), ('a', False, False, 'pending'),
    ('hey cedar', True, False, 'pending'), ('hey cedar', True, True, 'positive'),
    ('turn the lights off', True, True, 'pending'),
    ('hey ceedar', False, False, 'pending'),
])
def test_conservative_transcript_decisions(text, near, promote, want):
    assert classify_transcript(text, 'Hey Cedar', near_miss=near, promote=promote) == want


def test_matching_respects_token_boundaries_and_unicode():
    assert contains_phrase('HÉY_CÉDAR!', 'héy cédar')
    assert not contains_phrase('cedarwood', 'cedar')
