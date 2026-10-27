"""Cached split augmentation orchestration, with a lazily started CPU worker pool."""

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
import sys
import time
from uuid import uuid4

from studio.augmentation import CATALOG, tree_fingerprint
from studio.augmentation_cache import digest, encoded, materialize
from studio.augmentation_features import (POLICY_VERSION, SPLITS, ordered_results, recordings,
                                          split_files, split_identity, task_seed, worker_count)
from studio.augmentation_worker import initialize, process_clip
from studio.storage import ensure_directory


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
        'mww_augmentation.py', 'augmentation_features.py', 'augmentation_worker.py', 'augmentation_cache.py')}
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


def generate_pool(source, output, pool, *, cache_root, assignments, seed, policy, corpora,
                  versions, builder, report):
    files = sorted(Path(source).glob('*.wav'))
    if not files:
        print(f'→ No WAVs for {pool}; skipping', flush=True)
        return False
    for split, paths in split_files(files, assignments).items():
        if not paths:
            continue
        records = recordings(paths)
        config = dict(SPLITS[split], remove_silence=pool != 'reviewed negatives')
        identity = split_identity(records, seed=seed, pool=pool, split=split, config=config,
                                  policy=policy, corpora=corpora, versions=versions)
        def build(path):
            return builder.write(path, records, config=config, seed=seed, pool=pool, split=split)
        result = materialize(cache_root, identity, Path(output) / split / 'wakeword_mmap', build)
        result.update(pool=pool, split=split, recordings=len(records), identity=identity)
        report.append(result)
        print(f'→ {pool}/{split}: cache {"hit" if result["hit"] else "miss"}; '
              f'{result["examples"]} features; {result["seconds"]:.2f}s', flush=True)
    return True


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path,
                        default=Path.cwd() if Path('.mww-data-dir').exists() else Path('/data'))
    parser.add_argument('--tool-data-dir', type=Path)
    parser.add_argument('--input-manifest', type=Path)
    parser.add_argument('--split-manifest', type=Path)
    parser.add_argument('--seed', type=int, default=10)
    parser.add_argument('--augmentation-ids', default=None)
    parser.add_argument('--cache-dir', type=Path)
    parser.add_argument('--no-cache', action='store_true')
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
    shared = (args.tool_data_dir or args.data_dir).resolve()
    args.cache_dir = args.cache_dir or shared / '.cache/mww-augmentation/v1'
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
    cache_policy = dict(policy, impulse_paths=['mit_rirs_16k'] if 'mit_rirs_16k' in args.selected else [],
                        background_paths=[name for name in ('chime_16k', 'fma_16k', 'audioset_16k') if name in args.selected])
    versions = runtime_versions()
    report = dict(policy_version=POLICY_VERSION, workers=args.workers, cache_dir=None if args.no_cache else str(args.cache_dir), splits=[])
    # Raising on TERM unwinds cache staging and worker contexts; no partial entry
    # is published. Studio still owns/signals the complete subprocess group.
    def terminated(signum, frame):
        raise SystemExit(128 + signum)
    old_handler = signal.signal(signal.SIGTERM, terminated)
    try:
        with FeatureBuilder(policy, args.workers) as builder:
            for source, output, pool in ((args.input_dir, args.output_dir, 'generated'),
                    (args.personal_dir, args.personal_output_dir, 'personal'),
                    (args.negative_dir, args.negative_output_dir, 'reviewed negatives')):
                generate_pool(source, output, pool, cache_root=None if args.no_cache else args.cache_dir,
                    assignments=assignments, seed=args.seed, policy=cache_policy, corpora=corpora,
                    versions=versions, builder=builder, report=report['splits'])
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
          f'{sum(s["hit"] for s in report["splits"])}/{len(report["splits"])} cached splits', flush=True)
    return 0
