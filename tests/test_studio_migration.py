import io
import json
import tempfile
import unittest
import wave
from pathlib import Path

from studio.models import Conflict, ValidationError
from studio.runtime import StudioRuntime


def wav() -> bytes:
    output = io.BytesIO()
    with wave.open(output, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(16000)
        handle.writeframes(b"\0\0" * 1600)
    return output.getvalue()


class MigrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.personal = self.root / "personal_samples"
        self.negative = self.root / "negative_samples"
        self.captured = self.root / "captured_audio"
        self.models = self.root / "trained_wake_words"
        for directory in (self.personal, self.negative, self.captured, self.models):
            directory.mkdir()
        (self.personal / "me.wav").write_bytes(wav())
        (self.negative / "noise.wav").write_bytes(wav())
        (self.captured / "unknown.wav").write_bytes(wav())
        (self.captured / "unknown.json").write_text(json.dumps({"wake_word": "unknown phrase", "token": "never-public"}))
        (self.models / "unknown.tflite").write_bytes(b"TFL3legacy")
        (self.models / "unknown.json").write_text(json.dumps({"model": "unknown.tflite", "wake_word": "unknown phrase"}))
        self.original = {path: path.read_bytes() for path in self.root.rglob("*") if path.is_file()}
        self.runtime = StudioRuntime(self.root)
        self.word = self.runtime.workspaces.create("Hello legacy", "en", "hello_legacy")

    def tearDown(self):
        self.runtime.shutdown()
        self.temp.cleanup()

    def test_inspection_is_non_destructive_and_redacts_metadata(self):
        from studio.migration import MigrationService
        service = self.runtime.migration
        inventory = service.inspect()
        self.assertEqual(inventory.counts, {"personal": 1, "negative": 1, "captured": 1, "models": 1})
        self.assertTrue(inventory.requires_phrase_assignment)
        self.assertTrue(inventory.requires_model_assignment)
        self.assertNotIn("never-public", json.dumps(inventory, default=lambda value: value.__dict__))
        self.assertEqual({path: path.read_bytes() for path in self.root.rglob("*") if path.is_file() and path in self.original}, self.original)
        self.assertFalse((self.root / "studio" / "migration" / "inventory.json").exists())

    def test_import_requires_explicit_assignments_then_is_idempotent_with_backup_provenance(self):
        from studio.migration import LegacyImportSelection, MigrationService
        service = self.runtime.migration
        with self.assertRaises(ValidationError):
            service.import_into(self.word.id, LegacyImportSelection())
        selection = LegacyImportSelection(
            phrase_assignments={"unknown phrase": self.word.id},
            model_assignments={"unknown": self.word.id},
        )
        report = service.import_into(self.word.id, selection)
        self.assertEqual(report.imported_samples, 3)
        self.assertEqual(report.imported_models, 1)
        self.assertTrue((self.root / "studio" / "migration" / "inventory.json").is_file())
        self.assertTrue((self.root / "studio" / "migration" / "backups" / report.fingerprint).is_dir())
        self.assertEqual(self.runtime.samples.list(self.word.id, __import__("studio.models", fromlist=["SampleQuery"]).SampleQuery()).total, 3)
        self.assertTrue(all(item.source == "legacy" for item in self.runtime.samples.list(self.word.id, __import__("studio.models", fromlist=["SampleQuery"]).SampleQuery()).items))
        duplicate = service.import_into(self.word.id, selection)
        self.assertEqual(duplicate.imported_samples, 0)
        self.assertEqual(duplicate.imported_models, 0)
        self.assertEqual(self.runtime.training.versions(self.word.id).total, 1)
        self.assertEqual({path: path.read_bytes() for path in self.root.rglob("*") if path.is_file() and path in self.original}, self.original)

    def test_active_legacy_or_studio_job_blocks_import(self):
        from studio.migration import LegacyImportSelection, MigrationService
        service = self.runtime.migration
        job = self.runtime.jobs.enqueue("train", self.word.id, {"trigger": "manual"})
        with self.assertRaises(Conflict):
            service.import_into(self.word.id, LegacyImportSelection(
                phrase_assignments={"unknown phrase": self.word.id}, model_assignments={"unknown": self.word.id}))
        self.runtime.jobs.cancel(job.id)

    def test_routes_and_default_legacy_mode_isolation(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from studio.api import create_router
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        with TestClient(app) as client:
            response = client.get("/api/studio/migration")
            self.assertEqual(response.status_code, 200)
            self.assertNotIn("token", response.text)
            rejected = client.post("/api/studio/migration/import", json={})
            self.assertEqual(rejected.status_code, 422)


    def test_default_mode_starts_only_studio_workers_and_rejects_legacy_actions(self):
        import trainer_server as trainer
        from unittest.mock import patch
        if trainer.TRAINER_LEGACY_MODE:
            self.skipTest("explicit legacy-mode process")
        with patch.object(trainer.STUDIO_RUNTIME, "startup") as startup, patch.object(trainer.STUDIO_RUNTIME, "start_workers") as studio_workers, patch.object(trainer, "_start_auto_train_worker") as legacy_worker:
            trainer.start_auto_train_worker_event()
        startup.assert_called_once_with()
        studio_workers.assert_called_once_with()
        legacy_worker.assert_not_called()
        response = trainer.auto_train_action({"action": "review_now"})
        self.assertEqual(response.status_code, 409)
        self.assertIn("Studio mode", response.body.decode())


if __name__ == "__main__":
    unittest.main()
