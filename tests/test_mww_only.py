"""Regression boundaries for the microWakeWord-only trainer."""
import tempfile
import unittest
from dataclasses import asdict
from pathlib import Path

from studio.models import TrainingSettings, ValidationError
from studio.legacy_training import validate_inputs
from unittest.mock import patch


class MWWOnlyTests(unittest.TestCase):
    def test_legacy_mutations_reject_removed_companion_option(self):
        import trainer_server as trainer
        with patch.object(trainer, '_legacy_mode_required', return_value=None), \
                patch.object(trainer, '_save_auto_train_config_locked'), \
                patch.dict(trainer.AUTO_TRAIN_CONFIG, {'enabled': False}, clear=True):
            for enabled in (False, True):
                for action in (trainer.update_auto_train, trainer.train_now):
                    response = action({'train_openwakeword': enabled})
                    self.assertEqual(getattr(response, 'status_code', 200), 400, action.__name__)

    def test_legacy_sync_ignores_non_tflite_models(self):
        import trainer_server as trainer
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / 'output/old'
            output.mkdir(parents=True)
            (output / 'robot.json').write_text('{"model":"robot.onnx"}')
            (output / 'robot.onnx').write_bytes(b'old model')
            trained = root / 'trained'
            with patch.object(trainer, 'DATA_DIR', root), patch.object(trainer, 'ROOT_DIR', root / 'scripts'), patch.object(trainer, 'TRAINED_WAKE_WORDS_DIR', trained):
                trainer._sync_trained_wake_word_artifacts()
            self.assertEqual(list(trained.iterdir()), [])

    def test_legacy_esphome_manifest_rejects_non_tflite_model(self):
        import trainer_server as trainer
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'robot.json').write_text('{"model":"robot.onnx"}')
            (root / 'robot.onnx').write_bytes(b'old model')
            with patch.object(trainer, 'TRAINED_WAKE_WORDS_DIR', root), patch.object(trainer, '_sync_trained_wake_word_artifacts'):
                response = trainer.trained_wake_word_artifact('robot' + trainer.ESPHOME_MANIFEST_SUFFIX)
            self.assertEqual(response.status_code, 422)

    def test_legacy_download_rejects_removed_artifacts(self):
        import trainer_server as trainer
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in ('robot.oww.onnx', 'robot.onnx.data', 'robot.oww.verifier.pkl', 'robot.oww.json', 'robot.wake-bundle.json'):
                (root / name).write_bytes(b'historical artifact')
                with patch.object(trainer, 'TRAINED_WAKE_WORDS_DIR', root), patch.object(trainer, '_sync_trained_wake_word_artifacts'):
                    response = trainer.trained_wake_word_artifact(name)
                self.assertEqual(response.status_code, 400, name)

    def test_settings_have_no_companion_switch(self):
        self.assertEqual(asdict(TrainingSettings()), {'training_steps': 40000})

    def test_preflight_rejects_unsupported_embeddings_instead_of_silently_dropping_them(self):
        manifest = {'audio': [{'label': 'positive', 'split': 'training'}],
                    'config': {'training_steps': 100, 'train_openwakeword': False},
                    'datasets': [dict(id='old', path='/fixture/old.npy', representation='features',
                                      split='train', adapter='oww_embeddings_npy', fingerprint='a' * 64)]}
        with self.assertRaisesRegex(ValidationError, 'microWakeWord'):
            validate_inputs(manifest, require_splits=False)

    def test_legacy_settings_ignore_obsolete_switch_without_reenabling_it(self):
        from studio.training import load_settings
        self.assertEqual(asdict(load_settings({'training_steps': 123, 'train_openwakeword': True})), {'training_steps': 123})

    def test_removed_executable_files_are_not_shipped(self):
        root = Path(__file__).resolve().parents[1]
        for name in ('openwakeword_stage.py', 'cli/oww_dataset_trainer.py'):
            self.assertFalse((root / name).exists(), name)
