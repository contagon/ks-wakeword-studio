"""Bounded validation must preserve every example and cumulative metrics."""

import contextlib
import gc
import importlib.util
import sys
import types
import weakref
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pytest


SCRIPT = Path(__file__).resolve().parents[1] / 'cli/train_mww.py'


def load_launcher():
    spec = importlib.util.spec_from_file_location('train_mww', SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_evaluation_is_batched_without_dropping_tail_or_resetting_metrics():
    launcher = load_launcher()
    # Stand in only for TensorFlow's transport; consume the real generator.
    class Dataset:
        @staticmethod
        def from_generator(generator, output_signature):
            return generator()

    tf = types.SimpleNamespace(
        data=types.SimpleNamespace(Dataset=Dataset),
        TensorSpec=lambda shape, dtype: (shape, dtype), as_dtype=lambda dtype: dtype,
    )
    seen = []

    def evaluate(dataset, *, return_dict, verbose, steps=None):
        assert steps == 3  # Keras must know when finite generator evaluation ends.
        total = 0
        for features, labels in dataset:
            seen.append(len(features))
            assert len(features) <= 128
            np.testing.assert_array_equal(features[:, 0], labels[:, 0])
            total += int(labels.sum())
        return {'sum': total}

    features = np.arange(259, dtype=np.float32).reshape(-1, 1)
    with patch.dict(sys.modules, {'tensorflow': tf}):
        result = launcher.evaluate_bounded(evaluate, features, features.copy(),
                                          batch_size=128, return_dict=True, verbose=0)
    assert result == {'sum': 33411}
    assert seen == [128, 128, 3]


def test_validation_wrapper_is_scoped_and_preserves_upstream_metric_accumulation():
    launcher = load_launcher()

    @contextlib.contextmanager
    def swap_attribute(obj, attr, value):
        original = getattr(obj, attr)
        setattr(obj, attr, value)
        try:
            yield
        finally:
            setattr(obj, attr, original)

    class Model:
        def __init__(self):
            self.total = 0

        def evaluate(self, features, labels, **kwargs):
            self.total += int(labels.sum())
            return {'total': self.total}

    def upstream_validate(config, handler, model, mode):
        features = np.ones((5, 1), dtype=np.float32)
        first = model.evaluate(features, features, batch_size=1024, return_dict=True, verbose=0)
        second = model.evaluate(features, features, batch_size=1024, return_dict=True, verbose=0)
        assert first == {'total': 5}
        return second

    engine = types.SimpleNamespace(validate_nonstreaming=upstream_validate,
                                   swap_attribute=swap_attribute)
    model = Model()
    original_evaluate = model.evaluate
    launcher.install_bounded_validation(engine)

    # Replace dataset transport with actual bounded iteration for this scope test.
    def evaluate(evaluate_fn, features, labels, *, batch_size, **kwargs):
        result = None
        for offset in range(0, len(features), batch_size):
            result = evaluate_fn(features[offset:offset + batch_size],
                                 labels[offset:offset + batch_size], **kwargs)
        return result

    with patch.object(launcher, 'evaluate_bounded', evaluate):
        result = engine.validate_nonstreaming({}, None, model, 'validation')
    assert result == {'total': 10}
    assert model.evaluate == original_evaluate


def test_wrapper_restores_evaluate_when_validation_fails():
    launcher = load_launcher()
    # Use the real upstream-style attribute scope rather than a global patch.
    @contextlib.contextmanager
    def swap_attribute(obj, attr, value):
        original = getattr(obj, attr)
        setattr(obj, attr, value)
        try:
            yield
        finally:
            setattr(obj, attr, original)

    def fail(*args):
        raise RuntimeError('validation failed')

    engine = types.SimpleNamespace(validate_nonstreaming=fail, swap_attribute=swap_attribute)
    model = types.SimpleNamespace(evaluate=lambda *args: None)
    original = model.evaluate
    launcher.install_bounded_validation(engine)
    with pytest.raises(RuntimeError, match='validation failed'):
        engine.validate_nonstreaming({}, None, model, 'validation')
    assert model.evaluate is original


@pytest.mark.parametrize('batch_size', [0, -1])
def test_invalid_batch_size_fails_clearly(batch_size):
    launcher = load_launcher()
    with pytest.raises(ValueError, match='batch size'):
        launcher.evaluate_bounded(None, np.zeros((1, 1)), np.zeros((1, 1)), batch_size=batch_size)


@pytest.mark.parametrize('fails', [False, True])
def test_retained_tensorflow_generator_cannot_retain_validation_corpora(fails):
    launcher = load_launcher()
    retained_generators = []

    class Dataset:
        @staticmethod
        def from_generator(generator, output_signature):
            # TensorFlow's registered generator callbacks can outlive evaluate.
            retained_generators.append(generator)
            return generator

    tf = types.SimpleNamespace(data=types.SimpleNamespace(Dataset=Dataset),
        TensorSpec=lambda shape, dtype: (shape, dtype), as_dtype=lambda dtype: dtype)

    def evaluate(dataset, **kwargs):
        if fails:
            raise RuntimeError('evaluation failed')
        for _ in dataset():
            pass
        return {'recall': 1.0}

    with patch.dict(sys.modules, {'tensorflow': tf}):
        for _ in range(8):
            features = np.ones((257, 4), dtype=np.float32)
            labels = np.ones((257, 1), dtype=np.float32)
            references = [weakref.ref(features), weakref.ref(labels)]
            if fails:
                with pytest.raises(RuntimeError, match='evaluation failed'):
                    launcher.evaluate_bounded(evaluate, features, labels)
            else:
                launcher.evaluate_bounded(evaluate, features, labels)
            del features, labels
            gc.collect()
            assert all(ref() is None for ref in references), 'Generator retained a completed validation corpus'
    assert len(retained_generators) == 8
