import errno
import importlib
import json
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

import pytest


def api():
    return importlib.import_module('studio.augmentation_cache')


def build(path):
    path.mkdir()
    (path / 'data.ninja').write_bytes(b'features')
    (path / 'shape.json').write_text('[2, 178, 40]')
    return 2


def test_cache_reuses_verified_content_and_materializes_read_only_links(tmp_path):
    calls = []
    def builder(path):
        calls.append(path)
        return build(path)
    first = api().materialize(tmp_path / 'cache', {'seed': 10}, tmp_path / 'a', builder)
    second = api().materialize(tmp_path / 'cache', {'seed': 10}, tmp_path / 'b', builder)
    assert not first['hit'] and second['hit']
    assert first['key'] == second['key']
    assert len(calls) == 1
    assert second['examples'] == 2
    assert (tmp_path / 'a/data.ninja').read_bytes() == b'features'
    assert (tmp_path / 'a/data.ninja').stat().st_ino == (tmp_path / 'b/data.ninja').stat().st_ino
    assert (tmp_path / 'a/data.ninja').stat().st_mode & 0o222 == 0


def test_corruption_is_rejected_not_used_as_a_hit(tmp_path):
    first = api().materialize(tmp_path / 'cache', {'seed': 10}, tmp_path / 'a', build)
    path = tmp_path / 'cache' / first['key'] / 'features/data.ninja'
    path.chmod(0o600)
    path.write_bytes(b'corrupt')
    with pytest.raises(ValueError, match='integrity'):
        api().materialize(tmp_path / 'cache', {'seed': 10}, tmp_path / 'b', build)
    assert not (tmp_path / 'b').exists()


@pytest.mark.parametrize('failure', [RuntimeError, KeyboardInterrupt])
def test_failed_or_cancelled_build_never_publishes_partial_entry(tmp_path, failure):
    def broken(path):
        build(path)
        raise failure('cancelled')
    with pytest.raises(failure):
        api().materialize(tmp_path / 'cache', {'seed': 10}, tmp_path / 'a', broken)
    assert not (tmp_path / 'a').exists()
    assert not list((tmp_path / 'cache').glob('.partial-*'))
    result = api().materialize(tmp_path / 'cache', {'seed': 10}, tmp_path / 'a', build)
    assert not result['hit']


def test_concurrent_identical_requests_build_once(tmp_path):
    calls = []
    def builder(path):
        calls.append(path)
        return build(path)
    def request(i):
        return api().materialize(tmp_path / 'cache', {'seed': 10}, tmp_path / str(i), builder)
    with ThreadPoolExecutor(max_workers=2) as pool:
        outcomes = list(pool.map(request, range(2)))
    assert len(calls) == 1
    assert sorted(o['hit'] for o in outcomes) == [False, True]


def test_cache_refuses_unsafe_paths_and_does_not_replace_existing_outputs(tmp_path):
    target = tmp_path / 'outside'
    target.mkdir()
    (tmp_path / 'cache').symlink_to(target, target_is_directory=True)
    with pytest.raises(Exception, match='Unsafe|unsafe'):
        api().materialize(tmp_path / 'cache', {}, tmp_path / 'output', build)
    assert not list(target.iterdir())
    output = tmp_path / 'existing'
    output.mkdir()
    (output / 'user.txt').write_text('keep')
    with pytest.raises(ValueError, match='exists'):
        api().materialize(tmp_path / 'safe', {}, output, build)
    assert (output / 'user.txt').read_text() == 'keep'


def test_cache_rejects_symlink_features_and_manifest_tampering(tmp_path):
    def linked(path):
        path.mkdir()
        (path / 'data.ninja').symlink_to(tmp_path / 'external')
        return 1
    (tmp_path / 'external').write_text('secret')
    with pytest.raises(ValueError, match='regular|link'):
        api().materialize(tmp_path / 'cache', {}, tmp_path / 'out', linked)
    outcome = api().materialize(tmp_path / 'cache', {}, tmp_path / 'out', build)
    manifest = tmp_path / 'cache' / outcome['key'] / 'manifest.json'
    manifest.chmod(0o600)
    value = json.loads(manifest.read_text())
    value['identity'] = {'different': True}
    manifest.write_text(json.dumps(value))
    with pytest.raises(ValueError, match='integrity'):
        api().materialize(tmp_path / 'cache', {}, tmp_path / 'other', build)


def test_cross_filesystem_materialization_copies_verified_content(tmp_path):
    with patch('os.link', side_effect=OSError(errno.EXDEV, 'different filesystem')):
        result = api().materialize(tmp_path / 'cache', {}, tmp_path / 'out', build)
    assert not result['hit']
    assert (tmp_path / 'out/data.ninja').read_bytes() == b'features'


def test_no_cache_still_publishes_atomically(tmp_path):
    result = api().materialize(None, {}, tmp_path / 'out', build)
    assert not result['hit']
    assert (tmp_path / 'out/data.ninja').read_bytes() == b'features'


def test_split_manifest_count_must_match_recipe_on_build_and_hit(tmp_path):
    identity = {'recordings': [{'sha256': 'a'}], 'config': {'repeat': 1, 'slide_frames': 2}}
    result = api().materialize(tmp_path / 'cache', identity, tmp_path / 'a', build)
    metadata = tmp_path / 'cache' / result['key'] / 'manifest.json'
    metadata.chmod(0o600)
    value = json.loads(metadata.read_text())
    value['examples'] = 99
    metadata.write_text(json.dumps(value))
    with pytest.raises(ValueError, match='integrity|count'):
        api().materialize(tmp_path / 'cache', identity, tmp_path / 'b', build)
    with pytest.raises(ValueError, match='count'):
        api().materialize(tmp_path / 'other-cache', dict(identity, recordings=[]), tmp_path / 'c', build)
