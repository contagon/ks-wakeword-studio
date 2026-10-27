import importlib
import json
import sys
from pathlib import Path
from unittest.mock import patch

import pytest


def api():
    return importlib.import_module('studio.mww_augmentation')


def test_selected_corpora_keep_existing_transform_settings():
    policy = api().augmentation_policy({'chime_16k': '/noise'}, ['chime_16k'])
    assert policy['background_paths'] == ['/noise']
    assert policy['impulse_paths'] == []
    assert policy['augmentation_probabilities']['AddBackgroundNoise'] == .7
    assert policy['augmentation_probabilities']['RIR'] == 0
    assert policy['augmentation_probabilities']['Gain'] == .8
    assert policy['background_min_snr_db'] == 5
    assert policy['background_max_snr_db'] == 10
    empty = api().augmentation_policy({}, [])
    assert empty['augmentation_probabilities']['AddBackgroundNoise'] == 0
    assert empty['augmentation_probabilities']['RIR'] == 0


def test_pool_cache_reuses_unchanged_splits_across_paths_and_negative_updates(tmp_path):
    module = api()
    source = tmp_path / 'audio'
    source.mkdir()
    files = []
    for i, split in enumerate(('training', 'validation', 'testing')):
        p = source / f'{i}.wav'
        p.write_bytes(f'audio{i}'.encode())
        files.append(p)
    assignments = {str(p.resolve()): s for p, s in zip(files, ('training', 'validation', 'testing'))}
    calls = []
    class Builder:
        def write(self, path, records, *, config, seed, pool, split):
            calls.append((pool, split))
            path.mkdir()
            (path / 'data.ninja').write_bytes(b'features')
            return len(records) * config['repeat'] * config['slide_frames']
    report = []
    kwargs = dict(cache_root=tmp_path / 'cache', assignments=assignments, seed=10,
                  policy={}, corpora={}, versions={'engine': 'one'}, builder=Builder(), report=report)
    module.generate_pool(source, tmp_path / 'first', 'generated', **kwargs)
    assert calls == [('generated', s) for s in ('training', 'validation', 'testing')]
    assert [r['examples'] for r in report] == [20, 10, 1]
    assert report[0]['identity']['versions'] == {'engine': 'one'}
    report.clear()
    module.generate_pool(source, tmp_path / 'second', 'generated', **kwargs)
    assert len(calls) == 3
    assert all(r['hit'] for r in report)
    new = source / 'negative.wav'
    new.write_bytes(b'new negative')
    assignments[str(new.resolve())] = 'training'
    report.clear()
    module.generate_pool(source, tmp_path / 'negative', 'reviewed negatives', **kwargs)
    assert [r['hit'] for r in report] == [False, False, False]
    report.clear()
    # A different negative pool does not invalidate generated features.
    new.unlink()
    module.generate_pool(source, tmp_path / 'third', 'generated', **kwargs)
    assert all(r['hit'] for r in report)


def test_empty_splits_are_skipped_without_building_cache_entries(tmp_path):
    source = tmp_path / 'audio'
    source.mkdir()
    p = source / 'only.wav'
    p.write_bytes(b'one')
    class Builder:
        def write(self, path, records, **kwargs):
            path.mkdir()
            (path / 'data.ninja').write_bytes(b'one')
            return 1
    reports = []
    assert api().generate_pool(source, tmp_path / 'out', 'personal', cache_root=tmp_path / 'cache',
        assignments={str(p.resolve()): 'testing'}, seed=10, policy={}, corpora={}, versions={},
        builder=Builder(), report=reports)
    assert [p.name for p in (tmp_path / 'out').iterdir()] == ['testing']
    assert reports[0]['split'] == 'testing'
    assert reports[0]['identity']['seed'] == 10
    assert not api().generate_pool(tmp_path / 'missing', tmp_path / 'none', 'generated',
        cache_root=tmp_path / 'cache', assignments={}, seed=10, policy={}, corpora={}, versions={},
        builder=Builder(), report=[])


def test_warm_cache_does_not_invoke_or_import_ml_builder(tmp_path):
    module = api()
    source = tmp_path / 'audio'
    source.mkdir()
    p = source / 'one.wav'
    p.write_bytes(b'one')
    class Builder:
        def write(self, path, records, **kwargs):
            path.mkdir()
            (path / 'data.ninja').write_bytes(b'one')
            return 20
    kwargs = dict(cache_root=tmp_path / 'cache', assignments={str(p.resolve()): 'training'},
                  seed=10, policy={}, corpora={}, versions={}, builder=Builder(), report=[])
    module.generate_pool(source, tmp_path / 'a', 'generated', **kwargs)
    with patch.object(kwargs['builder'], 'write', side_effect=AssertionError('ML builder must not run')):
        module.generate_pool(source, tmp_path / 'b', 'generated', **kwargs)
    assert kwargs['report'][-1]['hit']


def test_cli_accepts_existing_explicit_paths_and_worker_bounds(tmp_path):
    args = api().parse_args([f'--data-dir={tmp_path}', '--augmentation-ids=', '--workers=1'])
    assert args.workers == 1
    assert args.input_dir == tmp_path / 'work/wake_word_samples'
    assert args.cache_dir == tmp_path / '.cache/mww-augmentation/v1'
    with pytest.raises(SystemExit):
        api().parse_args([f'--data-dir={tmp_path}', '--workers=5'])


@pytest.mark.parametrize('dependency', ['soxr', 'numpy-rms', 'numpy-minmax'])
def test_numerical_dependency_upgrade_changes_runtime_identity(tmp_path, dependency):
    from types import SimpleNamespace
    engine = tmp_path / 'engine'
    engine.mkdir()
    (engine / '__init__.py').write_text('')
    module = api()
    with patch.object(module.importlib.util, 'find_spec', return_value=SimpleNamespace(
            submodule_search_locations=[str(engine)])), \
         patch.object(module.importlib.metadata, 'version', return_value='1'):
        before = module.runtime_versions()
        with patch.object(module.importlib.metadata, 'version',
                          side_effect=lambda name: '2' if name == dependency else '1'):
            after = module.runtime_versions()
    assert before != after
    assert after[dependency] == '2'


def test_worker_corpus_order_is_relative_sorted_and_keeps_corpus_precedence(tmp_path):
    from studio import augmentation_worker as worker
    roots = [tmp_path / name for name in ('z-corpus', 'a-corpus')]
    for root in roots:
        for name in ('z/one.wav', 'a/two.wav'):
            path = root / name
            path.parent.mkdir(parents=True)
            path.touch()
    # Simulate the dependency's unsorted os.walk directory discovery, with the
    # same corpus contents returned in opposite orders after relocation.
    def discover(root):
        return [root / 'z/one.wav', root / 'a/two.wav']
    policy = dict(background_paths=list(map(str, roots)), impulse_paths=[str(roots[0])], gain=.8)
    result = worker.canonical_policy(policy, discover)
    assert result['background_paths'] == [str(root / name) for root in roots
                                          for name in ('a/two.wav', 'z/one.wav')]
    assert result['impulse_paths'] == result['background_paths'][:2]
    assert result['gain'] == .8
    assert policy['background_paths'] == list(map(str, roots))
    assert worker.canonical_policy(policy, lambda root: list(reversed(discover(root)))) == result
