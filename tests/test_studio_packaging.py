"""Check both image manifests ship the studio code and SQL resource together."""

import shlex
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


class StudioPackagingTests(unittest.TestCase):
    def test_both_images_copy_complete_importable_studio_package(self):
        for filename in ("dockerfile", "dockerfile.blackwell"):
            with self.subTest(dockerfile=filename):
                manifest = (REPO_ROOT / filename).read_text().replace("\\\n", " ")
                copies = []
                for line in manifest.splitlines():
                    words = shlex.split(line, comments=True)
                    if words and words[0].upper() == "COPY":
                        copies.append([word for word in words[1:] if not word.startswith("--")])
                self.assertIn(["studio/", "/root/mww-scripts/studio/"], copies,
                              f"{filename} must copy the complete studio directory, including schema.sql")
                self.assertIn(['tts_config.py', '/root/mww-scripts/tts_config.py'], copies)

                # Exercise the COPY source/destination in an isolated image-like tree.
                # No repository import path may hide a missing packaged resource.
                with tempfile.TemporaryDirectory() as directory:
                    image = Path(directory)
                    package = image / "root/mww-scripts/studio"
                    shutil.copytree(REPO_ROOT / "studio", package, ignore=shutil.ignore_patterns("__pycache__"))
                    shutil.copyfile(REPO_ROOT / 'tts_config.py', package.parent / 'tts_config.py')
                    self.assertTrue((package / "schema.sql").is_file())
                    result = subprocess.run(
                        [sys.executable, "-I", "-c", "\n".join([
                            "import sys",
                            "from pathlib import Path",
                            "sys.path.insert(0, sys.argv[1])",
                            "from studio.api import create_router",
                            "from studio.runtime import StudioRuntime",
                            "runtime = StudioRuntime(Path(sys.argv[2]))",
                            "word = runtime.workspaces.create('Hello', 'en', 'hello')",
                            "assert runtime.workspaces.get(word.id).model_id == 'hello'",
                            "runtime.shutdown()",
                        ]), str(package.parent), str(image / "data")],
                        cwd=image, capture_output=True, text=True, timeout=30,
                    )
                    self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
