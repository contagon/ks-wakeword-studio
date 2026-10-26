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

PERSONAL_NEGATIVE_MIN_SHARE = 0.10
PERSONAL_NEGATIVE_MAX_SHARE = 0.40
PERSONAL_NEGATIVE_MIDPOINT = 200
NEGATIVE_SAMPLING_WEIGHT = 37.0


def feature(path, sampling_weight, truth, truncation_strategy, penalty_weight=1.0):
    return {'features_dir': str(path), 'penalty_weight': penalty_weight, 'sampling_weight': sampling_weight,
            'truncation_strategy': truncation_strategy, 'truth': truth, 'type': 'mmap'}


def personal_negative_share(family_count: int) -> float:
    if type(family_count) is not int or family_count < 0:
        raise ValidationError('Reviewed negative training-family count must be a non-negative integer')
    if not family_count:
        return 0.0
    return (PERSONAL_NEGATIVE_MIN_SHARE
            + (PERSONAL_NEGATIVE_MAX_SHARE - PERSONAL_NEGATIVE_MIN_SHARE)
            * family_count / (family_count + PERSONAL_NEGATIVE_MIDPOINT))


def negative_features(args):
    reviewed_dir = args.reviewed_negative_dir
    has_training = reviewed_dir is not None and any(
        path.stat().st_size > 0 for path in (reviewed_dir / 'training').glob('**/*_mmap/data.ninja'))
    count = args.reviewed_negative_families
    if has_training and (count is None or count == 0):
        raise ValidationError('Reviewed negative training features require a positive training-family count')
    count = 0 if count is None else count
    target_share = personal_negative_share(count)
    if count and not has_training:
        raise ValidationError('Reviewed negative family count requires personal training features')

    if args.dataset_manifest:
        downloaded = mww_dataset_features(read_dataset_manifest(args.dataset_manifest))
    else:
        downloaded = [feature(args.stock_negatives_dir / name, weight, False, truncation)
                      for name, (weight, truncation) in STOCK_NEGATIVES.items()]
    downloaded_weight = sum(row['sampling_weight'] for row in downloaded)
    effective_share = (target_share if downloaded_weight else 1.0) if has_training else 0.0
    total_weight = NEGATIVE_SAMPLING_WEIGHT if has_training or downloaded_weight else 0.0
    for row in downloaded:
        if row['sampling_weight']:
            row['sampling_weight'] *= total_weight * (1 - effective_share) / downloaded_weight
    reviewed = ([feature(reviewed_dir, total_weight * effective_share, False, 'random', 1.25)]
                if reviewed_dir else [])
    return reviewed + downloaded, dict(training_families=count, target_personal_share=target_share,
                                      effective_personal_share=effective_share, total_weight=total_weight)


def training_config(args):
    if args.training_steps < 1:
        raise ValidationError('Training steps must be at least 1')
    # Match upstream's 75% primary / 25% low-rate finish without changing
    # the requested total. Preserve support for one-step smoke tests.
    finetune_steps = max(1, args.training_steps // 4) if args.training_steps > 1 else 0
    steps = [args.training_steps - finetune_steps]
    rates = [0.001]
    if finetune_steps:
        steps.append(finetune_steps)
        rates.append(0.00025)
    features = []
    # Real recordings get 3/5 of positive draws when both positive pools exist.
    if args.generated_dir:
        features.append(feature(args.generated_dir, 2.0, True, 'truncate_start'))
    if args.personal_dir:
        features.append(feature(args.personal_dir, 3.0, True, 'truncate_start'))
    negatives, sampling = negative_features(args)
    features += negatives
    return {
        'batch_size': 16,
        'clip_duration_ms': 1500,
        'eval_step_interval': args.eval_step_interval,
        'features': features,
        'negative_sampling': sampling,
        'freq_mask_count': [0],
        'freq_mask_max_size': [0],
        'learning_rates': rates,
        'maximization_metric': 'average_viable_recall',
        'minimization_metric': None,
        'negative_class_weight': [20],
        'positive_class_weight': [1],
        'target_minimization': 0.9,
        'time_mask_count': [0],
        'time_mask_max_size': [0],
        'train_dir': str(args.work_dir / 'trained_models/wakeword'),
        'training_steps': steps,
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
    parser.add_argument('--reviewed-negative-families', type=int)
    negatives = parser.add_mutually_exclusive_group(required=True)
    negatives.add_argument('--dataset-manifest', type=Path)
    negatives.add_argument('--stock-negatives-dir', type=Path)
    args = parser.parse_args()
    try:
        config = training_config(args)
        args.output.write_text(yaml.safe_dump(config, sort_keys=False))
        sampling = config['negative_sampling']
        print(f'Negative sampling: {sampling["training_families"]} training families; '
              f'target personal={sampling["target_personal_share"]:.1%}, '
              f'effective personal={sampling["effective_personal_share"]:.1%}; '
              f'total negative weight={sampling["total_weight"]:g}')
    except ValidationError as exc:
        parser.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    main()
