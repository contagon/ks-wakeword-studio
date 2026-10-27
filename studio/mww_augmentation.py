"""Fresh run-local augmentation with a lazily started CPU worker pool."""

import argparse
from concurrent.futures import ProcessPoolExecutor
import importlib.metadata
import importlib.util
import json
import multiprocessing
import os
from pathlib import Path
import re
import signal
import shutil
import stat
import sys
import time
from uuid import uuid4

from studio.augmentation import CATALOG, tree_fingerprint
from studio.augmentation_features import (POLICY_VERSION, SPLITS, ordered_results, recordings,
                                          split_files, task_seed, worker_count, digest, encoded)
from studio.augmentation_worker import initialize, process_clip
from studio.storage import ensure_directory, fsync_directories


def augmentation_policy(paths, selected):
    return dict(augmentation_duration_s=3.2, augmentation_probabilities={
        'SevenBandParametricEQ': .1, 'TanhDistortion': .05, 'PitchShift': .15,
        'BandStopFilter': .1, 'AddColorNoise': .1,
        'AddBackgroundNoise': .7 if any(name in selected for name in ('chime_16k', 'fma_16k', 'audioset_16k')) else 0,
        'Gain': .8, 'RIR': .7 if 'mit_rirs_16k' in selected else 0},
        impulse_paths=[str(paths['mit_rirs_16k'])] if 'mit_rirs_16k' in selected else [],
        background_paths=[str(paths[name]) for name in ('chime_16k', 'fma_16k', 'audioset_16k') if name in selected],
        background_min_snr_db=5, background_max_snr_db=10, min_jitter_s=.2, max_jitter_s=.3)


def runtime_versions():
    versions = dict(python=sys.version.split()[0])
    for name in ('numpy', 'scipy', 'librosa', 'soundfile', 'audiomentations', 'pymicro-features',
                 'soxr', 'numpy-rms', 'numpy-minmax', 'mmap-ninja', 'tensorflow', 'tf-nightly'):
        try:
            versions[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            versions[name] = 'not-installed'
    spec = importlib.util.find_spec('microwakeword')
    if spec is None or not spec.submodule_search_locations:
        raise ValueError('microWakeWord is not installed in the selected augmentation environment')
    root = Path(next(iter(spec.submodule_search_locations)))
    versions['engine_sources'] = {str(p.relative_to(root)): digest(p) for p in sorted(root.rglob('*.py'))}
    versions['implementation'] = {name: digest(Path(__file__).with_name(name)) for name in (
        'mww_augmentation.py', 'augmentation_features.py', 'augmentation_worker.py')}
    return versions


class FeatureBuilder:
    def __init__(self, policy, workers):
        self.policy, self.workers, self.executor = policy, workers, None
        self.worker_pids = set()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        if self.executor is not None:
            self.executor.shutdown(wait=True, cancel_futures=True)

    def write(self, path, records, *, config, seed, pool, split):
        import numpy as np
        from mmap_ninja.ragged import RaggedMmap
        if self.executor is None:
            self.executor = ProcessPoolExecutor(max_workers=self.workers,
                mp_context=multiprocessing.get_context('spawn'), initializer=initialize, initargs=(self.policy,))
        tasks = (dict(record, seed=task_seed(seed, pool, split, record, repetition))
                 for repetition in range(config['repeat']) for record in records)
        results = ordered_results(self.executor, process_clip, tasks, limit=2 * self.workers)

        def features():
            try:
                for result in results:
                    if result['gpu_count']:
                        raise RuntimeError('Augmentation worker unexpectedly initialized a GPU')
                    self.worker_pids.add(result['pid'])
                    spectrogram = result['features']
                    shifts = config['slide_frames']
                    if spectrogram.ndim != 2 or spectrogram.shape[0] < shifts or spectrogram.shape[1] != 40:
                        raise ValueError('Unexpected augmented feature shape')
                    length = spectrogram.shape[0] - shifts + 1
                    for index in range(shifts):
                        yield np.asarray(spectrogram[index:index + length], dtype=np.float32)
            finally:
                results.close()
        generator = features()
        try:
            RaggedMmap.from_generator(out_dir=str(path), sample_generator=generator, batch_size=100, verbose=False)
        finally:
            generator.close()
        count = len(RaggedMmap(path))
        if count != len(records) * config['repeat'] * config['slide_frames']:
            raise ValueError('Augmented feature count does not match recording/repetition/shift settings')
        return count


def write_features(destination, build, expected_examples):
    """Publish fresh features atomically; never replace previous run outputs."""
    destination = Path(destination)
    if destination.exists() or destination.is_symlink():
        raise ValueError('Augmentation output already exists; use a fresh output directory')
    ensure_directory(destination.parent)
    stage = destination.parent / ('.partial-' + uuid4().hex)
    started = time.monotonic()
    try:
        examples = build(stage)
        if type(examples) is not int or examples < 1 or examples != expected_examples:
            raise ValueError('Augmentation feature count does not match its recipe')
        size = 0
        data_found = False
        for path in stage.rglob('*'):
            mode = path.lstat().st_mode
            if stat.S_ISDIR(mode):
                continue
            if not stat.S_ISREG(mode):
                raise ValueError('Augmentation output must contain regular files')
            size += path.stat().st_size
            data_found |= path.name == 'data.ninja' and path.stat().st_size > 0
            with path.open('rb') as handle:
                os.fsync(handle.fileno())
        if not data_found:
            raise ValueError('Augmentation output has no feature data')
        fsync_directories(stage)
        if destination.exists() or destination.is_symlink():
            raise ValueError('Augmentation output already exists; use a fresh output directory')
        stage.rename(destination)
        fsync_directories(destination.parent)
        return dict(examples=examples, bytes=size, seconds=time.monotonic() - started)
    finally:
        if stage.exists():
            shutil.rmtree(stage)


def generate_pool(source, output, pool, *, assignments, seed, builder, report):
    files = sorted(Path(source).glob('*.wav'))
    if not files:
        print(f'→ No WAVs for {pool}; skipping', flush=True)
        return False
    for split, paths in split_files(files, assignments).items():
        if not paths:
            continue
        records = recordings(paths)
        config = dict(SPLITS[split], remove_silence=pool != 'reviewed negatives')
        def build(path):
            return builder.write(path, records, config=config, seed=seed, pool=pool, split=split)
        expected = len(records) * config['repeat'] * config['slide_frames']
        result = write_features(Path(output) / split / 'wakeword_mmap', build, expected)
        result.update(pool=pool, split=split, recordings=len(records))
        report.append(result)
        print(f'→ {pool}/{split}: generated '
              f'{result["examples"]} features; {result["seconds"]:.2f}s', flush=True)
    return True


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path,
                        default=Path.cwd() if Path('.mww-data-dir').exists() else Path('/data'))
    parser.add_argument('--input-manifest', type=Path)
    parser.add_argument('--split-manifest', type=Path)
    parser.add_argument('--seed', type=int, default=10)
    parser.add_argument('--augmentation-ids', default=None)
    parser.add_argument('--workers', type=int, default=None)
    for name in ('input-dir', 'output-dir', 'personal-dir', 'personal-output-dir',
                 'negative-dir', 'negative-output-dir', *[name.replace('_', '-') + '-dir' for name in CATALOG]):
        parser.add_argument('--' + name, type=Path)
    args = parser.parse_args(argv)
    try:
        requested = args.workers
        if requested is None and os.environ.get('MWW_AUGMENTATION_WORKERS'):
            requested = int(os.environ['MWW_AUGMENTATION_WORKERS'])
        args.workers = worker_count(requested)
    except ValueError as exc:
        parser.error(str(exc))
    args.data_dir = args.data_dir.resolve()
    work = args.data_dir / 'work'
    for name, default in dict(input_dir=work / 'wake_word_samples', personal_dir=args.data_dir / 'personal_samples',
        personal_output_dir=work / 'personal_augmented_features', negative_dir=args.data_dir / 'negative_samples',
        negative_output_dir=work / 'reviewed_negative_features',
        **{key + '_dir': args.data_dir / 'training_datasets' / key for key in CATALOG}).items():
        setattr(args, name, getattr(args, name) or default)
    args.output_dir = args.output_dir or Path(str(args.input_dir) + '_augmented')
    selected = list(CATALOG) if args.augmentation_ids is None else (args.augmentation_ids.split(',') if args.augmentation_ids else [])
    if any(name not in CATALOG for name in selected) or len(set(selected)) != len(selected):
        parser.error('Invalid augmentation corpus selection')
    args.selected = selected
    return args


def corpus_identities(args, paths):
    if args.input_manifest is None:
        return {name: tree_fingerprint(Path(paths[name])) for name in args.selected}
    # Studio already verifies the retained trees with pinned_paths before this
    # queue-owned child starts. Match those exact identities/paths, not a new
    # mutable catalog lookup or a redundant rehash of the entire corpus.
    value = json.loads(args.input_manifest.read_text())
    items = value.get('augmentation')
    if value.get('schema_version') != 1 or not isinstance(items, list):
        raise ValueError('Missing pinned augmentation inputs')
    result = {}
    for item in items:
        name = item.get('id')
        fingerprint = item.get('fingerprint', '')
        if (name not in args.selected or name in result or not re.fullmatch('[0-9a-f]{64}', fingerprint)
                or Path(item.get('path', '')).resolve() != Path(paths[name]).resolve()):
            raise ValueError('Augmentation paths do not match verified pinned inputs')
        result[name] = fingerprint
    if set(result) != set(args.selected):
        raise ValueError('Augmentation selection does not match pinned inputs')
    return result


def main(argv=None):
    args = parse_args(argv)
    started = time.monotonic()
    paths = {name: getattr(args, name + '_dir') for name in args.selected}
    for path in (args.input_dir, *paths.values()):
        if not path.is_dir() or path.is_symlink():
            raise ValueError(f'Missing or unsafe augmentation input directory: {path}')
    assignments = json.loads(args.split_manifest.read_text()) if args.split_manifest else None
    corpora = corpus_identities(args, paths)
    policy = augmentation_policy(paths, args.selected)
    versions = runtime_versions()
    report = dict(policy_version=POLICY_VERSION, seed=args.seed, workers=args.workers,
                  policy=policy, corpora=corpora, versions=versions, splits=[])
    # Raising on TERM unwinds run-local staging and worker contexts.
    def terminated(signum, frame):
        raise SystemExit(128 + signum)
    old_handler = signal.signal(signal.SIGTERM, terminated)
    try:
        with FeatureBuilder(policy, args.workers) as builder:
            for source, output, pool in ((args.input_dir, args.output_dir, 'generated'),
                    (args.personal_dir, args.personal_output_dir, 'personal'),
                    (args.negative_dir, args.negative_output_dir, 'reviewed negatives')):
                generate_pool(source, output, pool, assignments=assignments, seed=args.seed,
                    builder=builder, report=report['splits'])
            report['worker_pids'] = sorted(builder.worker_pids)
    finally:
        signal.signal(signal.SIGTERM, old_handler)
    report['seconds'] = time.monotonic() - started
    logs = args.data_dir / 'logs'
    ensure_directory(logs)
    temporary = logs / ('.augmentation-' + uuid4().hex)
    try:
        temporary.write_text(encoded(report) + '\n')
        temporary.replace(logs / 'augmentation.json')
    finally:
        temporary.unlink(missing_ok=True)
    print(f'Augmentation complete: {report["seconds"]:.2f}s; {args.workers} CPU worker(s); '
          f'{len(report["splits"])} freshly generated splits', flush=True)
    return 0
