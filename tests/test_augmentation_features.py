import importlib
from concurrent.futures import Future
from pathlib import Path
from unittest.mock import patch

import pytest


def api():
    return importlib.import_module('studio.augmentation_features')


def test_content_identity_and_seeds_ignore_paths_but_keep_duplicates_and_splits(tmp_path):
    a, b = tmp_path / 'a.wav', tmp_path / 'b.wav'
    a.write_bytes(b'one')
    b.write_bytes(b'one')
    records = api().recordings([a, b])
    assert [r['occurrence'] for r in records] == [0, 1]
    assert records[0]['sha256'] == records[1]['sha256']
    s = api().task_seed(10, 'generated', 'training', records[0], 0)
    assert s == api().task_seed(10, 'generated', 'training', api().recordings([b])[0], 0)
    assert s != api().task_seed(10, 'generated', 'testing', records[0], 0)
    assert s != api().task_seed(10, 'generated', 'training', records[1], 0)
    assert s != api().task_seed(10, 'generated', 'training', records[0], 1)
    options = dict(seed=10, pool='generated', split='training', config={'repeat': 2, 'slide_frames': 10},
                   policy={'gain': .8}, corpora={'music': 'abc'}, versions={'engine': 'pin'})
    identity = api().split_identity(records, **options)
    moved = [dict(r, path='/different/' + str(i)) for i, r in enumerate(records)]
    assert identity == api().split_identity(moved, seed=10, pool='generated', split='training',
        config={'repeat': 2, 'slide_frames': 10}, policy={'gain': .8}, corpora={'music': 'abc'}, versions={'engine': 'pin'})
    for key, changed in [('seed', 11), ('pool', 'personal'), ('split', 'testing'),
                         ('config', {'repeat': 1}), ('policy', {'gain': .9}),
                         ('corpora', {'music': 'changed'}), ('versions', {'engine': 'other'})]:
        assert api().split_identity(records, **dict(options, **{key: changed})) != identity
    b.write_bytes(b'changed')
    assert api().split_identity(api().recordings([a, b]), **options) != identity


def test_split_assignment_is_explicit_or_matches_legacy_seed_ten(tmp_path):
    files = []
    for i in range(10):
        p = tmp_path / f'{i:02}.wav'
        p.touch()
        files.append(p)
    assigned = {str(p.resolve()): 'testing' for p in files}
    selected = api().split_files(files, assigned)
    assert selected == {'training': [], 'validation': [], 'testing': files}
    with pytest.raises(ValueError, match='assignment'):
        api().split_files(files, {})
    legacy = api().split_files(files, None)
    assert [len(legacy[s]) for s in ('training', 'validation', 'testing')] == [8, 1, 1]
    assert set(sum(legacy.values(), [])) == set(files)


def test_ordered_worker_results_are_bounded_and_cancel_pending_on_close():
    class Pool:
        submitted = 0
        outstanding = 0
        maximum = 0
        futures = []
        def submit(self, fn, value):
            self.submitted += 1
            self.outstanding += 1
            self.maximum = max(self.maximum, self.outstanding)
            pool = self
            class Result(Future):
                def result(self):
                    pool.outstanding -= 1
                    return super().result()
            future = Result()
            future.set_result(value * 2)
            self.futures.append(future)
            return future
    pool = Pool()
    iterator = api().ordered_results(pool, lambda x: x * 2, range(100), limit=4)
    assert next(iterator) == 0
    assert pool.submitted == 4
    assert list(iterator) == list(range(2, 200, 2))
    assert pool.maximum == 4


def test_worker_failure_does_not_consume_all_input():
    class Pool:
        calls = 0
        def submit(self, fn, value):
            self.calls += 1
            f = Future()
            f.set_exception(RuntimeError('worker failed'))
            return f
    pool = Pool()
    with pytest.raises(RuntimeError, match='worker failed'):
        list(api().ordered_results(pool, str, range(100000), limit=4))
    assert pool.calls == 4


def test_worker_limit_respects_cpu_quota_and_explicit_diagnostic_override():
    with patch('os.sched_getaffinity', return_value=set(range(24))), \
         patch.object(Path, 'read_text', return_value='150000 100000'):
        assert api().worker_count() == 2
        assert api().worker_count(1) == 1
    with pytest.raises(ValueError, match='workers'):
        api().worker_count(0)
