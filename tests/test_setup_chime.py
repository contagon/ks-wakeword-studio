"""Exercise the real shell download/cache flow without network or audio dependencies."""
import io
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / 'cli/setup_chime'


class ChimeDownloadTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.tools = self.root / 'tools'
        self.tools.mkdir()
        self.data = self.root / 'data with spaces'
        self.cache = self.data / 'training_datasets/downloads/chime_home.tar.gz'
        self.cache.parent.mkdir(parents=True)
        venv = self.data / '.venv/bin'
        venv.mkdir(parents=True)
        (venv / 'activate').write_text(':\n')
        self.archive = self.root / 'fixture.tar.gz'
        with tarfile.open(self.archive, 'w:gz') as archive:
            member = tarfile.TarInfo('chime_home/chunks/example.48kHz.wav')
            member.size = 4
            archive.addfile(member, io.BytesIO(b'wave'))
        self.tool('curl', '''#!/bin/bash
printf '%s\n' "$*" >> "$CALLS"
while (( $# )); do
    if [[ "$1" == "-o" ]]; then shift; out="$1"; fi
    shift
done
if [[ "$MODE" == fail ]]; then printf partial > "$out"; exit 28; fi
if [[ "$MODE" == invalid ]]; then printf '<html>Unavailable</html>' > "$out"; exit 0; fi
if [[ "$MODE" == retry ]] && [[ $(wc -l < "$CALLS") == 1 ]]; then
    printf partial > "$out"; exit 28
fi
cp "$FIXTURE" "$out"
''')
        # Conversion is outside the download contract; real tar extraction still runs.
        self.tool('python', '#!/bin/bash\ncat >/dev/null\nprintf wave > "$2/example.wav"\n')
        self.tool('sleep', '#!/bin/bash\nexit 0\n')
        self.env = {**os.environ, 'PATH': f'{self.tools}:{os.environ["PATH"]}',
                    'CALLS': str(self.root / 'calls'), 'FIXTURE': str(self.archive), 'MODE': 'ok'}

    def tool(self, name, content):
        path = self.tools / name
        path.write_text(content)
        path.chmod(0o755)

    def run_setup(self, **env):
        return subprocess.run(['bash', str(SCRIPT), f'--data-dir={self.data}'],
                              env={**self.env, **env}, capture_output=True, text=True, timeout=10)

    def test_failed_download_does_not_poison_cache(self):
        result = self.run_setup(MODE='fail')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.cache.exists(), result.stdout + result.stderr)
        self.assertFalse(self.cache.with_suffix('.gz.incomplete').exists())
        self.assertIn('Failed to download', result.stderr)

    def test_transient_download_failure_is_retried(self):
        result = self.run_setup(MODE='retry')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.cache.read_bytes(), self.archive.read_bytes())

    def test_http_success_with_invalid_archive_is_not_cached(self):
        result = self.run_setup(MODE='invalid')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.cache.exists())
        self.assertIn('Failed to download', result.stderr)

    def test_corrupt_cached_archive_is_replaced(self):
        self.cache.write_bytes(b'partial previous download')
        result = self.run_setup()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.cache.read_bytes(), self.archive.read_bytes())

    def test_valid_cached_archive_needs_no_network(self):
        self.cache.write_bytes(self.archive.read_bytes())
        result = self.run_setup(MODE='fail')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertFalse((self.root / 'calls').exists())

    def test_trusted_mirror_can_override_unavailable_source(self):
        result = self.run_setup(CHIME_AUDIO_URL='https://mirror.example/chime_home.tar.gz')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('https://mirror.example/chime_home.tar.gz', (self.root / 'calls').read_text())


if __name__ == '__main__':
    unittest.main()
