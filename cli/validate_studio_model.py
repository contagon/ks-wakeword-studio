#!/usr/bin/env python3
"""Structural engine validation in its prepared interpreter, without inference."""
import argparse
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--model-id', required=True)
    parser.add_argument('--engine', choices=('mww',), required=True)
    parser.add_argument('--model-file', type=Path, help='Explicit retained legacy archive artifact')
    args = parser.parse_args()
    extension = '.tflite'
    files = [args.model_file] if args.model_file else list((args.data_dir / 'output').glob(f'*/{args.model_id}{extension}'))
    if len(files) != 1 or files[0].is_symlink():
        raise ValueError('Missing or ambiguous model output')
    import tensorflow as tf
    interpreter = tf.lite.Interpreter(model_path=str(files[0]), num_threads=1)
    interpreter.allocate_tensors()
    if not interpreter.get_input_details() or not interpreter.get_output_details():
        raise ValueError('TFLite model has no usable input/output tensors')
    path = args.data_dir / 'validation.json'
    state = json.loads(path.read_text()) if path.exists() else {}
    state['microWakeWord'] = True
    path.write_text(json.dumps(state, sort_keys=True))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
