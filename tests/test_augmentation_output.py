from pathlib import Path

import pytest

from studio import mww_augmentation as module


def build(path):
    path.mkdir()
    (path / 'data.ninja').write_bytes(b'features')
    return 2


def test_fresh_outputs_always_build_without_cache_metadata(tmp_path):
    calls = []
    def builder(path):
        calls.append(path)
        return build(path)
    for name in ('a', 'b'):
        result = module.write_features(tmp_path / name, builder, 2)
        assert result['examples'] == 2
        assert result['bytes'] == 8
        assert not {'key', 'hit', 'identity'} & result.keys()
    assert len(calls) == 2
    assert sorted(p.name for p in tmp_path.iterdir()) == ['a', 'b']


@pytest.mark.parametrize('failure', [RuntimeError, KeyboardInterrupt])
def test_failed_build_is_cleaned_up(tmp_path, failure):
    def broken(path):
        build(path)
        raise failure('cancelled')
    with pytest.raises(failure):
        module.write_features(tmp_path / 'out', broken, 2)
    assert list(tmp_path.iterdir()) == []


def test_count_mismatch_never_publishes(tmp_path):
    with pytest.raises(ValueError, match='count'):
        module.write_features(tmp_path / 'out', build, 3)
    assert list(tmp_path.iterdir()) == []


def test_existing_output_and_symlink_parents_are_not_overwritten(tmp_path):
    output = tmp_path / 'out'
    output.mkdir()
    (output / 'user.txt').write_text('keep')
    with pytest.raises(ValueError, match='exists'):
        module.write_features(output, build, 2)
    assert (output / 'user.txt').read_text() == 'keep'
    (tmp_path / 'link').symlink_to(output, target_is_directory=True)
    with pytest.raises(Exception, match='Unsafe|unsafe'):
        module.write_features(tmp_path / 'link/other', build, 2)
    assert not (output / 'other').exists()


def test_symlink_features_are_rejected(tmp_path):
    source = tmp_path / 'source'
    source.write_bytes(b'outside')
    def linked(path):
        path.mkdir()
        (path / 'data.ninja').symlink_to(source)
        return 2
    with pytest.raises(ValueError, match='regular'):
        module.write_features(tmp_path / 'out', linked, 2)
    assert not (tmp_path / 'out').exists()


@pytest.mark.parametrize('option', ['--cache-dir=/cache', '--no-cache'])
def test_removed_cache_options_are_rejected(option):
    with pytest.raises(SystemExit):
        module.parse_args([option])
