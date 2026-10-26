#!/usr/bin/env python3
"""CPU-only, unprompted ASR spot checks and limited pitch-diversity diagnostics."""
import argparse
import hashlib
import json
import random
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def semantic_match(text, phrase):
    return re.sub(r'[^a-z0-9]', '', text.lower()) == re.sub(r'[^a-z0-9]', '', phrase.lower())


def median_pitch(audio):
    import numpy as np
    pitches = []
    for start in range(0, len(audio) - 640 + 1, 320):
        frame = audio[start:start + 640].astype(np.float64)
        frame -= frame.mean()
        if np.sqrt(np.mean(frame * frame)) < .01:
            continue
        frame *= np.hanning(len(frame))
        ac = np.correlate(frame, frame, mode='full')[639:]
        lag = 40 + int(np.argmax(ac[40:229]))  # 70–400 Hz at 16 kHz.
        if ac[lag] / max(ac[0], 1e-12) > .45:
            pitches.append(16000 / lag)
    return float(np.median(pitches)) if pitches else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--results', type=Path, required=True)
    parser.add_argument('--model-path', type=Path, required=True, help='Existing local faster-whisper model snapshot; never downloads')
    parser.add_argument('--per-condition', type=int, default=12)
    parser.add_argument('--seed', type=int, default=101)
    args = parser.parse_args()
    if args.per_condition < 1 or not args.model_path.is_dir():
        parser.error('Use positive sample count and an existing local Whisper snapshot')
    from faster_whisper import WhisperModel
    from cli.tts_reference_qa import read_resampled_audio
    import numpy as np
    model = WhisperModel(str(args.model_path), device='cpu', compute_type='int8', cpu_threads=2, num_workers=1)
    results = json.loads(args.results.read_text())
    report = {'phrase': results['phrase'], 'model_snapshot': args.model_path.name,
              'model': 'faster-whisper-small.en', 'device': 'cpu', 'compute_type': 'int8',
              'seed': args.seed, 'prompt': None, 'conditions': [],
              'limitations': 'ASR is a spot check, not listening ground truth. Pitch variation does not establish independent speaker identities or detector accuracy.'}
    for condition in results['conditions']:
        accepted = condition['accepted_audio']
        sampled = random.Random(args.seed).sample(accepted, min(args.per_condition, len(accepted)))
        directory = args.results.parent / condition['id']
        transcripts, pitches = [], []
        for row in accepted:
            audio = read_resampled_audio(directory / f"{row['id']}.wav")
            pitch = median_pitch(audio)
            if pitch is not None:
                pitches.append(pitch)
        for row in sampled:
            audio = read_resampled_audio(directory / f"{row['id']}.wav")
            segments, _ = model.transcribe(audio, language='en', beam_size=5, condition_on_previous_text=False,
                                           vad_filter=False, initial_prompt=None)
            text = ' '.join(segment.text.strip() for segment in segments).strip()
            transcripts.append({'id': row['id'], 'transcript': text,
                                'match': semantic_match(text, results['phrase']), 'wav_sha256': row['wav_sha256']})
        report['conditions'].append({'id': condition['id'], 'transcribed': len(transcripts),
            'matches': sum(t['match'] for t in transcripts), 'transcripts': transcripts,
            'voiced_clips': len(pitches), 'pitch_hz_percentiles_10_50_90': np.percentile(pitches, [10, 50, 90]).tolist() if pitches else [],
            'accepted': condition['accepted'], 'unique_pcm': condition['unique_pcm']})
        (args.results.parent / 'semantics.json').write_text(json.dumps(report, indent=2))
        print(json.dumps({k: v for k, v in report['conditions'][-1].items() if k != 'transcripts'}), flush=True)
    report['results_sha256'] = hashlib.sha256(args.results.read_bytes()).hexdigest()
    (args.results.parent / 'semantics.json').write_text(json.dumps(report, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
