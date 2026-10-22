"""Recovery must preserve evidence and use normal generation admission/QA."""
import hashlib
import json
import tempfile
import unittest
from dataclasses import asdict, replace
from pathlib import Path
from unittest.mock import patch

from cli import tts_generate_samples as generator
from studio.models import Conflict, GenerationRecipe, ValidationError
from studio.runtime import StudioRuntime
from studio.storage import canonical_wav
from studio_harness import GenerationRunner, wav


class RecoveryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.runner = GenerationRunner()
        self.runtime = StudioRuntime(self.root, runner=self.runner)
        self.addCleanup(self.runtime.shutdown)
        self.service = self.runtime.generation
        self.word = self.runtime.workspaces.create('Janet', 'en', 'janet')
        self.recipe = GenerationRecipe('en', 'american', 'hybrid', 3, 8, ['omnivoice'])
        self.source = self.service.enqueue(self.word.id, self.recipe)
        self.runner.mode = 'short'
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(self.source.id).status, 'failed')
        self.build = self.root / 'studio/jobs' / self.source.id / 'generation/.wake_word_samples.build'
        self.final = self.build / 'final'
        self.final.mkdir(parents=True)
        self.originals = {'0.wav': wav(2000, .8), '1.wav': wav(3000, .8)}
        for name, data in self.originals.items():
            (self.final / name).write_bytes(data)
        (self.build / 'omnivoice_main.direct.jsonl').write_text(
            json.dumps({'id': 'omnivoice_0000099'}) + '\n')

    def enqueue(self):
        from studio import generation_recovery
        return generation_recovery.enqueue_recovery(self.service, self.word.id, self.source.id)

    def manifest(self, job):
        return self.root / 'studio/recovery' / job.payload['recovery_snapshot'] / 'manifest.json'

    def args(self, manifest):
        return generator.parser().parse_args([
            f'--data-dir={self.root}', f'--output-dir={self.root}/new/samples',
            '--samples=3', '--batch-size=8', '--language=en', '--english-accent=american',
            '--tts-mode=hybrid', '--engines=omnivoice', f'--recovery-manifest={manifest}', '--', 'Janet'])

    def test_snapshot_is_independent_and_job_publishes_through_normal_admission(self):
        job = self.enqueue()
        manifest = self.manifest(job)
        metadata = json.loads(manifest.read_text())
        self.assertEqual(metadata['source_job_id'], self.source.id)
        self.assertEqual(metadata['next_attempt'], 100)
        self.assertEqual(job.payload['recipe'], asdict(self.recipe))
        self.assertEqual(self.service.get_recipe(self.word.id), self.recipe)
        for row in metadata['files']:
            copied = manifest.parent / 'final' / row['name']
            self.assertEqual(copied.read_bytes(), self.originals[row['name']])
            self.assertNotEqual(copied.stat().st_ino, (self.final / row['name']).stat().st_ino)
            self.assertEqual(row['sha256'], hashlib.sha256(copied.read_bytes()).hexdigest())
        self.runner.mode = 'valid'
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'complete')
        self.assertIn(f'--recovery-manifest={manifest}', self.runner.calls[-1][1])
        self.assertEqual(len(self.service.get_batch(self.word.id, job.id).audio), 3)
        self.assertEqual(self.runtime.jobs.get(self.source.id).status, 'failed')
        self.assertEqual({p.name: p.read_bytes() for p in self.final.iterdir()}, self.originals)

    def test_refuses_wrong_workspace_active_source_and_non_omnivoice_source(self):
        from studio import generation_recovery
        other = self.runtime.workspaces.create('Other', 'en', 'other')
        active = self.service.enqueue(self.word.id, self.recipe)
        for word, source in [(other.id, self.source.id), (self.word.id, active.id)]:
            with self.subTest(word=word, source=source), self.assertRaises((Conflict, ValidationError)):
                generation_recovery.enqueue_recovery(self.service, word, source)
        self.runtime.jobs.cancel(active.id)
        self.source = self.service.enqueue(self.word.id, replace(self.recipe, engines=['qwen3']))
        self.runtime.workers.run_once('gpu')
        with self.assertRaises((Conflict, ValidationError)):
            self.enqueue()

    def test_snapshot_rejects_symlink_and_duplicate_audio_without_enqueuing(self):
        for mode in ['symlink', 'duplicate']:
            with self.subTest(mode=mode):
                path = self.final / '1.wav'
                path.unlink()
                if mode == 'symlink':
                    path.symlink_to(self.final / '0.wav')
                else:
                    path.write_bytes(self.originals['0.wav'])
                with self.assertRaises((ValueError, ValidationError, OSError)):
                    self.enqueue()
                self.assertEqual(self.runtime.jobs.list().total, 1)

    def test_generator_revalidates_retained_audio_and_fills_only_the_shortage(self):
        job = self.enqueue()
        manifest = self.manifest(job)
        instance = generator.Generator(self.args(manifest))
        checked, fresh = [], []

        def qa(command, **kwargs):
            entries = [json.loads(l) for l in Path(command[command.index('--input-jsonl') + 1]).read_text().splitlines()]
            checked.extend(Path(e['path']).read_bytes() for e in entries)
            result = Path(command[command.index('--output-jsonl') + 1])
            # One previously accepted clip now fails QA and must be replaced.
            result.write_text(''.join(json.dumps({'id': e['id'], 'accepted': Path(e['path']).name != '1.wav'}) + '\n' for e in entries))

        def synthesize(engine, count, references, prefix=''):
            fresh.append(count)
            paths = []
            for index in range(count):
                path = instance.raw_dir / f'fresh{index}.wav'
                path.write_bytes(wav(4000 + index, .8))
                paths.append(path)
            return [{'id': p.stem} for p in paths], paths

        def normalize(paths, start, limit):
            output = []
            for index, source in enumerate(paths[:limit], start):
                path = instance.final_dir / f'{index}.wav'
                path.write_bytes(source.read_bytes())
                output.append(path)
            return output

        with patch.object(instance, '_reference_qa_python', return_value=self.root / 'qa-python'), \
             patch.object(generator, 'run', side_effect=qa), \
             patch.object(instance, 'generate_direct_engine', side_effect=synthesize), \
             patch.object(instance, 'normalize', side_effect=normalize):
            instance.generate()
        output = self.root / 'new/samples'
        self.assertEqual(fresh, [2])
        self.assertIn(self.originals['0.wav'], checked)
        self.assertIn(self.originals['1.wav'], checked)
        self.assertEqual((output / '0.wav').read_bytes(), self.originals['0.wav'])
        self.assertNotIn(self.originals['1.wav'], [p.read_bytes() for p in output.glob('*.wav')])
        self.assertEqual(len(list(output.glob('*.wav'))), 3)
        self.assertGreaterEqual(instance.direct_attempt['omnivoice'], 100)
        saved = json.loads((output / '.generation_manifest.json').read_text())
        self.assertEqual(saved['actual_counts'], {'omnivoice': 3})
        self.assertEqual(saved['recovery']['retained'], 1)
        self.assertEqual({p.name: p.read_bytes() for p in self.final.iterdir()}, self.originals)

    def test_generator_rejects_snapshot_changes_during_qa(self):
        job = self.enqueue()
        manifest = self.manifest(job)
        instance = generator.Generator(self.args(manifest))

        def qa(command, **kwargs):
            rows = [json.loads(l) for l in Path(command[command.index('--input-jsonl') + 1]).read_text().splitlines()]
            Path(rows[0]['path']).write_bytes(wav(4000, .8))
            Path(command[command.index('--output-jsonl') + 1]).write_text(
                ''.join(json.dumps({'id': r['id'], 'accepted': True}) + '\n' for r in rows))

        with patch.object(instance, '_reference_qa_python', return_value=self.root / 'qa-python'), \
             patch.object(generator, 'run', side_effect=qa), \
             self.assertRaises(ValidationError):
            instance.generate()
        self.assertFalse(instance.output_dir.exists())
        self.assertEqual({p.name: p.read_bytes() for p in self.final.iterdir()}, self.originals)

    def test_bad_hash_config_or_missing_file_fails_before_touching_build(self):
        job = self.enqueue()
        manifest = self.manifest(job)
        metadata = json.loads(manifest.read_text())
        args = self.args(manifest)
        build = self.root / 'new/.wake_word_samples.build'
        build.mkdir(parents=True)
        sentinel = build / 'do-not-delete'
        sentinel.write_text('preserve')
        for mode in ['hash', 'config', 'missing']:
            changed = json.loads(json.dumps(metadata))
            if mode == 'hash':
                changed['files'][0]['sha256'] = '0' * 64
            elif mode == 'config':
                changed['config']['phrase'] = 'Another phrase'
            else:
                (manifest.parent / 'final' / metadata['files'][0]['name']).unlink()
            manifest.write_text(json.dumps(changed))
            with self.subTest(mode=mode), self.assertRaises((ValueError, ValidationError, FileNotFoundError)):
                generator.Generator(args).generate()
            self.assertEqual(sentinel.read_text(), 'preserve')
        self.assertEqual({p.name: p.read_bytes() for p in self.final.iterdir()}, self.originals)

    def test_recovery_batches_have_a_floor_but_normal_generation_does_not(self):
        job = self.enqueue()
        instance = generator.Generator(self.args(self.manifest(job)))
        self.assertGreaterEqual(instance._candidate_count('omnivoice', 1, []), 128)
        instance.args.recovery_manifest = None
        self.assertEqual(instance._candidate_count('omnivoice', 1, []), 2)

    def test_snapshot_identity_and_full_recipe_are_bound_to_the_queued_job(self):
        for field in ['word_id', 'source_job_id', 'recipe']:
            with self.subTest(field=field):
                job = self.enqueue()
                manifest = self.manifest(job)
                metadata = json.loads(manifest.read_text())
                if field == 'recipe':
                    metadata['recipe']['batch_size'] = 123
                else:
                    metadata[field] = 'f' * 32
                manifest.write_text(json.dumps(metadata))
                self.runner.mode = 'valid'
                self.runtime.workers.run_once('gpu')
                self.assertEqual(self.runtime.jobs.get(job.id).status, 'failed')
                with self.service.store.transaction() as db:
                    self.assertEqual(db.execute('SELECT count(*) FROM generation_batch_audio WHERE batch_id=?', (job.id,)).fetchone()[0], 0)
                self.assertTrue(manifest.exists())

    def test_explicit_recovery_does_not_skip_snapshot_checks_on_cache_hit(self):
        job = self.enqueue()
        instance = generator.Generator(self.args(self.manifest(job)))
        metadata = json.loads(self.manifest(job).read_text())
        metadata['files'][0]['sha256'] = '0' * 64
        self.manifest(job).write_text(json.dumps(metadata))
        with patch.object(instance, 'cache_hit', return_value=True), self.assertRaises(ValidationError):
            instance.generate()

    def test_fresh_audio_is_deduplicated_against_retained_and_other_fresh_pcm(self):
        job = self.enqueue()
        instance = generator.Generator(self.args(self.manifest(job)))
        instance.raw_dir.mkdir(parents=True)
        instance.accepted_hashes.add(hashlib.sha256(canonical_wav(self.originals['0.wav'])).hexdigest())
        # Equal PCM with unequal container bytes must still count as one clip.
        data = [self.originals['0.wav'] + b'JUNK\x00\x00\x00\x00', wav(4000, .8),
                wav(4000, .8) + b'JUNK\x00\x00\x00\x00']
        paths = []
        for index, audio in enumerate(data):
            path = instance.raw_dir / f'{index}.wav'
            path.write_bytes(audio)
            paths.append(path)

        def ffmpeg(command, **kwargs):
            Path(command[-1]).write_bytes(Path(command[command.index('-i') + 1]).read_bytes())
            return 0

        with patch.object(generator, 'run_normalization_ffmpeg', side_effect=ffmpeg):
            accepted = instance.normalize(paths, 1, 3)
        self.assertEqual([p.name for p in accepted], ['1.wav'])
        self.assertEqual(accepted[0].read_bytes(), wav(4000, .8))
        self.assertEqual(len(instance.accepted_hashes), 2)

    def test_failure_and_cancellation_admit_no_partial_batch_and_preserve_evidence(self):
        for mode in ['short', 'cancel']:
            with self.subTest(mode=mode):
                job = self.enqueue()
                manifest = self.manifest(job)
                before = {p.name: p.read_bytes() for p in (manifest.parent / 'final').iterdir()}
                self.runner.mode = 'short' if mode == 'short' else 'valid'
                if mode == 'cancel':
                    self.runner.hook = lambda context: self.runtime.jobs.cancel(context.job.id)
                self.runtime.workers.run_once('gpu')
                self.assertEqual(self.runtime.jobs.get(job.id).status, 'failed' if mode == 'short' else 'cancelled')
                with self.service.store.transaction() as db:
                    self.assertIsNone(db.execute('SELECT committed_at FROM generation_batches WHERE id=?', (job.id,)).fetchone()[0])
                    self.assertEqual(db.execute('SELECT count(*) FROM generation_batch_audio WHERE batch_id=?', (job.id,)).fetchone()[0], 0)
                self.assertEqual({p.name: p.read_bytes() for p in (manifest.parent / 'final').iterdir()}, before)
                self.assertEqual({p.name: p.read_bytes() for p in self.final.iterdir()}, self.originals)


if __name__ == '__main__':
    unittest.main()
