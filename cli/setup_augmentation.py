#!/usr/bin/env python3
"""Prepare one allowlisted augmentation corpus inside an owned job's staging tree."""
import argparse
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from studio.augmentation import CATALOG
from studio.mww_training import training_environment


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--corpus', choices=CATALOG, required=True)
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--stage-dir', type=Path, required=True)
    args = parser.parse_args()
    shared, stage = args.data_dir.resolve(), args.stage_dir.resolve()
    cli = Path(__file__).resolve().parent
    env, _ = training_environment(shared)
    env['HF_HOME'] = str(shared / '.cache/huggingface')
    env['HUGGINGFACE_HUB_CACHE'] = str(shared / '.cache/huggingface/hub')
    python = shared / '.venv/bin/python'
    subprocess.run([str(cli / 'setup_python_venv'), f'--data-dir={shared}'], env=env, cwd=shared, check=True)
    subprocess.run([str(python), str(cli / 'prepare_corpus.py'), f'--corpus={args.corpus}', f'--data-dir={stage}',
                    '--cleanup-archives', '--cleanup-intermediate-files'], cwd=stage, env=env, check=True)
    # Written only after the full source setup succeeds, never by a partial job.
    (stage / 'augmentation-complete.json').write_text(json.dumps({'schema_version': 1, 'corpus': args.corpus}))


if __name__ == '__main__':
    main()
