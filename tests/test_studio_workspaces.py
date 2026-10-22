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
    def test_resolve_source_infers_unique_phrase(self):
        word = self.service.create('Hey Café', 'fr', 'hey_cafe')
        for phrase in ('  HEY   CAFE\u0301  ', 'Ｈｅｙ Café', 'hey_cafe'):
            with self.subTest(phrase=phrase):
                self.assertEqual(self.service.resolve_source('kiosk', 'mww', phrase), word.id)

    def test_explicit_mapping_overrides_inference(self):
        first = self.service.create('Hello', 'en', 'hello')
        other = self.service.create('Other', 'en', 'other')
        with self.store.transaction() as db:
            db.execute("INSERT INTO devices(id,url,role) VALUES ('kiosk','http://kiosk','standalone')")
        self.service.set_source_mapping('kiosk', 'mww', 'Hello', other.id)
        self.assertEqual(self.service.resolve_source('kiosk', 'mww', 'Hello'), other.id)
        self.assertEqual(self.service.resolve_source('different', 'mww', 'Hello'), first.id)

    def test_ambiguous_and_unknown_sources_stay_unmapped(self):
        self.service.create('Hey Robot', 'en', 'hey_robot')
        self.service.create('HEY  ROBOT', 'en', 'different')
        for phrase in ('hey robot', '', 'robot', 'Unknown'):
            self.assertIsNone(self.service.resolve_source('kiosk', 'mww', phrase))
        # Exact model ID and another workspace phrase disagree: fail closed.
        self.service.create('hey_robot', 'en', 'third')
        self.assertIsNone(self.service.resolve_source('kiosk', 'mww', 'hey_robot'))

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

    def test_generated_model_ids_are_safe_unique_and_stable(self):
        for phrase in ("Hey kitchen", "你好", "!!!", "é" * 200):
            first = self.service.create(phrase, "en")
            second = self.service.create(phrase, "en")
            self.assertRegex(first.model_id, r"^[a-z0-9][a-z0-9_-]{0,63}$")
            self.assertNotEqual(first.model_id, second.model_id)
            self.assertEqual(self.service.update(first.id, WakewordUpdate(phrase="Changed")).model_id, first.model_id)

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
            self.assertEqual(db.execute("PRAGMA user_version").fetchone()[0], 18)


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

    def test_create_without_model_id_and_delete_workspace(self):
        response = self.client.post('/api/studio/wakewords', json={'phrase': 'Hello', 'language': 'en'})
        self.assertEqual(response.status_code, 201, response.text)
        word = response.json()
        self.assertTrue(word['model_id'])
        self.assertEqual(self.client.delete(f'/api/studio/wakewords/{word["id"]}').status_code, 204)
        self.assertEqual(self.client.get(f'/api/studio/wakewords/{word["id"]}').status_code, 404)
        self.assertEqual(self.client.delete(f'/api/studio/wakewords/{word["id"]}').status_code, 404)

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
            self.client.post("/api/studio/wakewords", json={
                "phrase": "Other", "language": "en", "model_id": "hello"}),
            self.client.post("/api/studio/wakewords", json={"token": secret}),
            self.client.get("/api/studio/wakewords?limit=101"),
            self.client.get("/api/studio/wakewords/missing"),
        ]
        self.assertEqual([r.status_code for r in responses], [200, 200, 409, 422, 422, 404])
        self.assertEqual(responses[0].json()["total"], 1)
        for result in responses:
            self.assertNotIn(secret, result.text)

    def test_app_factory_serves_studio_and_ui_and_owns_worker_lifecycle(self):
        from unittest.mock import patch
        from trainer_server import create_app

        with tempfile.TemporaryDirectory() as directory:
            runtime = StudioRuntime(Path(directory))
            with patch.object(runtime, "start_workers") as start, patch.object(runtime, "shutdown") as stop:
                with TestClient(create_app(runtime)) as client:
                    start.assert_called_once()
                    self.assertEqual(client.get("/api/studio/wakewords").status_code, 200)
                    self.assertIn('id="trainer-app"', client.get("/").text)
                    self.assertEqual(client.get("/api/auto_train").status_code, 404)
                stop.assert_called_once()
            runtime.shutdown()
