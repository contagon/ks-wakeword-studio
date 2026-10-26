"""Exercise training pool configuration without starting GPU training."""

import ast
import glob
import json
import os
import subprocess
import sys
import tempfile
import types
import unittest
from pathlib import Path
from types import SimpleNamespace

import yaml

REPO = Path(__file__).resolve().parents[1]


class PositiveSamplingTests(unittest.TestCase):
    def configure(self, root, generated=(), personal=(), manifest=True):
        work = root / 'work'
        work.mkdir()
        for pool, splits in (('wake_word_samples_augmented', generated),
                             ('personal_augmented_features', personal),
                             ('reviewed_negative_features', ('training',))):
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
            'DATASET_MANIFEST': str(inputs) if manifest else '', 'TRAINING_STEPS': '40',
            'PROGDIR': str(REPO / 'cli'), 'PATH': str(Path(sys.executable).parent) + os.pathsep + os.environ['PATH'],
        })
        path = work / 'trained_models/training_parameters.yaml'
        return result, yaml.safe_load(path.read_text()) if path.exists() else None

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
                self.assertEqual(negative, {'reviewed_negative_features': (8.0, 1.25),
                    'speech': (12.0, 1.0), 'dinner_party': (12.0, 1.0),
                    'no_speech': (5.0, 1.0), 'dinner_party_eval': (0.0, 1.0)})

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

    def test_empty_or_evaluation_only_positive_pools_cannot_start_training(self):
        for generated, personal in (((), ()), (('validation',), ('testing',))):
            with self.subTest(generated=generated, personal=personal), tempfile.TemporaryDirectory() as directory:
                result, _ = self.configure(Path(directory), generated, personal)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('positive training features', result.stderr.lower())

    def test_augmenter_skips_empty_source_splits_and_keeps_explicit_assignments(self):
        # ML dependencies are replaced at their boundary; execute the real routing
        # and split generator, and fail like RaggedMmap does for empty generators.
        source = ast.parse((REPO / 'cli/wake_word_sample_augmenter').read_text())
        nodes = [node for node in source.body if isinstance(node, ast.FunctionDef)
                 and node.name in ('bind_wav_generator', 'generate_feature_set')]
        for split in ('training', 'validation', 'testing'):
            with self.subTest(split=split), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                path = root / 'input/real.wav'
                path.parent.mkdir()
                path.touch()
                class Audio:
                    def astype(self, *args, **kwargs):
                        return str(path)
                class Spectrograms:
                    def __init__(self, clips, **kwargs):
                        self.clips = clips
                    def spectrogram_generator(self, split, repeat):
                        return self.clips.audio_generator(split=split, repeat=repeat)
                class Mmap:
                    @staticmethod
                    def from_generator(out_dir, sample_generator, **kwargs):
                        frames = list(sample_generator)
                        if not frames:
                            raise ValueError('Cannot write an empty mmap')
                        target = Path(out_dir)
                        target.mkdir(parents=True)
                        (target / 'data.ninja').write_text(json.dumps(frames))
                namespace = dict(Path=Path, glob=glob, os=os, types=types, stable_splits={str(path): split},
                    Clips=lambda **kwargs: SimpleNamespace(), augmenter=object(),
                    SpectrogramGeneration=Spectrograms, RaggedMmap=Mmap,
                    librosa=SimpleNamespace(load=lambda *args, **kwargs: (Audio(), 16000)),
                    np=SimpleNamespace(float32=None), split_cfg={
                        'training': dict(name='train', repetition=2, slide_frames=10),
                        'validation': dict(name='validation', repetition=1, slide_frames=10),
                        'testing': dict(name='test', repetition=1, slide_frames=1)})
                exec(compile(ast.Module(body=nodes, type_ignores=[]), 'actual-augmenter', 'exec'), namespace)
                self.assertTrue(namespace['generate_feature_set'](str(path.parent), str(root / 'features'), 'personal'))
                outputs = list((root / 'features').glob('*/wakeword_mmap/data.ninja'))
                self.assertEqual([p.relative_to(root / 'features').parts[0] for p in outputs], [split])
                self.assertEqual(json.loads(outputs[0].read_text()), [str(path)] * (2 if split == 'training' else 1))
                self.assertFalse(namespace['generate_feature_set'](str(root / 'absent'), str(root / 'empty'), 'generated'))
                self.assertFalse((root / 'empty').exists())
