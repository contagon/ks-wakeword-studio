from fastapi import FastAPI
from fastapi.testclient import TestClient

from studio.api import create_router
from studio.models import SampleQuery
from studio.runtime import StudioRuntime
import test_studio_collection as fixtures


class ScopedCollectionTests(fixtures.CollectionTests):
    def test_workspace_collection_skips_other_mappings_before_download(self):
        self.mapped()
        self.words.set_source_mapping('a', 'mww', 'Other', self.other.id)
        self.client.clips['a'] = [self.clip(), self.clip('2', 'Other'), self.clip('3', 'Unknown')]
        result = self.service.run(word_id=self.word.id)
        self.assertEqual((result.new, result.unmapped), (2, 1))
        self.assertNotIn(('audio', 'a', '2'), self.client.calls)
        self.assertEqual(self.samples.queue(self.other.id, SampleQuery()).total, 0)
        self.assertEqual(self.service.run(word_id=self.other.id).new, 1)

    def test_mapping_change_during_download_never_cross_imports(self):
        self.mapped()
        self.client.clips['a'] = [self.clip()]
        self.client.before_audio = lambda *_: self.words.set_source_mapping('a', 'mww', 'Hello', self.other.id)
        result = self.service.run(word_id=self.word.id)
        self.assertEqual(result.new, 0)
        self.assertEqual(self.samples.queue(self.other.id, SampleQuery()).total, 0)
        self.client.before_audio = None
        self.assertEqual(self.service.run(word_id=self.other.id).new, 1)


def test_manual_collect_queues_when_automatic_off(tmp_path):
    runtime = StudioRuntime(tmp_path)
    try:
        word = runtime.workspaces.create('Cedar', 'en')
        app = FastAPI()
        app.include_router(create_router(runtime))
        with TestClient(app) as client:
            response = client.post(f'/api/studio/wakewords/{word.id}/collection/jobs')
            assert response.status_code == 201
            assert response.json()['status'] == 'queued'
            assert response.json()['word_id'] == word.id
            runtime.workers.run_once('collection')
            assert runtime.jobs.get(response.json()['id']).status == 'complete'
    finally:
        runtime.shutdown()
