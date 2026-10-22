"""Tests-only command runner; production images do not ship this module."""
from __future__ import annotations

import io
import json
import wave
from pathlib import Path
from urllib.parse import urlsplit

from fastapi import FastAPI
from fastapi.testclient import TestClient

from studio.api import create_router
from studio.kiosk import KioskClient
from studio.models import RemoteRejected


def wav(value=200, seconds=1.0, rate=16000, channels=1) -> bytes:
    """Canonical 16-bit PCM WAV filled with one sample value (distinct values, distinct blobs)."""
    output = io.BytesIO()
    with wave.open(output, 'wb') as stream:
        stream.setparams((channels, 2, rate, 0, 'NONE', 'not compressed'))
        stream.writeframes(int(value).to_bytes(2, 'little', signed=True) * int(rate * seconds) * channels)
    return output.getvalue()


def api_client(runtime) -> TestClient:
    """The studio API for one runtime, without the app lifespan's worker threads."""
    app = FastAPI()
    app.include_router(create_router(runtime))
    return TestClient(app)


def augmentation_fixture(root):
    """Tiny real installed corpora: exercise production retention, never bypass it."""
    for name in ('mit_rirs_16k', 'audioset_16k', 'fma_16k', 'chime_16k'):
        path = Path(root) / 'training_datasets' / name
        path.mkdir(parents=True, exist_ok=True)
        (path / 'fixture.wav').write_bytes(wav(1, 0.2))


def pinned_augmentation_fixture(root):
    from dataclasses import asdict
    from studio.db import Store
    from studio.augmentation import snapshot
    augmentation_fixture(root)
    store = Store.open(root)
    try:
        return [asdict(item) for item in snapshot(store)]
    finally:
        store.close()


class FixtureOnlyClient(KioskClient):
    """Fail closed before transport unless the URL belongs to our own fixtures."""

    def __init__(self, credentials, urls):
        if any(urlsplit(url).hostname != '127.0.0.1' for url in urls):
            raise ValueError('Only loopback fixture URLs are allowed')
        super().__init__(credentials)
        self.urls = frozenset(urls)

    def _request(self, device, path, body, **kwargs):
        if device.url not in self.urls:
            raise RemoteRejected('Test harness only permits its loopback fixtures')
        return super()._request(device, path, body, **kwargs)


class StubGpuRunner:
    """Deterministic command runner for tests that opt in at construction/startup."""

    def __init__(self):
        self.training_count = 0

    def run(self, context, argv, *, cwd=None):
        values = {item.split("=", 1)[0]: item.split("=", 1)[1]
                  for item in argv if isinstance(item, str) and item.startswith("--") and "=" in item}
        if any(str(item).endswith('studio_classify.py') for item in argv):
            manifest = json.loads(Path(values['--input-manifest']).read_text())
            Path(values['--output-json']).write_text(json.dumps([
                {'id': sample['id'], 'transcript': 'turn the lights off',
                 'engine': manifest['engine'], 'model': 'fixture'} for sample in manifest['samples']]))
            return 0
        if any(str(item).endswith("tts_generate_samples.py") for item in argv):
            output = Path(values["--output-dir"])
            output.mkdir(parents=True, exist_ok=True)
            count = int(values["--samples"])
            for index in range(count):
                (output / f"fixture-{index}.wav").write_bytes(wav(index + 1, 0.2))
            return 0
        self.training_count += 1
        manifest = json.loads(Path(values["--input-manifest"]).read_text(encoding="utf-8"))
        root = Path(values["--data-dir"])
        output = root / "output" / "fixture"
        output.mkdir(parents=True, exist_ok=True)
        model_id = manifest["model_id"]
        (output / f"{model_id}.tflite").write_bytes(b"\x00\x00\x00\x00TFL3fixture" + str(self.training_count).encode())
        (output / f"{model_id}.json").write_text(json.dumps({"type": "micro", "model": f"{model_id}.tflite", "calibration": {"recall": 0.8}}), encoding="utf-8")
        (output / "logs").mkdir()
        (output / "logs" / "training.log").write_text("explicit test-harness GPU stub\n", encoding="utf-8")
        (root / "work" / "trained_models").mkdir(parents=True)
        (root / "work" / "trained_models" / "training_parameters.yaml").write_text("features: []\n", encoding="utf-8")
        (root / "validation.json").write_text('{"microWakeWord": true}\n', encoding="utf-8")
        return 0


class TrainingRunner:
    def __init__(self):
        self.calls, self.hook, self.mode = [], None, 'valid'

    def run(self, context, argv, *, cwd=None):
        self.calls.append(argv)
        options = dict(a.split('=', 1) for a in argv if a.startswith('--') and '=' in a)
        manifest = json.loads(Path(options['--input-manifest']).read_text())
        root = Path(options['--data-dir'])
        if self.hook:
            self.hook(context)
        if self.mode == 'crash':
            raise RuntimeError('simulated worker failure')
        out = root / 'output/fixture'
        out.mkdir(parents=True)
        slug = manifest['model_id']
        if self.mode != 'missing':
            (out / f'{slug}.tflite').write_bytes(b'\x00\x00\x00\x00TFL3fixture')
        (out / f'{slug}.json').write_text(json.dumps({'type': 'micro', 'model': f'{slug}.tflite', 'calibration': {'recall': .8}}))
        (out / 'logs').mkdir()
        (out / 'logs/training.log').write_text('fixture engine log')
        (root / 'work/trained_models').mkdir(parents=True)
        (root / 'work/trained_models/training_parameters.yaml').write_text('features: []')
        if self.mode != 'unvalidated':
            (root / 'validation.json').write_text('{"microWakeWord":true}')
        return 0


class VersionedTrainingRunner(TrainingRunner):
    def run(self, context, argv, **kwargs):
        code = super().run(context, argv, **kwargs)
        root = Path(next(a.split('=', 1)[1] for a in argv if a.startswith('--data-dir=')))
        weights = root / 'output/fixture/hello_robot.tflite'
        weights.write_bytes(weights.read_bytes() + context.job.id.encode())
        return code


class GenerationRunner:
    def __init__(self):
        self.calls = []
        self.mode = 'valid'
        self.hook = None

    def run(self, context, argv, *, cwd=None):
        self.calls.append((context.job.id, argv, cwd))
        if self.hook:
            self.hook(context)
        options = dict(part.split('=', 1) for part in argv if part.startswith('--') and '=' in part)
        output = Path(options['--output-dir'])
        output.mkdir(parents=True)
        count = int(options['--samples'])
        if self.mode == 'short':
            count -= 1
        if self.mode == 'extra':
            count += 1
        for index in range(count):
            (output / f'{index}.wav').write_bytes(b'broken' if self.mode == 'invalid' else wav(index + 1, 0.1))
        if self.mode == 'symlink':
            (output / '0.wav').unlink()
            (output / '0.wav').symlink_to(output / '1.wav')
        return 0
