import json
import os
import subprocess
import sys
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / 'cli' / 'training_progress.py'


class TrainingProgressFilterTests(unittest.TestCase):
    def run_filter(self, text, total=1000, interval=500):
        read_fd, write_fd = os.pipe()
        try:
            result = subprocess.run([sys.executable, str(SCRIPT), f'--total-steps={total}', f'--eval-interval={interval}'],
                                    input=text.encode(), capture_output=True, check=True, pass_fds=(write_fd,),
                                    env={**os.environ, 'STUDIO_PROGRESS_FD': str(write_fd)})
        finally:
            os.close(write_fd)
        with os.fdopen(read_fd, 'rb') as progress:
            events = [json.loads(line) for line in progress.read().splitlines()]
        return result.stdout.decode(), events

    def test_output_passes_through_and_steps_are_reported_once_per_percent(self):
        batches = ''.join(f'Validation Batch #{step // 500 + 1}: Accuracy = 0.900; Recall = 0.800; Precision = 0.700; '
                          f'Loss = 0.1234; Mini-Batch #{step % 500}\n' for step in range(1, 1001))
        validation = ('INFO:absl:Step 500 (nonstreaming): Validation: recall at no faph = 50.000 with cutoff 0.90, '
                      'accuracy = 97.50%, recall = 88.00%, precision = 99.00%, ambient false positives = 3, '
                      'estimated false positives per hour = 0.25000, loss = 0.04000, auc = 0.99000, '
                      'average viable recall = 0.900000000\n')
        text = 'secret path /data/x\n' + batches + validation
        stdout, events = self.run_filter(text)
        self.assertEqual(stdout, text)
        training = [event for event in events if event['stage'] == 'training']
        self.assertEqual([event['completed'] for event in training], list(range(10, 1001, 10)))
        self.assertEqual(training[0], {'stage': 'training', 'completed': 10, 'total': 1000, 'accuracy': 0.9,
                                       'recall': 0.8, 'precision': 0.7, 'loss': 0.1234})
        self.assertEqual(events[-1], {'stage': 'evaluating', 'completed': 500, 'total': 1000, 'accuracy': 0.975,
                                      'recall': 0.88, 'precision': 0.99, 'false_accepts_per_hour': 0.25, 'loss': 0.04})
        self.assertFalse(any('secret' in json.dumps(event) for event in events))

    def test_non_finite_metrics_are_omitted(self):
        _, events = self.run_filter('Validation Batch #1: Accuracy = 0.500; Recall = 0.500; Precision = 0.500; '
                                    'Loss = nan; Mini-Batch #10\n')
        self.assertEqual(events, [{'stage': 'training', 'completed': 10, 'total': 1000, 'accuracy': 0.5,
                                   'recall': 0.5, 'precision': 0.5}])


if __name__ == '__main__':
    unittest.main()
