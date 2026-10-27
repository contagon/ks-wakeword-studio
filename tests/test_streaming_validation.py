"""Validation input streaming without eager whole-corpus feature arrays."""

import importlib
import contextlib
import importlib.util
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import numpy as np
import pytest


def adapter(handler):
    module = importlib.import_module('studio.mww_validation')
    return module.StreamingValidationHandler(handler)


class Provider:
    def __init__(self, raw, examples, *, label=1.0, cutoffs=(0,), step=.01, stride=2):
        self.label = label
        self.penalty_weight = 1.25 if not label else 1.0
        self.fixed_right_cutoffs = list(cutoffs)
        self.step, self.stride = step, stride
        self.truncation_strategy = 'truncate_start'
        self.loaded_features = [raw]
        entries = [dict(loaded_feature_index=0, subindex=i) for i in range(len(raw))]
        self.feature_sets = {mode: entries for mode in ('validation', 'validation_ambient')}
        self.examples, self.calls, self.produced = examples, [], 0

    def get_mode_size(self, mode):
        return len(self.feature_sets.get(mode, ()))

    def get_feature_generator(self, mode, features_length, truncation_strategy):
        self.calls.append((mode, features_length, truncation_strategy))
        for example in self.examples:
            self.produced += 1
            yield example


def handler(*providers):
    class Handler:
        feature_providers = providers

        def get_data(self, *args, **kwargs):
            raise AssertionError('Eager full-corpus loader must never be called')

        def get_mode_size(self, mode):
            return sum(p.get_mode_size(mode) for p in providers)

        def get_mode_duration(self, mode):
            return 123.0
    return Handler()


def test_streams_multiple_providers_lazily_with_labels_weights_and_partial_batch():
    examples = [np.full((4, 2), i, dtype=np.float32) for i in (1, 2, 3)]
    positive = Provider(examples[:2], examples[:2])
    negative = Provider(examples[2:], examples[2:], label=0.0)
    source, labels, weights = adapter(handler(positive, negative)).get_data(
        'validation', batch_size=16, features_length=4, truncation_strategy='truncate_start')
    assert not isinstance(source, np.ndarray)
    assert source.shape == (3, 4, 2)
    assert positive.produced == negative.produced == 0
    np.testing.assert_array_equal(labels, [1, 1, 0])
    np.testing.assert_array_equal(weights, [1, 1, 1.25])
    iterator = source.batches(labels.reshape(-1, 1), batch_size=2)
    features, truths = next(iterator)
    np.testing.assert_array_equal(features[:, 0, 0], [1, 2])
    np.testing.assert_array_equal(truths[:, 0], [1, 1])
    assert negative.produced == 0
    features, truths = next(iterator)
    np.testing.assert_array_equal(features[:, 0, 0], [3])
    np.testing.assert_array_equal(truths[:, 0], [0])
    with pytest.raises(StopIteration):
        next(iterator)
    assert positive.calls == [('validation', 4, 'truncate_start')]


@pytest.mark.parametrize(('lengths', 'count'), [([4, 5, 24, 25], 4), ([44], 2), ([45], 3)])
def test_ambient_counts_match_exclusive_split_endpoint_and_provider_stride(lengths, count):
    raw = [np.zeros((n, 2), dtype=np.float32) for n in lengths]
    expected = [np.full((4, 2), i, dtype=np.float32) for i in range(count)]
    provider = Provider(raw, expected, label=0.0)
    source, labels, _ = adapter(handler(provider)).get_data(
        'validation_ambient', batch_size=16, features_length=4, truncation_strategy='split')
    assert len(source) == count
    batches = list(source.batches(labels.reshape(-1, 1), batch_size=2))
    assert sum(len(batch[0]) for batch in batches) == count
    assert provider.calls == [('validation_ambient', 4, 'split')]


def test_fixed_cutoffs_are_counted_and_generators_can_be_replayed():
    raw = [np.zeros((9, 2), dtype=np.float32)]
    expected = [np.full((4, 2), n, dtype=np.float32) for n in (2, 3)]
    provider = Provider(raw, expected, cutoffs=(0, 1))
    source, labels, _ = adapter(handler(provider)).get_data(
        'validation', batch_size=16, features_length=4, truncation_strategy='truncate_start')
    assert len(source) == 2
    for _ in range(2):
        batches = list(source.batches(labels.reshape(-1, 1), batch_size=128))
        np.testing.assert_array_equal(batches[0][0][:, 0, 0], [2, 3])


def test_empty_providers_are_ignored_and_mode_stats_are_forwarded():
    empty = SimpleNamespace(get_mode_size=lambda mode: 0)
    example = np.zeros((4, 2), dtype=np.float32)
    proxy = adapter(handler(empty, Provider([example], [example])))
    assert proxy.get_mode_duration('validation_ambient') == 123.0
    source, labels, _ = proxy.get_data('validation', batch_size=16, features_length=4,
                                     truncation_strategy='truncate_start')
    assert len(source) == len(labels) == 1


def test_preserves_numpy_rng_consumption_of_upstream_validation_shuffle():
    example = np.zeros((4, 2), dtype=np.float32)
    state = np.random.get_state()
    try:
        np.random.seed(123)
        np.random.shuffle(np.arange(7))
        expected = np.random.random()
        np.random.seed(123)
        adapter(handler(Provider([example] * 7, [example] * 7))).get_data(
            'validation', batch_size=16, features_length=4, truncation_strategy='truncate_start')
        assert np.random.random() == expected
    finally:
        np.random.set_state(state)


def test_training_cannot_accidentally_use_validation_adapter():
    with pytest.raises(ValueError, match='validation'):
        adapter(handler()).get_data('training', batch_size=16, features_length=4)


def test_no_split_windows_fail_clearly_instead_of_reporting_empty_metrics():
    raw = [np.zeros((4, 2), dtype=np.float32)]
    with pytest.raises(ValueError, match='empty'):
        adapter(handler(Provider(raw, [], label=0))).get_data(
            'validation_ambient', batch_size=16, features_length=4, truncation_strategy='split')


def test_wrong_provider_output_shape_fails_without_silent_padding_or_dropping():
    raw = [np.zeros((4, 2), dtype=np.float32)]
    source, labels, _ = adapter(handler(Provider(raw, [np.zeros((3, 2), np.float32)]))).get_data(
        'validation', batch_size=16, features_length=4, truncation_strategy='truncate_start')
    with pytest.raises(ValueError, match='shape'):
        list(source.batches(labels.reshape(-1, 1), batch_size=128))


@pytest.mark.parametrize(('expected', 'actual'), [(3, 2), (2, 3), (128, 129), (128, 127)])
def test_provider_count_mismatch_is_detected_before_final_batch(expected, actual):
    example = np.ones((4, 2), np.float32)
    source, labels, _ = adapter(handler(Provider([example] * expected, [example] * actual))).get_data(
        'validation', batch_size=16, features_length=4, truncation_strategy='truncate_start')
    with pytest.raises(ValueError, match='count'):
        # Match Keras: it asks for exactly the declared number of batches, not
        # an extra next() after the last one to discover iterator exhaustion.
        batches = source.batches(labels.reshape(-1, 1), batch_size=128)
        for _ in range((expected + 127) // 128):
            next(batches)


class ClosingProvider(Provider):
    closed = False
    fail = False

    def get_feature_generator(self, *args):
        try:
            for example in super().get_feature_generator(*args):
                if self.fail:
                    raise RuntimeError('provider failed')
                yield example
        finally:
            self.closed = True


def test_provider_generator_closes_when_batch_consumer_stops_early():
    example = np.ones((4, 2), np.float32)
    provider = ClosingProvider([example] * 3, [example] * 3)
    source, labels, _ = adapter(handler(provider)).get_data(
        'validation', batch_size=16, features_length=4, truncation_strategy='truncate_start')
    batches = source.batches(labels.reshape(-1, 1), batch_size=1)
    next(batches)
    assert not provider.closed
    batches.close()
    assert provider.closed


@pytest.mark.parametrize('failure', ['shape', 'count', 'provider'])
def test_provider_generator_closes_when_evaluation_input_fails(failure):
    example = np.ones((4, 2), np.float32)
    examples = [np.ones((3, 2), np.float32)] if failure == 'shape' else [example]
    raw = [example] * (2 if failure == 'count' else 1)
    provider = ClosingProvider(raw, examples)
    provider.fail = failure == 'provider'
    source, labels, _ = adapter(handler(provider)).get_data(
        'validation', batch_size=16, features_length=4, truncation_strategy='truncate_start')
    with pytest.raises((ValueError, RuntimeError), match=failure):
        list(source.batches(labels.reshape(-1, 1), batch_size=128))
    assert provider.closed


def test_provider_generator_closes_after_successful_complete_evaluation():
    example = np.ones((4, 2), np.float32)
    provider = ClosingProvider([example], [example])
    source, labels, _ = adapter(handler(provider)).get_data(
        'validation', batch_size=16, features_length=4, truncation_strategy='truncate_start')
    list(source.batches(labels.reshape(-1, 1), batch_size=128))
    assert provider.closed


def test_launcher_routes_upstream_validation_through_stream_without_eager_loading():
    spec = importlib.util.spec_from_file_location('streaming_launcher',
        Path(__file__).resolve().parents[1] / 'cli/train_mww.py')
    launcher = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(launcher)
    positive = np.ones((4, 2), np.float32)
    negative = np.zeros((4, 2), np.float32)
    p = Provider([positive] * 3, [positive] * 3)
    n = Provider([np.zeros((45, 2), np.float32)], [negative] * 3, label=0)
    p.feature_sets['validation_ambient'] = []
    n.feature_sets['validation'] = []
    original_handler = handler(p, n)

    @contextlib.contextmanager
    def swap_attribute(obj, name, value):
        old = getattr(obj, name)
        setattr(obj, name, value)
        try:
            yield
        finally:
            setattr(obj, name, old)

    class Model:
        def reset_metrics(self):
            self.positives = self.total = 0

        def evaluate(self, dataset, *, steps, return_dict, verbose):
            self.reset_metrics()
            for features, labels in dataset:
                assert len(features) <= 128
                self.total += len(features)
                self.positives += int(labels.sum())
            return dict(total=self.total, positives=self.positives)

    def original_validate(config, data, model, test_set):
        x, y, _ = data.get_data(test_set, batch_size=16, features_length=4,
                                truncation_strategy='truncate_start')
        first = model.evaluate(x, y.reshape(-1, 1), batch_size=1024, return_dict=True, verbose=0)
        x, y, _ = data.get_data(test_set + '_ambient', batch_size=16, features_length=4,
                                truncation_strategy='split')
        with swap_attribute(model, 'reset_metrics', lambda: None):
            combined = model.evaluate(x, y.reshape(-1, 1), batch_size=1024, return_dict=True, verbose=0)
        return first, combined

    class Dataset:
        @staticmethod
        def from_generator(generator, output_signature):
            return generator()

    tf = SimpleNamespace(data=SimpleNamespace(Dataset=Dataset),
        TensorSpec=lambda shape, dtype: (shape, dtype), as_dtype=lambda dtype: dtype)
    engine = SimpleNamespace(validate_nonstreaming=original_validate, swap_attribute=swap_attribute)
    model = Model()
    old_evaluate = model.evaluate
    launcher.install_bounded_validation(engine)
    with patch.dict(sys.modules, {'tensorflow': tf}):
        result = engine.validate_nonstreaming({}, original_handler, model, 'validation')
    assert result == ({'total': 3, 'positives': 3}, {'total': 6, 'positives': 3})
    assert model.evaluate == old_evaluate
    assert original_handler.feature_providers == (p, n)
