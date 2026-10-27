"""Optional real CPU augmentation/cache checks, runnable in the training image."""

import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import time
import unittest
import wave

REPO = Path(__file__).resolve().parents[1]


@unittest.skipUnless(importlib.util.find_spec('tensorflow') and importlib.util.find_spec('microwakeword'),
                     'requires the optional training-engine environment')
class AugmentationEngineTests(unittest.TestCase):
    def test_parallel_bytes_cache_hits_and_negative_only_update(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            positives, negatives, noise = (root / name for name in ('positives', 'negatives', 'noise'))
            for path in (positives, negatives, noise):
                path.mkdir()
            def wav(path, frequency):
                pcm = b''.join(struct.pack('<h', int(6000 * math.sin(2 * math.pi * frequency * i / 16000)))
                               for i in range(16000))
                with wave.open(str(path), 'wb') as target:
                    target.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
                    target.writeframes(pcm)
            assignments = {}
            for parent, count in ((positives, 12), (negatives, 3)):
                for i in range(count):
                    path = parent / f'{i:03}.wav'
                    wav(path, 190 + 23 * i + (17 if parent == negatives else 0))
                    assignments[str(path)] = ('training', 'validation', 'testing')[i % 3]
            relocated_noise = root / 'relocated-noise'
            for corpus, directories in ((noise, ('z', 'a')), (relocated_noise, ('a', 'z'))):
                for name in directories:
                    (corpus / name).mkdir(parents=True)
                    wav(corpus / name / 'background.wav', 77 if name == 'z' else 123)
            split_path = root / 'splits.json'
            split_path.write_text(json.dumps(assignments))
            timings = {}

            def run(name, workers, cache, corpus=noise):
                run_root = root / name
                started = time.monotonic()
                result = subprocess.run([sys.executable, str(REPO / 'cli/wake_word_sample_augmenter'),
                    f'--data-dir={run_root}', f'--input-dir={positives}',
                    f'--output-dir={run_root / "work/generated"}', f'--negative-dir={negatives}',
                    f'--split-manifest={split_path}', f'--cache-dir={cache}', '--seed=10',
                    f'--workers={workers}', '--augmentation-ids=chime_16k', f'--chime-16k-dir={corpus}'],
                    capture_output=True, text=True, env=dict(os.environ, PYTHONDONTWRITEBYTECODE='1'), timeout=180)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                timings[name] = round(time.monotonic() - started, 3)
                return run_root, json.loads((run_root / 'logs/augmentation.json').read_text())

            one, one_report = run('one', 1, root / 'cache-one')
            two, two_report = run('two', 2, root / 'cache-two', relocated_noise)
            def fingerprints(path):
                return {str(p.relative_to(path)): hashlib.sha256(p.read_bytes()).hexdigest()
                        for p in path.rglob('*') if p.is_file()}
            self.assertEqual(fingerprints(one / 'work'), fingerprints(two / 'work'))
            self.assertEqual([s['key'] for s in one_report['splits']], [s['key'] for s in two_report['splits']])
            self.assertEqual([s['examples'] for s in one_report['splits']], [80, 40, 4, 20, 10, 1])
            warm, warm_report = run('warm', 2, root / 'cache-one')
            self.assertTrue(all(s['hit'] for s in warm_report['splits']))
            self.assertEqual(warm_report['worker_pids'], [])
            self.assertEqual(fingerprints(one / 'work'), fingerprints(warm / 'work'))
            new = negatives / 'new.wav'
            wav(new, 411)
            assignments[str(new)] = 'training'
            split_path.write_text(json.dumps(assignments))
            updated, report = run('updated', 2, root / 'cache-one')
            self.assertEqual([(s['pool'], s['split']) for s in report['splits'] if not s['hit']],
                             [('reviewed negatives', 'training')])
            self.assertEqual(fingerprints(one / 'work/generated'), fingerprints(updated / 'work/generated'))
            # Real mmap loading must retain dimensions/counts, not just file bytes.
            from mmap_ninja.ragged import RaggedMmap
            features = RaggedMmap(updated / 'work/generated/training/wakeword_mmap')
            self.assertEqual(len(features), 80)
            self.assertEqual(features[0].shape[1], 40)
            print('AUGMENTATION_FIXTURE_SECONDS', json.dumps(timings), flush=True)


if __name__ == '__main__':
    unittest.main()
