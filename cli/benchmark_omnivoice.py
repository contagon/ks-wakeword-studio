#!/usr/bin/env python3
"""Controlled, queue-owned OmniVoice duration experiments; never publishes a corpus."""
import argparse
import hashlib
import importlib.metadata
import json
import math
import os
import random
import sqlite3
import sys
import time
import wave
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def build_conditions(durations, batch_sizes, takes, seed):
    if (not durations or not batch_sizes or takes < 1 or any(not math.isfinite(d) or d <= 0 for d in durations)
            or any(b not in (1, 8) for b in batch_sizes)):
        raise ValueError('Use positive finite durations/takes and batch sizes 1 or 8')
    return [{'id': f'd{duration:.3f}_b{batch_size}', 'duration': duration, 'batch_size': batch_size,
             'batches': [{'start': start, 'count': min(batch_size, takes - start), 'seed': seed + start}
                         for start in range(0, takes, batch_size)]}
            for batch_size in batch_sizes for duration in durations]


def summarize_condition(directory, results):
    hashes, pcm_hashes, rows = set(), set(), []
    accepted = [row for row in results if row.get('accepted')]
    for result in accepted:
        path = directory / f"{result['id']}.wav"
        data = path.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        with wave.open(str(path), 'rb') as audio:
            params = [audio.getnchannels(), audio.getsampwidth(), audio.getframerate()]
            pcm = audio.readframes(audio.getnframes())
            pcm_digest = hashlib.sha256(json.dumps(params).encode() + pcm).hexdigest()
            duration = audio.getnframes() / audio.getframerate()
        hashes.add(digest)
        pcm_hashes.add(pcm_digest)
        rows.append({'id': result['id'], 'wav_sha256': digest, 'pcm_sha256': pcm_digest, 'actual_duration': duration})
    return {'accepted': len(accepted), 'unique_wav_bytes': len(hashes), 'unique_pcm': len(pcm_hashes),
            'rejections': dict(Counter(r.get('reason', 'unknown') for r in results if not r.get('accepted'))),
            'accepted_audio': rows}


def run_when_available(pool, queue, job_id, wait_seconds, *, clock=time.monotonic, sleep=time.sleep):
    """Retry only pre-claim contention; never retry an already-owned handler."""
    from studio.models import Conflict
    deadline = clock() + wait_seconds
    while True:
        try:
            if pool.run_once('gpu', job_id=job_id):
                return
            if queue.get(job_id).status != 'queued':
                raise Conflict('Queued benchmark was cancelled before execution')
        except sqlite3.OperationalError as exc:
            if (getattr(exc, 'sqlite_errorcode', 0) & 255) not in (sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED) or queue.owns(job_id):
                raise
        if clock() >= deadline:
            raise Conflict('GPU/database remained busy; experiment did not execute')
        sleep(2)


def retry_sql(action, *, deadline, clock=time.monotonic, sleep=time.sleep):
    while True:
        try:
            return action()
        except sqlite3.OperationalError as exc:
            if (getattr(exc, 'sqlite_errorcode', 0) & 255) not in (sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED) or clock() >= deadline:
                raise
        sleep(2)


def generate(args):
    os.environ['HF_HOME'] = str(args.data_dir / '.cache/huggingface')
    os.environ['HUGGINGFACE_HUB_CACHE'] = str(args.data_dir / '.cache/huggingface/hub')
    import numpy as np
    import soundfile as sf
    import torch
    from omnivoice import OmniVoice
    from cli.tts_generate_samples import GENERATOR_VERSION, OMNIVOICE_MODEL, duration_bounds, reference_text, write_jsonl

    started = time.monotonic()
    model = OmniVoice.from_pretrained(OMNIVOICE_MODEL, device_map='cuda:0', dtype=torch.float16)
    load_seconds = time.monotonic() - started
    settings = {'num_step': 32, 'position_temperature': 0.0, 'class_temperature': 1.0,
                'denoise': True, 'postprocess_output': True}
    package = importlib.metadata.distribution('omnivoice')
    from huggingface_hub import try_to_load_from_cache
    cached_config = try_to_load_from_cache(OMNIVOICE_MODEL, 'config.json')
    metadata = {'phrase': args.phrase, 'takes': args.takes, 'seed': args.seed, 'settings': settings,
                'generator_version': GENERATOR_VERSION,
                'benchmark_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                'model': OMNIVOICE_MODEL, 'model_revision': getattr(model.config, '_commit_hash', None) or (
                    Path(cached_config).parent.name if isinstance(cached_config, str) else None),
                'package_source': json.loads(package.read_text('direct_url.json') or '{}'),
                'torch': torch.__version__, 'gpu': torch.cuda.get_device_name(0), 'load_seconds': load_seconds,
                'lm_dtype': str(next(model.parameters()).dtype),
                'codec_dtype': str(next(model.audio_tokenizer.parameters()).dtype),
                'frame_rate': model.audio_tokenizer.config.frame_rate, 'conditions': []}
    minimum, _, maximum = duration_bounds(args.phrase, 'en')
    conditions = build_conditions(args.durations, args.batch_sizes, args.takes, args.seed)
    # Fixed randomized condition order avoids always charging warmup to one duration.
    random.Random(args.seed).shuffle(conditions)
    for condition in conditions:
        directory = args.output_dir / condition['id']
        directory.mkdir()
        entries, failures = [], []
        elapsed = 0.0
        for batch in condition['batches']:
            random.seed(batch['seed'])
            np.random.seed(batch['seed'])
            torch.manual_seed(batch['seed'])
            torch.cuda.manual_seed_all(batch['seed'])
            torch.cuda.synchronize()
            started = time.monotonic()
            try:
                with torch.inference_mode():
                    audios = model.generate(text=[reference_text(args.phrase)] * batch['count'],
                        language=['en'] * batch['count'], duration=[condition['duration']] * batch['count'], **settings)
                torch.cuda.synchronize()
                if len(audios) != batch['count']:
                    raise ValueError('Incomplete upstream batch')
                for offset, audio in enumerate(audios):
                    name = f"{batch['start'] + offset:07d}"
                    sf.write(directory / f'{name}.wav', audio, model.sampling_rate, subtype='PCM_16')
                    entries.append({'id': name, 'path': str(directory / f'{name}.wav'),
                                    'minimum_duration': minimum, 'maximum_duration': maximum})
            except Exception as exc:
                failures.append({'batch': batch, 'error': repr(exc)})
            finally:
                elapsed += time.monotonic() - started  # Includes failed attempts and WAV writes.
        write_jsonl(directory / 'qa.input.jsonl', entries)
        condition.update(generation_seconds=elapsed, generated=len(entries), failures=failures,
                         target_tokens=int(condition['duration'] * model.audio_tokenizer.config.frame_rate))
        metadata['conditions'].append(condition)
        (args.output_dir / 'generation.json').write_text(json.dumps(metadata, indent=2))
        print(json.dumps({k: v for k, v in condition.items() if k != 'batches'}), flush=True)


def analyze(args):
    from cli.tts_generate_samples import Generator, parser, run
    from studio.storage import canonical_wav
    metadata = json.loads((args.output_dir / 'generation.json').read_text())
    for condition in metadata['conditions']:
        directory = args.output_dir / condition['id']
        started = time.monotonic()
        run([str(args.data_dir / '.recorder-venv/bin/python'), str(ROOT / 'cli/tts_reference_qa.py'),
             '--input-jsonl', str(directory / 'qa.input.jsonl'),
             '--output-jsonl', str(directory / 'qa.results.jsonl'), '--profile', 'omnivoice'])
        condition['qa_seconds'] = time.monotonic() - started
        results = [json.loads(l) for l in (directory / 'qa.results.jsonl').read_text().splitlines()]
        condition.update(summarize_condition(directory, results))
        gen_args = parser().parse_args([f'--data-dir={args.data_dir}', f'--output-dir={directory}/normalized',
                                       f'--samples={max(1, condition["accepted"])}', '--engines=omnivoice', '--', metadata['phrase']])
        instance = Generator(gen_args)
        instance.final_dir = directory / 'normalized'
        accepted = [directory / f"{r['id']}.wav" for r in results if r.get('accepted')]
        started = time.monotonic()
        normalized = instance.normalize(accepted, 0, len(accepted))
        condition['normalization_seconds'] = time.monotonic() - started
        condition['unique_normalized'] = len({hashlib.sha256(canonical_wav(p.read_bytes())).hexdigest() for p in normalized})
        (args.output_dir / 'results.json').write_text(json.dumps(metadata, indent=2))
        print(f"Bench {condition['id']}: {condition['accepted']}/{metadata['takes']} acoustic accepts; "
              f"{condition['unique_normalized']} unique normalized", flush=True)


def run_experiment(args):
    from uuid import uuid4
    from studio.jobs import WorkerPool
    from studio.models import Conflict
    from studio.runtime import StudioRuntime

    runtime = StudioRuntime(args.data_dir)
    pool, job = None, None
    deadline = time.monotonic() + args.wait_for_gpu_seconds
    dedupe = 'benchmark:' + uuid4().hex
    try:
        args.output_dir = args.output_dir.absolute()
        if args.analyze_only:
            metadata = json.loads((args.output_dir / 'generation.json').read_text())
            if metadata['phrase'] != args.phrase or metadata['takes'] != args.takes or metadata['seed'] != args.seed:
                raise ValueError('Analysis arguments must match the preserved generation metadata')
        else:
            args.output_dir.mkdir(parents=True, exist_ok=False)
        retry_sql(runtime.startup, deadline=deadline)
        pool = WorkerPool(runtime.jobs)

        def handle(job, context):
            command = [str(args.data_dir / 'tts-envs/omnivoice/bin/python'), str(Path(__file__).resolve()),
                       '--worker', f'--data-dir={args.data_dir}', f'--output-dir={args.output_dir}',
                       f'--phrase={args.phrase}', f'--takes={args.takes}', f'--seed={args.seed}',
                       '--durations', *map(str, args.durations), '--batch-sizes', *map(str, args.batch_sizes),
                       *(['--analyze-only'] if args.analyze_only else [])]
            context.run(command)
            metadata = json.loads((args.output_dir / 'results.json').read_text())
            return {'conditions': len(metadata['conditions'])}

        pool.register('benchmark', 'gpu', handle)
        # The normal resource claim arbitrates races; an optional waiter never preempts work.
        def admit():
            with runtime.jobs.store.transaction() as db:
                if not args.wait_for_gpu_seconds and db.execute("SELECT 1 FROM studio_jobs WHERE resource='gpu' AND status IN ('queued','running','cancelling')").fetchone():
                    raise Conflict('GPU queue is busy; retry the experiment when idle')
                return runtime.jobs.enqueue_in(db, 'benchmark', args.word_id,
                    {'experiment': 'omnivoice_duration', 'phrase': args.phrase, 'takes': args.takes, 'seed': args.seed},
                    dedupe, None, runtime.clock())
        job = retry_sql(admit, deadline=deadline)
        print(json.dumps({'benchmark_job_id': job.id, 'output_dir': str(args.output_dir)}), flush=True)
        run_when_available(pool, runtime.jobs, job.id, max(0, deadline - time.monotonic()))
        final = runtime.jobs.get(job.id)
        if final.status != 'complete':
            raise RuntimeError(f'Benchmark job {job.id} ended {final.status}: {final.result}')
        print(json.dumps({'job_id': job.id, 'status': final.status, 'results': str(args.output_dir / 'results.json')}))
    finally:
        if pool is not None:
            pool.stop()
        if job is not None:
            try:
                if runtime.jobs.get(job.id).status == 'queued':
                    runtime.jobs.cancel(job.id)
            except sqlite3.OperationalError:
                print(f'Could not check/cancel queued benchmark {job.id} during SQL outage; inspect it locally.', file=sys.stderr)
        runtime.shutdown()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path, default=Path('/data'))
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--word-id')
    parser.add_argument('--phrase', default='Janet')
    parser.add_argument('--durations', nargs='+', type=float, default=[.845, .937, 1.030, 1.123, 1.215])
    parser.add_argument('--batch-sizes', nargs='+', type=int, default=[1, 8])
    parser.add_argument('--takes', type=int, default=80)
    parser.add_argument('--seed', type=int, default=20261022)
    parser.add_argument('--wait-for-gpu-seconds', type=float, default=0,
                        help='Wait behind active GPU work without interrupting it (default: refuse a busy queue)')
    parser.add_argument('--worker', action='store_true', help=argparse.SUPPRESS)
    parser.add_argument('--analyze-only', action='store_true', help='Reanalyze preserved generation.json/WAVs without new inference')
    args = parser.parse_args()
    if not math.isfinite(args.wait_for_gpu_seconds) or args.wait_for_gpu_seconds < 0:
        parser.error('--wait-for-gpu-seconds must be nonnegative and finite')
    build_conditions(args.durations, args.batch_sizes, args.takes, args.seed)
    if args.worker:
        if not os.environ.get('STUDIO_JOB_TOKEN'):
            parser.error('Worker requires an owned Studio job')
        if not args.analyze_only:
            generate(args)
        analyze(args)
    else:
        if not args.word_id:
            parser.error('--word-id is required')
        run_experiment(args)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
