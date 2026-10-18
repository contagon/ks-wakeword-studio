import io
import copy
import json
import os
import re
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch

from studio.models import Conflict, ValidationError
from studio.runtime import StudioRuntime


TMP_ROOT = Path("/tmp/opencode")


def wav() -> bytes:
    output = io.BytesIO()
    with wave.open(output, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(16000)
        handle.writeframes(b"\0\0" * 1600)
    return output.getvalue()


LEGACY_MUTATION_ROUTES = (
    ("put", "/api/auto_train", {"json": {}}),
    ("post", "/api/tater_link/claim", {"json": {}}),
    ("post", "/api/tater_link/unlink", {}),
    ("post", "/api/auto_train/action", {"json": {}}),
    ("post", "/api/start_session", {"json": {}}),
    ("post", "/api/stop_session", {}),
    ("post", "/api/upload_take", {}),
    ("post", "/api/upload_personal_sample", {}),
    ("post", "/api/upload_captured_audio", {}),
    ("post", "/api/upload_captured_audio_raw", {"content": b""}),
    ("delete", "/api/data/not-a-real-item", {}),
    ("delete", "/api/samples/personal/not-a-real-file.wav", {}),
    ("post", "/api/samples/personal/not-a-real-file.wav/vad", {}),
    ("post", "/api/samples/trim", {}),
    ("post", "/api/samples/revert", {}),
    ("post", "/api/captured_audio/not-a-real-file.wav/approve_personal", {}),
    ("post", "/api/captured_audio/not-a-real-file.wav/mark_negative", {}),
    ("post", "/api/captured_audio/not-a-real-file.wav/discard", {}),
    ("post", "/api/train", {"json": {}}),
    ("post", "/api/reset_recordings", {}),
    ("post", "/api/reset_negative_samples", {}),
)


class MigrationTests(unittest.TestCase):
    def setUp(self):
        TMP_ROOT.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=TMP_ROOT)
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

    def selection(self):
        from studio.migration import LegacyImportSelection
        return LegacyImportSelection(
            phrase_assignments={"unknown phrase": self.word.id},
            model_assignments={"unknown": self.word.id},
        )

    def test_inspection_is_non_destructive_and_redacts_metadata(self):
        inventory = self.runtime.migration.inspect()
        self.assertEqual(inventory.counts, {"personal": 1, "negative": 1, "captured": 1, "models": 1})
        self.assertEqual((inventory.skipped_samples, inventory.skipped_models), (0, 0))
        self.assertTrue(inventory.requires_phrase_assignment)
        self.assertTrue(inventory.requires_model_assignment)
        self.assertNotIn("never-public", json.dumps(inventory, default=lambda value: value.__dict__))
        self.assertEqual({path: path.read_bytes() for path in self.root.rglob("*") if path.is_file() and path in self.original}, self.original)
        self.assertFalse((self.root / "studio" / "migration" / "inventory.json").exists())

    def test_import_requires_explicit_assignments_then_is_idempotent_with_backup_provenance(self):
        from studio.migration import LegacyImportSelection
        service = self.runtime.migration
        with self.assertRaises(ValidationError):
            service.import_into(self.word.id, LegacyImportSelection())
        report = service.import_into(self.word.id, self.selection())
        self.assertEqual(report.imported_samples, 3)
        self.assertEqual(report.imported_models, 1)
        self.assertEqual((report.skipped_samples, report.skipped_models), (0, 0))
        self.assertTrue((self.root / "studio" / "migration" / "inventory.json").is_file())
        self.assertTrue((self.root / "studio" / "migration" / "backups" / report.fingerprint).is_dir())
        self.assertEqual(self.runtime.samples.list(self.word.id, __import__("studio.models", fromlist=["SampleQuery"]).SampleQuery()).total, 3)
        self.assertTrue(all(item.source == "legacy" for item in self.runtime.samples.list(self.word.id, __import__("studio.models", fromlist=["SampleQuery"]).SampleQuery()).items))
        duplicate = service.import_into(self.word.id, self.selection())
        self.assertEqual(duplicate.imported_samples, 0)
        self.assertEqual(duplicate.imported_models, 0)
        self.assertEqual(self.runtime.training.versions(self.word.id).total, 1)
        self.assertEqual({path: path.read_bytes() for path in self.root.rglob("*") if path.is_file() and path in self.original}, self.original)

    def test_symlinks_and_escapes_are_not_inventory_hashed_backed_up_or_imported(self):
        outside = Path(tempfile.mkdtemp(dir=TMP_ROOT))
        self.addCleanup(lambda: __import__("shutil").rmtree(outside, ignore_errors=True))
        external_wav = outside / "outside.wav"
        external_model = outside / "outside.tflite"
        external_sidecar = outside / "outside.json"
        external_wav.write_bytes(wav() + b"external-only")
        external_model.write_bytes(b"TFL3external")
        external_sidecar.write_text('{"wake_word": "external only", "secret": "never-copy"}')
        os.symlink(external_wav, self.personal / "external.wav")
        os.symlink(external_sidecar, self.personal / "me.json")
        os.symlink(external_model, self.models / "external.tflite")
        captured_dir = self.root / "captured_audio"
        (captured_dir / "unknown.wav").unlink()
        (captured_dir / "unknown.json").unlink()
        captured_dir.rmdir()
        os.symlink(outside, captured_dir)

        inventory = self.runtime.migration.inspect()
        self.assertEqual(inventory.counts, {"personal": 1, "negative": 1, "captured": 0, "models": 1})
        self.assertGreaterEqual(inventory.skipped_samples, 3)
        self.assertGreaterEqual(inventory.skipped_models, 1)
        self.assertNotIn("outside", inventory.fingerprint)

        report = self.runtime.migration.import_into(self.word.id, self.selection())
        self.assertEqual((report.imported_samples, report.imported_models), (2, 1))
        self.assertGreaterEqual(report.skipped_samples, 2)
        self.assertGreaterEqual(report.skipped_models, 1)
        backup = self.root / "studio" / "migration" / "backups" / report.fingerprint
        self.assertFalse((backup / "personal" / "external.wav").exists())
        self.assertFalse((backup / "models" / "external.tflite").exists())
        self.assertFalse((backup / "captured" / "outside.wav").exists())
        self.assertNotIn(external_wav.read_bytes(), [path.read_bytes() for path in backup.rglob("*") if path.is_file()])
        self.assertNotIn(external_model.read_bytes(), [path.read_bytes() for path in backup.rglob("*") if path.is_file()])
        self.assertNotIn(external_sidecar.read_bytes(), [path.read_bytes() for path in backup.rglob("*") if path.is_file()])

    def test_lexical_parent_escape_is_rejected_without_reading_outside_legacy_root(self):
        outside = self.root / "outside.wav"
        outside.write_bytes(wav())
        candidate = self.personal / ".." / "outside.wav"
        self.assertIsNone(self.runtime.migration._checked_file(candidate, self.personal))

    def test_real_legacy_training_state_blocks_import(self):
        import trainer_server as trainer
        service = self.runtime.migration
        original_active = service.legacy_active
        service.legacy_active = trainer.STUDIO_RUNTIME.legacy_active
        try:
            with trainer.STATE_LOCK:
                trainer.STATE["training"]["running"] = True
            with self.assertRaises(Conflict):
                service.import_into(self.word.id, self.selection())
        finally:
            with trainer.STATE_LOCK:
                trainer.STATE["training"]["running"] = False
            service.legacy_active = original_active

    def test_active_studio_job_blocks_import(self):
        job = self.runtime.jobs.enqueue("train", self.word.id, {"trigger": "manual"})
        with self.assertRaises(Conflict):
            self.runtime.migration.import_into(self.word.id, self.selection())
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

    def test_studio_restart_does_not_start_or_run_legacy_workers(self):
        import trainer_server as trainer
        if trainer.TRAINER_LEGACY_MODE:
            self.skipTest("explicit legacy-mode process")
        with patch.object(trainer.STUDIO_RUNTIME, "startup") as startup, \
             patch.object(trainer.STUDIO_RUNTIME, "start_workers") as studio_workers, \
             patch.object(trainer, "_start_auto_train_worker") as legacy_worker, \
             patch.object(trainer, "_auto_review_capture") as legacy_review, \
             patch.object(trainer, "_notify_tater_satellites") as legacy_publish:
            trainer.start_auto_train_worker_event()
            trainer.stop_auto_train_worker_event()
            trainer.start_auto_train_worker_event()
        self.assertEqual(startup.call_count, 2)
        self.assertEqual(studio_workers.call_count, 2)
        legacy_worker.assert_not_called()
        legacy_review.assert_not_called()
        legacy_publish.assert_not_called()
        with self.assertRaisesRegex(RuntimeError, "legacy singleton training is disabled"):
            trainer._start_training_thread("studio_word", "en", True, False, "modern")

    @staticmethod
    def _legacy_api_routes(app):
        return tuple(
            route for route in app.routes
            if getattr(route, "path", "").startswith("/api/")
            and not route.path.startswith("/api/studio/")
            and getattr(route, "methods", None)
        )

    @staticmethod
    def _legacy_data_tree_snapshot(root):
        if not root.exists():
            return ()
        return tuple(
            (str(path.relative_to(root)), path.lstat().st_size, path.lstat().st_mtime_ns)
            for path in sorted(root.rglob("*"))
        )

    def test_studio_mode_allowlisted_legacy_routes_are_pure(self):
        """Any future Studio compatibility exception must be state and disk pure."""
        import trainer_server as trainer
        from fastapi.testclient import TestClient

        if trainer.TRAINER_LEGACY_MODE:
            self.skipTest("explicit legacy-mode process")

        routes = {route.path: route for route in self._legacy_api_routes(trainer.app)}
        self.assertTrue(set(trainer.LEGACY_STUDIO_READONLY_PATHS).issubset(routes))
        # Production Studio code has /api/studio as its only API base.
        self.assertEqual(trainer.LEGACY_STUDIO_READONLY_PATHS, frozenset())

        seed = trainer.PERSONAL_DIR / f"allowlist-purity-{os.getpid()}.wav"
        seed.parent.mkdir(parents=True, exist_ok=True)
        previous_seed = seed.read_bytes() if seed.exists() else None
        seed.write_bytes(wav())
        with trainer.STATE_LOCK:
            original_state = copy.deepcopy(trainer.STATE)
            trainer.STATE.update(
                {
                    "raw_phrase": "legacy phrase",
                    "safe_word": "legacy_phrase",
                    "language": "invalid-language",
                    "english_accent": "invalid-accent",
                    "tts_mode": "invalid-mode",
                    "takes": ["previous.wav"],
                    "takes_received": 77,
                }
            )
            trainer.STATE["training"].update(
                {"last_sent_tail": ["previous tail"], "last_log_size": 321}
            )

        try:
            with TestClient(trainer.app) as client:
                for path in sorted(trainer.LEGACY_STUDIO_READONLY_PATHS):
                    with self.subTest(path=path):
                        route = routes[path]
                        method = "GET" if "GET" in route.methods else sorted(route.methods)[0]
                        before_tree = self._legacy_data_tree_snapshot(trainer.DATA_DIR)
                        with trainer.STATE_LOCK:
                            before_state = copy.deepcopy(trainer.STATE)
                        response = client.request(method, path)
                        self.assertNotEqual(response.status_code, 409)
                        with trainer.STATE_LOCK:
                            self.assertEqual(trainer.STATE, before_state)
                        self.assertEqual(self._legacy_data_tree_snapshot(trainer.DATA_DIR), before_tree)
        finally:
            if previous_seed is None:
                seed.unlink(missing_ok=True)
            else:
                seed.write_bytes(previous_seed)
            with trainer.STATE_LOCK:
                trainer.STATE.clear()
                trainer.STATE.update(original_state)

    def test_studio_mode_default_denies_every_non_studio_api_route(self):
        import trainer_server as trainer
        from fastapi.testclient import TestClient

        if trainer.TRAINER_LEGACY_MODE:
            self.skipTest("explicit legacy-mode process")

        routes = self._legacy_api_routes(trainer.app)
        self.assertTrue(routes)
        with TestClient(trainer.app) as client:
            for route in routes:
                if route.path in trainer.LEGACY_STUDIO_READONLY_PATHS:
                    continue
                path = re.sub(r"{[^}]+}", "not-a-real-item", route.path)
                for method in sorted(route.methods):
                    with self.subTest(method=method, path=route.path):
                        response = client.request(method, path)
                        self.assertEqual(response.status_code, 409)
                        self.assertIn("Legacy singleton actions are disabled in Studio mode", response.text)

    def test_every_legacy_mutation_is_conflicted_in_studio_and_not_conflicted_in_legacy_mode(self):
        import trainer_server as trainer
        from fastapi.testclient import TestClient
        if trainer.TRAINER_LEGACY_MODE:
            self.skipTest("explicit legacy-mode process")
        with TestClient(trainer.app) as client:
            for method, path, kwargs in LEGACY_MUTATION_ROUTES:
                with self.subTest(mode="studio", method=method, path=path):
                    response = getattr(client, method)(path, **kwargs)
                    self.assertEqual(response.status_code, 409)
                    self.assertIn("Legacy singleton actions are disabled in Studio mode", response.text)
            with patch.object(trainer, "TRAINER_LEGACY_MODE", True), \
                 patch.object(trainer, "_reset_personal_samples_dir"), \
                 patch.object(trainer, "_reset_audio_dir"):
                for method, path, kwargs in LEGACY_MUTATION_ROUTES:
                    with self.subTest(mode="legacy", method=method, path=path):
                        response = getattr(client, method)(path, **kwargs)
                        self.assertNotEqual(response.status_code, 409)


if __name__ == "__main__":
    unittest.main()
