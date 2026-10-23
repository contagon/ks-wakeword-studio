#!/usr/bin/env python3
"""Score automatic classification against your manual kiosk labels. Read-only; changes no labels.

Run inside the Studio container with the recorder venv:
  docker exec ks-wakeword-studio /data/.recorder-venv/bin/python /root/mww-scripts/cli/evaluate_classification.py
"""
import argparse
from collections import Counter
import os
from pathlib import Path
import sqlite3
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / 'cli'))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', type=Path, default=Path('/data'))
    parser.add_argument('--phrase', help='Only this workspace phrase (default: all)')
    args = parser.parse_args()
    # CTranslate2 needs the pip CUDA libraries on the loader path before the process starts.
    from cuda_library_path import package_directory
    cuda = [d for d in (package_directory('nvidia.cublas.lib'), package_directory('nvidia.cudnn.lib')) if d]
    if cuda and cuda[0] not in os.environ.get('LD_LIBRARY_PATH', ''):
        os.environ['LD_LIBRARY_PATH'] = os.pathsep.join([*cuda, os.environ.get('LD_LIBRARY_PATH', '')])
        os.execv(sys.executable, [sys.executable, *sys.argv])
    from studio.speech import SpeechTranscriber, hearing

    db = sqlite3.connect(f"file:{args.data_dir / 'studio/studio.sqlite3'}?mode=ro", uri=True)
    rows = db.execute("SELECT s.id,s.label,r.near_miss,r.clip_id,a.normalized_hash,w.phrase,w.language "
                      "FROM samples s JOIN recordings r ON r.id=s.recording_id JOIN audio_records a ON a.id=s.audio_id "
                      "JOIN wakewords w ON w.id=s.word_id WHERE s.source='diagnostic' AND s.deleted=0 "
                      "AND s.label IN ('positive','negative') AND (? IS NULL OR w.phrase=?) ORDER BY w.phrase",
                      (args.phrase, args.phrase)).fetchall()
    transcriber = SpeechTranscriber(args.data_dir / 'auto_train_models')
    cells, misses = Counter(), []
    for i, (sid, label, near, clip, digest, phrase, language) in enumerate(rows, 1):
        print(f'\rTranscribing {i}/{len(rows)}', end='', file=sys.stderr, flush=True)
        result = transcriber.transcribe(args.data_dir / 'studio/blobs' / digest, language=language, phrase=phrase)
        heard = hearing(phrase, speech=result['speech'], text=result['transcript'], primed=result['guided_transcript'])
        cells[phrase, bool(near), heard, label] += 1
        if (heard, label) in (('phrase', 'negative'), ('other', 'positive')):
            misses.append((phrase, label, sid, clip, result))
    print(file=sys.stderr)
    for phrase in sorted({key[0] for key in cells}):
        print(f'\n{phrase}')
        for near, kind in ((False, 'Activation'), (True, 'Close miss')):
            count = lambda heard, label: cells[phrase, near, heard, label]
            print(f'  {kind:10}  heard phrase {count("phrase", "positive")} right {count("phrase", "negative")} wrong'
                  f' | something else {count("other", "negative")} right {count("other", "positive")} wrong'
                  f' | unclear {count("unclear", "positive")} positive, {count("unclear", "negative")} negative')
    for phrase, label, sid, clip, result in misses:
        print(f'\nDisagrees with your {label} label: sample {sid} (clip {clip}) speech={result["speech"]} '
              f'plain={result["transcript"]!r} primed={result["guided_transcript"]!r}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
