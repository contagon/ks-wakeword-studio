"""Shared shell helpers, exercised through bash with local stand-ins."""
import os
import subprocess
import tempfile
import unittest
from pathlib import Path

FUNCTIONS = Path(__file__).resolve().parents[1] / 'cli/shell.functions'


class ShellFunctionTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.env = {**os.environ, 'DATA_DIR': str(self.root), 'GIT_CONFIG_GLOBAL': '/dev/null',
                    'GIT_AUTHOR_NAME': 't', 'GIT_AUTHOR_EMAIL': 't@t', 'GIT_COMMITTER_NAME': 't',
                    'GIT_COMMITTER_EMAIL': 't@t'}

    def bash(self, script, **env):
        result = subprocess.run(['bash', '-c', f'set -euo pipefail; source "{FUNCTIONS}"; {script}'],
                                env={**self.env, **env}, capture_output=True, text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.strip()

    def git(self, *args, cwd):
        return subprocess.run(['git', *args], cwd=cwd, env=self.env, check=True, capture_output=True,
                              text=True).stdout.strip()

    def commit(self, upstream, content):
        (upstream / 'file').write_text(content)
        self.git('add', 'file', cwd=upstream)
        self.git('commit', '-qm', content, cwd=upstream)
        return self.git('rev-parse', 'HEAD', cwd=upstream)

    def test_checkout_tool_pins_and_repairs_checkouts(self):
        upstream = self.root / 'upstream'
        upstream.mkdir()
        self.git('init', '-q', cwd=upstream)
        first, second = self.commit(upstream, 'one'), self.commit(upstream, 'two')
        tool = self.root / 'tools/tool'
        checkout = lambda commit: self.bash(f'checkout_tool "{tool}" "{upstream}" {commit}')
        checkout(first)
        self.assertEqual(self.git('rev-parse', 'HEAD', cwd=tool), first)
        checkout(second)  # A new pin moves the existing clone.
        self.assertEqual((tool / 'file').read_text(), 'two')
        (tool / 'file').write_text('edited')
        checkout(second)  # A modified checkout is replaced.
        self.assertEqual((tool / 'file').read_text(), 'two')
        self.git('remote', 'set-url', 'origin', str(self.root / 'elsewhere'), cwd=tool)
        checkout(first)  # A foreign origin is replaced.
        self.assertEqual(self.git('remote', 'get-url', 'origin', cwd=tool), str(upstream))
        self.assertEqual((tool / 'file').read_text(), 'one')

    def test_setup_python_venv_skips_a_healthy_venv_built_from_the_pinned_tools(self):
        venv = self.root / '.venv/bin'
        venv.mkdir(parents=True)
        (venv / 'python').write_text('#!/bin/bash\nexit "${HEALTH:-0}"\n')
        (venv / 'python').chmod(0o755)
        (self.root / '.mww-data-dir').touch()
        stack = self.bash('echo "mww-${MWW_COMMIT}:psg-${PSG_COMMIT}"')
        (self.root / '.venv/.mww-stack').write_text(stack + '\n')
        script = FUNCTIONS.parent / 'setup_python_venv'
        run = lambda **env: subprocess.run(['bash', str(script), f'--data-dir={self.root}', '--no-gpu', '--python=false'],
                                           env={**self.env, **env}, capture_output=True, text=True, timeout=30)
        healthy = run()
        self.assertEqual(healthy.returncode, 0, healthy.stderr)
        self.assertIn('Healthy training venv found', healthy.stdout)
        # Unhealthy venvs fall through to a real install (stopped here by the missing interpreter).
        self.assertNotEqual(run(HEALTH='1').returncode, 0)
        (self.root / '.venv/.mww-stack').write_text('mww-old:psg-old\n')
        self.assertNotIn('Healthy training venv found', run().stdout)

    def test_detect_blackwell_uses_compute_capability_then_image_flag(self):
        bin_dir = self.root / 'bin'
        bin_dir.mkdir()
        smi = bin_dir / 'nvidia-smi'
        smi.write_text('#!/bin/bash\necho "${CAPABILITY:-}"\n')
        smi.chmod(0o755)
        report = 'detect_blackwell; echo "$IS_BLACKWELL"'
        path = f'{bin_dir}:{os.environ["PATH"]}'
        self.assertEqual(self.bash(report, PATH=path), 'false')
        self.assertEqual(self.bash(report, PATH=path, MWW_BLACKWELL_IMAGE='True'), 'true')
        self.assertEqual(self.bash(report, PATH=path, CAPABILITY='12.0'), 'true')
        self.assertEqual(self.bash(report, PATH=path, CAPABILITY='8.6', MWW_BLACKWELL_IMAGE='1'), 'false')


if __name__ == '__main__':
    unittest.main()
