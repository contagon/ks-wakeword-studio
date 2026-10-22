"""Saved recipes and owned, isolated generation of retained synthetic batches."""

import io
import json
import os
import re
import sys
from dataclasses import asdict, replace
from pathlib import Path
from uuid import uuid4

import tts_config as tts
from studio.models import Batch, BatchAudio, Conflict, GenerationRecipe, NotFound, Page, ValidationError
from studio.storage import canonical_wav, ensure_directory, open_directory, read_regular
from studio.jobs import aware_utc


class GenerationService:
    def __init__(self, store, blobs, jobs, *, clock=None):
        self.store, self.blobs, self.jobs = store, blobs, jobs
        self.clock = clock or jobs.clock

    def _now(self):
        return aware_utc(self.clock()).isoformat()

    @staticmethod
    def _word(db, word_id):
        row = db.execute('SELECT * FROM wakewords WHERE id=?', (word_id,)).fetchone()
        if row is None:
            raise NotFound('Wakeword not found')
        return row

    def _piper_available(self, language):
        root = self.store.root.parent / 'tools/piper-sample-generator'
        if language == 'en':
            return (root / 'models/en_US-libritts_r-medium.pt').is_file()
        return any(path.is_file() for path in (root / 'voices').glob(f'{language}_*.onnx'))

    def catalog(self):
        # Offline fallback is the shared provider catalog, never an invented list.
        return [{'language': code, 'name': name, 'accent_applies': code == 'en',
                 'english_accents': tts.english_accent_options() if code == 'en' else [],
                 'model_availability': self._model_availability(code),
                 'engines': {mode: tts.engines_for_language(code, mode, piper_available=self._piper_available(code))
                             for mode in tts.TTS_MODES}}
                for code, name in sorted(self._languages().items())]

    def _model_availability(self, language):
        available = self._piper_available(language)
        supported = language == 'en' or available
        catalog = self.store.root.parent / '.cache/piper_voices_catalog.json'
        try:
            if catalog.stat().st_size < 4 * 1024 * 1024:
                entries = json.loads(catalog.read_text())
                supported = supported or (isinstance(entries, dict) and any(key.startswith(language + '_') for key in entries))
        except (OSError, ValueError, TypeError):
            pass
        models = [{'engine': name, 'supported': True, 'available': True, 'reason': None}
                  for name in tts.modern_engines_for_language(language)]
        models.append({'engine': 'piper', 'supported': supported, 'available': available,
                       'reason': None if available else ('Install compatible Piper voice files to enable this model.' if supported
                           else 'No compatible Piper voice is installed or listed in the offline voice catalog for this language.')})
        return models

    def _languages(self):
        languages = dict(tts.COMMON_OMNIVOICE_LANGUAGES)
        cache = self.store.root.parent / '.cache/omnivoice_languages.json'
        try:
            if cache.stat().st_size <= 2 * 1024 * 1024:
                entries = json.loads(cache.read_text())
                if isinstance(entries, dict):
                    for code, entry in entries.items():
                        if (re.fullmatch(r'[a-z0-9_]{1,32}', code) and isinstance(entry, dict)
                                and isinstance(entry.get('name'), str) and 0 < len(entry['name']) <= 200):
                            languages[code] = entry['name']
        except (OSError, ValueError):
            pass  # Existing shared offline fallback; never fetch on a recipe request.
        return languages

    def _validate(self, recipe):
        if not isinstance(recipe, GenerationRecipe):
            raise ValidationError('Invalid recipe')
        if (recipe.language not in self._languages() or recipe.tts_mode not in tts.TTS_MODES
                or recipe.english_accent not in tts.ENGLISH_ACCENTS
                or (recipe.language != 'en' and recipe.english_accent != 'mixed')
                or type(recipe.samples) is not int or recipe.samples < 1
                or type(recipe.batch_size) is not int or recipe.batch_size < 1):
            raise ValidationError('Unsupported recipe')
        available = tts.engines_for_language(recipe.language, 'hybrid',
                                             piper_available=self._piper_available(recipe.language))
        if recipe.engines is not None:
            if (not isinstance(recipe.engines, list) or not recipe.engines
                    or not all(isinstance(engine, str) and engine in available for engine in recipe.engines)
                    or len(set(recipe.engines)) != len(recipe.engines)):
                raise ValidationError('Unsupported engine selection')
        elif not tts.engines_for_language(recipe.language, recipe.tts_mode,
                                          piper_available=self._piper_available(recipe.language)):
            raise ValidationError('No available engines')

    def enqueue_preview(self, word_id, recipe):
        self._validate(recipe)
        if recipe.engines is None or len(recipe.engines) != 1:
            raise ValidationError('Preview requires one engine')
        recipe = replace(recipe, samples=1, batch_size=1)
        with self.store.transaction() as db:
            word = self._word(db, word_id)
            if recipe.engines == ['moss']:
                from studio.generation_references import reference_pool
                if recipe.moss_after_current:
                    raise ValidationError('Select completed sources to preview MOSS')
                reference_pool(self, db, word_id, word['phrase'], recipe, 1)
            return self.jobs._enqueue(db, 'preview', word_id,
                                      {'phrase': word['phrase'], 'recipe': asdict(recipe)}, None, None, self.clock())

    def handle_preview(self, job, context):
        if (context.queue is not self.jobs or context.job.id != job.id or job.id not in self.jobs._owners
                or job.kind != 'preview' or self.jobs.get(job.id).status != 'running'):
            raise Conflict('Owned preview context required')
        recipe = GenerationRecipe(**job.payload['recipe'])
        self._validate(recipe)
        references = self._references(job, context, job.payload['phrase'], recipe)
        output = self._run_generator(job, context, job.payload['phrase'], recipe,
                                     reference_manifest=references[0] if references else None)
        if references:
            from studio.generation_references import output_parents
            output_parents(output, references[1], recipe.samples)
        audio = list(self._read_audio(output, recipe.samples))
        if len(audio) != 1 or context.cancelled():
            raise Conflict('Preview incomplete or cancelled')
        with open_directory(self.store.scoped_directory('jobs', job.id)) as directory:
            fd = os.open('preview.wav', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=directory)
            with os.fdopen(fd, 'wb') as output:
                output.write(audio[0][1])
                output.flush()
                os.fsync(output.fileno())
        return {'preview': True}

    def preview_audio(self, word_id, job_id):
        with self.store.transaction() as db:
            self._word(db, word_id)
            row = db.execute("SELECT 1 FROM studio_jobs WHERE id=? AND word_id=? AND kind='preview' AND status='complete'",
                             (job_id, word_id)).fetchone()
            if row is None:
                raise NotFound('Preview not ready')
            with open_directory(self.store.scoped_directory('jobs', job_id)) as directory:
                try:
                    data = read_regular(directory, 'preview.wav', self.blobs.max_bytes, 'Unsafe preview')
                except FileNotFoundError as exc:
                    raise NotFound('Preview unavailable') from exc
                if len(data) > self.blobs.max_bytes:
                    raise ValidationError('Preview too large')
                return canonical_wav(data)

    def save_recipe(self, word_id, recipe):
        self._validate(recipe)
        with self.store.transaction() as db:
            self._word(db, word_id)
            db.execute('INSERT INTO generation_recipes VALUES (?,?) ON CONFLICT(word_id) DO UPDATE SET recipe=excluded.recipe',
                       (word_id, json.dumps(asdict(recipe), sort_keys=True)))
        return recipe

    def get_recipe(self, word_id):
        with self.store.transaction() as db:
            self._word(db, word_id)
            row = db.execute('SELECT recipe FROM generation_recipes WHERE word_id=?', (word_id,)).fetchone()
            if row is None:
                raise NotFound('Generation recipe not saved')
            return GenerationRecipe(**json.loads(row[0]))

    def enqueue(self, word_id, recipe=None):
        # Admit the phrase, recipe and job together. Later edits cannot rewrite them.
        with self.store.transaction() as db:
            word = self._word(db, word_id)
            if recipe is None:
                row = db.execute('SELECT recipe FROM generation_recipes WHERE word_id=?', (word_id,)).fetchone()
                if row is None:
                    raise NotFound('Generation recipe not saved')
                recipe = GenerationRecipe(**json.loads(row[0]))
            self._validate(recipe)
            encoded = json.dumps(asdict(recipe), sort_keys=True)
            db.execute('INSERT INTO generation_recipes VALUES (?,?) ON CONFLICT(word_id) DO UPDATE SET recipe=excluded.recipe',
                       (word_id, encoded))
            job = self.jobs._enqueue(db, 'generation', word_id,
                                     {'phrase': word['phrase'], 'recipe': asdict(recipe)}, None, None, self.clock())
            db.execute('INSERT INTO generation_batches VALUES (?,?,?,?,NULL)',
                       (job.id, word_id, word['phrase'], encoded))
            return job

    def submit(self, word_id, recipe):
        from studio.generation_submissions import submit
        return submit(self, word_id, recipe)

    def sources(self, word_id, language=None, offset=0, limit=50):
        from studio.generation_references import list_sources
        return list_sources(self, word_id, language, offset, limit)

    def _batch(self, db, word_id, batch_id):
        row = db.execute('SELECT b.*,j.status,j.created_at,j.finished_at FROM generation_batches b '
                         'JOIN studio_jobs j ON j.id=b.id WHERE b.id=? AND b.word_id=?', (batch_id, word_id)).fetchone()
        if row is None:
            raise NotFound('Batch not found')
        ready = row['committed_at'] is not None and row['status'] == 'complete'
        audio = db.execute('SELECT a.id,a.original_hash,a.normalized_hash,a.family_id FROM generation_batch_audio b '
                           'JOIN audio_records a ON a.id=b.audio_id WHERE batch_id=? ORDER BY position', (batch_id,)).fetchall()
        selected = db.execute('SELECT 1 FROM generation_selection WHERE word_id=? AND batch_id=?', (word_id, batch_id)).fetchone()
        status = 'complete' if ready else ('failed' if row['status'] == 'complete' else row['status'])
        return Batch(batch_id, word_id, row['phrase'], GenerationRecipe(**json.loads(row['recipe'])), status,
                     row['created_at'], row['finished_at'], [BatchAudio(*a) for a in audio] if ready else [], bool(selected))

    def get_batch(self, word_id, batch_id):
        with self.store.transaction() as db:
            self._word(db, word_id)
            return self._batch(db, word_id, batch_id)

    def delete_batch(self, word_id: str, batch_id: str) -> None:
        from studio.deletion import delete_batch
        delete_batch(self.store, self.blobs, word_id, batch_id)

    def list(self, word_id, offset=0, limit=50):
        if type(offset) is not int or offset < 0 or type(limit) is not int or not 1 <= limit <= 100:
            raise ValidationError('Invalid pagination')
        with self.store.transaction() as db:
            self._word(db, word_id)
            # Failed, cancelled and interrupted datasets are unusable, so they are not listed.
            visible = ("FROM generation_batches b JOIN studio_jobs j ON j.id=b.id WHERE b.word_id=? AND "
                       "(j.status IN ('queued','running','cancelling') OR (j.status='complete' AND b.committed_at IS NOT NULL))")
            total = db.execute(f'SELECT count(*) {visible}', (word_id,)).fetchone()[0]
            rows = db.execute(f'SELECT b.id {visible} ORDER BY b.rowid DESC LIMIT ? OFFSET ?',
                              (word_id, limit, offset)).fetchall()
            return Page([self._batch(db, word_id, row[0]) for row in rows], total, offset, limit)

    def selection(self, word_id):
        with self.store.transaction() as db:
            self._word(db, word_id)
            return [row[0] for row in db.execute('SELECT batch_id FROM generation_selection WHERE word_id=? ORDER BY batch_id', (word_id,))]

    def select_batches(self, word_id, batch_ids):
        if (not isinstance(batch_ids, list) or not all(isinstance(item, str) for item in batch_ids)
                or len(set(batch_ids)) != len(batch_ids)):
            raise ValidationError('Invalid selection')
        with self.store.transaction() as db:
            self._word(db, word_id)
            for batch_id in batch_ids:
                if self._batch(db, word_id, batch_id).status != 'complete':
                    raise Conflict('Batch is not ready')
            db.execute('DELETE FROM generation_selection WHERE word_id=?', (word_id,))
            db.executemany('INSERT INTO generation_selection VALUES (?,?)', [(word_id, item) for item in batch_ids])

    def execute(self, job, context=None):
        # A plain caller must not spawn work outside the queue's ownership lifetime.
        if (context is None or context.queue is not self.jobs or context.job.id != job.id
                or job.id not in self.jobs._owners):
            raise Conflict('Owned job context required')
        with self.store.transaction() as db:
            row = db.execute('SELECT * FROM generation_batches WHERE id=? AND word_id=?', (job.id, job.word_id)).fetchone()
            state = db.execute('SELECT kind,status FROM studio_jobs WHERE id=?', (job.id,)).fetchone()
            if row is None or tuple(state) != ('generation', 'running') or row['committed_at'] is not None:
                raise Conflict('Generation job not admitted')
            phrase, recipe = row['phrase'], GenerationRecipe(**json.loads(row['recipe']))
        self._validate(recipe)
        # GPU work occurs outside SQL. Blob publication and reference admission
        # share the GC write lock, so another workspace cannot collect a blob
        # between these two operations, even if its content is identical.
        references = self._references(job, context, phrase, recipe)
        output = self._run_generator(job, context, phrase, recipe,
                                     reference_manifest=references[0] if references else None)
        parents = None
        if references:
            from studio.generation_references import output_parents
            parents = output_parents(output, references[1], recipe.samples)
        context.log(f'Validating and saving {recipe.samples} samples')
        with self.store.transaction() as db:
            if db.execute('SELECT status FROM studio_jobs WHERE id=?', (job.id,)).fetchone()[0] != 'running' or context.stop_event.is_set():
                raise Conflict('Generation cancelled')
            for index, (data, normalized) in enumerate(self._read_audio(output, recipe.samples)):
                if context.stop_event.is_set():
                    raise Conflict('Generation cancelled')
                original = self.blobs.put(io.BytesIO(data)).sha256
                canonical = self.blobs.put(io.BytesIO(normalized)).sha256
                known = db.execute('SELECT family_id FROM audio_families WHERE content_hash=?', (canonical,)).fetchone()
                parent = parents[index] if parents else None
                if parent and known and known[0] != parent['family_id']:
                    raise ValidationError('MOSS output conflicts with an existing audio family')
                family = parent['family_id'] if parent else (known[0] if known else canonical)
                db.execute('INSERT OR IGNORE INTO audio_families VALUES (?,?)', (canonical, family))
                audio_id = uuid4().hex
                db.execute('INSERT INTO audio_records VALUES (?,?,?,?,?,NULL,NULL,?)',
                           (audio_id, original, canonical, family, parent['id'] if parent else None, self._now()))
                db.execute('INSERT INTO generation_batch_audio VALUES (?,?,?)', (job.id, index, audio_id))
            db.execute('UPDATE generation_batches SET committed_at=? WHERE id=?', (self._now(), job.id))
        context.log(f'Synthetic batch validated and saved: {recipe.samples}/{recipe.samples}')
        return self.get_batch(job.word_id, job.id)

    def _references(self, job, context, phrase, recipe):
        if recipe.engines != ['moss'] or not (recipe.moss_source_batch_ids or job.payload.get('provider_dataset')):
            return None
        from studio.generation_references import materialize_references
        try:
            return materialize_references(self, job, recipe, phrase, recipe.samples, cancelled=context.cancelled)
        except ValidationError:
            context.log('MOSS sources are unavailable: all selected source datasets must complete successfully with enough distinct clips')
            raise

    def _run_generator(self, job, context, phrase, recipe, *, reference_manifest=None):
        root = self.store.scoped_directory('jobs', job.id)
        output = root / 'generation' / 'samples'
        ensure_directory(output.parent)
        if output.exists() or output.is_symlink():
            raise Conflict('Generation output already exists')
        command = [sys.executable, str(Path(__file__).resolve().parent.parent / 'cli/tts_generate_samples.py'),
                   f'--data-dir={self.store.root.parent}', f'--output-dir={output}',
                   f'--language={recipe.language}', f'--english-accent={recipe.english_accent}',
                   f'--tts-mode={recipe.tts_mode}', f'--samples={recipe.samples}', f'--batch-size={recipe.batch_size}',
                    *([f'--engines={",".join(recipe.engines)}'] if recipe.engines is not None else []),
                    *([f'--reference-manifest={reference_manifest}'] if reference_manifest is not None else []),
                   '--', phrase]
        context.log(f'Generating synthetic batch: {recipe.samples} samples, batch size {recipe.batch_size}')
        context.run(command, cwd=str(root))
        if context.cancelled():
            raise Conflict('Generation cancelled')
        return output

    def _read_audio(self, output, samples):
        with open_directory(output) as directory:
            names = sorted(name for name in os.listdir(directory) if name.lower().endswith('.wav'))
            if len(names) != samples:
                raise ValidationError('Incomplete batch')
            for name in names:
                data = read_regular(directory, name, self.blobs.max_bytes, 'Unsafe generated audio')
                if len(data) > self.blobs.max_bytes:
                    raise ValidationError('Generated audio too large')
                normalized = canonical_wav(data)
                yield data, normalized

    def handle(self, job, context):
        batch = self.execute(job, context)
        return {'batch_id': batch.id}
