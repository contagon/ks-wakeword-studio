"""Lightweight augmentation identities and bounded ordered task scheduling."""

from collections import Counter, deque
import hashlib
import math
import os
from pathlib import Path
import random

from studio.augmentation_cache import digest, encoded


POLICY_VERSION = 1
SPLITS = {'training': {'repeat': 2, 'slide_frames': 10},
          'validation': {'repeat': 1, 'slide_frames': 10},
          'testing': {'repeat': 1, 'slide_frames': 1}}


def split_files(files, assignments):
    files = sorted(map(Path, files))
    if assignments is not None:
        if any(str(p.resolve()) not in assignments or assignments[str(p.resolve())] not in SPLITS for p in files):
            raise ValueError('Audio missing stable family assignment')
        return {split: [p for p in files if assignments[str(p.resolve())] == split] for split in SPLITS}
    random.Random(10).shuffle(files)
    n = len(files)
    validation = testing = max(1, int(.1 * n))
    training = max(0, n - validation - testing)
    return dict(training=files[:training], validation=files[training:training + validation],
                testing=files[training + validation:])


def recordings(files):
    occurrences = Counter()
    result = []
    for path in files:
        sha = digest(Path(path))
        result.append(dict(path=str(path), sha256=sha, occurrence=occurrences[sha]))
        occurrences[sha] += 1
    return result


def task_seed(seed, pool, split, recording, repetition):
    value = [POLICY_VERSION, seed, pool, split, recording['sha256'], recording['occurrence'], repetition]
    return int(hashlib.sha256(encoded(value).encode()).hexdigest()[:8], 16)


def split_identity(records, *, seed, pool, split, config, policy, corpora, versions):
    return dict(policy_version=POLICY_VERSION, seed=seed, pool=pool, split=split, config=config,
                policy=policy, corpora=corpora, versions=versions,
                recordings=[{k: r[k] for k in ('sha256', 'occurrence')} for r in records])


def worker_count(requested=None):
    available = len(os.sched_getaffinity(0)) if hasattr(os, 'sched_getaffinity') else (os.cpu_count() or 1)
    try:
        quota, period = Path('/sys/fs/cgroup/cpu.max').read_text().split()
        if quota != 'max':
            available = min(available, max(1, math.ceil(int(quota) / int(period))))
    except (OSError, ValueError, ZeroDivisionError):
        pass
    if requested is not None and not 1 <= requested <= 4:
        raise ValueError('Augmentation workers must be between 1 and 4')
    return min(available, requested or 4)


def ordered_results(executor, fn, tasks, *, limit):
    if limit < 1:
        raise ValueError('In-flight augmentation limit must be positive')
    tasks, pending = iter(tasks), deque()
    try:
        for _ in range(limit):
            task = next(tasks, None)
            if task is None:
                break
            pending.append(executor.submit(fn, task))
        while pending:
            future = pending.popleft()
            yield future.result()
            task = next(tasks, None)
            if task is not None:
                pending.append(executor.submit(fn, task))
    finally:
        for future in pending:
            future.cancel()
