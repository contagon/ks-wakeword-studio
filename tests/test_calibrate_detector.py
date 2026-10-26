import importlib.util
import json
import os
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch

import numpy as np


SCRIPT_PATH = (
    Path(__file__).resolve().parents[1]
    / "cli"
    / "calibrate_detector.py"
)
SPEC = importlib.util.spec_from_file_location("calibrate_detector", SCRIPT_PATH)
calibrate_detector = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(calibrate_detector)


def candidate(cutoff, window, recall, false_accepts_per_hour):
    return {
        "probability_cutoff": cutoff,
        "sliding_window_size": window,
        "recall": recall,
        "false_accepts_per_hour": false_accepts_per_hour,
    }


class CalibrationSelectionTests(unittest.TestCase):
    def test_prefers_negative_rejection_within_recall_margin(self):
        candidates = [
            dict(candidate(0.95, 5, 0.99, 0.0), negative_rejection_rate=0.5),
            dict(candidate(0.97, 6, 0.987, 0.1), negative_rejection_rate=1.0),
            dict(candidate(0.99, 7, 0.90, 0.0), negative_rejection_rate=1.0),
        ]
        best, _ = calibrate_detector._select_best_candidate(candidates, 0.25)
        self.assertEqual(best['probability_cutoff'], 0.97)

    def test_negative_rejection_does_not_override_ambient_budget(self):
        candidates = [
            dict(candidate(0.95, 5, 0.99, 0.1), negative_rejection_rate=0.5),
            dict(candidate(0.97, 6, 0.99, 0.6), negative_rejection_rate=1.0),
        ]
        best, _ = calibrate_detector._select_best_candidate(candidates, 0.25)
        self.assertEqual(best['probability_cutoff'], 0.95)

    def test_defaults_are_conservative(self):
        self.assertEqual(calibrate_detector.DEFAULT_WINDOW_SIZES, "5,6,7")
        self.assertEqual(calibrate_detector.DEFAULT_CUTOFF_MIN, 0.95)
        self.assertEqual(calibrate_detector.DEFAULT_RECALL_MARGIN, 0.005)

    def test_prefers_zero_false_accepts_within_recall_margin(self):
        candidates = [
            candidate(0.95, 5, 0.99894, 0.103408),
            candidate(0.95, 6, 0.99744, 0.0),
            candidate(0.95, 7, 0.99554, 0.0),
        ]

        best, selected_limit = calibrate_detector._select_best_candidate(
            candidates,
            target_faph=0.25,
            recall_margin=0.005,
        )

        self.assertEqual(best["sliding_window_size"], 6)
        self.assertEqual(best["false_accepts_per_hour"], 0.0)
        self.assertEqual(selected_limit, 0.25)

    def test_does_not_trade_away_recall_beyond_margin(self):
        candidates = [
            candidate(0.95, 5, 0.99, 0.1),
            candidate(0.99, 6, 0.90, 0.0),
        ]

        best, _ = calibrate_detector._select_best_candidate(
            candidates,
            target_faph=0.25,
            recall_margin=0.005,
        )

        self.assertEqual(best["sliding_window_size"], 5)

    def test_uses_strictest_available_false_accept_tier(self):
        candidates = [
            candidate(0.95, 5, 0.99, 0.6),
            candidate(0.99, 6, 0.99, 1.5),
        ]

        best, selected_limit = calibrate_detector._select_best_candidate(
            candidates,
            target_faph=0.25,
            recall_margin=0.005,
        )

        self.assertEqual(best["false_accepts_per_hour"], 0.6)
        self.assertEqual(selected_limit, 0.75)

    def test_rejects_negative_recall_margin(self):
        with self.assertRaises(ValueError):
            calibrate_detector._select_best_candidate(
                [candidate(0.95, 6, 0.99, 0.0)],
                target_faph=0.25,
                recall_margin=-0.001,
            )


class EvalSetTests(unittest.TestCase):
    def handler(self, labels):
        class Handler:
            def get_data(self, mode, **kwargs):
                if mode == 'validation':
                    return [np.array([index]) for index in range(len(labels))], labels, []
                if mode == 'validation_ambient':
                    return [np.array([42])], [False], []
                raise AssertionError('Calibration accessed non-validation data')
        return Handler()

    def test_retains_ordinary_validation_negatives(self):
        positive_mode, ambient_mode, positives, negatives, ambient = (
            calibrate_detector._load_eval_sets(
                self.handler([True, False, False]),
                {'batch_size': 16, 'spectrogram_length': 100},
            )
        )
        self.assertEqual((positive_mode, ambient_mode), ('validation', 'validation_ambient'))
        self.assertEqual([track.tolist() for track in positives], [[0]])
        self.assertEqual([track.tolist() for track in negatives], [[1], [2]])
        self.assertEqual([track.tolist() for track in ambient], [[42]])

    def test_missing_validation_positives_never_uses_testing(self):
        with self.assertRaisesRegex(RuntimeError, 'validation'):
            calibrate_detector._load_eval_sets(
                self.handler([False]), {'batch_size': 16, 'spectrogram_length': 100}
            )

    def test_missing_ambient_never_uses_testing(self):
        class Handler:
            def get_data(self, mode, **kwargs):
                if mode == 'validation':
                    return [np.array([1])], [True], []
                if mode == 'validation_ambient':
                    return [], [], []
                raise AssertionError('Calibration accessed testing data')
        with self.assertRaisesRegex(RuntimeError, 'validation'):
            calibrate_detector._load_eval_sets(
                Handler(), {'batch_size': 16, 'spectrogram_length': 100}
            )


class NegativeScoringTests(unittest.TestCase):
    def test_counts_each_triggering_track_once_and_uses_strict_cutoff(self):
        maxima = calibrate_detector._track_maxima(
            [np.array([0.2, 0.99, 0.99]), np.array([0.5, 0.5])],
            window_size=1,
        )
        accepts, rejection = calibrate_detector._score_negative_tracks(
            maxima, np.array([0.5, 0.99], dtype=np.float32)
        )
        np.testing.assert_array_equal(accepts, [1, 0])
        np.testing.assert_allclose(rejection, [0.5, 1.0])

    def test_no_negatives_has_no_measured_rejection(self):
        accepts, rejection = calibrate_detector._score_negative_tracks(
            np.array([]), np.array([0.95])
        )
        np.testing.assert_array_equal(accepts, [0])
        self.assertIsNone(rejection)

    def test_negative_scoring_does_not_skip_initial_trigger(self):
        maxima = calibrate_detector._track_maxima(
            [np.array([1.0, 1.0, 0.0, 0.0])], window_size=2,
        )
        np.testing.assert_allclose(maxima, [1.0])


class CalibrationCliTests(unittest.TestCase):
    def test_packaged_metadata_preserves_negative_metrics(self):
        script = (SCRIPT_PATH.parent / 'wake_word_sample_trainer').read_text()
        # Execute the production packaging heredoc without running training.
        packaging = script.split('json_path = Path(os.environ["JSON_PATH"])', 1)[1].split('\nPY', 1)[0]
        packaging = 'import json\nimport os\nfrom pathlib import Path\njson_path = Path(os.environ["JSON_PATH"])' + packaging
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            calibration = root / 'calibration.json'
            calibration.write_text(json.dumps({
                'probability_cutoff': 0.96, 'sliding_window_size': 6,
                'selected_metrics': {'negative_false_accepts': 2, 'negative_rejection_rate': 0.8},
                'evaluation': {'negative_dataset': 'validation', 'negative_tracks': 10,
                               'negative_metric_unit': 'feature_track'},
            }))
            output = root / 'model.json'
            with patch.dict(os.environ, {'JSON_PATH': str(output),
                                         'CALIBRATION_PATH': str(calibration),
                                         'WAKE_WORD_TITLE': 'test', 'TFLITE_FILENAME': 'test.tflite'}):
                exec(compile(packaging, str(SCRIPT_PATH.parent / 'wake_word_sample_trainer'), 'exec'), {})
            metadata = json.loads(output.read_text())
        self.assertEqual(metadata['micro']['probability_cutoff'], 0.96)
        self.assertEqual(metadata['calibration']['negative_false_accepts'], 2)
        self.assertEqual(metadata['calibration']['negative_rejection_rate'], 0.8)
        self.assertEqual(metadata['calibration']['negative_tracks'], 10)
        self.assertEqual(metadata['calibration']['negative_dataset'], 'validation')
        self.assertEqual(metadata['calibration']['negative_metric_unit'], 'feature_track')

    def test_cli_retains_negative_metrics_without_inflating_ambient_hours(self):
        self.run_calibration(with_negatives=True)

    def test_cli_reports_unmeasured_rejection_without_negatives(self):
        self.run_calibration(with_negatives=False)

    def run_calibration(self, with_negatives):
        # Replace only the external engine and expensive streaming inference.
        class Handler:
            def __init__(self, config):
                pass

            def get_data(self, mode, **kwargs):
                if mode == 'validation':
                    tracks = [np.full(100, 0.99, dtype=np.float32)]
                    labels = [True]
                    if with_negatives:
                        tracks += [np.full(100, 0.97, dtype=np.float32),
                                   np.full(100, 0.955, dtype=np.float32)]
                        labels += [False, False]
                    return tracks, labels, [1.0] * len(labels)
                if mode == 'validation_ambient':
                    return [np.zeros(100, dtype=np.float32)], [False], [1.0]
                raise AssertionError('Calibration must not access testing data')

        class Model:
            def __init__(self, path, stride):
                pass

            def predict_spectrogram(self, track):
                return track

        data = types.ModuleType('microwakeword.data')
        data.FeatureHandler = Handler
        inference = types.ModuleType('microwakeword.inference')
        inference.Model = Model
        modules = {'microwakeword': types.ModuleType('microwakeword'),
                   'microwakeword.data': data, 'microwakeword.inference': inference}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            config = root / 'training.yaml'
            config.write_text('batch_size: 16\nspectrogram_length: 100\nstride: 1\nwindow_step_ms: 10\n')
            model = root / 'model.tflite'
            model.touch()
            output = root / 'calibration.json'
            argv = ['calibrate_detector', '--training-config', str(config),
                    '--model', str(model), '--output', str(output),
                    '--window-sizes', '1', '--positive-skip-slices', '0',
                    '--cutoff-min', '0.95', '--cutoff-max', '0.96']
            with patch.dict(sys.modules, modules), patch.object(sys, 'argv', argv):
                self.assertEqual(calibrate_detector.main(), 0)
            result = json.loads(output.read_text())
        self.assertEqual(result['probability_cutoff'], 0.96)
        self.assertEqual(result['evaluation']['negative_dataset'], 'validation')
        self.assertEqual(result['evaluation']['negative_tracks'], 2 if with_negatives else 0)
        self.assertEqual(result['evaluation']['negative_metric_unit'], 'feature_track')
        metrics = result['selected_metrics']
        self.assertEqual(metrics['negative_false_accepts'], 1 if with_negatives else 0)
        self.assertEqual(metrics['negative_rejection_rate'], 0.5 if with_negatives else None)
        self.assertEqual(metrics['recall'], 1.0)
        self.assertEqual(metrics['false_accepts_per_hour'], 0.0)
        self.assertAlmostEqual(metrics['ambient_hours'], 1 / 3600, places=6)
        if with_negatives:
            self.assertEqual(result['per_window_best'][0]['negative_rejection_rate'], 0.5)


if __name__ == "__main__":
    unittest.main()
