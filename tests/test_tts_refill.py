import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from cli import tts_generate_samples as generator
from studio.errors import child_error
from studio.jobs import ProcessRunner


class RefillTests(unittest.TestCase):
    def budget(self, **kwargs):
        from cli.tts_refill import RefillBudget
        return RefillBudget(20000, **kwargs)

    def test_refill_sizes_use_normalized_unique_yield_not_acoustic_accepts(self):
        budget = self.budget()
        budget.observe('omnivoice', attempted=20000, generated=20000, accepted=3680)
        self.assertEqual(budget.request('omnivoice', 1000, 1.5, refill=True), 6522)
        # A high acoustic pass rate is irrelevant if normalization/dedup keeps one clip.
        budget = self.budget()
        budget.observe('omnivoice', attempted=1000, generated=1000, accepted=1)
        self.assertEqual(budget.request('omnivoice', 100, 1.5, refill=True), 12000)

    def test_low_yield_twenty_thousand_corpus_finishes_without_geometric_tail(self):
        budget = self.budget()
        missing, rounds, generated = 20000, 0, 0
        while missing:
            requested = budget.request('omnivoice', missing, 1.5, refill=rounds > 0)
            self.assertGreater(requested, 0)
            accepted = min(missing, int(requested * .184))
            budget.observe('omnivoice', attempted=requested, generated=requested, accepted=accepted)
            generated += requested
            missing -= accepted
            rounds += 1
            self.assertLessEqual(rounds, 8)
        self.assertLess(generated, 125000)

    def test_candidate_deadline_and_repeated_failure_budgets_are_bounded(self):
        now = [10.0]
        budget = self.budget(max_candidates=150, max_seconds=30, clock=lambda: now[0])
        self.assertEqual(budget.request('omnivoice', 20000, 1.5), 150)
        budget.observe('omnivoice', attempted=150, generated=0, accepted=0)
        self.assertEqual(budget.request('omnivoice', 1, 1.5, refill=True), 0)
        self.assertEqual(budget.stop_reason(), 'candidate_budget')
        budget = self.budget(max_seconds=30, clock=lambda: now[0])
        now[0] = 40.0
        self.assertEqual(budget.stop_reason(), 'time_budget')
        self.assertEqual(budget.request('omnivoice', 1, 1.5), 0)
        budget = self.budget()
        for _ in range(3):
            budget.observe('omnivoice', attempted=128, generated=0, accepted=0)
        self.assertFalse(budget.eligible('omnivoice'))
        self.assertTrue(budget.eligible('qwen3'))

    def test_moss_cannot_request_more_candidates_than_unique_references(self):
        budget = self.budget()
        budget.observe('moss', attempted=50, generated=50, accepted=5)
        self.assertEqual(budget.request('moss', 100, 1.25, refill=True, reference_count=7), 7)

    def test_generator_completes_twenty_thousand_at_low_final_yield(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            args = generator.parser().parse_args([f'--data-dir={root}', f'--output-dir={root}/samples',
                '--samples=20000', '--engines=omnivoice', '--', 'Janet'])
            instance = generator.Generator(args)
            requests = []

            def synthesize(engine, count, references, prefix=''):
                requested = instance._candidate_count(engine, count, references)
                requests.append(requested)
                paths = [root / f'{prefix}{i}.wav' for i in range(requested)]
                return [{'id': p.stem} for p in paths], paths

            def normalize(paths, start, limit):
                # Acoustic QA accepts everything; only 18.4% survive final normalization/dedup.
                count = min(limit, int(len(paths) * .184))
                accepted = []
                for index in range(start, start + count):
                    path = instance.final_dir / f'{index}.wav'
                    path.write_bytes(str(index).encode())
                    accepted.append(path)
                return accepted

            with patch.object(instance, 'generate_direct_engine', side_effect=synthesize), \
                 patch.object(instance, 'qualify_direct_candidates', side_effect=lambda engine, entries, paths, prefix='': paths), \
                 patch.object(instance, 'normalize', side_effect=normalize):
                instance.generate()
            self.assertEqual(len(list(instance.output_dir.glob('*.wav'))), 20000)
            self.assertLessEqual(len(requests), 8)
            self.assertLess(sum(requests), 125000)
            saved = json.loads((instance.output_dir / '.generation_manifest.json').read_text())
            self.assertEqual(saved['actual_counts'], {'omnivoice': 20000})
            self.assertEqual(saved['candidate_budget']['attempted'], sum(requests))

    def test_generator_retries_zero_yield_and_exceptions_then_reports_retained_count(self):
        for failure in ['zero', 'exception']:
            with self.subTest(failure=failure), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                args = generator.parser().parse_args([
                    f'--data-dir={root}', f'--output-dir={root}/samples', '--samples=5',
                    '--engines=omnivoice', '--max-candidates=10000', '--', 'Janet'])
                instance = generator.Generator(args)
                calls = []

                def synthesize(engine, count, references, prefix=''):
                    calls.append(engine)
                    if failure == 'exception':
                        raise RuntimeError('private upstream error')
                    return [{'id': 'rejected'}], [root / 'rejected.wav']

                with patch.object(instance, 'generate_direct_engine', side_effect=synthesize), \
                     patch.object(instance, 'qualify_direct_candidates', return_value=[]), \
                     patch.object(instance, 'normalize', return_value=[]), \
                     patch.object(generator, 'studio_progress') as progress, \
                     self.assertRaisesRegex(RuntimeError, r'TTS_INCOMPLETE.*retained=0.*missing=5'):
                    instance.generate()
                self.assertEqual(calls, ['omnivoice'] * 3)
                self.assertFalse(instance.output_dir.exists())
                self.assertEqual(progress.call_args.kwargs['reason'], 'engine_error' if failure == 'exception' else 'no_progress')

    def _fake_generator(self, root, engines, samples, yields, **options):
        argv = [f'--data-dir={root}', f'--output-dir={root}/samples', f'--samples={samples}',
                f'--engines={",".join(engines)}', *options.pop('argv', []), '--', 'Janet']
        instance = generator.Generator(generator.parser().parse_args(argv), **options)
        rounds = []

        def synthesize(engine, count, references, prefix=''):
            requested = instance._candidate_count(engine, count, references)
            rounds.append((engine, prefix, requested))
            directory = instance.raw_dir / f'{engine}_{prefix or "main"}'
            directory.mkdir(parents=True, exist_ok=True)
            paths = [directory / f'{i}.wav' for i in range(requested)]
            return [{'id': p.stem} for p in paths], paths

        def normalize(paths, start, limit):
            engine = paths[0].parent.name.split('_')[0] if paths else None
            count = min(limit, int(len(paths) * yields.get(engine, 0)))
            accepted = []
            for index in range(start, start + count):
                path = instance.final_dir / f'{index}.wav'
                path.write_bytes(f'{engine}-{index}'.encode())
                accepted.append(path)
            return accepted

        patches = [patch.object(instance, 'generate_direct_engine', side_effect=synthesize),
                   patch.object(instance, 'qualify_direct_candidates',
                                side_effect=lambda engine, entries, paths, prefix='': paths),
                   patch.object(instance, 'normalize', side_effect=normalize),
                   patch.object(instance, 'engines', return_value=list(engines))]
        return instance, rounds, patches

    def test_refills_stay_within_selected_providers_and_skip_stalled_ones(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            # OmniVoice never yields; Qwen3 does. Piper is unselected and must never run.
            instance, rounds, patches = self._fake_generator(
                root, ['qwen3', 'omnivoice'], 400, {'qwen3': .3, 'omnivoice': 0})
            with patches[0], patches[1], patches[2], patches[3]:
                instance.generate()
            engines = {engine for engine, _, _ in rounds}
            self.assertEqual(engines, {'qwen3', 'omnivoice'})
            omnivoice_refills = [r for r in rounds if r[0] == 'omnivoice' and r[1].startswith('refill')]
            # One initial round plus at most two refills before three consecutive stalls retire it.
            self.assertLessEqual(len(omnivoice_refills), 2)
            saved = json.loads((instance.output_dir / '.generation_manifest.json').read_text())
            self.assertEqual(saved['actual_counts'], {'qwen3': 400, 'omnivoice': 0})
            self.assertEqual(sum(saved['actual_counts'].values()), len(list(instance.output_dir.glob('*.wav'))))
            self.assertEqual(saved['candidate_budget']['yield']['omnivoice']['accepted'], 0)

    def test_time_budget_admits_no_new_round_but_finishes_the_current_one(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            now = [0.0]
            instance, rounds, patches = self._fake_generator(
                root, ['omnivoice'], 1000, {'omnivoice': .01}, argv=['--max-generation-seconds=60', '--max-candidates=1000000'])
            instance.budget.clock, instance.budget.deadline = (lambda: now[0]), 60.0
            original = patches[0].kwargs['side_effect']

            def slow(*args, **kwargs):
                result = original(*args, **kwargs)
                now[0] += 45  # Each round takes 45s; the deadline expires during round two.
                return result
            patches[0] = patch.object(instance, 'generate_direct_engine', side_effect=slow)
            with patches[0], patches[1], patches[2], patches[3], \
                 patch.object(generator, 'studio_progress') as progress, \
                 self.assertRaisesRegex(RuntimeError, r'TTS_INCOMPLETE.*reason=time_budget'):
                instance.generate()
            self.assertEqual(len(rounds), 2)
            self.assertEqual(progress.call_args.kwargs['reason'], 'time_budget')
            self.assertFalse(instance.output_dir.exists())

    def test_incomplete_child_fails_job_with_actionable_log_through_real_runner(self):
        import sys
        import threading
        from datetime import datetime, timezone
        from studio.db import Store
        from studio.errors import OperationError
        from studio.jobs import ChildGroups, JobContext, JobQueue
        from studio.workspaces import WorkspaceService
        with tempfile.TemporaryDirectory() as directory:
            store = Store.open(Path(directory))
            self.addCleanup(store.close)
            now = datetime(2026, 1, 1, tzinfo=timezone.utc)
            jobs = JobQueue(store, clock=lambda: now, groups=ChildGroups())
            word = WorkspaceService(store).create('Janet', 'en', 'janet')
            job = jobs.enqueue('generation', word.id, {})
            jobs.claim('gpu', now)
            context = JobContext(jobs, job, threading.Event(), None)
            script = '''import json,os
os.write(int(os.environ['STUDIO_PROGRESS_FD']), (json.dumps({'stage':'incomplete','completed':19953,
         'total':20000,'reason':'no_progress'})+'\\n').encode())
raise RuntimeError('TTS_INCOMPLETE retained=19953 missing=47 reason=no_progress /private/path')
'''
            with self.assertRaises(OperationError) as raised:
                ProcessRunner().run(context, [sys.executable, '-c', script])
            self.assertEqual(raised.exception.code, 'generation_incomplete')
            log = jobs.log_tail(job.id)
            self.assertIn('retained 19953/20000; missing 47', log)
            self.assertIn('repeated rounds made no progress', log)
            self.assertNotIn('/private/path', log)
            jobs.finish(job.id, {'error': raised.exception.code}, 'failed')

    def test_round_admits_one_candidate_count_even_if_deadline_passes_mid_round(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            args = generator.parser().parse_args([f'--data-dir={root}', f'--output-dir={root}/samples',
                '--samples=100', '--engines=omnivoice', '--max-generation-seconds=60', '--', 'Janet'])
            instance = generator.Generator(args)
            ticks = iter([0.0, 61.0, 61.0, 61.0, 61.0, 61.0])
            instance.budget.clock, instance.budget.deadline = (lambda: next(ticks)), 60.0
            seen = []

            def inner(engine, count, references, prefix=''):
                seen.append(instance._candidate_count(engine, count, references))
                return [], []
            with patch.object(instance, '_generate_direct_engine', side_effect=inner), \
                 patch.object(generator, 'studio_progress'):
                instance._run_round('omnivoice', 100, [])
            self.assertEqual(seen, [150])
            self.assertEqual(instance.budget.attempted, 150)
            self.assertIsNone(instance._admitted)

    def test_hybrid_moss_refills_skip_used_carriers_and_moss_outputs(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            args = generator.parser().parse_args([f'--data-dir={root}', f'--output-dir={root}/samples',
                '--samples=10', '--engines=qwen3,moss', '--', 'Janet'])
            instance = generator.Generator(args)
            accepted = [(root / f'{i}.wav').resolve() for i in range(4)]
            # Take 3 is a MOSS clone of carrier 0; neither may carry another MOSS take.
            instance.moss_carriers = {accepted[3]: accepted[0]}
            self.assertEqual(instance._generation_references('moss', accepted), accepted[1:3])
            self.assertEqual(instance._generation_references('qwen3', accepted), accepted)

    def test_incomplete_progress_has_safe_actionable_counts_and_allowlisted_error(self):
        context = Mock()
        event = {'stage': 'incomplete', 'completed': 19953, 'total': 20000, 'reason': 'candidate_budget'}
        self.assertTrue(ProcessRunner._progress(context, json.dumps(event).encode()))
        message = context.log.call_args.args[0]
        self.assertIn('19953', message)
        self.assertIn('47', message)
        self.assertIn('candidate budget', message)
        self.assertIn('recover', message.lower())
        self.assertEqual(child_error('TTS_INCOMPLETE retained=19953 missing=47').code, 'generation_incomplete')
        # Specific engine-failure guidance wins when every round failed.
        self.assertEqual(child_error('No space left on device\nTTS_INCOMPLETE retained=0 missing=5 reason=engine_error').code,
                         'disk_full')
        self.assertEqual(child_error('TTS_INCOMPLETE retained=0 missing=5 reason=engine_error').code,
                         'generation_incomplete')
        self.assertIsNone(ProcessRunner._progress(context, json.dumps({**event, 'reason': '/private/secret'}).encode()))


if __name__ == '__main__':
    unittest.main()
