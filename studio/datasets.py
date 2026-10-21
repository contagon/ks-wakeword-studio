"""Shared immutable dataset installs and explicit, engine-specific classifier inputs.

Catalog is operator-controlled, never supplied through the HTTP API. Background
audio/RIR augmentation assets are intentionally not classifier-negative entries.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import stat
import struct
import tempfile
import zipfile
from dataclasses import asdict
from pathlib import Path, PurePosixPath

from studio.jobs import JobQueue
from studio.models import Conflict, Dataset, DatasetInput, Job, NotFound, Page, ValidationError
from studio.storage import open_directory
from studio.workspaces import WorkspaceService


MAX_EXTRACTED_BYTES = 500 * 1024**3
MAX_ARCHIVE_MEMBERS = 2_000_000


def sample_count(root: Path, adapter: str) -> int | None:
    """Read mmap-ninja's sample-index shape, never count feature shard files."""
    try:
        if adapter == 'wav':
            return sum(1 for path in root.rglob('*.wav') if path.is_file())
        if adapter != 'mww_mmap':
            return None
        roots = set()
        for path in root.rglob('type.ninja'):
            with path.open('rb') as handle:
                if handle.read(7) == b'ragged':
                    roots.add(path.parent)
        # Ragged shapes can themselves be ragged: only count top-level corpora.
        corpora = [path for path in roots if not any(parent in roots for parent in path.parents)]
        if not corpora:
            return None
        total = 0
        for path in corpora:
            with (path / 'starts/shape.ninja').open('rb') as handle:
                shape = handle.read(9)
            if len(shape) != 8:
                return None
            count = struct.unpack('<Q', shape)[0]
            if (path / 'starts/data.ninja').stat().st_size != count * 8:
                return None
            total += count
        return total
    except (OSError, ValueError, struct.error):
        return None


def read_dataset_manifest(path: Path) -> list[DatasetInput]:
    try:
        document = json.loads(Path(path).read_text())
        if document['schema_version'] != 1 or not isinstance(document['datasets'], list):
            raise ValueError()
        rows = [DatasetInput(**row) for row in document['datasets']]
        if len({row.id for row in rows}) != len(rows):
            raise ValueError()
        return rows
    except (OSError, ValueError, TypeError, KeyError) as exc:
        raise ValidationError('Invalid dataset manifest') from exc


def _inputs(inputs):
    seen = set()
    for row in inputs:
        value = asdict(row) if isinstance(row, DatasetInput) else dict(row)
        if (value.get('split') not in ('train', 'evaluation') or
                not isinstance(value.get('id'), str) or
                not re.fullmatch(r'[a-z0-9][a-z0-9_-]{0,99}', value['id']) or
                value['id'] in seen or value.get('representation') not in ('audio', 'features') or
                not isinstance(value.get('adapter'), str) or
                not isinstance(value.get('path'), str) or not Path(value['path']).is_absolute() or
                not isinstance(value.get('fingerprint'), str) or
                not re.fullmatch(r'[0-9a-f]{64}', value['fingerprint'])):
            raise ValidationError('Invalid dataset input')
        seen.add(value['id'])
        yield value


def mww_dataset_features(inputs) -> list[dict]:
    rows = []
    for row in _inputs(inputs):
        if row['representation'] != 'features' or row['adapter'] != 'mww_mmap':
            raise ValidationError('Unsupported dataset for microWakeWord: requires mww_mmap features')
        evaluation = row['split'] == 'evaluation'
        rows.append(dict(features_dir=row['path'], penalty_weight=1.0,
                         sampling_weight=0.0 if evaluation else (5.0 if row['id'] == 'no_speech' else 12.0),
                         truncation_strategy='split' if evaluation else 'random', truth=False, type='mmap'))
    return rows


class DatasetService:
    def __init__(self, store, jobs: JobQueue, *, catalog=None):
        self.store, self.jobs = store, jobs
        entries = json.loads(Path(__file__).with_name('dataset_catalog.json').read_text()) if catalog is None else catalog
        self.catalog = {}
        for entry in entries:
            row = dict(entry)
            if (not re.fullmatch(r'[a-z0-9][a-z0-9_-]{0,99}', row['id']) or
                    row['id'] in self.catalog or row['split'] not in ('train', 'evaluation') or
                    row['representation'] not in ('features', 'audio') or
                    row['purpose'] != 'classifier_negative' or not row['url'].startswith('https://')):
                raise ValidationError('Invalid dataset catalog')
            self.catalog[row['id']] = row

    def _entry(self, dataset_id):
        if dataset_id not in self.catalog:
            raise NotFound('Dataset not found')
        return self.catalog[dataset_id]

    def _selected(self, db, word_id):
        row = db.execute("SELECT dataset_ids FROM studio_dataset_preferences WHERE word_id=? AND kind='negative'", (word_id,)).fetchone()
        if row:
            return set(json.loads(row[0]))
        return set(self.catalog)

    def list(self, word_id: str, search: str = '', status: str | None = None,
             offset: int = 0, limit: int = 50) -> Page[Dataset]:
        WorkspaceService(self.store).get(word_id)
        if (type(offset) is not int or type(limit) is not int or offset < 0 or not 1 <= limit <= 100 or
                not isinstance(search, str) or len(search) > 200 or
                status not in (None, 'available', 'installed', 'queued', 'running', 'failed', 'selected')):
            raise ValidationError('Invalid dataset query')
        with self.store.transaction() as db:
            selected = self._selected(db, word_id)
            installs = {r['dataset_id']: json.loads(r['manifest_json']) for r in db.execute('SELECT * FROM studio_dataset_installations')}
            latest = {}
            for job in db.execute("SELECT id,payload,status FROM studio_jobs WHERE kind='download' ORDER BY created_at,rowid"):
                latest[json.loads(job['payload']).get('dataset_id')] = job
        result = []
        for key, entry in sorted(self.catalog.items()):
            install, job = installs.get(key), latest.get(key)
            state = 'installed' if install else ('available' if job is None else job['status'])
            if state not in ('installed', 'queued', 'running', 'failed'):
                state = 'available'
            if (search.casefold() not in ' '.join(str(v) for v in entry.values()).casefold() or
                    (status == 'selected' and key not in selected) or
                    (status not in (None, 'selected') and status != state)):
                continue
            result.append(Dataset(**{k: entry[k] for k in ('id', 'name', 'description', 'source', 'license', 'representation', 'split', 'adapter', 'purpose', 'download_bytes')},
                                  installed_bytes=install['installed_bytes'] if install else None,
                                  fingerprint=install['input']['fingerprint'] if install else None,
                                  selected=key in selected, status=state, job_id=job['id'] if job else None,
                                  error_code='download_failed' if state == 'failed' else None,
                                  sample_count=(install.get('sample_count') if 'sample_count' in install else sample_count(Path(install['input']['path']), entry['adapter'])) if install else None))
        return Page(result[offset:offset + limit], len(result), offset, limit)

    def select(self, word_id: str, dataset_ids: list[str]) -> None:
        WorkspaceService(self.store).get(word_id)
        if not isinstance(dataset_ids, list) or any(not isinstance(key, str) for key in dataset_ids) or len(set(dataset_ids)) != len(dataset_ids):
            raise ValidationError('Invalid dataset selection')
        for key in dataset_ids:
            self._entry(key)
        with self.store.transaction() as db:
            db.execute('DELETE FROM studio_dataset_selections WHERE word_id=?', (word_id,))
            db.executemany('INSERT INTO studio_dataset_selections VALUES (?,?)', [(word_id, key) for key in dataset_ids])
            db.execute("INSERT INTO studio_dataset_preferences VALUES (?, 'negative', ?) ON CONFLICT(word_id,kind) DO UPDATE SET dataset_ids=excluded.dataset_ids",
                       (word_id, json.dumps(dataset_ids)))

    def download(self, dataset_id: str) -> Job:
        self._entry(dataset_id)
        # JobQueue's unique dedupe key arbitrates concurrent requests for an attempt.
        with self.store.transaction() as db:
            rows = db.execute("SELECT id,payload,status FROM studio_jobs WHERE kind='download'").fetchall()
        matching = [row for row in rows if json.loads(row['payload']).get('dataset_id') == dataset_id]
        for row in matching:
            if row['status'] in ('queued', 'running', 'cancelling'):
                return self.jobs.get(row['id'])
        return self.jobs.enqueue('download', None, {'dataset_id': dataset_id},
                                 dedupe_key=f'dataset:{dataset_id}:{len(matching)}')

    def execute(self, job, context) -> dict:
        entry = self._entry(job.payload.get('dataset_id'))
        if context.cancelled():
            return {}
        with open_directory(self.store.root / 'datasets' / 'staging'):
            pass
        with tempfile.TemporaryDirectory(prefix='download-', dir=self.store.root / 'datasets' / 'staging') as directory:
            archive = Path(directory) / 'archive.zip'
            context.log('Downloading classifier dataset')
            context.run(['curl', '--fail', '--location', '--proto', '=https', '--proto-redir', '=https',
                         '--connect-timeout', '30', '--max-time', '14400', '--max-filesize', str(100 * 1024**3),
                         '--output', str(archive), entry['url']])
            if context.cancelled():
                return {}
            snapshot = self.install_archive(entry['id'], archive, cancelled=context.cancelled)
            context.log('Dataset installed and fingerprinted')
            return {'dataset_id': entry['id'], 'fingerprint': snapshot.fingerprint}

    def install_archive(self, dataset_id: str, archive: Path, *, cancelled=lambda: False) -> DatasetInput:
        entry = self._entry(dataset_id)
        root = self.store.root / 'datasets'
        with open_directory(root / 'staging'):
            pass
        with open_directory(root / 'versions' / dataset_id):
            pass
        with tempfile.TemporaryDirectory(prefix='extract-', dir=root / 'staging') as directory:
            stage = Path(directory) / 'content'
            stage.mkdir()
            try:
                with zipfile.ZipFile(archive) as source:
                    members = source.infolist()
                    if len(members) > MAX_ARCHIVE_MEMBERS or sum(m.file_size for m in members) > MAX_EXTRACTED_BYTES:
                        raise ValidationError('Dataset archive exceeds installation limits')
                    seen = set()
                    for member in members:
                        path = PurePosixPath(member.filename)
                        mode = member.external_attr >> 16
                        if (not path.parts or path.is_absolute() or '..' in path.parts or
                                '\\' in member.filename or ':' in member.filename or
                                any(ord(c) < 32 for c in member.filename) or
                                (stat.S_IFMT(mode) not in (0, stat.S_IFREG, stat.S_IFDIR)) or
                                path.as_posix() in seen or path.parts[0] == '.studio-installation.json'):
                            raise ValidationError('Unsafe dataset archive member')
                        seen.add(path.as_posix())
                        if cancelled():
                            raise Conflict('Dataset installation cancelled')
                        target = stage.joinpath(*path.parts)
                        if member.is_dir():
                            target.mkdir(parents=True, exist_ok=True)
                        else:
                            target.parent.mkdir(parents=True, exist_ok=True)
                            with source.open(member) as reader, target.open('xb') as writer:
                                while True:
                                    if cancelled():
                                        raise Conflict('Dataset installation cancelled')
                                    block = reader.read(1024 * 1024)
                                    if not block:
                                        break
                                    writer.write(block)
                                writer.flush()
                                os.fsync(writer.fileno())
                content = stage / dataset_id if (stage / dataset_id).is_dir() else stage
                extension = {'mww_mmap': '*.ninja', 'wav': '*.wav'}.get(entry['adapter'])
                if extension is None or not any(content.rglob(extension)):
                    raise ValidationError('Dataset archive lacks supported feature/audio files')
                digest = hashlib.sha256(json.dumps(entry, sort_keys=True).encode())
                size = 0
                for file in sorted(stage.rglob('*')):
                    if file.is_file():
                        digest.update(file.relative_to(stage).as_posix().encode() + b'\0')
                        digest.update(str(file.stat().st_size).encode() + b'\0')
                        with file.open('rb') as handle:
                            for block in iter(lambda: handle.read(1024 * 1024), b''):
                                if cancelled():
                                    raise Conflict('Dataset installation cancelled')
                                digest.update(block)
                        size += file.stat().st_size
                fingerprint = digest.hexdigest()
                destination = root / 'versions' / dataset_id / fingerprint
                relative = content.relative_to(stage)
                value = DatasetInput(dataset_id, str(destination / relative), entry['representation'], entry['split'], entry['adapter'], fingerprint)
                manifest = json.dumps({'input': asdict(value), 'installed_bytes': size, 'catalog': entry,
                                       'sample_count': sample_count(content, entry['adapter'])}, sort_keys=True)
                with (stage / '.studio-installation.json').open('x') as handle:
                    handle.write(manifest + '\n')
                    handle.flush()
                    os.fsync(handle.fileno())
                for directory_path in sorted((p for p in stage.rglob('*') if p.is_dir()), reverse=True) + [stage]:
                    with open_directory(directory_path) as descriptor:
                        os.fsync(descriptor)
                # Publish content before committing its reference. Never replace retained versions.
                if cancelled():
                    raise Conflict('Dataset installation cancelled')
                with self.store.transaction() as db:
                    if not destination.exists():
                        stage.rename(destination)
                        with open_directory(destination.parent) as descriptor:
                            os.fsync(descriptor)
                    # Do not trust an existing fingerprint symlink or escaped input.
                    input_directory = destination / relative
                    with open_directory(input_directory):
                        pass
                    db.execute('INSERT INTO studio_dataset_installations VALUES (?,?,?) ON CONFLICT(dataset_id) DO UPDATE SET fingerprint=excluded.fingerprint,manifest_json=excluded.manifest_json',
                               (dataset_id, fingerprint, manifest))
                return value
            except (zipfile.BadZipFile, OSError, RuntimeError) as exc:
                raise ValidationError('Invalid dataset archive') from exc

    def require_installed(self, word_id: str) -> None:
        WorkspaceService(self.store).get(word_id)
        with self.store.transaction() as db:
            installed = {row[0] for row in db.execute('SELECT dataset_id FROM studio_dataset_installations')}
            missing = self._selected(db, word_id) - installed
        if missing:
            from studio.errors import OperationError
            raise OperationError('negative_datasets_missing')

    def snapshot(self, word_id: str, *, _db=None) -> list[DatasetInput]:
        from contextlib import nullcontext
        if _db is None:
            WorkspaceService(self.store).get(word_id)
        with (self.store.transaction() if _db is None else nullcontext(_db)) as db:
            selected = self._selected(db, word_id)
            installs = {row['dataset_id']: row['manifest_json'] for row in db.execute('SELECT dataset_id,manifest_json FROM studio_dataset_installations')}
            result = []
            for key in sorted(selected):
                self._entry(key)
                if key not in installs:
                    raise Conflict('Selected dataset is not installed')
                value = DatasetInput(**json.loads(installs[key])['input'])
                mww_dataset_features([value])
                if not Path(value.path).exists():
                    raise Conflict('Selected dataset installation is missing')
                path = Path(value.path)
                if path.is_symlink():
                    raise ValidationError('Unsafe dataset input path')
                with open_directory(path):
                    pass
                result.append(value)
            return result
