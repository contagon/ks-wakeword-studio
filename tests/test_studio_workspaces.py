import sqlite3
import tempfile
import unittest
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from studio.api import create_router
from studio.db import Store
from studio.models import Conflict, NotFound, ValidationError, WakewordUpdate
from studio.runtime import StudioRuntime
from studio.workspaces import WorkspaceService


class WorkspaceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.store = Store.open(self.root)
        self.addCleanup(lambda: self.store.close())
        self.service = WorkspaceService(self.store)

    def test_workspaces_survive_restart(self):
        first = self.service.create("Hey kitchen", "en", "hey_kitchen")
        second = self.service.create("Hallo Büro", "de", "hallo_buro")
        self.store.close()
        self.store = Store.open(self.root)
        service = WorkspaceService(self.store)
        self.assertEqual(service.get(first.id).phrase, "Hey kitchen")
        self.assertEqual(service.get(second.id).language, "de")
        page = service.list(1, 1)
        self.assertEqual((page.total, page.offset, page.limit), (2, 1, 1))
        self.assertEqual(page.items[0].id, second.id)
        self.assertTrue((self.root / "studio/studio.sqlite3").is_file())

    def test_duplicate_model_id_rejected(self):
        self.service.create("Hello", "en", "hello")
        with self.assertRaises(Conflict):
            self.service.create("Different phrase", "de", "hello")
        self.assertEqual(self.service.list(0, 50).total, 1)

    def test_phrase_edit_keeps_model_id(self):
        word = self.service.create("Old phrase", "en", "stable_id")
        updated = self.service.update(word.id, WakewordUpdate(phrase="New phrase"))
        self.assertEqual((updated.id, updated.model_id, updated.phrase),
                         (word.id, "stable_id", "New phrase"))
        with self.assertRaises(sqlite3.IntegrityError):
            with self.store.transaction() as db:
                db.execute("UPDATE wakewords SET model_id = 'renamed' WHERE id = ?", (word.id,))
        self.assertEqual(self.service.get(word.id).model_id, "stable_id")

    def test_validation_and_missing_records(self):
        for model_id in ("../escape", "", "two words", "UPPER", "x" * 65):
            with self.subTest(model_id=model_id), self.assertRaises(ValidationError):
                self.service.create("Hello", "en", model_id)
        with self.assertRaises(ValidationError):
            self.service.create("  ", "en", "hello")
        for offset, limit in ((-1, 50), (0, 0), (0, 101)):
            with self.assertRaises(ValidationError):
                self.service.list(offset, limit)
        with self.assertRaises(NotFound):
            self.service.get("missing")
        with self.assertRaises(NotFound):
            self.service.update("missing", WakewordUpdate(phrase="Hello"))

    def test_transactions_rollback_and_schema_is_durable(self):
        with self.assertRaises(RuntimeError):
            with self.store.transaction() as db:
                db.execute("INSERT INTO wakewords VALUES (?, ?, ?, ?, ?, ?)",
                           ("id", "Phrase", "en", "model", "now", "now"))
                raise RuntimeError("interrupted")
        self.assertEqual(self.service.list(0, 50).total, 0)
        with self.store.transaction() as db:
            self.assertEqual(db.execute("PRAGMA foreign_keys").fetchone()[0], 1)
            self.assertEqual(db.execute("PRAGMA journal_mode").fetchone()[0], "wal")
            self.assertEqual(db.execute("PRAGMA user_version").fetchone()[0], 8)


class WorkspaceAPITests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "data"
        self.runtime = StudioRuntime(self.root)
        self.addCleanup(self.runtime.shutdown)
        app = FastAPI()
        app.include_router(create_router(self.runtime))
        self.client = TestClient(app)

    def test_runtime_is_lazy_idempotent_and_restartable(self):
        self.assertFalse(self.root.exists())
        self.runtime.startup()
        first = self.runtime.workspaces.create("Hello", "en", "hello")
        self.runtime.startup()
        self.assertEqual(self.runtime.workspaces.get(first.id), first)
        self.runtime.shutdown()
        self.runtime.shutdown()
        self.runtime.startup()
        self.assertEqual(self.runtime.workspaces.get(first.id), first)

    def test_workspace_apis_never_expose_tokens(self):
        secret = "private-admin-token-should-not-leak"
        response = self.client.post("/api/studio/wakewords", json={
            "phrase": "Hello", "language": "en", "model_id": "hello"})
        self.assertEqual(response.status_code, 201, response.text)
        word = response.json()
        self.assertEqual(set(word), {"id", "phrase", "language", "model_id", "created_at", "updated_at"})
        self.assertTrue(word["created_at"].endswith("+00:00"))
        responses = [
            self.client.get("/api/studio/wakewords"),
            self.client.get(f'/api/studio/wakewords/{word["id"]}'),
            self.client.patch(f'/api/studio/wakewords/{word["id"]}', json={"phrase": "New"}),
            self.client.post("/api/studio/wakewords", json={
                "phrase": "Other", "language": "en", "model_id": "hello"}),
            self.client.post("/api/studio/wakewords", json={"token": secret}),
            self.client.patch(f'/api/studio/wakewords/{word["id"]}', json={"model_id": secret}),
            self.client.get("/api/studio/wakewords?limit=101"),
            self.client.get("/api/studio/wakewords/missing"),
        ]
        self.assertEqual([r.status_code for r in responses], [200, 200, 200, 409, 422, 422, 422, 404])
        self.assertEqual(responses[0].json()["total"], 1)
        self.assertEqual(responses[2].json()["model_id"], "hello")
        for result in responses:
            self.assertNotIn(secret, result.text)

    def test_legacy_app_registers_studio_without_starting_workers(self):
        import trainer_server

        paths = {route.path for route in trainer_server.app.routes}
        self.assertIn("/api/studio/wakewords", paths)
        self.assertIn("/api/studio/wakewords/{word_id}", paths)
        self.assertIsNone(trainer_server.AUTO_TRAIN_WORKER)
