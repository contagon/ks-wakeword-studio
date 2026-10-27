#!/usr/bin/env python3
"""Run the pinned engine with streamed, bounded validation inputs.

Passing whole NumPy arrays to Keras evaluate can copy the entire validation
corpus onto the GPU before its batch_size takes effect. A generator-backed
dataset transfers only a batch at a time and leaves upstream metric logic intact.
The validation handler adapter also avoids assembling whole host feature arrays.
"""

from functools import wraps
from pathlib import Path
import runpy
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from studio.mww_validation import StreamingValidationHandler, ValidationFeatures


VALIDATION_BATCH_SIZE = 128


def evaluate_bounded(evaluate, features, labels, *, batch_size=VALIDATION_BATCH_SIZE, **kwargs):
    if batch_size < 1:
        raise ValueError('Validation batch size must be at least 1')
    if len(features) != len(labels):
        raise ValueError('Validation features and labels must have matching lengths')

    import tensorflow as tf

    def batches():
        if isinstance(features, ValidationFeatures):
            yield from features.batches(labels, batch_size)
            return
        for start in range(0, len(features), batch_size):
            yield features[start:start + batch_size], labels[start:start + batch_size]

    # Do not use from_tensor_slices: constructing it can eagerly tensorize the
    # full corpus. from_generator keeps the original arrays in host memory.
    dataset = tf.data.Dataset.from_generator(
        batches,
        output_signature=(
            tf.TensorSpec((None, *features.shape[1:]), tf.as_dtype(features.dtype)),
            tf.TensorSpec((None, *labels.shape[1:]), tf.as_dtype(labels.dtype)),
        ),
    )
    try:
        return evaluate(dataset, steps=(len(features) + batch_size - 1) // batch_size, **kwargs)
    finally:
        # TensorFlow can keep registered from_generator callbacks alive across
        # evaluations. Release their closure cells explicitly: otherwise every
        # validation pass retains another complete ordinary/ambient corpus.
        features = labels = None


def install_bounded_validation(train_module):
    original_validate = train_module.validate_nonstreaming

    @wraps(original_validate)
    def validate(config, data_processor, model, test_set):
        original_evaluate = model.evaluate

        def bounded(features, labels, **kwargs):
            kwargs.pop('batch_size', None)
            return evaluate_bounded(original_evaluate, features, labels,
                                    batch_size=VALIDATION_BATCH_SIZE, **kwargs)

        # Preserve upstream's resets and its accumulation across ordinary and
        # ambient evaluation. One evaluate call still scores each complete set.
        with train_module.swap_attribute(model, 'evaluate', bounded):
            return original_validate(config, StreamingValidationHandler(data_processor), model, test_set)

    train_module.validate_nonstreaming = validate


def main():
    from microwakeword import train

    install_bounded_validation(train)
    print(f'→ Validation streams mmap features in batches of at most {VALIDATION_BATCH_SIZE} examples', flush=True)
    runpy.run_module('microwakeword.model_train_eval', run_name='__main__')


if __name__ == '__main__':
    main()
