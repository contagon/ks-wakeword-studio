"""Exercise training pool configuration without starting GPU training."""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[1]


class PositiveSamplingTests(unittest.TestCase):
    def configure(self, root, generated=(), personal=(), manifest=True, reviewed=('training',), families='200', steps=40):
        work = root / 'work'
        work.mkdir()
        for pool, splits in (('wake_word_samples_augmented', generated),
                             ('personal_augmented_features', personal),
                             ('reviewed_negative_features', reviewed)):
            for split in splits:
                mmap = work / pool / split / 'wakeword_mmap'
                mmap.mkdir(parents=True)
                (mmap / 'data.ninja').write_bytes(b'nonempty-feature-data')
        # Empty directories are not evidence of usable features.
        (work / 'wake_word_samples_augmented/training').mkdir(parents=True, exist_ok=True)
        (work / 'personal_augmented_features/training').mkdir(parents=True, exist_ok=True)
        datasets = root / 'datasets'
        for name in ('speech', 'dinner_party', 'no_speech', 'dinner_party_eval'):
            (datasets / 'negative_datasets' / name).mkdir(parents=True)
        inputs = root / 'datasets.json'
        inputs.write_text(json.dumps({'schema_version': 1, 'datasets': [
            dict(id=name, path=str(datasets / 'negative_datasets' / name),
                 fingerprint='a' * 64, adapter='mww_mmap', representation='features',
                 split='evaluation' if name.endswith('_eval') else 'train')
            for name in ('speech', 'dinner_party', 'no_speech', 'dinner_party_eval')]}))
        script = (REPO / 'cli/wake_word_sample_trainer').read_text()
        section = script[script.index('check_directories()'):script.index('echo "   Wrote training_parameters.yaml"')]
        result = subprocess.run(['bash', '-ec', section], capture_output=True, text=True, env={
            **os.environ, 'WORK_DIR': str(work), 'TRAINING_DS': str(datasets),
             'DATASET_MANIFEST': str(inputs) if manifest else '', 'TRAINING_STEPS': str(steps),
            'REVIEWED_NEGATIVE_FAMILIES': families,
            'PROGDIR': str(REPO / 'cli'), 'PATH': str(Path(sys.executable).parent) + os.pathsep + os.environ['PATH'],
        })
        path = work / 'trained_models/training_parameters.yaml'
        return result, yaml.safe_load(path.read_text()) if path.exists() else None

    def test_training_budget_uses_lower_rate_for_final_quarter(self):
        for steps, stages, rates in (
            (80000, [60000, 20000], [0.001, 0.00025]),
            (40000, [30000, 10000], [0.001, 0.00025]),
            (101, [76, 25], [0.001, 0.00025]),
            (3, [2, 1], [0.001, 0.00025]),
            (2, [1, 1], [0.001, 0.00025]),
            (1, [1], [0.001]),
        ):
            with self.subTest(steps=steps), tempfile.TemporaryDirectory() as directory:
                result, config = self.configure(Path(directory), ('training',), steps=steps)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(config['training_steps'], stages)
                self.assertEqual(config['learning_rates'], rates)
                self.assertEqual(sum(config['training_steps']), steps)
                self.assertEqual(config['batch_size'], 16)
                self.assertNotIn('minimum_positive_samples_per_batch', config)

    def test_nonpositive_budget_fails_without_writing_config(self):
        for steps in (0, -1):
            with self.subTest(steps=steps), tempfile.TemporaryDirectory() as directory:
                result, config = self.configure(Path(directory), ('training',), steps=steps)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('training steps', result.stderr.lower())
                self.assertIsNone(config)

    def test_cli_defaults_to_eighty_thousand_steps_and_preserves_overrides(self):
        for override, expected in ((None, '80000'), ('123', '123')):
            with self.subTest(override=override), tempfile.TemporaryDirectory() as directory:
                env = dict(os.environ, DATA_DIR=directory)
                env.pop('TRAINING_STEPS', None)
                if override is not None:
                    env['TRAINING_STEPS'] = override
                result = subprocess.run(
                    ['bash', '-ec', 'source "$1"; echo "$TRAINING_STEPS"',
                     'test-defaults', str(REPO / 'cli/shell.functions')],
                    env=env, capture_output=True, text=True,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout.strip(), expected)

    def test_real_and_synthetic_positives_have_sixty_forty_sampling(self):
        for manifest in (True, False):
            with self.subTest(manifest=manifest), tempfile.TemporaryDirectory() as directory:
                result, config = self.configure(Path(directory), ('training',), ('training',), manifest)
                self.assertEqual(result.returncode, 0, result.stderr)
                positive = {Path(row['features_dir']).name: row for row in config['features'] if row['truth']}
                self.assertEqual(positive['personal_augmented_features']['sampling_weight'], 3.0)
                self.assertEqual(positive['wake_word_samples_augmented']['sampling_weight'], 2.0)
                self.assertEqual(sum(row['sampling_weight'] for row in positive.values()), 5.0)
                self.assertTrue(all(row['penalty_weight'] == 1.0 for row in positive.values()))
                negative = {Path(row['features_dir']).name: (row['sampling_weight'], row['penalty_weight'])
                            for row in config['features'] if not row['truth']}
                self.assertAlmostEqual(negative['reviewed_negative_features'][0], 9.25)
                self.assertEqual(negative['reviewed_negative_features'][1], 1.25)
                self.assertAlmostEqual(negative['speech'][0], 27.75 * 12 / 29)
                self.assertAlmostEqual(negative['dinner_party'][0], 27.75 * 12 / 29)
                self.assertAlmostEqual(negative['no_speech'][0], 27.75 * 5 / 29)
                self.assertEqual(negative['dinner_party_eval'], (0.0, 1.0))
                self.assertIn('200 training families', result.stdout)

    def test_single_positive_pool_and_evaluation_only_pools_are_supported(self):
        for generated, personal, expected in (
            (('training',), (), {'wake_word_samples_augmented'}),
            ((), ('training',), {'personal_augmented_features'}),
            (('training',), ('validation', 'testing'), {'wake_word_samples_augmented', 'personal_augmented_features'}),
            (('validation', 'testing'), ('training',), {'wake_word_samples_augmented', 'personal_augmented_features'}),
        ):
            with self.subTest(generated=generated, personal=personal), tempfile.TemporaryDirectory() as directory:
                result, config = self.configure(Path(directory), generated, personal)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual({Path(row['features_dir']).name for row in config['features'] if row['truth']}, expected)

    def test_evaluation_only_negatives_are_kept_but_never_sampled(self):
        with tempfile.TemporaryDirectory() as directory:
            result, config = self.configure(Path(directory), ('training',), reviewed=('validation', 'testing'), families='0')
            self.assertEqual(result.returncode, 0, result.stderr)
            reviewed = next(row for row in config['features']
                            if Path(row['features_dir']).name == 'reviewed_negative_features')
            self.assertEqual(reviewed['sampling_weight'], 0)
            self.assertAlmostEqual(sum(row['sampling_weight'] for row in config['features'] if not row['truth']), 37)

    def test_empty_or_evaluation_only_positive_pools_cannot_start_training(self):
        for generated, personal in (((), ()), (('validation',), ('testing',))):
            with self.subTest(generated=generated, personal=personal), tempfile.TemporaryDirectory() as directory:
                result, _ = self.configure(Path(directory), generated, personal)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('positive training features', result.stderr.lower())

    def test_augmenter_skips_empty_source_splits_and_keeps_explicit_assignments(self):
        from studio.mww_augmentation import generate_pool
        for split in ('training', 'validation', 'testing'):
            with self.subTest(split=split), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                path = root / 'input/real.wav'
                path.parent.mkdir()
                path.touch()
                class Builder:
                    def write(self, target, records, *, config, **kwargs):
                        target.mkdir(parents=True)
                        frames = [r['path'] for _ in range(config['repeat']) for r in records]
                        (target / 'data.ninja').write_text(json.dumps(frames))
                        return len(records) * config['repeat'] * config['slide_frames']
                kwargs = dict(cache_root=None, assignments={str(path): split}, seed=10,
                              policy={}, corpora={}, versions={}, builder=Builder(), report=[])
                self.assertTrue(generate_pool(path.parent, root / 'features', 'personal', **kwargs))
                outputs = list((root / 'features').glob('*/wakeword_mmap/data.ninja'))
                self.assertEqual([p.relative_to(root / 'features').parts[0] for p in outputs], [split])
                self.assertEqual(json.loads(outputs[0].read_text()), [str(path)] * (2 if split == 'training' else 1))
                self.assertFalse(generate_pool(root / 'absent', root / 'empty', 'generated', **kwargs))
                self.assertFalse((root / 'empty').exists())
