"""Tests-only command runner; production images do not ship this module."""
from __future__ import annotations

import io
import json
import wave
from pathlib import Path
from urllib.parse import urlsplit

from studio.kiosk import KioskClient
from studio.models import RemoteRejected


class FixtureOnlyClient(KioskClient):
    """Fail closed before transport unless the URL belongs to our own fixtures."""

    def __init__(self, credentials, urls):
        if any(urlsplit(url).hostname != '127.0.0.1' for url in urls):
            raise ValueError('Only loopback fixture URLs are allowed')
        super().__init__(credentials)
        self.urls = frozenset(urls)

    def _request(self, device, path, body):
        if device.url not in self.urls:
            raise RemoteRejected('Test harness only permits its loopback fixtures')
        return super()._request(device, path, body)


class StubGpuRunner:
    """Deterministic command runner for tests that opt in at construction/startup."""

    def __init__(self):
        self.training_count = 0

    @staticmethod
    def _wav(seed: int = 1) -> bytes:
        output = io.BytesIO()
        with wave.open(output, "wb") as file:
            file.setnchannels(1)
            file.setsampwidth(2)
            file.setframerate(16000)
            file.writeframes(seed.to_bytes(2, "little", signed=True) * 3200)
        return output.getvalue()

    def run(self, context, argv, *, cwd=None):
        values = {item.split("=", 1)[0]: item.split("=", 1)[1]
                  for item in argv if isinstance(item, str) and item.startswith("--") and "=" in item}
        if any(str(item).endswith("tts_generate_samples.py") for item in argv):
            output = Path(values["--output-dir"])
            output.mkdir(parents=True, exist_ok=True)
            count = int(values["--samples"])
            for index in range(count):
                (output / f"fixture-{index}.wav").write_bytes(self._wav(index + 1))
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
