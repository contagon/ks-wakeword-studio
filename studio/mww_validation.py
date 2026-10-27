"""Lazy validation inputs for the pinned microWakeWord mmap feature providers.

Only labels/weights are materialized (a few bytes per example). Spectrograms
are obtained from upstream's generators and stacked one evaluation batch at a
time. The upstream validation function still owns all metric/reset logic.
"""

from itertools import islice

import numpy as np


def _provider_layout(provider, mode, features_length, strategy):
    """Count windows using mmap shapes, without converting/reading their data."""
    try:
        entries = provider.feature_sets[mode]
        loaded = provider.loaded_features
        first = entries[0]
        bins = loaded[first['loaded_feature_index']][first['subindex']].shape[1]
        strategy = provider.truncation_strategy if strategy == 'default' else strategy
        if strategy == 'split':
            # Match the pinned generator exactly, including its exclusive end.
            stride = int(1000 * provider.step * provider.stride)
            count = sum(len(range(0, loaded[item['loaded_feature_index']][item['subindex']].shape[0]
                                  - features_length, stride)) for item in entries)
        else:
            count = len(entries) * len(provider.fixed_right_cutoffs)
    except (AttributeError, IndexError, KeyError, TypeError) as exc:
        raise ValueError('Streaming validation requires compatible mmap feature providers') from exc
    return count, bins


class ValidationFeatures:
    """A repeatable, bounded-batch source rather than a whole-corpus array."""

    dtype = np.dtype(np.float32)

    def __init__(self, providers, mode, features_length, strategy, count, bins):
        self.providers = tuple(providers)
        self.mode, self.features_length, self.strategy = mode, features_length, strategy
        self.shape = (count, features_length, bins)

    def __len__(self):
        return self.shape[0]

    def batches(self, labels, batch_size):
        if batch_size < 1:
            raise ValueError('Validation batch size must be at least 1')
        if len(labels) != len(self):
            raise ValueError('Validation features and labels must have matching lengths')
        examples = self._examples()
        try:
            for offset in range(0, len(self), batch_size):
                size = min(batch_size, len(self) - offset)
                chunks = list(islice(examples, size))
                if len(chunks) != size:
                    raise ValueError('Validation provider example count changed during evaluation')
                if offset + size == len(self):
                    # Keras stops after its declared steps, so check exhaustion
                    # before yielding the final batch, not on a later next().
                    sentinel = object()
                    if next(examples, sentinel) is not sentinel:
                        raise ValueError('Validation provider example count changed during evaluation')
                batch = np.stack(chunks).astype(self.dtype, copy=False)
                del chunks
                yield batch, labels[offset:offset + size]
        finally:
            examples.close()

    def _examples(self):
        for provider, expected in self.providers:
            generator = provider.get_feature_generator(self.mode, self.features_length, self.strategy)
            count = 0
            try:
                for spectrogram in generator:
                    count += 1
                    if count > expected:
                        raise ValueError('Validation provider example count changed during evaluation')
                    if spectrogram.shape != self.shape[1:]:
                        raise ValueError('Unexpected validation spectrogram shape')
                    yield spectrogram
                if count != expected:
                    raise ValueError('Validation provider example count changed during evaluation')
            finally:
                generator.close()


class StreamingValidationHandler:
    """Validation-only adapter; the original handler remains untouched."""

    def __init__(self, handler):
        self.handler = handler

    def __getattr__(self, name):
        return getattr(self.handler, name)

    def get_data(self, mode, batch_size, features_length, truncation_strategy='default'):
        if mode not in ('validation', 'validation_ambient', 'testing', 'testing_ambient'):
            raise ValueError('Streaming validation adapter cannot load training data')
        if features_length < 1 or truncation_strategy == 'none':
            raise ValueError('Streaming validation requires fixed-length spectrograms')
        providers, labels, weights, bins = [], [], [], None
        for provider in self.handler.feature_providers:
            if not provider.get_mode_size(mode):
                continue
            count, provider_bins = _provider_layout(provider, mode, features_length, truncation_strategy)
            if not count:
                continue
            if bins is not None and bins != provider_bins:
                raise ValueError('Inconsistent validation spectrogram shape')
            bins = provider_bins
            providers.append((provider, count))
            labels.append(np.full(count, provider.label))
            weights.append(np.full(count, provider.penalty_weight))
        if not providers:
            raise ValueError(f'Cannot evaluate empty {mode} feature set')
        labels, weights = np.concatenate(labels), np.concatenate(weights)
        # Upstream shuffles validation, consuming NumPy's global RNG before the
        # next training interval. Preserve that RNG advancement, but do not copy
        # or randomly seek the large feature arrays: aggregate metrics are order
        # independent (up to floating-point summation differences).
        np.random.shuffle(np.arange(len(labels)))
        return (ValidationFeatures(providers, mode, features_length, truncation_strategy,
                                   len(labels), bins), labels, weights)
