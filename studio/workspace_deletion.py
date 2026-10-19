"""Explicit, workspace-scoped destruction. Never follows stored archive paths.

The deployment intent flock covers the entire operation (including physical
cleanup). Staged remote bytes are not removed: quarantine their device so a later
publication cannot accidentally commit deleted workspace bytes.
"""

import hashlib
import json
import os
import re
import shutil
import stat
from uuid import uuid4

from studio.models import Conflict, NotFound, ValidationError
from studio.storage import BlobStore, normalize_audio, open_directory


def source_key(device_id, clip_id):
    return hashlib.sha256(json.dumps([device_id, clip_id], ensure_ascii=True).encode()).hexdigest()


def source_deleted(store, device_id, clip_id, db=None):
    if db is None:
        with store.transaction() as connection:
            return source_deleted(store, device_id, clip_id, connection)
    with open_directory(store.root / 'deleted-sources') as directory:
        try:
            fd = os.open(source_key(device_id, clip_id), os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=directory)
        except FileNotFoundError:
            return False
        with os.fdopen(fd, 'r') as marker:
            if not stat.S_ISREG(os.fstat(marker.fileno()).st_mode):
                raise ValidationError('Unsafe source tombstone')
            word_id = marker.read(33)
        if not re.fullmatch(r'[0-9a-f]{32}', word_id):
            raise ValidationError('Invalid source tombstone')
        # A prepared marker only takes effect if the SQL deletion committed.
        # Rollback/crash-before-commit cannot suppress surviving recordings.
        return db.execute('SELECT 1 FROM wakewords WHERE id=?', (word_id,)).fetchone() is None


def _remove_tree(store, category, identity):
    # All identities come from DB primary keys, never manifests or user paths.
    if not re.fullmatch(r'[0-9a-f]{32}', identity):
        raise ValidationError('Unsafe workspace storage identifier')
    with open_directory(store.root / category) as parent:
        try:
            mode = os.stat(identity, dir_fd=parent, follow_symlinks=False).st_mode
        except FileNotFoundError:
            return
        if stat.S_ISDIR(mode):
            # Python's fd-based implementation resists nested symlink swaps.
            if not shutil.rmtree.avoids_symlink_attacks:
                raise ValidationError('Safe filesystem cleanup unavailable')
            shutil.rmtree(identity, dir_fd=parent)
        else:
            os.unlink(identity, dir_fd=parent)
        os.fsync(parent)


def _audio_gc(db, candidates, hashes):
    """Only collect the affected lineage, preserving all surviving references."""
    audio = {r['id']: dict(r) for r in db.execute('SELECT * FROM audio_records')}
    # Ancestors can be retained only by trim history; descendants may be undone.
    changed = True
    while changed:
        before = len(candidates)
        for identity, row in audio.items():
            if identity in candidates and row['parent_id']:
                candidates.add(row['parent_id'])
            if row['parent_id'] in candidates:
                candidates.add(identity)
        changed = len(candidates) != before
    used = set()
    for table, column in (('samples', 'audio_id'), ('recordings', 'audio_id'),
                          ('sample_history', 'old_audio_id'), ('sample_history', 'new_audio_id'),
                          ('generation_batch_audio', 'audio_id')):
        used.update(r[0] for r in db.execute(f'SELECT {column} FROM {table}'))
    for row in db.execute('SELECT manifest FROM training_runs'):
        used.update(a['audio_id'] for a in json.loads(row[0]).get('audio', []) if 'audio_id' in a)
    # An immutable surviving derivative must retain its ancestors as well.
    todo = list(used)
    while todo:
        row = audio.get(todo.pop())
        if row and row['parent_id'] and row['parent_id'] not in used:
            used.add(row['parent_id'])
            todo.append(row['parent_id'])
    removable = (candidates & audio.keys()) - used
    families = {audio[i]['family_id'] for i in removable}
    for identity in removable:
        hashes.update((audio[identity]['original_hash'], audio[identity]['normalized_hash']))
    # Children before parents: foreign keys remain enabled throughout.
    while removable:
        parents = {audio[i]['parent_id'] for i in removable}
        leaves = removable - parents
        if not leaves:
            raise ValidationError('Invalid audio lineage')
        db.executemany('DELETE FROM audio_records WHERE id=?', [(i,) for i in leaves])
        removable -= leaves
    for family in families:
        if not db.execute('SELECT 1 FROM audio_records WHERE family_id=?', (family,)).fetchone():
            db.execute('DELETE FROM audio_families WHERE family_id=?', (family,))
            db.execute('DELETE FROM training_family_splits WHERE family_id=?', (family,))
    hashes.difference_update(r[0] for r in db.execute('SELECT original_hash FROM audio_records UNION SELECT normalized_hash FROM audio_records UNION SELECT original_hash FROM recording_conflicts'))


def _finish_cleanup(store, blobs, word_id, jobs, hashes):
    with store.transaction() as db:
        for digest in hashes:
            if not db.execute('SELECT 1 FROM audio_records WHERE original_hash=? OR normalized_hash=? UNION SELECT 1 FROM recording_conflicts WHERE original_hash=?', (digest, digest, digest)).fetchone():
                try:
                    blobs.delete(digest)
                except FileNotFoundError:
                    pass
    for job_id in jobs:
        _remove_tree(store, 'jobs', job_id)
        _remove_tree(store, 'runs', job_id)
    _remove_tree(store, 'models', word_id)
    with open_directory(store.root / 'workspace-deletions') as directory:
        os.unlink(word_id, dir_fd=directory)
        os.fsync(directory)


def recover_workspace_deletions(store, blobs):
    """Complete committed cleanup after a crash; ignore rolled-back deletions."""
    from studio.deployment import DeploymentService
    with DeploymentService(store, None, None)._lock('intent'):
        with open_directory(store.root / 'workspace-deletions') as directory:
            for word_id in os.listdir(directory):
                if not re.fullmatch(r'[0-9a-f]{32}', word_id):
                    raise ValidationError('Unsafe deletion journal')
                with store.transaction() as db:
                    exists = db.execute('SELECT 1 FROM wakewords WHERE id=?', (word_id,)).fetchone()
                if exists:
                    os.unlink(word_id, dir_fd=directory)
                    os.fsync(directory)
                    continue
                fd = os.open(word_id, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=directory)
                with os.fdopen(fd) as handle:
                    if not stat.S_ISREG(os.fstat(handle.fileno()).st_mode):
                        raise ValidationError('Unsafe deletion journal')
                    record = json.load(handle)
                _finish_cleanup(store, blobs, word_id, record['jobs'], record['hashes'])


def delete_workspace(store, word_id, blobs=None):
    from studio.deployment import DeploymentService

    blobs = blobs or BlobStore(store.root / 'blobs')
    # Same cross-process gate as publish/reconcile/retry, in the same lock order.
    with DeploymentService(store, None, None)._lock('intent'):
        with store.transaction() as db:
            if not db.execute('SELECT 1 FROM wakewords WHERE id=?', (word_id,)).fetchone():
                raise NotFound('Workspace not found')
            if db.execute("SELECT 1 FROM studio_jobs WHERE word_id=? AND status IN ('queued','running','cancelling')", (word_id,)).fetchone():
                raise Conflict('Cancel active workspace jobs before deleting')
            jobs = {r[0] for r in db.execute('SELECT id FROM studio_jobs WHERE word_id=? UNION SELECT id FROM training_runs WHERE word_id=?', (word_id, word_id))}
            if any(not re.fullmatch(r'[0-9a-f]{32}', identity) for identity in jobs | {word_id}):
                raise ValidationError('Unsafe workspace storage identifier')
            # Refuse symlinked storage parents before any metadata is removed.
            for category in ('jobs', 'runs', 'models'):
                with open_directory(store.root / category):
                    pass
            samples = 'SELECT id FROM samples WHERE word_id=?'
            recordings = 'SELECT id FROM recordings WHERE word_id=?'
            batches = 'SELECT id FROM generation_batches WHERE word_id=?'
            versions = 'SELECT id FROM model_versions WHERE word_id=?'
            audio = {r[0] for r in db.execute('SELECT audio_id FROM samples WHERE word_id=? UNION SELECT audio_id FROM recordings WHERE word_id=?', (word_id, word_id))}
            audio.update(r[0] for r in db.execute(f'SELECT old_audio_id FROM sample_history WHERE sample_id IN ({samples}) UNION SELECT new_audio_id FROM sample_history WHERE sample_id IN ({samples})', (word_id, word_id)))
            audio.update(r[0] for r in db.execute(f'SELECT audio_id FROM generation_batch_audio WHERE batch_id IN ({batches})', (word_id,)))
            # A deleted generated batch can leave audio retained only by a run
            # snapshot. Capture those identities before removing run history.
            for row in db.execute('SELECT manifest FROM training_runs WHERE word_id=?', (word_id,)):
                audio.update(item['audio_id'] for item in json.loads(row[0]).get('audio', []) if 'audio_id' in item)
            hashes = {r[0] for r in db.execute(f'SELECT original_hash FROM recording_conflicts WHERE recording_id IN ({recordings})', (word_id,))}
            # Conflicts retain their raw hash but ingest also published a decoded
            # blob. Recover that exact candidate from these sources only; never
            # sweep unrelated orphan content.
            for digest in tuple(hashes):
                try:
                    content = blobs.read(digest)
                except FileNotFoundError:
                    continue
                hashes.add(hashlib.sha256(normalize_audio(content, blobs.max_bytes)).hexdigest())
            # Minimal opaque source tombstones contain no recording/audio data.
            with open_directory(store.root / 'deleted-sources') as directory:
                for row in db.execute('SELECT device_id,clip_id FROM recordings WHERE word_id=?', (word_id,)):
                    temporary = '.partial-' + uuid4().hex
                    fd = os.open(temporary, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600, dir_fd=directory)
                    try:
                        with os.fdopen(fd, 'wb') as marker:
                            marker.write(word_id.encode('ascii'))
                            marker.flush()
                            os.fsync(marker.fileno())
                        try:
                            os.link(temporary, source_key(*row), src_dir_fd=directory, dst_dir_fd=directory, follow_symlinks=False)
                        except FileExistsError:
                            pass
                    finally:
                        os.unlink(temporary, dir_fd=directory)
                os.fsync(directory)
            db.execute("INSERT OR IGNORE INTO deployment_staging_blocks SELECT device_id,'workspace_deleted' FROM deployment_staging WHERE word_id=?", (word_id,))
            for table in ('publications', 'publication_history', 'deployment_intents', 'deployment_staging'):
                db.execute(f'DELETE FROM {table} WHERE word_id=?', (word_id,))
            for table in ('deployment_events', 'legacy_model_validations', 'migration_model_provenance'):
                db.execute(f'DELETE FROM {table} WHERE version_id IN ({versions})', (word_id,))
            db.execute('DELETE FROM model_versions WHERE word_id=?', (word_id,))
            db.execute('DELETE FROM training_runs WHERE word_id=?', (word_id,))
            for table in ('sample_history', 'migration_sample_provenance'):
                db.execute(f'DELETE FROM {table} WHERE sample_id IN ({samples})', (word_id,))
            db.execute('DELETE FROM samples WHERE word_id=?', (word_id,))
            db.execute(f'DELETE FROM recording_conflicts WHERE recording_id IN ({recordings})', (word_id,))
            db.execute('DELETE FROM recordings WHERE word_id=?', (word_id,))
            db.execute(f'DELETE FROM generation_selection WHERE word_id=? OR batch_id IN ({batches})', (word_id, word_id))
            db.execute(f'DELETE FROM generation_batch_audio WHERE batch_id IN ({batches})', (word_id,))
            db.execute('DELETE FROM generation_batches WHERE word_id=?', (word_id,))
            for table in ('generation_recipes', 'training_settings', 'studio_dataset_selections',
                          'source_mappings', 'migration_imports', 'migration_source_claims'):
                db.execute(f'DELETE FROM {table} WHERE word_id=?', (word_id,))
            scopes = {r[0] for r in db.execute('SELECT scope FROM studio_schedules') if r[0].endswith(':' + word_id)}
            for scope in scopes:
                db.execute('DELETE FROM studio_schedule_occurrences WHERE scope=?', (scope,))
                db.execute('DELETE FROM studio_schedules WHERE scope=?', (scope,))
            db.execute('DELETE FROM studio_schedule_occurrences WHERE job_id IN (SELECT id FROM studio_jobs WHERE word_id=?)', (word_id,))
            db.execute('DELETE FROM studio_jobs WHERE word_id=?', (word_id,))
            db.execute('DELETE FROM wakewords WHERE id=?', (word_id,))
            _audio_gc(db, audio, hashes)
            # Fsync before SQL commit. Recovery checks whether SQL committed;
            # rolled-back operations never authorize physical cleanup.
            with open_directory(store.root / 'workspace-deletions') as directory:
                try:
                    os.unlink(word_id, dir_fd=directory)
                except FileNotFoundError:
                    pass
                fd = os.open(word_id, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600, dir_fd=directory)
                with os.fdopen(fd, 'w') as handle:
                    json.dump({'jobs': sorted(jobs), 'hashes': sorted(hashes)}, handle)
                    handle.flush()
                    os.fsync(handle.fileno())
                os.fsync(directory)
        # Never run a global orphan sweep. Only hashes belonging to this deletion.
        _finish_cleanup(store, blobs, word_id, jobs, hashes)
