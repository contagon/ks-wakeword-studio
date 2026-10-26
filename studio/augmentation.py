"""Retained raw augmentation corpora, distinct from classifier feature inputs."""
import hashlib
import json
import os
import shutil
import stat
from pathlib import Path
from uuid import uuid4

from studio.models import AugmentationInput, ValidationError
from studio.storage import ensure_directory, flock, fsync_directories, open_directory


# Corpus id -> (display name, description, source). The id also names the
# corpus directory and the augmenter's --<id>-dir flag; cli/prepare_corpus.py
# downloads and converts each one.
CATALOG = {
    'mit_rirs_16k': ('MIT room impulse responses', 'Room echoes and reverberation.',
                     'MIT environmental impulse responses (Hugging Face mirror)'),
    'audioset_16k': ('AudioSet', 'Everyday environmental background sounds.',
                     'AudioSet balanced training subset (agkphysics mirror)'),
    'fma_16k': ('Free Music Archive', 'Music mixed behind wakeword recordings.',
                'FMA small, with an extra-small fallback mirror'),
    'chime_16k': ('CHiME-Home', 'Real household background recordings.',
                  'CHiME-Home (Internet Archive mirror)'),
}


def tree_fingerprint(root):
    files = []
    if root.is_symlink() or not root.is_dir():
        raise ValidationError('Missing or unsafe augmentation corpus')
    ensure_directory(root)
    for path in sorted(root.rglob('*')):
        mode = path.lstat().st_mode
        if stat.S_ISDIR(mode):
            continue
        if not stat.S_ISREG(mode):
            raise ValidationError('Augmentation corpora must contain only real directories and regular files')
        with path.open('rb') as handle:
            files.append((str(path.relative_to(root)), hashlib.file_digest(handle, 'sha256').hexdigest()))
    if not files:
        raise ValidationError('Empty augmentation corpus; complete its setup before training')
    return hashlib.sha256(json.dumps(files, separators=(',', ':')).encode()).hexdigest()


def snapshot(store, selected_ids=None):
    selected = list(CATALOG) if selected_ids is None else list(selected_ids)
    if any(name not in CATALOG for name in selected) or len(set(selected)) != len(selected):
        raise ValidationError('Invalid augmentation selection')
    with flock(store.root, 'augmentation.lock'):
        return _snapshot(store, selected)


def _snapshot(store, selected):
    result = []
    parent = store.root / 'augmentation'
    ensure_directory(parent)
    for name in CATALOG:
        if name not in selected:
            continue
        source = store.data_dir / 'training_datasets' / name
        if not source.is_dir() or source.is_symlink():
            raise ValidationError(f'Missing augmentation corpus {name}; run {store.data_dir}/.venv/bin/python '
                                  f'cli/prepare_corpus.py --corpus={name} --data-dir={store.data_dir} before training')
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
                fsync_directories(stage)
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
    inputs = manifest.get('augmentation')
    if (not isinstance(inputs, list) or any(not isinstance(item, dict) or item.get('id') not in CATALOG for item in inputs)
            or len({item['id'] for item in inputs}) != len(inputs)):
        raise ValidationError('Missing pinned augmentation inputs; create a new execution snapshot after corpus setup')
    paths = {}
    for item in inputs:
        path = Path(item['path'])
        if tree_fingerprint(path) != item['fingerprint']:
            raise ValidationError('Retained augmentation corpus checksum mismatch')
        paths[item['id']] = path
    return paths
