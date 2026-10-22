"""Explicit loopback/temp-only app runner for Playwright, never a production mode.

Run from the repository root: python tests/studio_browser_server.py --port 8798
The production app, routes, lifecycle and committed UI are used unchanged.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from studio.datasets import DatasetService
from studio.runtime import StudioRuntime
from studio_harness import FixtureOnlyClient, StubGpuRunner, augmentation_fixture
from test_studio_workflow import FixtureKiosk, PASSWORD
from test_studio_workflow import wav_bytes


class BrowserRuntime(StudioRuntime):
    def start_workers(self):
        # Tests explicitly drain queues: no wall-clock scheduler races.
        self.startup()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, required=True)
    args = parser.parse_args()
    import uvicorn

    with tempfile.TemporaryDirectory(prefix='studio-browser-') as directory:
        os.environ['DATA_DIR'] = directory
        follower = FixtureKiosk('fixture-follower', leader=False)
        leader = FixtureKiosk('fixture-leader', leader=True, follower=follower)
        augmentation_fixture(Path(directory))
        runtime = BrowserRuntime(Path(directory), runner=StubGpuRunner())
        runtime.startup()
        runtime.devices.client = FixtureOnlyClient(runtime.devices._token, [leader.url, follower.url])
        base = json.loads(Path('studio/dataset_catalog.json').read_text())[0]
        assert runtime._store is not None
        runtime._datasets = DatasetService(runtime._store,
            runtime.jobs, catalog=[dict(base, id=f'dataset_{i:03}', name=f'Corpus {i:03}') for i in range(200)])
        runtime.training.datasets = runtime._datasets
        from trainer_server import create_app
        app = create_app(runtime)

        @app.get('/__test/fixtures')
        def fixtures():
            return {'leader': leader.url, 'follower': follower.url, 'password': PASSWORD}

        @app.post('/__test/drain-gpu')
        def drain_gpu():
            return {'ran': runtime.workers.run_once('gpu')}

        @app.post('/__test/drain-collection')
        def drain_collection():
            return {'ran': runtime.workers.run_once('collection')}

        @app.post('/__test/new-clips')
        def new_clips():
            for device in (leader, follower):
                device.clip_id += '-new'
                device.audio = wav_bytes(50)
            return {'ok': True}

        try:
            uvicorn.run(app, host='127.0.0.1', port=args.port, log_level='warning')
        finally:
            runtime.shutdown()
            leader.close()
            follower.close()


if __name__ == '__main__':
    main()
