"""Wakeword identity and display settings, independent of legacy global paths."""

import re
import sqlite3
from collections.abc import Callable
from datetime import datetime, timezone
from uuid import uuid4

from studio.db import Store
from studio.models import Conflict, NotFound, Page, SourceMapping, ValidationError, Wakeword, WakewordUpdate


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class WorkspaceService:
    def __init__(self, store: Store, clock: Callable[[], datetime] = utc_now):
        self.store = store
        self.clock = clock

    def _timestamp(self) -> str:
        return self.clock().astimezone(timezone.utc).isoformat()

    def set_source_mapping(self, device_id: str, engine: str, source_phrase: str, word_id: str) -> None:
        # Exact per-device/engine names only. Display phrases are not identities.
        for value, bound in ((engine, 100), (source_phrase, 200)):
            if self._text(value, bound) != value:
                raise ValidationError("Source mappings require exact names")
        with self.store.transaction() as db:
            if db.execute("SELECT 1 FROM devices WHERE id=?", (device_id,)).fetchone() is None:
                raise NotFound("Device not found")
            if db.execute("SELECT 1 FROM wakewords WHERE id=?", (word_id,)).fetchone() is None:
                raise NotFound("Wakeword not found")
            db.execute("""INSERT INTO source_mappings VALUES (?,?,?,?)
                          ON CONFLICT(device_id,engine,source_phrase) DO UPDATE SET word_id=excluded.word_id""",
                       (device_id, engine, source_phrase, word_id))

    def source_mappings(self, device_id: str) -> list[SourceMapping]:
        with self.store.transaction() as db:
            if db.execute("SELECT 1 FROM devices WHERE id=?", (device_id,)).fetchone() is None:
                raise NotFound("Device not found")
            return [SourceMapping(**dict(row)) for row in db.execute(
                "SELECT * FROM source_mappings WHERE device_id=? ORDER BY engine,source_phrase", (device_id,))]

    def resolve_source(self, device_id: str, engine: str, source_phrase: str) -> str | None:
        with self.store.transaction() as db:
            rows = db.execute("SELECT word_id FROM source_mappings WHERE device_id=? AND engine=? AND source_phrase=?",
                              (device_id, engine, source_phrase)).fetchall()
            return rows[0][0] if len(rows) == 1 else None

    @staticmethod
    def _text(value: str, maximum: int) -> str:
        if not isinstance(value, str) or not 1 <= len(value.strip()) <= maximum:
            raise ValidationError("Invalid workspace text")
        if any(ord(char) < 32 for char in value):
            raise ValidationError("Invalid workspace text")
        return value.strip()

    def create(self, phrase: str, language: str, model_id: str) -> Wakeword:
        phrase = self._text(phrase, 200)
        language = self._text(language, 35)
        if not isinstance(model_id, str) or not re.fullmatch(r"[a-z0-9][a-z0-9_-]{0,63}", model_id):
            raise ValidationError("Invalid model identifier")
        now = self._timestamp()
        word = Wakeword(uuid4().hex, phrase, language, model_id, now, now)
        try:
            with self.store.transaction() as db:
                db.execute("INSERT INTO wakewords VALUES (?, ?, ?, ?, ?, ?)",
                           (word.id, phrase, language, model_id, now, now))
        except sqlite3.IntegrityError as exc:
            raise Conflict("Model identifier already exists") from exc
        return word

    def get(self, word_id: str) -> Wakeword:
        with self.store.transaction() as db:
            row = db.execute("SELECT * FROM wakewords WHERE id = ?", (word_id,)).fetchone()
            if row is None:
                raise NotFound("Wakeword not found")
            return Wakeword(**dict(row))

    def list(self, offset: int = 0, limit: int = 50) -> Page[Wakeword]:
        if not isinstance(offset, int) or not isinstance(limit, int) or offset < 0 or not 1 <= limit <= 100:
            raise ValidationError("Invalid pagination")
        with self.store.transaction() as db:
            total = db.execute("SELECT COUNT(*) FROM wakewords").fetchone()[0]
            rows = db.execute("SELECT * FROM wakewords ORDER BY created_at, id LIMIT ? OFFSET ?",
                              (limit, offset)).fetchall()
            return Page([Wakeword(**dict(row)) for row in rows], total, offset, limit)

    def update(self, word_id: str, changes: WakewordUpdate) -> Wakeword:
        phrase = self._text(changes.phrase, 200) if changes.phrase is not None else None
        language = self._text(changes.language, 35) if changes.language is not None else None
        with self.store.transaction() as db:
            row = db.execute("SELECT * FROM wakewords WHERE id = ?", (word_id,)).fetchone()
            if row is None:
                raise NotFound("Wakeword not found")
            db.execute("UPDATE wakewords SET phrase = ?, language = ?, updated_at = ? WHERE id = ?",
                       (phrase if phrase is not None else row["phrase"],
                        language if language is not None else row["language"], self._timestamp(), word_id))
            return Wakeword(**dict(db.execute("SELECT * FROM wakewords WHERE id = ?", (word_id,)).fetchone()))
