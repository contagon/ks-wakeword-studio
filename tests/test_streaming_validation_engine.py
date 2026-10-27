"""Optional real-engine checks; also runnable inside the training image.

CUDA_VISIBLE_DEVICES= python tests/test_streaming_validation_engine.py
The lightweight test venv skips these when the ML stack is unavailable.
"""

import hashlib
import importlib.util
from pathlib import Path
import sys
import unittest

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@unittest.skipUnless(importlib.util.find_spec('tensorflow') and importlib.util.find_spec('microwakeword'),
                     'requires the optional training-engine environment')
class StreamingValidationEngineTests(unittest.TestCase):
    def setUp(self):
        from microwakeword.data import FeatureHandler, MmapFeatureGenerator
        from studio.mww_validation import StreamingValidationHandler

        rng = np.random.default_rng(123)
        providers = []
        for label, count, lengths, uint16, cutoffs in (
            (True, 259, [], False, [0, 1]),
            (False, 77, [178, 179, 218, 219, 5000, 10000], True, [0]),
        ):
            # Use the real provider methods with in-memory backing arrays; no
            # corpus downloads or training files are created by this check.
            p = MmapFeatureGenerator.__new__(MmapFeatureGenerator)
            p.label, p.penalty_weight, p.sampling_weight = float(label), 1.0, 1.0
            p.truncation_strategy, p.fixed_right_cutoffs = 'random', cutoffs
            p.step, p.stride = .01, 2
            p.feature_sets = {mode: [] for mode in ('training', 'validation', 'validation_ambient',
                                                  'testing', 'testing_ambient')}
            p.loaded_features, p.stats = [], {}
            for mode, sizes in (('validation', [160 + i % 41 for i in range(count)]),
                                ('validation_ambient', lengths)):
                raw = []
                for n in sizes:
                    values = rng.integers(0, 100, size=(n, 40), dtype=np.uint16)
                    raw.append(values if uint16 else values.astype(np.float32) * .0390625)
                index = len(p.loaded_features)
                p.loaded_features.append(raw)
                p.feature_sets[mode] = [dict(loaded_feature_index=index, subindex=i) for i in range(len(raw))]
            for mode, entries in p.feature_sets.items():
                p.stats[mode] = dict(spectrogram_count=len(entries), total_duration=sum(
                    p.loaded_features[e['loaded_feature_index']][e['subindex']].shape[0] * .01 for e in entries))
            providers.append(p)
        self.handler = FeatureHandler.__new__(FeatureHandler)
        self.handler.feature_providers = providers
        self.streaming = StreamingValidationHandler(self.handler)

    def test_every_processed_example_and_label_matches_eager_loader(self):
        for mode, strategy, expected in (('validation', 'truncate_start', 595),
                                         ('validation_ambient', 'split', 740)):
            with self.subTest(mode=mode):
                x, y, _ = self.handler.get_data(mode, 16, 178, strategy)
                source, labels, _ = self.streaming.get_data(mode, 16, 178, strategy)
                batches = list(source.batches(labels.reshape(-1, 1), 128))
                streamed = np.concatenate([batch[0] for batch in batches])
                self.assertEqual(len(source), expected)
                self.assertTrue(all(len(batch[0]) <= 128 for batch in batches))
                fingerprint = lambda a, label: (hashlib.sha256(a.tobytes()).hexdigest(), float(label))
                self.assertEqual(sorted(fingerprint(a, label) for a, label in zip(x, y)),
                                 sorted(fingerprint(a, label) for a, label in zip(streamed, labels)))

    def test_all_upstream_metrics_match_for_repeated_streamed_evaluation(self):
        import tensorflow as tf
        from microwakeword import train

        spec = importlib.util.spec_from_file_location('real_validation_launcher',
            Path(__file__).resolve().parents[1] / 'cli/train_mww.py')
        launcher = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(launcher)
        cutoffs = np.linspace(0, 1, 101).tolist()
        with tf.device('/CPU:0'):
            model = tf.keras.Sequential([tf.keras.Input((178, 40)),
                tf.keras.layers.GlobalAveragePooling1D(),
                tf.keras.layers.Dense(1, activation='sigmoid',
                                      kernel_initializer=tf.keras.initializers.Constant(.01))])
            model.compile(loss='binary_crossentropy', metrics=[
                tf.keras.metrics.BinaryAccuracy(name='accuracy'), tf.keras.metrics.Recall(name='recall'),
                tf.keras.metrics.Precision(name='precision'), tf.keras.metrics.AUC(name='auc'),
                tf.keras.metrics.BinaryCrossentropy(name='loss'),
                tf.keras.metrics.TruePositives(name='tp', thresholds=cutoffs),
                tf.keras.metrics.FalsePositives(name='fp', thresholds=cutoffs),
                tf.keras.metrics.FalseNegatives(name='fn', thresholds=cutoffs),
                tf.keras.metrics.TrueNegatives(name='tn', thresholds=cutoffs),
            ])
            original = train.validate_nonstreaming
            config = dict(batch_size=16, spectrogram_length=178)
            baseline = original(config, self.handler, model, 'validation')
            try:
                launcher.install_bounded_validation(train)
                for _ in range(4):
                    actual = train.validate_nonstreaming(config, self.handler, model, 'validation')
                    for key, expected in baseline.items():
                        np.testing.assert_allclose(actual[key], expected, rtol=1e-5, atol=1e-6, err_msg=key)
            finally:
                train.validate_nonstreaming = original


if __name__ == '__main__':
    unittest.main()
