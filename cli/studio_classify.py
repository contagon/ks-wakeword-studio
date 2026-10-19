"""Queue-owned inference process. Output is private and never a public job log."""
import argparse
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from studio.speech import SpeechTranscriber


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input-manifest', type=Path, required=True)
    parser.add_argument('--output-json', type=Path, required=True)
    args = parser.parse_args()
    manifest = json.loads(args.input_manifest.read_text())
    transcriber = SpeechTranscriber(Path(manifest['cache_dir']))
    results = [{'id': sample['id'], **transcriber.transcribe(Path(sample['path']), engine=manifest['engine'],
               language=manifest['language'], phrase=manifest['phrase'])} for sample in manifest['samples']]
    with args.output_json.open('x') as output:
        json.dump(results, output)


if __name__ == '__main__':
    main()
