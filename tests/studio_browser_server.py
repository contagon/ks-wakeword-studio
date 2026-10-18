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
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from studio.datasets import DatasetService
from studio.runtime import StudioRuntime
from studio_harness import FixtureOnlyClient, StubGpuRunner, augmentation_fixture
from test_studio_workflow import FixtureKiosk, TOKEN


class BrowserRuntime(StudioRuntime):
    def start_workers(self):
        # Tests explicitly drain queues: no wall-clock scheduler races.
        self.startup()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, required=True)
    args = parser.parse_args()
    import uvicorn

    with tempfile.TemporaryDirectory(prefix='studio-browser-', dir='/tmp/opencode') as directory:
        os.environ['DATA_DIR'] = directory
        os.environ.pop('TRAINER_LEGACY_MODE', None)
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
        # Explicit dependency injection is local to this tests-only executable.
        with patch('studio.runtime.StudioRuntime', return_value=runtime):
            import trainer_server

        @trainer_server.app.get('/__test/fixtures')
        def fixtures():
            return {'leader': leader.url, 'follower': follower.url, 'token': TOKEN}

        @trainer_server.app.post('/__test/drain-gpu')
        def drain_gpu():
            return {'ran': runtime.workers.run_once('gpu')}

        try:
            uvicorn.run(trainer_server.app, host='127.0.0.1', port=args.port, log_level='warning')
        finally:
            runtime.shutdown()
            leader.close()
            follower.close()


if __name__ == '__main__':
    main()
