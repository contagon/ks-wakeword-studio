"""Execution-time input snapshots and fail-closed immutable model archives."""

import hashlib
import json
import os
import shutil
from dataclasses import asdict
from pathlib import Path
from typing import Callable, Protocol
from threading import Event
from uuid import uuid4

from studio.jobs import utc_now, aware_utc
from studio.models import (Conflict, DatasetInput, ModelVersion, NotFound, Page, RunManifest,
                           TrainingAudio, TrainingResult, TrainingSettings, ValidationError)
from studio.storage import open_directory
from studio.workspaces import WorkspaceService


def encode(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False)


def load_manifest(value):
    data = json.loads(value)
    if 'legacy_identity' in data:
        from studio.models import LegacyRun
        return LegacyRun(**{key: data[key] for key in LegacyRun.__dataclass_fields__ if key in data})
    from studio.augmentation import AugmentationInput
    data['augmentation'] = tuple(AugmentationInput(**item) for item in data.get('augmentation', []))
    data['config'] = TrainingSettings(**data['config'])
    data['audio'] = tuple(TrainingAudio(**a) for a in data['audio'])
    data['datasets'] = tuple(DatasetInput(**d) for d in data['datasets'])
    data['selected_batches'] = tuple(data['selected_batches'])
    return RunManifest(**data)


class TrainingAdapter(Protocol):
    def run(self, manifest: RunManifest, run_root: Path, on_log: Callable[[str], None], cancel: Event) -> TrainingResult: ...


class TrainingService:
    def __init__(self, store, blobs, jobs, datasets, *, clock=utc_now, adapter_factory=None):
        self.store, self.blobs, self.jobs, self.datasets = store, blobs, jobs, datasets
        self.clock, self.adapter_factory = clock, adapter_factory

    def _now(self):
        return aware_utc(self.clock()).isoformat()

    def settings(self, word_id):
        WorkspaceService(self.store).get(word_id)
        with self.store.transaction() as db:
            row = db.execute('SELECT config FROM training_settings WHERE word_id=?', (word_id,)).fetchone()
            return TrainingSettings(**json.loads(row[0])) if row else TrainingSettings()

    def save_settings(self, word_id, settings):
        if (not isinstance(settings, TrainingSettings) or type(settings.training_steps) is not int
                or not 1 <= settings.training_steps <= 10000000 or type(settings.train_openwakeword) is not bool):
            raise ValidationError('Invalid training settings')
        WorkspaceService(self.store).get(word_id)
        with self.store.transaction() as db:
            db.execute('INSERT INTO training_settings VALUES (?,?) ON CONFLICT(word_id) DO UPDATE SET config=excluded.config',
                       (word_id, encode(asdict(settings))))
        return settings

    def enqueue(self, word_id, trigger='manual'):
        if trigger not in ('manual', 'scheduled'):
            raise ValidationError('Invalid training trigger')
        return self.jobs.enqueue('train', word_id, {'trigger': trigger})

    def snapshot(self, word_id, run_id):
        # Large raw corpus hashing/copying precedes the final metadata snapshot;
        # never block label/job/cancellation writes for the duration of that I/O.
        with self.store.transaction() as db:
            existing = db.execute('SELECT manifest FROM training_runs WHERE id=? AND word_id=?', (run_id, word_id)).fetchone()
            if existing:
                return load_manifest(existing[0])
            if db.execute('SELECT 1 FROM wakewords WHERE id=?', (word_id,)).fetchone() is None:
                raise NotFound('Workspace not found')
        from studio.augmentation import snapshot
        augmentation = snapshot(self.store)
        # Hold the Store lock across the dataset-service snapshot and transaction;
        # use one SQLite transaction so other processes cannot edit selections.
        with self.store.transaction() as db:
            existing = db.execute('SELECT manifest FROM training_runs WHERE id=? AND word_id=?', (run_id, word_id)).fetchone()
            if existing:
                return load_manifest(existing[0])
            word = db.execute('SELECT * FROM wakewords WHERE id=?', (word_id,)).fetchone()
            if word is None:
                raise NotFound('Workspace not found')
            config = db.execute('SELECT config FROM training_settings WHERE word_id=?', (word_id,)).fetchone()
            settings = TrainingSettings(**json.loads(config[0])) if config else TrainingSettings()
            datasets = tuple(self.datasets.snapshot(word_id, _db=db))
            seed = db.execute('SELECT seed FROM training_seed WHERE id=1').fetchone()[0]
            rows = db.execute("SELECT a.*,s.id sample_id,s.revision,s.label,NULL batch_id FROM samples s JOIN audio_records a ON a.id=s.audio_id "
                              "LEFT JOIN recordings r ON r.id=s.recording_id WHERE s.word_id=? AND s.deleted=0 "
                              "AND (r.id IS NULL OR r.quarantined=0) AND s.label IN ('positive','negative') ORDER BY s.rowid", (word_id,)).fetchall()
            batches = tuple(r[0] for r in db.execute('SELECT s.batch_id FROM generation_selection s JOIN generation_batches b ON b.id=s.batch_id '
                            "JOIN studio_jobs j ON j.id=b.id WHERE s.word_id=? AND j.status='complete' AND b.committed_at IS NOT NULL ORDER BY s.batch_id", (word_id,)))
            for batch in batches:
                rows += db.execute("SELECT a.*,NULL sample_id,NULL revision,'positive' label,b.batch_id FROM generation_batch_audio b "
                                   'JOIN audio_records a ON a.id=b.audio_id WHERE b.batch_id=? ORDER BY b.position', (batch,)).fetchall()
            audio = []
            for row in rows:
                assignment = db.execute('SELECT split FROM training_family_splits WHERE family_id=?', (row['family_id'],)).fetchone()
                if assignment:
                    split = assignment[0]
                else:
                    bucket = int(hashlib.sha256(f'{seed}:{row["family_id"]}'.encode()).hexdigest(), 16) % 100
                    split = 'training' if bucket < 80 else ('validation' if bucket < 90 else 'testing')
                    db.execute('INSERT INTO training_family_splits VALUES (?,?)', (row['family_id'], split))
                audio.append(TrainingAudio(row['id'], row['original_hash'], row['normalized_hash'], row['family_id'],
                                          str(self.blobs.root / row['normalized_hash']), row['label'], split,
                                          row['sample_id'], row['revision'], row['batch_id']))
            effective = dict(model_id=word['model_id'], phrase=word['phrase'], language=word['language'],
                             config=asdict(settings), seed=seed, audio=[asdict(a) for a in audio],
                             datasets=[asdict(d) for d in datasets], augmentation=[asdict(a) for a in augmentation], selected_batches=batches, adapter_version=2)
            fingerprint = hashlib.sha256(encode(effective).encode()).hexdigest()
            manifest = RunManifest(1, run_id, word_id, word['model_id'], word['phrase'], word['language'], settings,
                                   seed, tuple(audio), datasets, batches, fingerprint, self._now(), augmentation)
            db.execute('INSERT INTO training_runs VALUES (?,?,?)', (run_id, word_id, encode(asdict(manifest))))
            return manifest

    def get_manifest(self, word_id, run_id):
        with self.store.transaction() as db:
            row = db.execute('SELECT manifest FROM training_runs WHERE word_id=? AND id=?', (word_id, run_id)).fetchone()
            if row is None:
                raise NotFound('Run manifest not found')
            return load_manifest(row[0])

    def counts(self, word_id):
        WorkspaceService(self.store).get(word_id)
        with self.store.transaction() as db:
            counts = {'positive': 0, 'negative': 0, 'artificial': 0}
            for row in db.execute("SELECT s.label,count(*) FROM samples s LEFT JOIN recordings r ON r.id=s.recording_id "
                                  "WHERE s.word_id=? AND s.deleted=0 AND (r.id IS NULL OR r.quarantined=0) "
                                  "AND s.label IN ('positive','negative') GROUP BY s.label", (word_id,)):
                counts[row[0]] = row[1]
            counts['artificial'] = db.execute('SELECT count(*) FROM generation_selection s JOIN generation_batches b ON b.id=s.batch_id '
                "JOIN studio_jobs j ON j.id=b.id JOIN generation_batch_audio a ON a.batch_id=b.id WHERE s.word_id=? AND j.status='complete' AND b.committed_at IS NOT NULL", (word_id,)).fetchone()[0]
            return counts

    def runs(self, word_id, offset=0, limit=50):
        WorkspaceService(self.store).get(word_id)
        self._page(offset, limit)
        with self.store.transaction() as db:
            ids = [r[0] for r in db.execute("SELECT id FROM studio_jobs WHERE word_id=? AND kind='train' ORDER BY rowid DESC", (word_id,))]
        return Page([self.jobs.get(i) for i in ids[offset:offset + limit]], len(ids), offset, limit)

    @staticmethod
    def _page(offset, limit):
        if type(offset) is not int or offset < 0 or type(limit) is not int or not 1 <= limit <= 100:
            raise ValidationError('Invalid pagination')

    def versions(self, word_id, offset=0, limit=50):
        WorkspaceService(self.store).get(word_id)
        self._page(offset, limit)
        with self.store.transaction() as db:
            rows = db.execute("SELECT v.version,EXISTS(SELECT 1 FROM migration_model_provenance p WHERE p.version_id=v.id) legacy,EXISTS(SELECT 1 FROM legacy_model_validations a WHERE a.version_id=v.id) validated FROM model_versions v JOIN studio_jobs j ON j.id=v.run_id WHERE v.word_id=? AND j.status='complete' ORDER BY v.rowid DESC", (word_id,)).fetchall()
            items = []
            for row in rows[offset:offset + limit]:
                data = json.loads(row[0])
                if row['legacy']:
                    data.update(origin='legacy', validation_state='validated' if row['validated'] else 'unvalidated')
                items.append(ModelVersion(**data))
            return Page(items, len(rows), offset, limit)

    def successful_version(self, job_id):
        """Task-9 completion hook lookup. Never returns running/partial archives."""
        with self.store.transaction() as db:
            row = db.execute("SELECT v.version FROM model_versions v JOIN studio_jobs j ON j.id=v.run_id WHERE v.run_id=? AND j.status='complete'", (job_id,)).fetchone()
            if row and db.execute('SELECT 1 FROM migration_model_provenance WHERE version_id=json_extract(?,\'$.id\')', (row[0],)).fetchone():
                return None
            return ModelVersion(**json.loads(row[0])) if row else None

    def execute(self, job, context=None):
        if (context is None or context.queue is not self.jobs or context.job.id != job.id or job.id not in self.jobs._owners
                or self.jobs.get(job.id).status != 'running' or job.kind != 'train'):
            raise Conflict('Owned job context required')
        manifest = self.snapshot(job.word_id, job.id)
        root = self.store.scoped_directory('jobs', job.id) / 'training'
        with open_directory(root):
            pass
        (root / 'run-manifest.json').write_text(encode(asdict(manifest)), encoding='utf-8')
        previous = [version for version in self.versions(job.word_id).items if version.origin == 'training']
        with self.store.transaction() as db:
            scope = db.execute('SELECT schedule_scope FROM studio_jobs WHERE id=?', (job.id,)).fetchone()[0]
        scheduled = job.payload.get('trigger') == 'scheduled' or scope == 'train:' + job.word_id
        if scheduled and previous and previous[0].fingerprint == manifest.fingerprint:
            context.log('Unchanged configuration and data; scheduled training skipped')
            return None
        if context.cancelled():
            raise Conflict('Training cancelled')
        from studio.legacy_training import LegacyTrainingAdapter
        adapter = self.adapter_factory(context) if self.adapter_factory else LegacyTrainingAdapter(context, self.store.root.parent)
        result = adapter.run(manifest, root, context.log, context.stop_event)
        if context.cancelled():
            raise Conflict('Training cancelled')
        if not result.validated:
            raise ValidationError('Training outputs not validated')
        return self._archive(manifest, root, result, context)

    def _archive(self, manifest, root, result, context):
        from studio.legacy_training import checked_file, sha256
        version_id = uuid4().hex
        parent = self.store.root / 'models' / manifest.word_id
        with open_directory(parent):
            pass
        stage, destination = parent / ('.partial-' + version_id), parent / version_id
        stage.mkdir()
        # Validate again at the trust boundary, including injected adapter results.
        for name, source in result.artifacts.items():
            if Path(name).is_absolute() or '..' in Path(name).parts:
                raise ValidationError('Unsafe artifact name')
            path = checked_file(Path(source), root)
            if result.checksums.get(name) != sha256(path):
                raise ValidationError('Artifact checksum mismatch')
            target = stage / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, target)
        slug = manifest.model_id
        metadata = json.loads((stage / f'{slug}.json').read_text())
        if metadata.get('model') != f'{slug}.tflite' or not (stage / f'{slug}.tflite').is_file():
            raise ValidationError('Invalid stable model manifest')
        shutil.copyfile(root / 'run-manifest.json', stage / 'run-manifest.json')
        (stage / 'metrics.json').write_text(encode(result.metrics))
        (stage / 'job.log').write_text(self.jobs.log_tail(context.job.id, 65536))
        checksums = {str(p.relative_to(stage)): sha256(p) for p in stage.rglob('*') if p.is_file()}
        version = ModelVersion(version_id, manifest.word_id, slug, manifest.run_id, self._now(), str(destination),
                               manifest.fingerprint, checksums, result.metrics)
        (stage / 'archive.json').write_text(encode(asdict(version)))
        for p in stage.rglob('*'):
            if p.is_file():
                with p.open('rb') as handle:
                    os.fsync(handle.fileno())
        for p in sorted([stage, *[p for p in stage.rglob('*') if p.is_dir()]], key=lambda p: len(p.parts), reverse=True):
            with open_directory(p) as fd:
                os.fsync(fd)
        with self.store.transaction() as db:
            if db.execute('SELECT status FROM studio_jobs WHERE id=?', (context.job.id,)).fetchone()[0] != 'running' or context.stop_event.is_set():
                raise Conflict('Training cancelled')
            stage.rename(destination)
            with open_directory(parent) as fd:
                os.fsync(fd)
            db.execute('INSERT INTO model_versions VALUES (?,?,?,?)', (version_id, manifest.word_id, manifest.run_id, encode(asdict(version))))
        # SQL job completion (and proof that the child group is gone) is an
        # additional publication gate, not this filesystem rename alone.
        return version

    def handle(self, job, context):
        version = self.execute(job, context)
        return {'run_id': job.id, 'version_id': version.id} if version else {'run_id': job.id, 'skipped': True}
