import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from studio.legacy_training import validate_inputs

REPO = Path(__file__).resolve().parents[1]


class TrainingCLITests(unittest.TestCase):
    def test_cli_rejects_unpinned_corpora_before_any_environment_setup(self):
        from studio import legacy_training as training
        from studio.models import ValidationError
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            manifest = root / 'manifest.json'
            manifest.write_text(json.dumps({'schema_version': 1, 'audio': [
                {'label': label, 'split': split} for label in ('positive', 'negative')
                for split in ('training', 'validation', 'testing')], 'datasets': [], 'config': {}}))
            with patch.object(training, '_run') as command:
                with self.assertRaisesRegex(ValidationError, 'pinned augmentation'):
                    training.main([f'--input-manifest={manifest}', f'--data-dir={root / "run"}', f'--tool-data-dir={root / "shared"}'])
            command.assert_not_called()
            self.assertFalse((root / 'shared').exists())

    def test_structural_validator_requires_real_engine_acceptance_before_marker(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / 'output/fixture'
            output.mkdir(parents=True)
            model = output / 'robot.tflite'
            model.write_text('valid fixture')
            # Stand-in exercises the actual validator without an ML install.
            (root / 'tensorflow.py').write_text('''from pathlib import Path
class Interpreter:
    def __init__(self, model_path, **kwargs): self.path = Path(model_path)
    def allocate_tensors(self):
        if self.path.read_text() != 'valid fixture': raise ValueError('invalid model')
    def get_input_details(self): return [{}]
    def get_output_details(self): return [{}]
class lite: pass
lite.Interpreter = Interpreter
''')
            command = [sys.executable, str(REPO / 'cli/validate_studio_model.py'), f'--data-dir={root}', '--model-id=robot', '--engine=mww']
            env = {**os.environ, 'PYTHONPATH': str(root)}
            valid = subprocess.run(command, env=env, capture_output=True)
            self.assertEqual(valid.returncode, 0, valid.stderr)
            self.assertEqual(json.loads((root / 'validation.json').read_text()), {'microWakeWord': True})
            (root / 'validation.json').unlink()
            model.write_text('broken')
            invalid = subprocess.run(command, env=env, capture_output=True)
            self.assertNotEqual(invalid.returncode, 0)
            self.assertFalse((root / 'validation.json').exists())

    def test_structural_validator_rejects_removed_engine(self):
        result = subprocess.run([sys.executable, str(REPO / 'cli/validate_studio_model.py'),
                                 '--data-dir=/unused', '--model-id=robot', '--engine=oww'], capture_output=True)
        self.assertEqual(result.returncode, 2)
        self.assertIn(b'invalid choice', result.stderr)

    def test_actual_mww_naming_section_preserves_stable_hyphenated_id(self):
        script = (REPO / 'cli/wake_word_sample_trainer').read_text()
        section = script[script.index('artifact_source='):script.index('\nOUTPUT_DIR=')]
        result = subprocess.run(['bash', '-c', section + '\nprintf "%s" "$wake_word_filename"'],
                                env={**os.environ, 'ARTIFACT_SLUG': 'robot-one', 'STABLE_MODEL_ID': 'robot-one', 'WAKE_WORD': 'Robot'}, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, 'robot-one')

    def test_real_cli_insufficient_families_writes_actionable_error_without_setup(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            manifest = root / 'manifest.json'
            manifest.write_text(json.dumps({'schema_version': 1, 'audio': [{'label': 'positive', 'split': 'training'}],
                                           'datasets': [], 'config': {}}))
            result = subprocess.run(['bash', str(REPO / 'train_wake_word'), f'--input-manifest={manifest}',
                                     f'--data-dir={root / "run"}', f'--tool-data-dir={root / "shared"}'], capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(json.loads((root / 'run/preflight-error.json').read_text())['code'], 'positive_counts')
            self.assertFalse((root / 'shared').exists())

    def test_real_augmenter_generator_consumes_explicit_assignments_without_reshuffle(self):
        import ast
        import glob
        import types
        from types import SimpleNamespace
        source = ast.parse((REPO / 'cli/wake_word_sample_augmenter').read_text())
        binding = next(node for node in source.body if isinstance(node, ast.FunctionDef) and node.name == 'bind_wav_generator')
        with tempfile.TemporaryDirectory() as directory:
            paths = [Path(directory) / f'{i}.wav' for i in range(3)]
            for path in paths:
                path.touch()
            assignments = dict(zip(map(str, paths), ('testing', 'training', 'validation')))
            class Audio:
                def __init__(self, path): self.path = path
                def astype(self, *args, **kwargs): return self.path
            namespace = {'Clips': object, 'glob': glob, 'os': os, 'types': types, 'stable_splits': assignments,
                         'librosa': SimpleNamespace(load=lambda path, **kwargs: (Audio(path), 16000)), 'np': SimpleNamespace(float32=None)}
            exec(compile(ast.Module(body=[binding], type_ignores=[]), 'actual-augmenter', 'exec'), namespace)
            clips = SimpleNamespace()
            namespace['bind_wav_generator'](clips, directory)
            self.assertEqual(list(clips.audio_generator(split='train', repeat=2)), [str(paths[1]), str(paths[1])])
            self.assertEqual(list(clips.audio_generator(split='validation')), [str(paths[2])])
            self.assertEqual(list(clips.audio_generator(split='test')), [str(paths[0])])

    def test_actual_manifest_cli_bypasses_generation_explicit_splits_and_datasets(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            repo, shared, run = base / 'repo', base / 'shared', base / 'run'
            (repo / 'cli').mkdir(parents=True)
            shutil.copy(REPO / 'train_wake_word', repo)
            shutil.copytree(REPO / 'studio', repo / 'studio')
            shutil.copy(REPO / 'cli/studio_train.py', repo / 'cli')
            (shared / '.venv/bin').mkdir(parents=True)
            (shared / '.venv/bin/python').symlink_to(sys.executable)
            (shared / '.venv/bin/activate').write_text('')
            from studio_harness import pinned_augmentation_fixture
            augmentation = pinned_augmentation_fixture(shared)
            capture = base / 'calls.jsonl'
            stub = "#!/usr/bin/env python3\nimport json, os, sys\nfrom pathlib import Path\nwith open(os.environ['CAPTURE'], 'a') as f: f.write(json.dumps([Path(__file__).name, sys.argv[1:]])+'\\n')\n"
            for name in ('check_training_venv', 'wake_word_sample_augmenter', 'wake_word_sample_trainer', 'validate_studio_model.py'):
                path = repo / 'cli' / name
                path.write_text(stub)
                path.chmod(0o755)
            audio = []
            for index, split in enumerate(('training', 'validation', 'testing')):
                for label in ('positive', 'negative'):
                    source = base / f'{index}-{label}.wav'
                    source.write_bytes(b'fixture')
                    audio.append({'audio_id': f'{index}-{label}', 'label': label, 'path': str(source),
                                  'normalized_hash': hashlib.sha256(b'fixture').hexdigest(), 'split': split})
            manifest = {'schema_version': 1, 'model_id': 'stable_robot', 'phrase': 'こんにちは', 'language': 'ja',
                        'audio': audio, 'datasets': [], 'config': {'training_steps': 123}, 'seed': 10, 'augmentation': augmentation}
            path = base / 'manifest.json'
            path.write_text(json.dumps(manifest))
            result = subprocess.run(['bash', str(repo / 'train_wake_word'), f'--input-manifest={path}',
                                     f'--data-dir={run}', f'--tool-data-dir={shared}'],
                                    env={**os.environ, 'CAPTURE': str(capture)}, text=True, capture_output=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            calls = [json.loads(line) for line in capture.read_text().splitlines()]
            self.assertEqual([c[0] for c in calls], ['check_training_venv', 'wake_word_sample_augmenter', 'wake_word_sample_trainer', 'validate_studio_model.py'])
            split_path = Path(next(a.split('=', 1)[1] for a in calls[1][1] if a.startswith('--split-manifest=')))
            self.assertEqual(set(json.loads(split_path.read_text()).values()), {'training', 'validation', 'testing'})
            for flag, item in zip(('mit-rirs-16k-dir', 'audioset-16k-dir', 'fma-16k-dir', 'chime-16k-dir'), augmentation):
                self.assertIn(f'--{flag}={item["path"]}', calls[1][1])
            self.assertFalse(any('setup_' in call[0] for call in calls))
            trainer = calls[2][1]
            self.assertIn('--artifact-slug=stable_robot', trainer)
            self.assertIn('--training-steps=123', trainer)
            dataset_path = Path(next(a.split('=', 1)[1] for a in trainer if a.startswith('--dataset-manifest=')))
            self.assertEqual(json.loads(dataset_path.read_text()), {'schema_version': 1, 'datasets': []})
            self.assertEqual(len(list((run / 'work/wake_word_samples').glob('*.wav'))), 3)
            self.assertFalse((shared / 'work').exists())
            self.assertTrue((run / 'logs/commands.log').is_file())

    def test_preflight_requires_positive_splits_and_accepts_mww_features(self):
        from studio.models import ValidationError
        manifest = {'audio': [], 'datasets': [], 'config': {}}
        with self.assertRaisesRegex(ValidationError, 'positive'):
            validate_inputs(manifest)
        manifest['audio'] = [{'label': 'positive', 'split': 'training'}]
        with self.assertRaisesRegex(ValidationError, 'validation.*testing'):
            validate_inputs(manifest)
        manifest['audio'] += [{'label': 'positive', 'split': x} for x in ('validation', 'testing')]
        manifest['datasets'] = [{'id': 'speech', 'path': '/fixture', 'representation': 'features', 'split': 'train', 'adapter': 'mww_mmap', 'fingerprint': 'a' * 64}]
        validate_inputs(manifest)
