"""Spawn-worker entry points. Keep this module free of import-time ML imports."""

import hashlib
import io
import os
from pathlib import Path
import random


_state = None


def canonical_policy(policy, discover):
    """Use the dependency's supported files, never its os.walk discovery order.

    Preserve selected-corpus precedence while sorting relative paths within each
    corpus so relocation/creation order cannot change seeded file selection.
    """
    result = dict(policy)
    for key in ('background_paths', 'impulse_paths'):
        result[key] = []
        for directory in policy[key]:
            root = Path(directory).absolute()
            paths = sorted(discover(root), key=lambda path: str(Path(path).relative_to(root)))
            result[key].extend(str(path) for path in paths)
    return result


def initialize(policy):
    global _state
    # Force these before importing NumPy/TensorFlow in this fresh spawn process.
    os.environ['CUDA_VISIBLE_DEVICES'] = ''
    for name in ('OMP_NUM_THREADS', 'OPENBLAS_NUM_THREADS', 'MKL_NUM_THREADS',
                 'TF_NUM_INTRAOP_THREADS', 'TF_NUM_INTEROP_THREADS'):
        os.environ[name] = '1'
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    import numpy as np
    import librosa
    import tensorflow as tf
    from microwakeword.audio.augmentation import Augmentation
    from microwakeword.audio.audio_utils import generate_features_for_clip
    from audiomentations.core.utils import find_audio_files_in_paths
    tf.config.set_visible_devices([], 'GPU')
    policy = canonical_policy(policy, find_audio_files_in_paths)
    _state = (np, librosa, tf, Augmentation(**policy), generate_features_for_clip)


def process_clip(task):
    np, librosa, tf, augmenter, frontend = _state
    with open(task['path'], 'rb') as source:
        audio = source.read()
    if hashlib.sha256(audio).hexdigest() != task['sha256']:
        raise ValueError('Audio changed after augmentation input hashing')
    random.seed(task['seed'])
    np.random.seed(task['seed'])
    tf.random.set_seed(task['seed'])
    samples, _ = librosa.load(io.BytesIO(audio), sr=16000, mono=True)
    features = frontend(augmenter.augment_clip(samples.astype(np.float32, copy=False)), step_ms=10)
    return dict(features=features, pid=os.getpid(), gpu_count=len(tf.config.get_visible_devices('GPU')))
