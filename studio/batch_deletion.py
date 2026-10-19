"""Reference-aware generated dataset deletion with recoverable physical cleanup."""

import json
import os
import re
import shutil
import stat

from studio.models import Conflict, NotFound, ValidationError
from studio.storage import open_directory
from studio.workspace_deletion import _audio_gc


def _finish_cleanup(store, blobs, batch_id, hashes):
    with store.transaction() as db:
        for digest in hashes:
            if not db.execute('SELECT 1 FROM audio_records WHERE original_hash=? OR normalized_hash=? '
                              'UNION SELECT 1 FROM recording_conflicts WHERE original_hash=?',
                              (digest, digest, digest)).fetchone():
                try:
                    blobs.delete(digest)
                except FileNotFoundError:
                    pass
    # Keep job history and owner.lock. Only the generation scratch tree is ours.
    with open_directory(store.scoped_directory('jobs', batch_id)) as directory:
        try:
            mode = os.stat('generation', dir_fd=directory, follow_symlinks=False).st_mode
        except FileNotFoundError:
            pass
        else:
            if stat.S_ISDIR(mode):
                if not shutil.rmtree.avoids_symlink_attacks:
                    raise ValidationError('Safe filesystem cleanup unavailable')
                shutil.rmtree('generation', dir_fd=directory)
            else:
                os.unlink('generation', dir_fd=directory)
            os.fsync(directory)
    with open_directory(store.root / 'batch-deletions') as directory:
        os.unlink(batch_id, dir_fd=directory)
        os.fsync(directory)


def recover_batch_deletions(store, blobs):
    from studio.deployment import DeploymentService
    with DeploymentService(store, None, None)._lock('intent'):
        with open_directory(store.root / 'batch-deletions') as directory:
            for batch_id in os.listdir(directory):
                if not re.fullmatch(r'[0-9a-f]{32}', batch_id):
                    raise ValidationError('Unsafe batch deletion journal')
                with store.transaction() as db:
                    exists = db.execute('SELECT 1 FROM generation_batches WHERE id=?', (batch_id,)).fetchone()
                if exists:
                    # Prepared journal whose SQL transaction rolled back.
                    os.unlink(batch_id, dir_fd=directory)
                    os.fsync(directory)
                    continue
                fd = os.open(batch_id, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=directory)
                with os.fdopen(fd) as source:
                    if not stat.S_ISREG(os.fstat(source.fileno()).st_mode):
                        raise ValidationError('Unsafe batch deletion journal')
                    record = json.load(source)
                _finish_cleanup(store, blobs, batch_id, record['hashes'])


def delete_batch(store, blobs, word_id, batch_id):
    from studio.deployment import DeploymentService
    with DeploymentService(store, None, None)._lock('intent'):
        with store.transaction() as db:
            if not db.execute('SELECT 1 FROM generation_batches WHERE id=? AND word_id=?', (batch_id, word_id)).fetchone():
                raise NotFound('Batch not found')
            if db.execute("SELECT 1 FROM studio_jobs WHERE word_id=? AND status IN ('queued','running','cancelling')",
                          (word_id,)).fetchone():
                raise Conflict('Cancel active workspace jobs before deleting a dataset')
            if not re.fullmatch(r'[0-9a-f]{32}', batch_id):
                raise ValidationError('Unsafe batch identity')
            with open_directory(store.scoped_directory('jobs', batch_id)):
                pass
            audio = {row[0] for row in db.execute('SELECT audio_id FROM generation_batch_audio WHERE batch_id=?', (batch_id,))}
            db.execute('DELETE FROM generation_selection WHERE batch_id=?', (batch_id,))
            db.execute('DELETE FROM generation_batch_audio WHERE batch_id=?', (batch_id,))
            db.execute('DELETE FROM generation_batches WHERE id=?', (batch_id,))
            hashes = set()
            _audio_gc(db, audio, hashes)
            with open_directory(store.root / 'batch-deletions') as directory:
                fd = os.open(batch_id, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | os.O_NOFOLLOW, 0o600, dir_fd=directory)
                with os.fdopen(fd, 'w') as output:
                    json.dump({'hashes': sorted(hashes)}, output)
                    output.flush()
                    os.fsync(output.fileno())
                os.fsync(directory)
        _finish_cleanup(store, blobs, batch_id, hashes)
