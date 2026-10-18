"""Retained raw augmentation corpora, distinct from classifier feature inputs."""
import hashlib
import json
import os
import shutil
import stat
import fcntl
from pathlib import Path
from uuid import uuid4

from studio.models import AugmentationInput, ValidationError
from studio.storage import open_directory


RESOURCES = {'mit_rirs_16k': 'setup_mit_audio', 'audioset_16k': 'setup_audioset',
             'fma_16k': 'setup_fma', 'chime_16k': 'setup_chime'}


def tree_fingerprint(root):
    files = []
    if root.is_symlink() or not root.is_dir():
        raise ValidationError('Missing or unsafe augmentation corpus')
    with open_directory(root):
        pass
    for path in sorted(root.rglob('*')):
        mode = path.lstat().st_mode
        if stat.S_ISDIR(mode):
            continue
        if not stat.S_ISREG(mode):
            raise ValidationError('Augmentation corpora must contain only real directories and regular files')
        digest = hashlib.sha256()
        with path.open('rb') as handle:
            for block in iter(lambda: handle.read(1024 * 1024), b''):
                digest.update(block)
        files.append((str(path.relative_to(root)), digest.hexdigest()))
    if not files:
        raise ValidationError('Empty augmentation corpus; complete its setup before training')
    return hashlib.sha256(json.dumps(files, separators=(',', ':')).encode()).hexdigest()


def snapshot(store):
    with open_directory(store.root) as directory:
        fd = os.open('augmentation.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600, dir_fd=directory)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX)
        return _snapshot(store)
    finally:
        os.close(fd)


def _snapshot(store):
    result = []
    parent = store.root / 'augmentation'
    with open_directory(parent):
        pass
    for name, setup in RESOURCES.items():
        source = store.root.parent / 'training_datasets' / name
        if not source.is_dir() or source.is_symlink():
            raise ValidationError(f'Missing augmentation corpus {name}; run bash cli/{setup} --data-dir={store.root.parent} before training')
        fingerprint = tree_fingerprint(source)
        target = parent / fingerprint
        if not target.exists():
            stage = parent / ('.partial-' + uuid4().hex)
            try:
                shutil.copytree(source, stage, symlinks=True)
                if tree_fingerprint(stage) != fingerprint:
                    raise ValidationError('Augmentation installation changed during snapshot; retry after setup completes')
                for path in stage.rglob('*'):
                    if path.is_file():
                        with path.open('rb') as handle:
                            os.fsync(handle.fileno())
                        path.chmod(0o400)
                for directory in sorted([stage, *[p for p in stage.rglob('*') if p.is_dir()]], key=lambda p: len(p.parts), reverse=True):
                    with open_directory(directory) as fd:
                        os.fsync(fd)
                stage.rename(target)
                with open_directory(parent) as fd:
                    os.fsync(fd)
            finally:
                if stage.exists():
                    shutil.rmtree(stage)
        if tree_fingerprint(target) != fingerprint:
            raise ValidationError('Retained augmentation corpus checksum mismatch')
        result.append(AugmentationInput(name, str(target), fingerprint))
    return tuple(result)


def pinned_paths(manifest):
    inputs = manifest.get('augmentation', [])
    if {item['id'] for item in inputs} != set(RESOURCES) or len(inputs) != len(RESOURCES):
        raise ValidationError('Missing pinned augmentation inputs; create a new execution snapshot after corpus setup')
    paths = {}
    for item in inputs:
        path = Path(item['path'])
        if tree_fingerprint(path) != item['fingerprint']:
            raise ValidationError('Retained augmentation corpus checksum mismatch')
        paths[item['id']] = path
    return paths
