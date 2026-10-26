"""Stateless capture analysis; no legacy session state or persistent previews."""

import io
import threading
import wave

from studio.models import CapturePreview
from studio.storage import MAX_AUDIO_SECONDS, normalize_audio

_vad_lock = threading.Lock()
_vad_model = None


def detect_speech(wav_bytes: bytes) -> list[dict[str, float]]:
    # Silero is stateful: serialize inference as well as initial loading.
    global _vad_model
    with _vad_lock:
        import numpy as np
        import torch
        from silero_vad import get_speech_timestamps, load_silero_vad

        if _vad_model is None:
            _vad_model = load_silero_vad()
            _vad_model.eval()
        with wave.open(io.BytesIO(wav_bytes), 'rb') as source:
            pcm = source.readframes(source.getnframes())
        audio = torch.from_numpy(np.frombuffer(pcm, dtype='<i2').astype(np.float32) / 32768.0)
        return get_speech_timestamps(audio, _vad_model, sampling_rate=16000,
                                     threshold=0.5, min_speech_duration_ms=150,
                                     min_silence_duration_ms=100, speech_pad_ms=0,
                                     return_seconds=True)


def analyze_capture(data: bytes, max_bytes: int) -> CapturePreview:
    normalized = normalize_audio(data, max_bytes, truncate=True)
    with wave.open(io.BytesIO(normalized), 'rb') as source:
        duration = source.getnframes() / 16000
    try:
        segments = detect_speech(normalized)
        if segments:
            start = max(0.0, min(float(s['start']) for s in segments) - 0.08)
            end = min(duration, max(float(s['end']) for s in segments) + 0.08)
            if 0 <= start < end <= duration:
                return CapturePreview(duration, start, end, 'silero', None, duration >= MAX_AUDIO_SECONDS)
        return CapturePreview(duration, 0, duration, 'none', 'no_speech', duration >= MAX_AUDIO_SECONDS)
    except Exception:
        # Optional runtime/model failures should not lose a user's recording.
        return CapturePreview(duration, 0, duration, 'none', 'vad_unavailable', duration >= MAX_AUDIO_SECONDS)
