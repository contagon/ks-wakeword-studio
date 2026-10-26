#!/usr/bin/env python3
"""Write the microWakeWord training config for one run.

Classifier negatives come from an explicit dataset manifest (Studio), which
replaces the stock negative datasets entirely, or from the stock datasets.
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from studio.datasets import mww_dataset_features, read_dataset_manifest
from studio.models import ValidationError

# Stock negative dataset -> (sampling weight, truncation strategy).
STOCK_NEGATIVES = {'speech': (12.0, 'random'), 'dinner_party': (12.0, 'random'),
                   'no_speech': (5.0, 'random'), 'dinner_party_eval': (0.0, 'split')}


def feature(path, sampling_weight, truth, truncation_strategy, penalty_weight=1.0):
    return {'features_dir': str(path), 'penalty_weight': penalty_weight, 'sampling_weight': sampling_weight,
            'truncation_strategy': truncation_strategy, 'truth': truth, 'type': 'mmap'}


def training_config(args):
    features = []
    # Real recordings get 3/5 of positive draws when both positive pools exist.
    if args.generated_dir:
        features.append(feature(args.generated_dir, 2.0, True, 'truncate_start'))
    if args.personal_dir:
        features.append(feature(args.personal_dir, 3.0, True, 'truncate_start'))
    if args.reviewed_negative_dir:
        features.append(feature(args.reviewed_negative_dir, 8.0, False, 'random', 1.25))
    if args.dataset_manifest:
        features += mww_dataset_features(read_dataset_manifest(args.dataset_manifest))
    else:
        features += [feature(args.stock_negatives_dir / name, weight, False, truncation)
                     for name, (weight, truncation) in STOCK_NEGATIVES.items()]
    return {
        'batch_size': 16,
        'clip_duration_ms': 1500,
        'eval_step_interval': args.eval_step_interval,
        'features': features,
        'freq_mask_count': [0],
        'freq_mask_max_size': [0],
        'learning_rates': [0.001],
        'maximization_metric': 'average_viable_recall',
        'minimization_metric': None,
        'negative_class_weight': [20],
        'positive_class_weight': [1],
        'target_minimization': 0.9,
        'time_mask_count': [0],
        'time_mask_max_size': [0],
        'train_dir': str(args.work_dir / 'trained_models/wakeword'),
        'training_steps': [args.training_steps],
        'window_step_ms': 10,
    }


def main():
    import yaml

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--work-dir', type=Path, required=True)
    parser.add_argument('--training-steps', type=int, required=True)
    parser.add_argument('--eval-step-interval', type=int, required=True)
    parser.add_argument('--generated-dir', type=Path)
    parser.add_argument('--personal-dir', type=Path)
    parser.add_argument('--reviewed-negative-dir', type=Path)
    negatives = parser.add_mutually_exclusive_group(required=True)
    negatives.add_argument('--dataset-manifest', type=Path)
    negatives.add_argument('--stock-negatives-dir', type=Path)
    args = parser.parse_args()
    try:
        args.output.write_text(yaml.safe_dump(training_config(args), sort_keys=False))
    except ValidationError as exc:
        parser.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    main()
