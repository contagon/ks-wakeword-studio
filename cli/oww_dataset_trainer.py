#!/usr/bin/env python3
"""Explicit config bridge for the pinned OWW trainer; requires a prepared environment.

No setup shell is invoked: it would download and select stock classifier assets.
The enclosing Studio job must execute this command via JobContext.run.
"""

import importlib.util
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from studio.datasets import oww_dataset_config, read_dataset_manifest


def main():
    trainer, manifest, *arguments = sys.argv[1:]
    inputs = read_dataset_manifest(Path(manifest))
    oww_dataset_config({}, inputs)  # Reject incompatible tensors before upstream side effects.
    spec = importlib.util.spec_from_file_location('studio_pinned_oww_trainer', trainer)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    original = module.make_config
    module.make_config = lambda *args, **kwargs: oww_dataset_config(original(*args, **kwargs), inputs)
    sys.argv = [trainer, *arguments]
    return module.main()


if __name__ == '__main__':
    raise SystemExit(main())
