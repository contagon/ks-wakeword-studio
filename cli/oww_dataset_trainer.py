#!/usr/bin/env python3
"""Explicit config bridge for the pinned OWW trainer; requires a prepared environment.

No setup shell is invoked: it would download and select stock classifier assets.
The enclosing Studio job must execute this command via JobContext.run.
"""

import importlib.util
import sys
import re
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
    stable_ids = [a.split('=', 1)[1] for a in arguments if a.startswith('--studio-model-id=')]
    if stable_ids:
        if len(stable_ids) != 1 or not re.fullmatch(r'[a-z0-9][a-z0-9_-]{0,63}', stable_ids[0]):
            raise ValueError('Invalid stable Studio model ID')
        stable_id = stable_ids[0]
        original_name = module.safe_name
        module.safe_name = lambda value: stable_id if value == stable_id else original_name(value)
        arguments = [a for a in arguments if not a.startswith('--studio-model-id=')]
    original = module.make_config
    module.make_config = lambda *args, **kwargs: oww_dataset_config(original(*args, **kwargs), inputs)
    if hasattr(module, 'run'):
        original_run = module.run
        # Upstream accepts failed export when a partial ONNX exists. Explicit
        # Studio jobs must never turn a failed stage into a successful archive.
        def strict_run(cmd, env=None, allow_onnx_failure=None):
            return original_run(cmd, env=env)
        module.run = strict_run
    sys.argv = [trainer, *arguments]
    return module.main()


if __name__ == '__main__':
    raise SystemExit(main())
