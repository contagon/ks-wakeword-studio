#!/usr/bin/env python3
"""Pass microWakeWord training output through unchanged while reporting progress.

When STUDIO_PROGRESS_FD is set, bounded step counters and numeric metrics are
written to it as structured events. Raw output is never forwarded there.
"""
import argparse
import json
import math
import os
import re
import sys

NUMBER = r'([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?|nan|inf)'
BATCH = re.compile(r'Validation Batch #(\d+): Accuracy = ' + NUMBER + r'; Recall = ' + NUMBER
                   + r'; Precision = ' + NUMBER + r'; Loss = ' + NUMBER + r'; Mini-Batch #(\d+)')
VALIDATION = re.compile(r'Step (\d+) \(nonstreaming\): Validation: .*?accuracy = ' + NUMBER + r'%, recall = '
                        + NUMBER + r'%, precision = ' + NUMBER + r'%, .*?estimated false positives per hour = '
                        + NUMBER + r', loss = ' + NUMBER)


def finite(value, scale=1.0):
    number = float(value) / scale
    return number if math.isfinite(number) and number >= 0 else None


class Reporter:
    def __init__(self, total, interval, descriptor):
        self.total, self.interval, self.descriptor = total, interval, descriptor
        self.every = max(1, total // 100)
        self.next_step, self.last_step = self.every, 0

    def emit(self, stage, step, **metrics):
        event = {'stage': stage, 'completed': min(step, self.total), 'total': self.total}
        event.update({name: value for name, value in metrics.items() if value is not None})
        try:
            os.write(self.descriptor, (json.dumps(event) + '\n').encode())
        except OSError:
            self.descriptor = None

    def line(self, text):
        if self.descriptor is None:
            return
        if match := BATCH.search(text):
            step = (int(match[1]) - 1) * self.interval + int(match[6])
            if step < self.last_step:
                # A retry attempt restarts training from the first step.
                self.next_step = self.every
            self.last_step = step
            if step >= self.next_step or step == self.total:
                self.next_step = (step // self.every + 1) * self.every
                self.emit('training', step, accuracy=finite(match[2]), recall=finite(match[3]),
                          precision=finite(match[4]), loss=finite(match[5]))
        elif match := VALIDATION.search(text):
            self.emit('evaluating', int(match[1]), accuracy=finite(match[2], 100), recall=finite(match[3], 100),
                      precision=finite(match[4], 100), false_accepts_per_hour=finite(match[5]),
                      loss=finite(match[6]))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--total-steps', type=int, required=True)
    parser.add_argument('--eval-interval', type=int, required=True)
    args = parser.parse_args(argv)
    descriptor = os.environ.get('STUDIO_PROGRESS_FD')
    try:
        descriptor = int(descriptor) if descriptor is not None else None
    except ValueError:
        descriptor = None
    reporter = Reporter(max(1, args.total_steps), max(1, args.eval_interval), descriptor)
    for raw in sys.stdin.buffer:
        sys.stdout.buffer.write(raw)
        sys.stdout.buffer.flush()
        try:
            reporter.line(raw.decode('utf-8', errors='replace'))
        except (ValueError, OverflowError):
            pass
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
