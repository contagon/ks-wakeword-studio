from __future__ import annotations

import os
import subprocess
import tempfile
import unittest
from pathlib import Path

from studio.mww_training import training_environment


REPO_ROOT = Path(__file__).resolve().parents[1]


class TrainingEnvironmentTests(unittest.TestCase):
    def runtime_policy(self, *, gpu_visible=True, gpu_count=1, training_fails=False, override=None):
        script = (REPO_ROOT / 'cli/wake_word_sample_trainer').read_text()
        policy = script[script.index('normalize_bool()'):script.index('if [ "${IS_BLACKWELL}" = "true" ]; then')]
        preflight = script[script.index('INITIAL_TRAINING_DEVICE="GPU"'):script.index('TRAINING_DONE="false"')]
        attempts = script[script.index('TRAINING_DONE="false"'):script.index('source_path=')]
        env = dict(os.environ, IS_BLACKWELL='false',
                   GPU_VISIBLE_TO_CONTAINER='true' if gpu_visible else 'false',
                   TF_GPU_COUNT=str(gpu_count), TEST_TRAINING_FAILS='true' if training_fails else 'false',
                   TRAIN_LOG='/unused')
        env.pop('MWW_ALLOW_CPU_FALLBACK', None)
        if override is not None:
            env['MWW_ALLOW_CPU_FALLBACK'] = override
        # Only hardware detection and the expensive training command are doubled;
        # run the production policy, preflight decisions and fallback branches.
        stubs = '''
detect_blackwell() { :; }
is_gpu_runtime_failure() { return 0; }
run_attempt() {
  echo "START:$1"
  case "$1" in
    "CPU fallback:"*) return 0 ;;
  esac
  [ "$TEST_TRAINING_FAILS" != true ]
}
'''
        return subprocess.run(['bash', '-ec', stubs + policy + preflight + attempts],
                              env=env, text=True, capture_output=True)

    def test_gpu_failure_stops_without_cpu_fallback_by_default(self):
        result = self.runtime_policy(training_fails=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('CPU fallback is disabled', result.stderr)
        self.assertNotIn('START:CPU fallback', result.stdout)

    def test_visible_gpu_unusable_by_tensorflow_stops_by_default(self):
        result = self.runtime_policy(gpu_count=0)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('CPU fallback is disabled', result.stderr)
        self.assertNotIn('START:', result.stdout)

    def test_cpu_only_system_can_still_train(self):
        result = self.runtime_policy(gpu_visible=False, gpu_count=0)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('START:Attempt 1/3: CPU training', result.stdout)
        self.assertNotIn('START:CPU fallback', result.stdout)

    def test_successful_gpu_training_stays_on_gpu(self):
        result = self.runtime_policy()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('START:Attempt 1/3: GPU training', result.stdout)
        self.assertNotIn('START:CPU fallback', result.stdout)

    def test_cpu_fallback_remains_an_explicit_opt_in(self):
        result = self.runtime_policy(training_fails=True, override='true')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('START:CPU fallback', result.stdout)

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
