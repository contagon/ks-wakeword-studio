"""Explicit-input adapter. One owned command contains the entire subprocess tree.

The CLI path uses subprocess only *inside* that owned command and never creates
new sessions. Standalone legacy train_wake_word remains unchanged.
"""

import argparse
import hashlib
import json
import os
import shutil
import stat
import subprocess
from dataclasses import asdict
from pathlib import Path

from studio.models import DatasetInput, TrainingResult, ValidationError


REPO = Path(__file__).resolve().parents[1]
PREFLIGHT_MESSAGES = {
    'positive_counts': 'Positive audio requires training, validation and testing families; add more independent positive recordings or batches',
    'input_invalid': 'Training input validation failed; inspect retained inputs and engine compatibility',
}


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def checked_file(path, root):
    if not path.is_relative_to(root) or path.is_symlink() or not stat.S_ISREG(path.stat().st_mode):
        raise ValidationError('Unsafe training artifact')
    for parent in path.relative_to(root).parents:
        if (root / parent).is_symlink():
            raise ValidationError('Unsafe training artifact directory')
    if not path.stat().st_size:
        raise ValidationError('Empty training artifact')
    return path


def validate_inputs(manifest, *, require_splits=True):
    from studio.datasets import mww_dataset_features
    audio = manifest['audio']
    positives = [a for a in audio if a['label'] == 'positive']
    if not positives:
        raise ValidationError('No usable positive audio; label recordings or select a completed synthetic batch')
    if any(a['label'] not in ('positive', 'negative') or a['split'] not in ('training', 'validation', 'testing') for a in audio):
        raise ValidationError('Only labeled audio with stable family splits is supported')
    if require_splits and set(a['split'] for a in positives) != {'training', 'validation', 'testing'}:
        raise ValidationError(PREFLIGHT_MESSAGES['positive_counts'])
    negatives = [a for a in audio if a['label'] == 'negative']
    if require_splits and negatives and {a['split'] for a in negatives} != {'training', 'validation', 'testing'}:
        raise ValidationError('Reviewed negative audio requires training, validation and testing families for microWakeWord mmap features; label more independent negatives')
    inputs = [DatasetInput(**d) for d in manifest['datasets']]
    mww_dataset_features(inputs)
    if require_splits and not inputs and not any(a['label'] == 'negative' and a['split'] == 'training' for a in audio):
        raise ValidationError('Select classifier negative datasets or label negative training families; defaults are disabled')


def training_environment(data_dir, environ=None):
    """Remove recorder-only CUDA libraries using an explicit tool-data root."""
    env = dict(os.environ if environ is None else environ)
    removed, kept = [], []
    for entry in env.get('LD_LIBRARY_PATH', '').split(os.pathsep):
        try:
            recorder = bool(entry) and Path(entry).resolve().is_relative_to((data_dir / '.recorder-venv').resolve())
        except (OSError, RuntimeError, ValueError):
            recorder = False
        (removed if recorder else kept).append(entry)
    if any(kept):
        env['LD_LIBRARY_PATH'] = os.pathsep.join(kept)
    else:
        env.pop('LD_LIBRARY_PATH', None)
    return env, removed


class LegacyTrainingAdapter:
    def __init__(self, context, tool_data_dir):
        self.context, self.tool_data_dir = context, Path(tool_data_dir)

    def run(self, manifest, run_root, on_log, cancel):
        try:
            validate_inputs(asdict(manifest), require_splits=False)
        except ValidationError as exc:
            # These are fixed, trusted actionable validation messages, not raw
            # child output or exception prose from remote providers.
            on_log(str(exc))
            raise
        on_log('Preparing isolated training environment and retained inputs')
        try:
            self.context.run(['bash', str(REPO / 'train_wake_word'),
                              f'--input-manifest={run_root / "run-manifest.json"}',
                              f'--data-dir={run_root}', f'--tool-data-dir={self.tool_data_dir}'], cwd=str(run_root))
        except Exception:
            error = run_root / 'preflight-error.json'
            if error.is_file() and not error.is_symlink():
                try:
                    code = json.loads(error.read_text())['code']
                    on_log(PREFLIGHT_MESSAGES.get(code, PREFLIGHT_MESSAGES['input_invalid']))
                except (ValueError, KeyError, TypeError):
                    pass
            on_log('Training command failed; no model version is publishable. Inspect the retained run logs and environment prerequisites')
            raise
        if cancel.is_set() or self.context.cancelled():
            raise ValidationError('Training cancelled')
        validation_path = checked_file(run_root / 'validation.json', run_root)
        validation = json.loads(validation_path.read_text())
        if validation.get('microWakeWord') is not True:
            raise ValidationError('Engine output validation did not complete')
        slug = manifest.model_id
        candidates = list((run_root / 'output').glob(f'*/{slug}.json'))
        if len(candidates) != 1:
            raise ValidationError('Missing or ambiguous model manifest')
        output = candidates[0].parent
        metadata = json.loads(checked_file(output / f'{slug}.json', run_root).read_text())
        model = checked_file(output / f'{slug}.tflite', run_root)
        with model.open('rb') as handle:
            if handle.read(8)[4:8] != b'TFL3':
                raise ValidationError('Invalid TFLite model identifier')
        if metadata.get('model') != model.name or metadata.get('type') != 'micro':
            raise ValidationError('Invalid stable microWakeWord manifest')
        artifacts = {}
        artifacts['config/model_validation.json'] = str(validation_path)
        if (run_root / 'logs').exists():
            for path in (run_root / 'logs').rglob('*'):
                if path.is_file() or path.is_symlink():
                    artifacts[f'logs/orchestration/{path.relative_to(run_root / "logs")}'] = str(checked_file(path, run_root))
        for path in output.rglob('*'):
            if path.is_dir() and not path.is_symlink():
                continue
            artifacts[str(path.relative_to(output))] = str(checked_file(path, run_root))
        config = checked_file(run_root / 'work/trained_models/training_parameters.yaml', run_root)
        artifacts['config/training_parameters.yaml'] = str(config)
        # Retain engine effective configurations and calibration when available.
        for parent, prefix in ((run_root / 'work/trained_models/wakeword', 'config/mww'),):
            if parent.exists():
                for path in parent.rglob('*'):
                    if path.suffix in ('.json', '.yaml', '.yml'):
                        artifacts[f'{prefix}/{path.relative_to(parent)}'] = str(checked_file(path, run_root))
        metrics = metadata.get('calibration', {})
        if not isinstance(metrics, dict):
            raise ValidationError('Invalid model metrics')
        json.dumps(metrics, allow_nan=False)
        on_log('Training artifacts and available metrics validated')
        return TrainingResult(artifacts, {name: sha256(Path(path)) for name, path in artifacts.items()}, metrics, True)


def _run(argv, *, cwd, env):
    # Called only by main inside the queue-owned CLI tree (or an explicit CLI
    # invocation). No shell interpolation, new sessions, daemonization or globals.
    log_path = env.get('STUDIO_TRAIN_COMMAND_LOG')
    if log_path:
        with Path(log_path).open('ab') as log:
            subprocess.run([str(a) for a in argv], cwd=cwd, env=env, check=True,
                           stdout=log, stderr=subprocess.STDOUT)
    else:
        subprocess.run([str(a) for a in argv], cwd=cwd, env=env, check=True)


def stage_inputs(manifest, root):
    split_map = {}
    for label, directory in (('positive', 'wake_word_samples'), ('negative', 'reviewed_negatives')):
        target = root / 'work' / directory
        target.mkdir(parents=True)
        for index, audio in enumerate(manifest['audio']):
            if audio['label'] != label:
                continue
            source = Path(audio['path'])
            if source.is_symlink() or sha256(source) != audio['normalized_hash']:
                raise ValidationError('Retained audio checksum mismatch')
            path = target / f'{index:08d}.wav'
            shutil.copyfile(source, path)
            split_map[str(path)] = audio['split']
    split_path = root / 'splits.json'
    split_path.write_text(json.dumps(split_map, sort_keys=True))
    return split_path


def main(argv=None):
    parser = argparse.ArgumentParser(description='Train retained Studio inputs without generating audio')
    parser.add_argument('--input-manifest', type=Path, required=True)
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--tool-data-dir', type=Path, required=True)
    args = parser.parse_args(argv)
    manifest = json.loads(args.input_manifest.read_text())
    if manifest.get('schema_version') != 1:
        raise ValidationError('Unsupported training input manifest')
    root, shared = args.data_dir.resolve(), args.tool_data_dir.resolve()
    if root == shared or (root / 'work').exists():
        raise ValidationError('A fresh isolated run root is required')
    root.mkdir(parents=True, exist_ok=True)
    try:
        validate_inputs(manifest)
        from studio.augmentation import pinned_paths
        augmentation = pinned_paths(manifest)
    except ValidationError as exc:
        code = next((key for key, message in PREFLIGHT_MESSAGES.items() if str(exc) == message), 'input_invalid')
        (root / 'preflight-error.json').write_text(json.dumps({'code': code}))
        raise
    env, _ = training_environment(shared)
    (root / 'logs').mkdir()
    env['STUDIO_TRAIN_COMMAND_LOG'] = str(root / 'logs/commands.log')
    cli = REPO / 'cli'
    python = shared / '.venv/bin/python'
    try:
        _run([python, cli / 'check_training_venv'], cwd=root, env=env)
    except (OSError, subprocess.CalledProcessError):
        _run(['bash', cli / 'setup_python_venv', f'--data-dir={shared}'], cwd=shared, env=env)
        _run([python, cli / 'check_training_venv'], cwd=root, env=env)
    split_path = stage_inputs(manifest, root)
    # Engine-specific explicit manifests: never fall back to catalog defaults.
    mww_datasets = manifest['datasets']
    dataset_path = root / 'datasets.json'
    dataset_path.write_text(json.dumps({'schema_version': 1, 'datasets': mww_datasets}))
    _run([python, cli / 'wake_word_sample_augmenter', f'--data-dir={root}', f'--split-manifest={split_path}', f'--seed={manifest["seed"]}',
          f'--personal-dir={root / "empty-personal"}', f'--negative-dir={root / "work/reviewed_negatives"}',
          *[f'--{flag}={augmentation[name]}' for flag, name in
            (('mit-rirs-16k-dir', 'mit_rirs_16k'), ('audioset-16k-dir', 'audioset_16k'), ('fma-16k-dir', 'fma_16k'), ('chime-16k-dir', 'chime_16k'))]], cwd=root, env=env)
    _run([cli / 'wake_word_sample_trainer', f'--data-dir={root}', f'--tool-data-dir={shared}', f'--dataset-manifest={dataset_path}',
          f'--artifact-slug={manifest["model_id"]}', f'--language={manifest["language"]}',
          f'--stable-model-id={manifest["model_id"]}',
          f'--training-steps={manifest["config"]["training_steps"]}',
          f'--samples={sum(a["label"] == "positive" for a in manifest["audio"])}',
          'studio-input', manifest['phrase']], cwd=root, env=env)
    validation_args = [f'--data-dir={root}', f'--model-id={manifest["model_id"]}']
    _run([python, cli / 'validate_studio_model.py', *validation_args, '--engine=mww'], cwd=root, env=env)
    return 0
