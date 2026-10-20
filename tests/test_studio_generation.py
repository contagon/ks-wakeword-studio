import io
import importlib.util
import json
import subprocess
import sqlite3
import tempfile
import unittest
import wave
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict, replace
from pathlib import Path
from unittest.mock import Mock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from studio.generation import GenerationService
from studio.api import create_router
from studio.models import Conflict, GenerationRecipe, NotFound, ValidationError, WakewordUpdate
from studio.runtime import StudioRuntime


def wav(value=1):
    stream = io.BytesIO()
    with wave.open(stream, 'wb') as output:
        output.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
        output.writeframes(value.to_bytes(2, 'little') * 1600)
    return stream.getvalue()


class FixtureRunner:
    def __init__(self):
        self.calls = []
        self.mode = 'valid'
        self.hook = None

    def run(self, context, argv, *, cwd=None):
        self.calls.append((context.job.id, argv, cwd))
        if self.hook:
            self.hook(context)
        options = dict(part.split('=', 1) for part in argv if part.startswith('--') and '=' in part)
        output = Path(options['--output-dir'])
        output.mkdir(parents=True)
        count = int(options['--samples'])
        if self.mode == 'short':
            count -= 1
        if self.mode == 'extra':
            count += 1
        for index in range(count):
            (output / f'{index}.wav').write_bytes(b'broken' if self.mode == 'invalid' else wav(index + 1))
        if self.mode == 'symlink':
            (output / '0.wav').unlink()
            (output / '0.wav').symlink_to(output / '1.wav')
        return 0


class GenerationTests(unittest.TestCase):
    def test_workspace_deletion_collects_audio_retained_only_by_deleted_batch_history(self):
        from uuid import uuid4
        job, batch = self.generate()
        with self.service.store.transaction() as db:
            db.execute('INSERT INTO training_runs VALUES (?,?,?)',
                       (uuid4().hex, self.word.id, json.dumps({'audio': [{'audio_id': a.audio_id} for a in batch.audio]})))
        self.service.delete_batch(self.word.id, batch.id)
        self.runtime.workspaces.delete(self.word.id)
        with self.service.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 0)
        for audio in batch.audio:
            self.assertFalse((self.runtime.blobs.root / audio.normalized_hash).exists())

    def test_delete_batch_removes_selection_but_preserves_snapshot_audio(self):
        job, batch = self.generate()
        self.service.select_batches(self.word.id, [batch.id])
        retained = batch.audio[0]
        manifest = {'audio': [{'audio_id': retained.audio_id}]}
        with self.service.store.transaction() as db:
            db.execute('INSERT INTO training_runs VALUES (?,?,?)', ('history', self.word.id, json.dumps(manifest)))
        self.service.delete_batch(self.word.id, batch.id)
        self.assertEqual(self.service.list(self.word.id).total, 0)
        self.assertEqual(self.service.selection(self.word.id), [])
        self.assertEqual(self.runtime.training.counts(self.word.id)['artificial'], 0)
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'complete')
        self.assertEqual(self.runtime.blobs.read(retained.normalized_hash), wav())
        self.assertFalse((self.service.store.root / 'jobs' / job.id / 'generation').exists())
        with self.service.store.transaction() as db:
            self.assertEqual(db.execute('SELECT manifest FROM training_runs WHERE id=?', ('history',)).fetchone()[0], json.dumps(manifest))
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 1)
            self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(), [])

    def test_delete_batch_checks_workspace_and_active_jobs(self):
        job, batch = self.generate()
        app = FastAPI(); app.include_router(create_router(self.runtime))
        with TestClient(app) as client:
            path = f'/api/studio/wakewords/{self.word.id}/generation/batches/{batch.id}'
            self.assertEqual(client.delete(path.replace(self.word.id, self.other.id)).status_code, 404)
            pending = self.runtime.jobs.enqueue('train', self.word.id, {})
            self.assertEqual(client.delete(path).status_code, 409)
            self.runtime.jobs.cancel(pending.id)
            self.assertEqual(client.delete(path).status_code, 204)
            self.assertEqual(client.delete(path).status_code, 404)

    def test_delete_batch_cleanup_recovers_after_crash_and_preserves_shared_blobs(self):
        imported = self.runtime.samples.import_audio(self.other.id, 'positive', io.BytesIO(wav()))
        job, batch = self.generate()
        with patch('studio.batch_deletion._finish_cleanup', side_effect=OSError('fixture crash')):
            with self.assertRaises(OSError):
                self.service.delete_batch(self.word.id, batch.id)
        self.runtime.shutdown()
        self.assertEqual(self.runtime.generation.list(self.word.id).total, 0)
        self.assertEqual(self.runtime.blobs.read(imported.normalized_hash), wav())
        self.assertFalse((self.runtime.generation.store.root / 'jobs' / job.id / 'generation').exists())

    def test_generation_reports_incremental_progress(self):
        job, batch = self.generate()
        log = self.runtime.jobs.log_tail(job.id)
        self.assertIn('2 samples', log)
        self.assertIn('Validating', log)
        self.assertIn('2/2', log)
        self.assertIn('complete', log)

    def test_defaults_and_visible_missing_piper(self):
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        with TestClient(app) as api:
            defaults = api.get('/api/studio/generation/defaults')
            self.assertEqual(defaults.status_code, 200)
            self.assertEqual(defaults.json(), {'samples': 50000, 'batch_size': 100})
        english = next(c for c in self.service.catalog() if c['language'] == 'en')
        piper = next(m for m in english['model_availability'] if m['engine'] == 'piper')
        self.assertTrue(piper['supported'])
        self.assertFalse(piper['available'])
        self.assertIn('Install', piper['reason'])

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.runner = FixtureRunner()
        self.runtime = StudioRuntime(self.root, runner=self.runner)
        self.word = self.runtime.workspaces.create('Hello robot', 'en', 'hello_robot')
        self.other = self.runtime.workspaces.create('Other robot', 'en', 'other_robot')
        self.service = self.runtime.generation
        self.recipe = GenerationRecipe('en', 'british', 'modern', 2, 1)
        self.service.save_recipe(self.word.id, self.recipe)

    def tearDown(self):
        self.runtime.shutdown()
        self.temp.cleanup()

    def generate(self, word=None):
        job = self.service.enqueue(word or self.word.id)
        self.assertTrue(self.runtime.workers.run_once('gpu'))
        return self.runtime.jobs.get(job.id), self.service.get_batch(word or self.word.id, job.id)

    def test_catalog_routes_supported_languages_and_installed_piper_only(self):
        catalog = {item['language']: item for item in self.service.catalog()}
        self.assertEqual(catalog['en']['engines']['modern'], ['omnivoice', 'qwen3', 'moss'])
        self.assertEqual(catalog['fi']['engines']['hybrid'], ['omnivoice'])
        self.assertEqual(catalog['en']['engines']['piper'], [])
        model = self.root / 'tools/piper-sample-generator/models/en_US-libritts_r-medium.pt'
        model.parent.mkdir(parents=True)
        model.write_bytes(b'fixture')
        self.service.save_recipe(self.word.id, replace(self.recipe, tts_mode='piper'))
        catalog = {item['language']: item for item in self.service.catalog()}
        self.assertEqual(catalog['en']['engines']['hybrid'], ['omnivoice', 'qwen3', 'moss', 'piper'])
        self.assertFalse(catalog['fi']['accent_applies'])

    def test_explicit_engines_are_snapshotted_and_passed_to_generator(self):
        recipe = replace(self.recipe, engines=['qwen3', 'moss'])
        self.service.save_recipe(self.word.id, recipe)
        job, batch = self.generate()
        self.assertEqual(job.status, 'complete')
        self.assertEqual(batch.recipe.engines, ['qwen3', 'moss'])
        self.assertIn('--engines=qwen3,moss', self.runner.calls[-1][1])

    def test_generation_admits_submitted_recipe_atomically_instead_of_rereading_another_tabs_settings(self):
        from studio.api import create_router
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        submitted = replace(self.recipe, samples=3, engines=['qwen3'])
        with TestClient(app) as client:
            response = client.post(f'/api/studio/wakewords/{self.word.id}/generation/jobs', json=asdict(submitted))
        self.assertEqual(response.status_code, 201, response.text)
        job = response.json()
        self.assertEqual(job['payload']['recipe'], asdict(submitted))
        self.assertEqual(self.service.get_recipe(self.word.id), submitted)
        self.service.save_recipe(self.word.id, replace(self.recipe, engines=['moss']))
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.service.get_batch(self.word.id, job['id']).recipe, submitted)

    def test_explicit_engine_selection_rejects_empty_unknown_duplicate_or_unsupported(self):
        for engines in ([], ['unknown'], ['qwen3', 'qwen3'], ['piper']):
            with self.subTest(engines=engines), self.assertRaises(ValidationError):
                self.service.save_recipe(self.word.id, replace(self.recipe, engines=engines))
        with self.assertRaises(ValidationError):
            self.service.save_recipe(self.word.id, replace(self.recipe, language='fi', english_accent='mixed', engines=['qwen3']))

    def test_preview_is_one_engine_one_sample_without_recipe_or_batch_side_effects(self):
        job = self.service.enqueue_preview(self.word.id, replace(self.recipe, engines=['qwen3']))
        self.assertEqual(job.kind, 'preview')
        self.assertTrue(self.runtime.workers.run_once('gpu'))
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'complete')
        self.assertEqual(self.service.preview_audio(self.word.id, job.id), wav())
        self.assertEqual(self.service.list(self.word.id).total, 0)
        self.assertEqual(self.service.get_recipe(self.word.id), self.recipe)
        self.assertIn('--samples=1', self.runner.calls[-1][1])
        self.assertIn('--engines=qwen3', self.runner.calls[-1][1])
        with self.service.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 0)
        with self.assertRaises(NotFound):
            self.service.preview_audio(self.other.id, job.id)

    def test_preview_must_choose_exactly_one_engine_and_audio_waits_for_completion(self):
        with self.assertRaises(ValidationError):
            self.service.enqueue_preview(self.word.id, replace(self.recipe, engines=['moss', 'qwen3']))
        job = self.service.enqueue_preview(self.word.id, replace(self.recipe, engines=['qwen3']))
        with self.assertRaises(NotFound):
            self.service.preview_audio(self.word.id, job.id)

    def test_preview_api_uses_workspace_ownership_and_returns_wav_only_after_completion(self):
        from studio.api import create_router
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        client = TestClient(app)
        base = f'/api/studio/wakewords/{self.word.id}/generation/previews'
        response = client.post(base, json=asdict(replace(self.recipe, engines=['qwen3'])))
        self.assertEqual(response.status_code, 201, response.text)
        job_id = response.json()['id']
        self.assertEqual(client.get(f'{base}/{job_id}/audio').status_code, 404)
        self.runtime.workers.run_once('gpu')
        response = client.get(f'{base}/{job_id}/audio')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['content-type'], 'audio/wav')
        self.assertEqual(response.content, wav())
        self.assertEqual(client.get(f'/api/studio/wakewords/{self.other.id}/generation/previews/{job_id}/audio').status_code, 404)

    def test_preview_invalid_audio_fails_without_retaining_training_data(self):
        self.runner.mode = 'invalid'
        job = self.service.enqueue_preview(self.word.id, replace(self.recipe, engines=['qwen3']))
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'failed')
        self.assertEqual(self.service.list(self.word.id).total, 0)
        with self.assertRaises(NotFound):
            self.service.preview_audio(self.word.id, job.id)

    def test_batch_blob_publication_and_references_are_atomic_against_workspace_gc(self):
        self.runtime.samples.import_audio(self.other.id, 'positive', io.BytesIO(wav()))
        job = self.service.enqueue(self.word.id)
        prepared, release, deleted = threading.Event(), threading.Event(), threading.Event()
        put = self.runtime.blobs.put

        def pause(stream):
            result = put(stream)
            if not prepared.is_set():
                prepared.set()
                if not release.wait(3):
                    raise RuntimeError('test writer was not released')
            return result

        def remove():
            self.runtime.workspaces.delete(self.other.id)
            deleted.set()

        with ThreadPoolExecutor(max_workers=2) as pool, patch.object(self.runtime.blobs, 'put', side_effect=pause):
            worker = pool.submit(self.runtime.workers.run_once, 'gpu')
            self.assertTrue(prepared.wait(3))
            deletion = pool.submit(remove)
            try:
                self.assertFalse(deleted.wait(.05), 'GC must wait for batch audio references')
            finally:
                release.set()
                self.assertTrue(worker.result(timeout=3))
                deletion.result(timeout=3)
        self.assertEqual(self.runtime.jobs.get(job.id).status, 'complete')
        batch = self.service.get_batch(self.word.id, job.id)
        self.assertEqual(self.runtime.blobs.read(batch.audio[0].normalized_hash), wav())

    def test_selection_endpoint_includes_batches_beyond_visible_page(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from studio.api import create_router
        ids = [self.generate()[0].id for _ in range(55)]
        self.service.select_batches(self.word.id, [ids[0], ids[-1]])
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        with TestClient(app) as client:
            base = f'/api/studio/wakewords/{self.word.id}/generation'
            self.assertEqual(len(client.get(base + '/batches').json()['items']), 50)
            self.assertEqual(set(client.get(base + '/selection').json()), {ids[0], ids[-1]})
            self.assertEqual(client.get(f'/api/studio/wakewords/{self.other.id}/generation/selection').json(), [])

    def test_invalid_recipes_are_rejected_not_silently_defaulted(self):
        for changes in ({'language': 'invented'}, {'tts_mode': 'unknown'}, {'tts_mode': 'piper'},
                        {'language': 'de'}, {'english_accent': 'unknown'}, {'samples': 0},
                        {'samples': True}, {'samples': 1.5}, {'batch_size': 0}, {'batch_size': True}):
            with self.subTest(changes=changes), self.assertRaises(ValidationError):
                self.service.save_recipe(self.word.id, replace(self.recipe, **changes))
        self.service.save_recipe(self.word.id, replace(self.recipe, language='fi', english_accent='mixed'))

    def test_cached_extended_language_catalog_is_reused_without_network(self):
        cache = self.root / '.cache/omnivoice_languages.json'
        cache.parent.mkdir(parents=True)
        cache.write_text(json.dumps({'ace': {'name': 'Acehnese', 'iso_639_3': 'ace', 'duration_hours': 1}}))
        self.service.save_recipe(self.word.id, replace(self.recipe, language='ace', english_accent='mixed'))
        entries = {item['language']: item for item in self.service.catalog()}
        self.assertEqual(entries['ace']['engines']['modern'], ['omnivoice'])

    def test_metadata_failure_leaves_no_partial_audio_references(self):
        with self.runtime.generation.store.transaction() as db:
            db.execute("CREATE TRIGGER reject_second_audio BEFORE INSERT ON generation_batch_audio "
                       "WHEN NEW.position=1 BEGIN SELECT RAISE(ABORT, 'fixture crash'); END")
        job, batch = self.generate()
        self.assertEqual(job.status, 'failed')
        self.assertEqual(batch.audio, [])
        with self.runtime.generation.store.transaction() as db:
            self.assertEqual(db.execute('SELECT count(*) FROM generation_batch_audio').fetchone()[0], 0)
            self.assertEqual(db.execute('SELECT count(*) FROM audio_records').fetchone()[0], 0)

    def test_actual_v6_upgrade_preserves_existing_workspace_and_audio(self):
        from studio.db import Store
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'studio').mkdir()
            db = sqlite3.connect(root / 'studio/studio.sqlite3')
            for filename in ('schema.sql', 'schema_samples.sql', 'schema_devices.sql', 'schema_collection.sql',
                             'schema_jobs.sql', 'schema_datasets.sql'):
                db.executescript((Path(__file__).resolve().parents[1] / 'studio' / filename).read_text())
            db.execute("INSERT INTO wakewords VALUES ('old','Old robot','en','old_robot','before','before')")
            db.execute("INSERT INTO audio_records VALUES ('audio','original','normalized','family',NULL,NULL,NULL,'before')")
            db.execute('PRAGMA user_version=6')
            db.commit()
            db.close()
            store = Store.open(root)
            try:
                with store.transaction() as db:
                    self.assertEqual(db.execute('PRAGMA user_version').fetchone()[0], 16)
                    self.assertEqual(db.execute("SELECT phrase FROM wakewords WHERE id='old'").fetchone()[0], 'Old robot')
                    self.assertEqual(db.execute("SELECT family_id FROM audio_records WHERE id='audio'").fetchone()[0], 'family')
            finally:
                store.close()

    def test_generator_children_stay_in_owned_session_with_legacy_compatibility(self):
        path = Path(__file__).resolve().parents[1] / 'cli/tts_generate_samples.py'
        spec = importlib.util.spec_from_file_location('studio_fixture_generator', path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        for owned in (False, True):
            environment = {'STUDIO_JOB_TOKEN': 'fixture-owned'} if owned else {}
            with self.subTest(owned=owned), patch.dict(module.os.environ, environment, clear=True):
                with patch.object(module.subprocess, 'run') as run:
                    module.run(['fixture-provider'])
                    self.assertEqual(run.call_args.kwargs['start_new_session'], not owned)
                process = Mock()
                process.wait.return_value = 0
                with patch.object(module.subprocess, 'Popen', return_value=process) as spawn:
                    self.assertEqual(module.run_normalization_ffmpeg(['fixture-ffmpeg'], 1), 0)
                    self.assertEqual(spawn.call_args.kwargs['start_new_session'], not owned)

    def test_owned_ffmpeg_timeout_does_not_kill_shared_job_group(self):
        path = Path(__file__).resolve().parents[1] / 'cli/tts_generate_samples.py'
        spec = importlib.util.spec_from_file_location('studio_timeout_generator', path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        process = Mock()
        process.wait.side_effect = [subprocess.TimeoutExpired('fixture', 1), 0]
        with patch.dict(module.os.environ, {'STUDIO_JOB_TOKEN': 'fixture'}), \
                patch.object(module.subprocess, 'Popen', return_value=process), \
                patch.object(module.os, 'killpg') as kill_group:
            self.assertIsNone(module.run_normalization_ffmpeg(['fixture'], 1))
            process.kill.assert_called_once_with()
            kill_group.assert_not_called()

    def test_phrase_is_one_literal_argument_even_with_shell_syntax(self):
        phrase = '--help; $(touch forbidden) "robot"'
        self.runtime.workspaces.update(self.word.id, WakewordUpdate(phrase=phrase))
        job, batch = self.generate()
        self.assertEqual(job.status, 'complete')
        self.assertEqual(batch.phrase, phrase)
        self.assertEqual(self.runner.calls[0][1][-2:], ['--', phrase])

    def test_enqueue_snapshots_phrase_recipe_and_ignores_mutated_job_projection(self):
        job = self.service.enqueue(self.word.id)
        job.payload['recipe']['samples'] = 99
        self.service.save_recipe(self.word.id, replace(self.recipe, samples=7))
        self.runtime.workspaces.update(self.word.id, WakewordUpdate(phrase='Changed phrase'))
        self.runtime.workers.run_once('gpu')
        batch = self.service.get_batch(self.word.id, job.id)
        self.assertEqual(batch.phrase, 'Hello robot')
        self.assertEqual(batch.recipe, self.recipe)
        self.assertEqual(len(batch.audio), 2)
        argv = self.runner.calls[0][1]
        self.assertIn('--samples=2', argv)
        self.assertIn('--batch-size=1', argv)
        self.assertEqual(argv[-1], 'Hello robot')
        self.assertFalse(any('voice-count' in arg for arg in argv))

    def test_two_words_use_isolated_output_and_preserve_previous_blobs(self):
        self.service.save_recipe(self.other.id, self.recipe)
        first, batch = self.generate()
        saved = [self.runtime.blobs.read(audio.normalized_hash) for audio in batch.audio]
        second, _ = self.generate(self.other.id)
        third, _ = self.generate()
        self.assertEqual([first.status, second.status, third.status], ['complete'] * 3)
        paths = [next(arg for arg in call[1] if arg.startswith('--output-dir=')) for call in self.runner.calls]
        self.assertEqual(len(set(paths)), 3)
        self.assertTrue(all('/studio/jobs/' in path for path in paths))
        self.assertFalse((self.root / 'work/wake_word_samples').exists())
        self.assertEqual(saved, [self.runtime.blobs.read(audio.normalized_hash) for audio in batch.audio])

    def test_partial_invalid_extra_symlink_outputs_never_ready_or_selectable(self):
        for mode in ('short', 'invalid', 'extra', 'symlink'):
            with self.subTest(mode=mode):
                self.runner.mode = mode
                job, batch = self.generate()
                self.assertEqual(job.status, 'failed')
                self.assertNotEqual(batch.status, 'complete')
                self.assertEqual(batch.audio, [])
                with self.assertRaises(Conflict):
                    self.service.select_batches(self.word.id, [batch.id])

    def test_selection_is_scoped_atomic_and_preserves_history(self):
        _, batch = self.generate()
        self.service.select_batches(self.word.id, [batch.id])
        self.assertTrue(self.service.get_batch(self.word.id, batch.id).selected)
        with self.assertRaises(NotFound):
            self.service.select_batches(self.other.id, [batch.id])
        with self.assertRaises(ValidationError):
            self.service.select_batches(self.word.id, [batch.id, batch.id])
        self.service.select_batches(self.word.id, [])
        self.assertFalse(self.service.get_batch(self.word.id, batch.id).selected)
        self.assertEqual(len(self.service.get_batch(self.word.id, batch.id).audio), 2)

    def test_identical_generated_and_imported_audio_share_existing_families(self):
        imported = self.runtime.samples.import_audio(self.other.id, 'positive', io.BytesIO(wav()))
        _, batch = self.generate()
        self.assertEqual(batch.audio[0].family_id, imported.family_id)
        self.assertEqual(batch.audio[0].normalized_hash, imported.normalized_hash)

    def test_training_and_generation_share_gpu_lock_and_cancelled_batch_unusable(self):
        training = self.runtime.jobs.enqueue('train', self.word.id, {})
        claimed = self.runtime.jobs.claim('gpu', self.runtime.clock())
        queued = self.service.enqueue(self.word.id)
        self.assertIsNone(self.runtime.jobs.claim('gpu', self.runtime.clock()))
        self.assertEqual(claimed.id, training.id)
        self.runtime.jobs.finish(training.id, {})
        self.runner.hook = lambda context: self.runtime.jobs.cancel(context.job.id)
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(queued.id).status, 'cancelled')
        self.assertEqual(self.service.get_batch(self.word.id, queued.id).audio, [])

    def test_execute_without_owned_context_or_unadmitted_job_rejected(self):
        job = self.service.enqueue(self.word.id)
        with self.assertRaises(Conflict):
            self.service.execute(job)
        forged = self.runtime.jobs.enqueue('generation', self.word.id, {'recipe': asdict(self.recipe)})
        self.runtime.jobs.cancel(job.id)
        self.runtime.workers.run_once('gpu')
        self.assertEqual(self.runtime.jobs.get(forged.id).status, 'failed')
        self.assertEqual(self.runner.calls, [])

    def test_recipe_batches_and_routes_survive_restart(self):
        _, batch = self.generate()
        self.service.select_batches(self.word.id, [batch.id])
        self.runtime.shutdown()
        self.assertEqual(self.runtime.generation.get_recipe(self.word.id), self.recipe)
        self.assertTrue(self.runtime.generation.get_batch(self.word.id, batch.id).selected)
        from studio.api import create_router
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        with TestClient(app) as client:
            base = f'/api/studio/wakewords/{self.word.id}/generation'
            self.assertEqual(client.get('/api/studio/generation/catalog').status_code, 200)
            self.assertEqual(client.get(base + '/recipe').json(), asdict(self.recipe))
            self.assertEqual(client.put(base + '/recipe', json={**asdict(self.recipe), 'tts_voice_count': 10}).status_code, 422)
            self.assertEqual(client.put(base + '/recipe', json=asdict(self.recipe)).status_code, 200)
            self.assertEqual(client.get(base + '/batches').json()['total'], 1)
            self.assertEqual(client.put(base + '/batches', json={'batch_ids': []}).status_code, 200)
            self.assertEqual(client.post(base + '/jobs').status_code, 201)


if __name__ == '__main__':
    unittest.main()
