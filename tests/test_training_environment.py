from __future__ import annotations

import os
import tempfile
import unittest
from pathlib import Path

from studio.mww_training import training_environment


REPO_ROOT = Path(__file__).resolve().parents[1]


class TrainingEnvironmentTests(unittest.TestCase):
    def test_training_subprocess_removes_only_recorder_cuda_paths(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            data_dir = Path(directory)
            recorder_cublas = data_dir / ".recorder-venv" / "site-packages" / "cublas"
            recorder_cudnn = data_dir / ".recorder-venv" / "site-packages" / "cudnn"
            original = os.pathsep.join(
                (
                    str(recorder_cublas),
                    "/usr/local/cuda/lib64",
                    str(recorder_cudnn),
                    "/opt/vendor/lib",
                )
            )

            environ = {"LD_LIBRARY_PATH": original}
            env, removed = training_environment(data_dir, environ)
            self.assertEqual(environ["LD_LIBRARY_PATH"], original)

            self.assertEqual(removed, [str(recorder_cublas), str(recorder_cudnn)])
            self.assertEqual(
                env["LD_LIBRARY_PATH"],
                os.pathsep.join(("/usr/local/cuda/lib64", "/opt/vendor/lib")),
            )

    def test_tensorflow_preflight_reports_the_actual_training_device(self) -> None:
        trainer_script = (REPO_ROOT / "cli" / "wake_word_sample_trainer").read_text(
            encoding="utf-8"
        )

        self.assertIn("TensorFlow GPU preflight", trainer_script)
        self.assertIn("NVIDIA GPU passthrough is present", trainer_script)
        self.assertIn('${INITIAL_TRAINING_DEVICE} training', trainer_script)
        self.assertIn('"${PROGDIR}/cuda_library_path.py"', trainer_script)

    def test_blackwell_setup_explicitly_installs_and_checks_tensorboard(self) -> None:
        setup = (REPO_ROOT / "cli" / "setup_blackwell_venv").read_text(encoding="utf-8")
        health_check = (REPO_ROOT / "cli" / "check_training_venv").read_text(encoding="utf-8")
        dockerfile = (REPO_ROOT / "dockerfile").read_text(encoding="utf-8")

        self.assertIn("    tensorboard ", setup)
        self.assertIn('"${VENV}/bin/python" "${HEALTH_CHECK}"', setup)
        self.assertIn("import tensorboard", health_check)
        self.assertIn("from tensorboard.summary.v2 import scalar", health_check)
        self.assertIn("from microwakeword.audio.augmentation import Augmentation", health_check)
        self.assertIn("from microwakeword import model_train_eval", health_check)
        self.assertIn("ENV MWW_BLACKWELL_TF=required", dockerfile)

    def test_blackwell_main_venv_explicitly_installs_tensorboard(self) -> None:
        setup = (REPO_ROOT / "cli" / "setup_python_venv").read_text(encoding="utf-8")

        self.assertIn('default_tensorboard_specs=( "tensorboard" )', setup)
        self.assertIn('"${VENV}/bin/python" "${PROGDIR}/check_training_venv"', setup)
        self.assertIn('pip_install --no-deps -e "${MWW}"', setup)
        for dependency in (
            "audiomentations",
            "audio_metadata",
            "datasets",
            "mmap_ninja",
            "pymicro-features",
            "webrtcvad-wheels",
        ):
            self.assertIn(dependency, setup)


if __name__ == "__main__":
    unittest.main()
