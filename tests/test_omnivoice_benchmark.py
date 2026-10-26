import json
import sqlite3
import sys
import os
import shutil
import textwrap
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from studio.runtime import StudioRuntime
from studio.jobs import WorkerPool
from studio.models import ValidationError
from studio_harness import wav


class BenchmarkTests(unittest.TestCase):
    def test_startup_and_atomic_enqueue_contention_retry_without_duplicate_jobs(self):
        from cli.benchmark_omnivoice import retry_sql
        with tempfile.TemporaryDirectory() as directory:
            runtime = StudioRuntime(Path(directory))
            try:
                word = runtime.workspaces.create('Janet', 'en', 'janet')
                attempts = []
                busy = sqlite3.OperationalError('database is locked')
                busy.sqlite_errorcode = sqlite3.SQLITE_BUSY

                def admit():
                    with runtime.jobs.store.transaction() as db:
                        job = runtime.jobs.enqueue_in(db, 'benchmark', word.id, {}, 'bench-fixture', None, runtime.clock())
                        attempts.append(job.id)
                        if len(attempts) == 1:
                            raise busy  # The first insert must roll back before retry.
                        return job

                job = retry_sql(admit, deadline=30, clock=lambda: 0, sleep=lambda _: None)
                self.assertEqual(runtime.jobs.list().total, 1)
                self.assertEqual(runtime.jobs.get(job.id).status, 'queued')
                self.assertEqual(len(attempts), 2)
            finally:
                runtime.shutdown()

    @unittest.skipUnless(shutil.which('ffmpeg'), 'ffmpeg not installed')
    def test_analysis_qa_and_normalization_share_one_real_owned_child_session(self):
        from cli.benchmark_omnivoice import analyze
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            experiment = root / 'experiment'
            condition = experiment / 'd1.030_b8'
            condition.mkdir(parents=True)
            rows = []
            for index in range(2):
                path = condition / f'{index}.wav'
                path.write_bytes(wav(2000 + index, .8))
                rows.append({'id': str(index), 'path': str(path), 'minimum_duration': .3, 'maximum_duration': 2})
            (condition / 'qa.input.jsonl').write_text(''.join(json.dumps(r) + '\n' for r in rows))
            (experiment / 'generation.json').write_text(json.dumps({'takes': 2, 'phrase': 'Janet', 'conditions': [{'id': 'd1.030_b8'}]}))
            python = root / '.recorder-venv/bin/python'
            python.parent.mkdir(parents=True)
            python.symlink_to(sys.executable)
            scripts = root / 'fixture/cli'
            scripts.mkdir(parents=True)
            record = root / 'children.jsonl'
            audit = "with open(os.environ['AUDIT_FILE'], 'a') as f: f.write(json.dumps({'sid':os.getsid(0),'token':os.environ.get('STUDIO_JOB_TOKEN')})+'\\n')"
            (scripts / 'tts_reference_qa.py').write_text(
                "import os,json,sys,pathlib\n" + audit + "\n"
                "a=sys.argv; rows=[json.loads(l) for l in pathlib.Path(a[a.index('--input-jsonl')+1]).read_text().splitlines()]\n"
                "pathlib.Path(a[a.index('--output-jsonl')+1]).write_text(''.join(json.dumps({'id':r['id'],'accepted':True})+'\\n' for r in rows))\n")
            fakebin = root / 'bin'
            fakebin.mkdir()
            wrapper = fakebin / 'ffmpeg'
            real_ffmpeg = shutil.which('ffmpeg')
            wrapper.write_text(f'#!{sys.executable}\nimport os,json,sys\n' + audit + f"\nos.execv({real_ffmpeg!r}, [{real_ffmpeg!r}, *sys.argv[1:]])\n")
            wrapper.chmod(0o755)
            runtime = StudioRuntime(root)
            try:
                word = runtime.workspaces.create('Janet', 'en', 'janet')
                job = runtime.jobs.enqueue('benchmark', word.id, {})
                pool = WorkerPool(runtime.jobs)
                code = textwrap.dedent(f'''
                    import os,argparse,pathlib
                    import cli.benchmark_omnivoice as b
                    b.ROOT=pathlib.Path({str(root / 'fixture')!r})
                    os.environ['AUDIT_FILE']={str(record)!r}
                    os.environ['PATH']={str(fakebin)!r}+os.pathsep+os.environ['PATH']
                    b.analyze(argparse.Namespace(data_dir=pathlib.Path({str(root)!r}), output_dir=pathlib.Path({str(experiment)!r})))
                ''')
                pool.register('benchmark', 'gpu', lambda job, context: context.run([sys.executable, '-c', code]) and {})
                pool.run_once('gpu', job_id=job.id)
                self.assertEqual(runtime.jobs.get(job.id).status, 'complete')
                audited = [json.loads(l) for l in record.read_text().splitlines()]
                self.assertEqual(len(audited), 3)  # One QA process and two real FFmpeg invocations.
                self.assertEqual(len({r['sid'] for r in audited}), 1)
                self.assertEqual(len({r['token'] for r in audited}), 1)
                self.assertEqual(len(audited[0]['token']), 32)
                self.assertEqual(json.loads((experiment / 'results.json').read_text())['conditions'][0]['unique_normalized'], 2)
            finally:
                runtime.shutdown()

    def test_waiter_retries_database_contention_before_claim_without_interrupting_jobs(self):
        from cli.benchmark_omnivoice import run_when_available
        with tempfile.TemporaryDirectory() as directory:
            runtime = StudioRuntime(Path(directory))
            try:
                word = runtime.workspaces.create('Janet', 'en', 'janet')
                job = runtime.jobs.enqueue('benchmark', word.id, {})
                pool = WorkerPool(runtime.jobs)
                pool.register('benchmark', 'gpu', lambda job, context: {'conditions': 1})
                recover = runtime.jobs.recover
                busy = sqlite3.OperationalError('database is locked')
                busy.sqlite_errorcode = sqlite3.SQLITE_BUSY
                calls = [busy]

                def contended():
                    if calls:
                        raise calls.pop()
                    return recover()

                sleeps = []
                with patch.object(runtime.jobs, 'recover', side_effect=contended):
                    run_when_available(pool, runtime.jobs, job.id, 30, clock=lambda: 0, sleep=sleeps.append)
                self.assertEqual(runtime.jobs.get(job.id).status, 'complete')
                self.assertEqual(sleeps, [2])
            finally:
                runtime.shutdown()

    def test_conditions_use_matching_batch_seeds_across_durations(self):
        from cli.benchmark_omnivoice import build_conditions
        conditions = build_conditions([.845, .937, 1.03, 1.123, 1.215], [1, 8], 16, 123)
        self.assertEqual(len(conditions), 10)
        for condition in conditions:
            self.assertEqual(sum(b['count'] for b in condition['batches']), 16)
            self.assertEqual([b['seed'] for b in condition['batches']],
                             list(range(123, 139, condition['batch_size'])))
        with self.assertRaises(ValueError):
            build_conditions([float('nan')], [8], 16, 123)

    def test_summary_counts_rejections_and_pcm_duplicates_not_just_file_bytes(self):
        from cli.benchmark_omnivoice import summarize_condition
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for index, data in enumerate([wav(2000, .8), wav(2000, .8) + b'JUNK\0\0\0\0', wav(3000, .8)]):
                (root / f'{index}.wav').write_bytes(data)
            results = [{'id': '0', 'accepted': True}, {'id': '1', 'accepted': True},
                       {'id': '2', 'accepted': False, 'reason': 'dc_offset'}]
            summary = summarize_condition(root, results)
            self.assertEqual(summary['accepted'], 2)
            self.assertEqual(summary['unique_wav_bytes'], 2)
            self.assertEqual(summary['unique_pcm'], 1)
            self.assertEqual(summary['rejections'], {'dc_offset': 1})

    def test_benchmark_claims_gpu_without_becoming_generation_or_training(self):
        with tempfile.TemporaryDirectory() as directory:
            runtime = StudioRuntime(Path(directory))
            try:
                word = runtime.workspaces.create('Janet', 'en', 'janet')
                job = runtime.jobs.enqueue('benchmark', word.id, {'experiment': 'omnivoice_duration'})
                other = runtime.jobs.enqueue('benchmark', word.id, {'experiment': 'other_runner'})
                self.assertFalse(runtime.workers.run_once('gpu'))  # Web worker cannot execute an unknown handler.
                pool = WorkerPool(runtime.jobs)

                def handler(job, context):
                    self.assertTrue(runtime.jobs.owns(job.id))
                    self.assertEqual(runtime.jobs.get(job.id).status, 'running')
                    return {'conditions': 10}

                pool.register('benchmark', 'gpu', handler)
                with self.assertRaises(ValidationError):
                    pool.run_once('gpu', job_id='')
                training = runtime.jobs.enqueue('train', word.id, {})
                claimed = runtime.jobs.claim('gpu', runtime.clock(), kinds=['train'])
                self.assertEqual(claimed.id, training.id)
                self.assertFalse(pool.run_once('gpu'))
                self.assertEqual(runtime.jobs.get(job.id).status, 'queued')
                runtime.jobs.finish(training.id, {})
                self.assertTrue(pool.run_once('gpu', job_id=other.id))
                self.assertEqual(runtime.jobs.get(other.id).status, 'complete')
                self.assertEqual(runtime.jobs.get(job.id).status, 'queued')
                self.assertTrue(pool.run_once('gpu', job_id=job.id))
                self.assertEqual(runtime.jobs.get(job.id).status, 'complete')
                self.assertEqual(runtime.generation.list(word.id).total, 0)
            finally:
                runtime.shutdown()
