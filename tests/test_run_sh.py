from __future__ import annotations

import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
RUN_SH = REPO_ROOT / "run.sh"


def _cuda_path_probe() -> str:
    source = RUN_SH.read_text(encoding="utf-8")
    match = re.search(
        r'WHISPER_CUDA_LIBRARY_PATH="\$\("\$\{PY\}" - <<\'PY\'\n(?P<probe>.*?)\nPY\n\)"',
        source,
        flags=re.DOTALL,
    )
    if match is None:
        raise AssertionError("Could not locate the CUDA library path probe in run.sh")
    return match.group("probe")


class RunShCudaLibraryPathTests(unittest.TestCase):
    def test_croniter_is_exactly_pinned_and_validated_on_reuse(self):
        source = RUN_SH.read_text(encoding="utf-8")
        self.assertIn('CRONITER_VERSION="6.0.0"', source)
        self.assertIn('"croniter==${CRONITER_VERSION}"', source)
        probe = re.search(r"import importlib.metadata as md\n(?P<probe>.*?)\nPY", source, re.DOTALL).group(0)[:-3]
        import types
        versions = {'fastapi': '0.115.6', 'uvicorn': '0.30.6', 'python-multipart': '0.0.9',
                    'croniter': '6.0.0', 'silero-vad': '5.0.0', 'numpy': '1.24.0',
                    'faster-whisper': '1.0.0', 'onnx-asr': '0.12.0', 'nvidia-cudnn-cu12': '9.0.0'}
        from unittest.mock import patch
        for version in ('6.0.0', '5.0.1', None):
            def installed(package):
                if package == 'croniter':
                    if version is None:
                        import importlib.metadata
                        raise importlib.metadata.PackageNotFoundError(package)
                    return version
                return versions.get(package, '1.0.0')
            with self.subTest(version=version), patch('importlib.metadata.version', side_effect=installed), \
                 patch.object(sys, 'argv', ['-', '0.115.6', '0.30.6', '0.0.9', '6.0.0']), \
                 patch.dict(sys.modules, {'onnxruntime': types.SimpleNamespace(get_available_providers=lambda: ['CUDAExecutionProvider'])}):
                if version == '6.0.0':
                    exec(probe, {})
                else:
                    with self.assertRaises((SystemExit, __import__('importlib.metadata', fromlist=['PackageNotFoundError']).PackageNotFoundError)):
                        exec(probe, {})

    def _run_probe(self, python_path: Path) -> subprocess.CompletedProcess[str]:
        env = dict(os.environ)
        env["PYTHONPATH"] = str(python_path)
        return subprocess.run(
            [sys.executable, "-S", "-"],
            input=_cuda_path_probe(),
            text=True,
            capture_output=True,
            check=False,
            env=env,
        )

    def test_namespace_cuda_packages_do_not_require_module_file(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            cublas_lib = root / "nvidia" / "cublas" / "lib"
            cudnn_lib = root / "nvidia" / "cudnn" / "lib"
            cublas_lib.mkdir(parents=True)
            cudnn_lib.mkdir(parents=True)

            result = self._run_probe(root)

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(
                result.stdout.strip().split(":"),
                [str(cublas_lib.resolve()), str(cudnn_lib.resolve())],
            )

    def test_missing_cuda_packages_return_an_empty_path(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            result = self._run_probe(Path(temp_dir))

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), "")

    def test_parakeet_uses_cuda_onnxruntime_package(self) -> None:
        source = RUN_SH.read_text(encoding="utf-8")

        self.assertIn('"onnx-asr[hub]>=0.12.0"', source)
        self.assertIn('"onnxruntime-gpu[cuda,cudnn]<1.27"', source)
        self.assertIn('"CUDAExecutionProvider"', source)


if __name__ == "__main__":
    unittest.main()
