"""Verified, immutable augmentation features with atomic cache/run publication."""

import errno
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import time
from uuid import uuid4

from studio.storage import ensure_directory, flock, fsync_directories


def encoded(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False)


def digest(path):
    if not stat.S_ISREG(path.lstat().st_mode):
        raise ValueError('Augmentation cache requires regular files, not links')
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()


def inventory(root):
    ensure_directory(root)
    result = {}
    for path in sorted(root.rglob('*')):
        mode = path.lstat().st_mode
        if stat.S_ISDIR(mode):
            continue
        result[str(path.relative_to(root))] = dict(size=path.lstat().st_size, sha256=digest(path))
    if not result or not any(Path(name).name == 'data.ninja' for name in result):
        raise ValueError('Augmentation feature output is empty or invalid')
    return result


def _check_count(identity, examples):
    if type(examples) is not int or examples < 1:
        raise ValueError('Augmentation feature count must be positive')
    if 'recordings' in identity and 'config' in identity:
        expected = len(identity['recordings']) * identity['config']['repeat'] * identity['config']['slide_frames']
        if examples != expected:
            raise ValueError('Augmentation feature count does not match its recipe')


def verify(entry, key, identity):
    ensure_directory(entry)
    manifest = entry / 'manifest.json'
    try:
        digest(manifest)  # Also reject symlinks before reading metadata.
        value = json.loads(manifest.read_text())
        if (value['schema_version'] != 1 or value['key'] != key or value['identity'] != identity
                or value['files'] != inventory(entry / 'features')):
            raise ValueError('Augmentation cache integrity check failed')
        _check_count(identity, value['examples'])
    except (OSError, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise ValueError('Augmentation cache integrity check failed') from exc
    return value


def _clone(source, destination):
    def link_or_copy(src, dst):
        try:
            os.link(src, dst)
        except OSError as exc:
            if exc.errno not in (errno.EXDEV, errno.EPERM, errno.EOPNOTSUPP):
                raise
            shutil.copyfile(src, dst)
        Path(dst).chmod(0o400)
        with open(dst, 'rb') as output:
            os.fsync(output.fileno())
    shutil.copytree(source, destination, copy_function=link_or_copy)


def _publish(source, destination):
    ensure_directory(destination.parent)
    stage = destination.parent / ('.partial-' + uuid4().hex)
    try:
        _clone(source, stage)
        fsync_directories(stage)
        if destination.exists() or destination.is_symlink():
            raise ValueError('Augmentation output already exists; use a fresh output directory')
        stage.rename(destination)
        fsync_directories(destination.parent)
    finally:
        if stage.exists():
            shutil.rmtree(stage)


def materialize(cache_root, identity, destination, build):
    """Call build(path)->example_count only on a miss; never replace user outputs.

    Corrupt entries fail closed with an actionable integrity error. No automatic
    eviction/removal of retained entries or historical runs is performed.
    """
    destination = Path(destination)
    if destination.exists() or destination.is_symlink():
        raise ValueError('Augmentation output already exists; use a fresh output directory')
    key = hashlib.sha256(encoded(identity).encode()).hexdigest()
    started = time.monotonic()
    if cache_root is None:
        ensure_directory(destination.parent)
        stage = destination.parent / ('.partial-' + uuid4().hex)
        try:
            examples = build(stage)
            files = inventory(stage)
            _check_count(identity, examples)
            for path in stage.rglob('*'):
                if path.is_file():
                    with path.open('rb') as handle:
                        os.fsync(handle.fileno())
            fsync_directories(stage)
            stage.rename(destination)
            fsync_directories(destination.parent)
            return dict(key=key, hit=False, examples=examples, bytes=sum(v['size'] for v in files.values()),
                        seconds=time.monotonic() - started)
        finally:
            if stage.exists():
                shutil.rmtree(stage)
    cache_root = Path(cache_root)
    ensure_directory(cache_root)
    with flock(cache_root / 'locks', key):
        entry = cache_root / key
        hit = entry.exists() or entry.is_symlink()
        if hit:
            metadata = verify(entry, key, identity)
        else:
            stage = cache_root / ('.partial-' + uuid4().hex)
            ensure_directory(stage)
            try:
                examples = build(stage / 'features')
                files = inventory(stage / 'features')
                _check_count(identity, examples)
                metadata = dict(schema_version=1, key=key, identity=identity, examples=examples, files=files)
                (stage / 'manifest.json').write_text(encoded(metadata))
                for path in stage.rglob('*'):
                    if path.is_file():
                        with path.open('rb') as handle:
                            os.fsync(handle.fileno())
                        path.chmod(0o400)
                fsync_directories(stage)
                stage.rename(entry)
                fsync_directories(cache_root)
            finally:
                if stage.exists():
                    shutil.rmtree(stage)
        _publish(entry / 'features', destination)
    return dict(key=key, hit=hit, examples=metadata['examples'],
                bytes=sum(v['size'] for v in metadata['files'].values()), seconds=time.monotonic() - started)
