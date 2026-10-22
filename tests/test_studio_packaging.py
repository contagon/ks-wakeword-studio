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
    def test_image_context_excludes_test_harnesses_and_local_state(self):
        excluded = (REPO_ROOT / '.dockerignore').read_text().splitlines()
        for pattern in ('tests', '**/__pycache__', '**/*.py[cod]', '.superpowers', 'frontend/node_modules', 'data', 'static/ui'):
            self.assertIn(pattern, excluded)

    def test_image_copies_complete_importable_studio_package(self):
        filename = "dockerfile"
        manifest = (REPO_ROOT / filename).read_text().replace("\\\n", " ")
        copies = []
        for line in manifest.splitlines():
            words = shlex.split(line, comments=True)
            if words and words[0].upper() == "COPY":
                copies.append([word for word in words[1:] if not word.startswith("--")])
        self.assertIn(["studio/", "/root/mww-scripts/studio/"], copies,
                      f"{filename} must copy the complete studio directory, including schema.sql")
        self.assertIn(['tts_config.py', '/root/mww-scripts/tts_config.py'], copies)
        self.assertIn(['cli/', '/root/mww-scripts/cli/'], copies)
        self.assertIn(['static/', '/root/mww-scripts/static/'], copies)
        entrypoints = next(row[:-1] for row in copies if 'trainer_server.py' in row)
        self.assertTrue({'run.sh', 'trainer_server.py',
                         'requirements.txt'}.issubset(entrypoints))
        self.assertIn('EXPOSE 8789', manifest)
        # Node builds the UI in its own stage; the runtime image never installs it.
        ui_stage, runtime_stage = manifest.split('\nFROM ', 2)[1:]
        self.assertTrue(ui_stage.startswith('node:') and 'npm run build' in ui_stage)
        self.assertIn(['/src/static/ui/', '/root/mww-scripts/static/ui/'], copies)
        self.assertNotIn('npm ', runtime_stage)
        self.assertNotIn('nodejs', runtime_stage.lower())
        self.assertFalse(any('tests/' in row for row in copies))

        # Exercise the COPY source/destination in an isolated image-like tree.
        # No repository import path may hide a missing packaged resource.
        with tempfile.TemporaryDirectory() as directory:
            image = Path(directory)
            package = image / "root/mww-scripts/studio"
            shutil.copytree(REPO_ROOT / "studio", package, ignore=shutil.ignore_patterns("__pycache__"))
            shutil.copyfile(REPO_ROOT / 'tts_config.py', package.parent / 'tts_config.py')
            shutil.copytree(REPO_ROOT / 'cli', package.parent / 'cli', ignore=shutil.ignore_patterns('__pycache__'))
            for helper in ('dataset_config.py', 'studio_train.py', 'validate_studio_model.py',
                           'tts_generate_samples.py', 'wake_word_sample_trainer'):
                self.assertTrue((package.parent / 'cli' / helper).is_file())
            self.assertTrue((package / "schema.sql").is_file())
            self.assertTrue((package / "dataset_catalog.json").is_file())
            self.assertFalse((package / "test_harness.py").exists())
            result = subprocess.run(
                [sys.executable, "-I", "-c", "\n".join([
                    "import sys",
                    "from pathlib import Path",
                    "sys.path.insert(0, sys.argv[1])",
                    "from studio.api import create_router",
                    "from studio.runtime import StudioRuntime",
                    "from studio.jobs import ProcessRunner",
                    "runtime = StudioRuntime(Path(sys.argv[2]))",
                    "assert runtime.runner is None",
                    "assert isinstance(runtime.workers.runner, ProcessRunner)",
                    "word = runtime.workspaces.create('Hello', 'en', 'hello')",
                    "assert runtime.workspaces.get(word.id).model_id == 'hello'",
                    "runtime.shutdown()",
                ]), str(package.parent), str(image / "data")],
                cwd=image, capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
