#!/usr/bin/env python3
"""Apply explicit classifier inputs to a legacy MWW config, never merge stock defaults."""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from studio.datasets import mww_dataset_features, read_dataset_manifest
from studio.models import ValidationError


def main():
    import yaml

    parser = argparse.ArgumentParser()
    parser.add_argument('manifest', type=Path)
    parser.add_argument('config', type=Path)
    parser.add_argument('--reviewed-negative-dir')
    args = parser.parse_args()
    try:
        features = mww_dataset_features(read_dataset_manifest(args.manifest))
        config = yaml.safe_load(args.config.read_text())
        config['features'] = [row for row in config['features'] if row.get('truth') is True or
                              (args.reviewed_negative_dir is not None and
                               row.get('features_dir') == args.reviewed_negative_dir)] + features
        args.config.write_text(yaml.safe_dump(config, sort_keys=False))
    except ValidationError as exc:
        parser.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    main()
