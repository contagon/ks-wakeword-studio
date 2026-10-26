#!/usr/bin/env python3
"""Batch speech-presence and acoustic safety QA for synthetic wakeword candidates."""

from __future__ import annotations

import argparse
import json
import wave
from pathlib import Path


ACOUSTIC_LIMITS = {
    "omnivoice": {
        "minimum_speech_ratio": 0.25,
        "maximum_spectral_flatness": 0.18,
        "maximum_high_frequency_ratio": 0.30,
        "maximum_zero_crossing_rate": 0.28,
    },
    "qwen3": {
        "minimum_speech_ratio": 0.15,
        "maximum_spectral_flatness": 0.25,
        "maximum_high_frequency_ratio": 0.35,
        "maximum_zero_crossing_rate": 0.32,
        "vad_bypass_flatness": 0.11,
    },
    "moss": {
        "minimum_speech_ratio": 0.20,
        "maximum_spectral_flatness": 0.22,
        "maximum_high_frequency_ratio": 0.32,
        "maximum_zero_crossing_rate": 0.30,
        "vad_bypass_flatness": 0.10,
    },
    "piper": {
        "minimum_speech_ratio": 0.18,
        "maximum_spectral_flatness": 0.22,
        "maximum_high_frequency_ratio": 0.32,
        "maximum_zero_crossing_rate": 0.30,
        "vad_bypass_flatness": 0.10,
    },
}


def read_resampled_audio(path: Path):
    import numpy as np

    with wave.open(str(path), "rb") as stream:
        channels = stream.getnchannels()
        sample_width = stream.getsampwidth()
        sample_rate = stream.getframerate()
        frames = stream.getnframes()
        raw = stream.readframes(frames)
    if channels < 1 or sample_width != 2 or sample_rate <= 0 or not raw:
        raise ValueError("expected PCM16 WAV audio")
    audio = np.frombuffer(raw, dtype="<i2").astype(np.float32)
    if channels > 1:
        audio = audio.reshape(-1, channels).mean(axis=1)
    audio /= 32768.0
    if sample_rate != 16000:
        output_length = max(1, round(len(audio) * 16000 / sample_rate))
        source_positions = np.arange(len(audio), dtype=np.float64)
        target_positions = np.arange(output_length, dtype=np.float64) * (sample_rate / 16000)
        audio = np.interp(target_positions, source_positions, audio).astype(np.float32)
    return audio


def speech_ratio(path: Path, vad_model) -> float:
    import torch
    from silero_vad import get_speech_timestamps

    audio = read_resampled_audio(path)
    timestamps = get_speech_timestamps(
        torch.from_numpy(audio),
        vad_model,
        sampling_rate=16000,
        threshold=0.5,
    )
    speech_samples = sum(item["end"] - item["start"] for item in timestamps)
    return speech_samples / max(1, len(audio))


def acoustic_metrics(path: Path) -> dict[str, float]:
    """Return inexpensive measurements that separate speech from static."""

    import numpy as np

    audio = read_resampled_audio(path)
    if not len(audio):
        raise ValueError("empty audio")
    centered = audio - float(np.mean(audio))
    peak = float(np.max(np.abs(centered)))
    rms = float(np.sqrt(np.mean(np.square(centered))))
    clipped_ratio = float(np.mean(np.abs(audio) >= 0.999))
    zero_crossing_rate = float(np.mean(centered[:-1] * centered[1:] < 0)) if len(centered) > 1 else 1.0

    frame_size = 512
    hop = 256
    spectra = []
    window = np.hanning(frame_size).astype(np.float32)
    padded = np.pad(centered, (0, max(0, frame_size - len(centered))))
    for start in range(0, max(1, len(padded) - frame_size + 1), hop):
        frame = padded[start : start + frame_size]
        if len(frame) < frame_size:
            frame = np.pad(frame, (0, frame_size - len(frame)))
        if float(np.sqrt(np.mean(np.square(frame)))) < 0.001:
            continue
        spectra.append(np.square(np.abs(np.fft.rfft(frame * window))))
    if spectra:
        power = np.mean(np.stack(spectra), axis=0) + 1e-12
        useful = power[3:]
        spectral_flatness = float(np.exp(np.mean(np.log(useful))) / np.mean(useful))
        frequencies = np.fft.rfftfreq(frame_size, 1.0 / 16000.0)
        high_frequency_ratio = float(
            np.sum(power[frequencies >= 4000.0]) / max(1e-12, np.sum(power[frequencies >= 80.0]))
        )
    else:
        spectral_flatness = 1.0
        high_frequency_ratio = 1.0
    return {
        "duration": len(audio) / 16000.0,
        "rms": rms,
        "peak": peak,
        "clipped_ratio": clipped_ratio,
        "dc_offset": abs(float(np.mean(audio))),
        "spectral_flatness": spectral_flatness,
        "high_frequency_ratio": high_frequency_ratio,
        "zero_crossing_rate": zero_crossing_rate,
    }


def acoustic_rejection_reason(
    metrics: dict[str, float],
    detected_speech_ratio: float,
    profile: str,
    minimum_duration: float,
    maximum_duration: float,
) -> str:
    limits = ACOUSTIC_LIMITS[profile]
    if metrics["duration"] < minimum_duration:
        return "too_short"
    if metrics["duration"] > maximum_duration:
        return "too_long_or_rambling"
    if metrics["rms"] < 0.004:
        return "too_quiet"
    if metrics["rms"] > 0.55 or metrics["clipped_ratio"] > 0.01:
        return "clipped_or_overdriven"
    if metrics["dc_offset"] > 0.05:
        return "dc_offset"
    if metrics["spectral_flatness"] > limits["maximum_spectral_flatness"]:
        return "static_or_broadband_noise"
    if metrics["high_frequency_ratio"] > limits["maximum_high_frequency_ratio"]:
        return "high_frequency_noise"
    if metrics["zero_crossing_rate"] > limits["maximum_zero_crossing_rate"]:
        return "noise_like_waveform"
    vad_bypass = limits.get("vad_bypass_flatness", -1.0)
    if detected_speech_ratio < limits["minimum_speech_ratio"] and metrics["spectral_flatness"] > vad_bypass:
        return "no_speech_detected"
    return "accepted"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-jsonl", type=Path, required=True)
    parser.add_argument("--output-jsonl", type=Path, required=True)
    parser.add_argument(
        "--profile",
        choices=tuple(ACOUSTIC_LIMITS),
        required=True,
        help="Apply strict provider-specific corpus safety limits.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    entries = [
        json.loads(line)
        for line in args.input_jsonl.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    from silero_vad import load_silero_vad

    vad_model = load_silero_vad(onnx=True)
    results = []
    for entry in entries:
        path = Path(entry["path"])
        try:
            detected_speech_ratio = speech_ratio(path, vad_model)
            metrics = acoustic_metrics(path)
        except Exception as error:
            results.append({"id": entry["id"], "accepted": False, "reason": f"speech_detection_failed: {error}"})
            continue
        reason = acoustic_rejection_reason(
            metrics,
            detected_speech_ratio,
            args.profile,
            float(entry.get("minimum_duration", 0.25)),
            float(entry.get("maximum_duration", 5.0)),
        )
        results.append(
            {
                "id": entry["id"],
                "accepted": reason == "accepted",
                "reason": reason,
                "speech_ratio": round(detected_speech_ratio, 4),
                "acoustic_metrics": {key: round(value, 6) for key, value in metrics.items()},
            }
        )

    args.output_jsonl.parent.mkdir(parents=True, exist_ok=True)
    with args.output_jsonl.open("w", encoding="utf-8") as stream:
        for result in results:
            stream.write(json.dumps(result, ensure_ascii=False) + "\n")
    accepted_count = sum(bool(result["accepted"]) for result in results)
    print(f"Reference QA accepted {accepted_count}/{len(results)} clip(s)", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
