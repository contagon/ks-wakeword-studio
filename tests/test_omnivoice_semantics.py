import unittest
import numpy as np


class SemanticChecksTests(unittest.TestCase):
    def test_pitch_sanity_estimate_distinguishes_voiced_range_from_silence(self):
        from cli.benchmark_omnivoice_semantics import median_pitch
        tone = .1 * np.sin(2 * np.pi * 220 * np.arange(16000) / 16000)
        pitch = median_pitch(tone)
        self.assertTrue(200 < pitch < 240)
        self.assertIsNone(median_pitch(np.zeros(16000)))

    def test_semantic_match_does_not_prompt_or_accept_another_name(self):
        from cli.benchmark_omnivoice_semantics import semantic_match
        self.assertTrue(semantic_match(' Janet. ', 'Janet'))
        self.assertFalse(semantic_match('Janice', 'Janet'))
        self.assertFalse(semantic_match('', 'Janet'))
