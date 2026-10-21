"""Shared raw augmentation downloads, separate from classifier selections."""
import fcntl
import json
import os
import shutil
import stat
import sys
import wave
from pathlib import Path

from studio.augmentation import RESOURCES, tree_fingerprint
from studio.errors import OperationError
from studio.models import Conflict, NotFound, ValidationError
from studio.storage import open_directory

CATALOG = {
    'mit_rirs_16k': ('MIT room impulse responses', 'Room echoes and reverberation.', 'MIT environmental impulse responses (Hugging Face mirror)'),
    'audioset_16k': ('AudioSet', 'Everyday environmental background sounds.', 'AudioSet balanced training subset (agkphysics mirror)'),
    'fma_16k': ('Free Music Archive', 'Music mixed behind wakeword recordings.', 'FMA small, with an extra-small fallback mirror'),
    'chime_16k': ('CHiME-Home', 'Real household background recordings.', 'CHiME-Home (Internet Archive mirror)'),
}


def audio_metrics(root, *, validate=False, cancelled=lambda: False):
    if root.is_symlink() or not root.is_dir() or any(parent.is_symlink() for parent in root.parents):
        raise OperationError('augmentation_invalid')
    size = count = 0
    for path in root.rglob('*'):
        if cancelled():
            raise Conflict('Dataset preparation cancelled')
        mode = path.lstat().st_mode
        if stat.S_ISDIR(mode):
            continue
        if not stat.S_ISREG(mode):
            raise OperationError('augmentation_invalid')
        size += path.stat().st_size
        if path.suffix.lower() != '.wav':
            continue
        count += 1
        try:
            with wave.open(str(path), 'rb') as audio:
                if (audio.getframerate(), audio.getnchannels(), audio.getsampwidth(), audio.getcomptype()) != (16000, 1, 2, 'NONE') or audio.getnframes() <= 0:
                    raise OperationError('augmentation_invalid')
                if validate:
                    remaining = audio.getnframes() * 2
                    while remaining:
                        block = audio.readframes(min(65536, remaining // 2))
                        if not block:
                            raise OperationError('augmentation_invalid')
                        remaining -= len(block)
                else:
                    # Header + final frame verifies truncation without reading GB
                    # of PCM during a catalog/readiness request.
                    audio.setpos(audio.getnframes() - 1)
                    if len(audio.readframes(1)) != 2:
                        raise OperationError('augmentation_invalid')
        except (wave.Error, EOFError, ValueError) as exc:
            raise OperationError('augmentation_invalid') from exc
    if not count:
        raise OperationError('augmentation_invalid')
    return size, count


class AugmentationDatasetService:
    def __init__(self, store, jobs):
        self.store, self.jobs = store, jobs

    def _entry(self, key):
        if key not in CATALOG:
            raise NotFound('Unknown augmentation dataset')
        return CATALOG[key]

    def _attempts(self, db, key):
        return [row for row in db.execute("SELECT id,payload,status,result,created_at FROM studio_jobs WHERE kind='download' ORDER BY rowid")
                if json.loads(row['payload']).get('augmentation_id') == key]

    def catalog(self):
        items = []
        with self.store.transaction() as db:
            latest = {key: self._attempts(db, key) for key in CATALOG}
        for key, (name, description, source) in CATALOG.items():
            job = latest[key][-1] if latest[key] else None
            size = count = None
            error_code = None
            target = self.store.root.parent / 'training_datasets' / key
            try:
                size, count = audio_metrics(target)
                status = 'installed'
            except (OperationError, OSError):
                status = 'available'
                if target.exists() or target.is_symlink():
                    status, error_code = 'failed', 'augmentation_repair_required'
            if job and job['status'] in ('queued', 'running', 'cancelling'):
                status = job['status']
            elif job and job['status'] in ('failed', 'cancelled', 'interrupted') and status != 'installed':
                status = 'failed'
            result = json.loads(job['result']) if job else {}
            items.append(dict(id=key, name=name, description=description, source=source,
                              license='See source terms; individual recordings may have different licenses.',
                              status=status, installed_bytes=size, file_count=count, download_bytes=None,
                              job_id=job['id'] if job else None, job_created_at=job['created_at'] if job else None,
                              error_code=(error_code or result.get('error_code')) if status == 'failed' else None))
        storage = shutil.disk_usage(self.store.root.parent)
        return dict(items=items, ready=all(row['status'] == 'installed' for row in items),
                    storage_free_bytes=storage.free, storage_total_bytes=storage.total)

    def require_ready(self):
        catalog = self.catalog()
        if not catalog['ready']:
            if any(row['error_code'] == 'augmentation_repair_required' for row in catalog['items']):
                raise OperationError('augmentation_repair_required')
            active = any(row['status'] in ('queued', 'running', 'cancelling') for row in catalog['items'])
            raise OperationError('augmentation_busy' if active else 'augmentation_missing')

    def download(self, key):
        self._entry(key)
        target = self.store.root.parent / 'training_datasets' / key
        try:
            audio_metrics(target)
            installed = True
        except (OperationError, OSError):
            if target.exists() or target.is_symlink():
                raise OperationError('augmentation_repair_required')
            installed = False
        with self.store.transaction() as db:
            attempts = self._attempts(db, key)
            for row in attempts:
                if row['status'] in ('queued', 'running', 'cancelling'):
                    return self.jobs._record(self.jobs._row(db, row['id']))
            if installed:
                raise Conflict('Augmentation corpus already installed')
            return self.jobs._enqueue(db, 'download', None, {'augmentation_id': key},
                                      f'augmentation:{key}:{len(attempts)}', None, self.jobs.clock())

    def execute(self, job, context):
        key = job.payload.get('augmentation_id')
        self._entry(key)
        if context.cancelled():
            return {}
        target = self.store.root.parent / 'training_datasets' / key
        if target.exists() or target.is_symlink():
            try:
                audio_metrics(target)
            except (OperationError, OSError) as exc:
                raise OperationError('augmentation_repair_required') from exc
            raise Conflict('Augmentation corpus already installed')
        root = self.store.scoped_directory('jobs', job.id)
        stage = root / 'augmentation-install'
        with open_directory(stage):
            pass
        context.log('Preparing training dependencies, downloading and converting augmentation audio to 16 kHz. This can take a long time; detailed output is retained privately.')
        try:
            context.run([sys.executable, str(Path(__file__).resolve().parents[1] / 'cli/setup_augmentation.py'),
                         f'--corpus={key}', f'--data-dir={self.store.root.parent}', f'--stage-dir={stage}'], cwd=str(stage))
            if context.cancelled():
                raise Conflict('Dataset preparation cancelled')
            with open_directory(stage) as directory:
                receipt_fd = os.open('augmentation-complete.json', os.O_RDONLY | os.O_NOFOLLOW, dir_fd=directory)
                with os.fdopen(receipt_fd, 'rb') as receipt:
                    if not stat.S_ISREG(os.fstat(receipt.fileno()).st_mode):
                        raise OperationError('augmentation_invalid')
                    completed = json.loads(receipt.read(4096))
            if completed != {'schema_version': 1, 'corpus': key}:
                raise OperationError('augmentation_invalid')
            source = stage / 'training_datasets' / key
            context.log('Validating converted augmentation audio')
            size, count = audio_metrics(source, validate=True, cancelled=context.cancelled)
            fingerprint = tree_fingerprint(source)
            with open_directory(self.store.root) as directory:
                fd = os.open('augmentation.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600, dir_fd=directory)
            try:
                fcntl.flock(fd, fcntl.LOCK_EX)
                if context.cancelled():
                    raise Conflict('Dataset preparation cancelled')
                with open_directory(target.parent):
                    pass
                # Never overwrite pre-existing operator-managed corpora.
                if target.exists() or target.is_symlink():
                    audio_metrics(target, validate=True, cancelled=context.cancelled)
                    raise Conflict('Augmentation corpus already installed')
                source.rename(target)
                with open_directory(target.parent) as directory:
                    os.fsync(directory)
            finally:
                os.close(fd)
            context.log(f'Augmentation dataset installed: {count} WAV files; automatically used by training')
            return dict(augmentation_id=key, fingerprint=fingerprint, installed_bytes=size, file_count=count)
        except (ValidationError, FileNotFoundError, ValueError) as exc:
            raise OperationError('augmentation_invalid') from exc
        finally:
            # This job owns only its staging tree, never installed/operator data.
            shutil.rmtree(stage)
