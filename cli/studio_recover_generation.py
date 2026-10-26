#!/usr/bin/env python3
"""Snapshot a failed OmniVoice batch and submit a new normally owned recovery job."""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from studio.generation_recovery import enqueue_recovery
from studio.runtime import StudioRuntime


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--word-id', required=True)
    parser.add_argument('--source-job-id', required=True)
    args = parser.parse_args()
    runtime = StudioRuntime(args.data_dir)
    try:
        job = enqueue_recovery(runtime.generation, args.word_id, args.source_job_id)
        print(json.dumps({'job_id': job.id, 'snapshot_id': job.payload['recovery_snapshot'],
                          'source_job_id': args.source_job_id, 'status': job.status}))
    finally:
        runtime.shutdown()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
