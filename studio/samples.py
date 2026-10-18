"""Manual classification with durable source tombstones and immutable lineage.

Visible deletion is metadata-only. Audio records and history are retained even
without a current visible sample: future run manifests may reference any version.
This service deliberately performs no blob garbage collection.
"""

import io
import json
import math
import sqlite3
import wave
from collections.abc import Callable
from dataclasses import fields, replace
from datetime import datetime, timezone
from typing import BinaryIO
from uuid import uuid4

from studio.db import Store
from studio.models import (Conflict, DiagnosticClip, NotFound, Page, Recording, Sample,
                           SampleQuery, ValidationError)
from studio.storage import BlobStore, normalize_audio
from studio.workspaces import WorkspaceService, utc_now


SAMPLE_SELECT = """SELECT s.*, a.original_hash, a.normalized_hash, a.family_id
    FROM samples s JOIN audio_records a ON a.id=s.audio_id
    LEFT JOIN recordings r ON r.id=s.recording_id"""
RECORDING_SELECT = """SELECT r.*, a.original_hash, a.normalized_hash, a.family_id
    FROM recordings r JOIN audio_records a ON a.id=r.audio_id"""


def _public_metadata(raw: object) -> dict[str, object]:
    """Project retained provenance onto numeric diagnostics safe for public records.

    No arbitrary strings, nested structures, or unknown keys are public, even
    under a recognized field name. Apply on reads so existing records are safe
    without rewriting their immutable raw provenance.
    """
    bounds = {"duration": (0, 600), "duration_s": (0, 600),
              "duration_ms": (0, 600000), "sample_rate": (1, 192000),
              "channels": (1, 8), "frames": (0, 115200000)}
    if not isinstance(raw, dict):
        return {}
    return {key: value for key, (minimum, maximum) in bounds.items()
            if type(value := raw.get(key)) in (int, float)
            and minimum <= value <= maximum and math.isfinite(value)}


def _sample(db: sqlite3.Connection, row: sqlite3.Row) -> Sample:
    values = {f.name: row[f.name] for f in fields(Sample) if f.name != "recording"}
    recording = None
    if row["recording_id"]:
        recording = _recording(db.execute(RECORDING_SELECT + " WHERE r.id=?", (row["recording_id"],)).fetchone())
    return Sample(**values, recording=recording)


def _recording(row: sqlite3.Row) -> Recording:
    values = {f.name: row[f.name] for f in fields(Recording)}
    values["scores"] = json.loads(values["scores"])
    values["metadata"] = _public_metadata(json.loads(values["metadata"]))
    for name in ("near_miss", "quarantined"):
        values[name] = bool(values[name])
    return Recording(**values)


class SampleService:
    def __init__(self, store: Store, blobs: BlobStore, clock: Callable[[], datetime] = utc_now):
        self.store = store
        self.blobs = blobs
        self.clock = clock

    def _now(self) -> str:
        return self.clock().astimezone(timezone.utc).isoformat()

    @staticmethod
    def _word(db: sqlite3.Connection, word_id: str) -> None:
        if db.execute("SELECT 1 FROM wakewords WHERE id=?", (word_id,)).fetchone() is None:
            raise NotFound("Wakeword not found")

    @staticmethod
    def _label(label: str) -> None:
        if label not in ("positive", "negative", "discarded"):
            raise ValidationError("Invalid manual label")

    @staticmethod
    def _revision(row: sqlite3.Row, expected: int) -> None:
        if type(expected) is not int or expected < 0:
            raise ValidationError("Invalid revision")
        if row["revision"] != expected:
            raise Conflict("Stale sample revision")

    @staticmethod
    def _date(value: str | None) -> str | None:
        if value is None:
            return None
        try:
            parsed = datetime.fromisoformat(value)
            if parsed.tzinfo is None:
                raise ValueError()
            return parsed.astimezone(timezone.utc).isoformat()
        except (TypeError, ValueError) as exc:
            raise ValidationError("Invalid timestamp") from exc

    def _prepare(self, audio: BinaryIO) -> tuple[str, str]:
        data = audio.read(self.blobs.max_bytes + 1)
        if not isinstance(data, bytes):
            raise ValidationError("Invalid audio stream")
        normalized = normalize_audio(data, self.blobs.max_bytes)
        original = self.blobs.put(io.BytesIO(data))
        training = self.blobs.put(io.BytesIO(normalized))
        return original.sha256, training.sha256

    def _audio(self, db: sqlite3.Connection, original: str, normalized: str,
               parent: sqlite3.Row | None = None, start: float | None = None,
               end: float | None = None) -> str:
        known = db.execute("SELECT family_id FROM audio_families WHERE content_hash=?", (normalized,)).fetchone()
        family = parent["family_id"] if parent else (known[0] if known else normalized)
        if known and known[0] != family:
            # Never merge previously split evaluation families silently.
            raise Conflict("Derivative collides with another audio family")
        db.execute("INSERT OR IGNORE INTO audio_families VALUES (?,?)", (normalized, family))
        audio_id = uuid4().hex
        db.execute("INSERT INTO audio_records VALUES (?,?,?,?,?,?,?,?)",
                   (audio_id, original, normalized, family, parent["audio_id"] if parent else None,
                    start, end, self._now()))
        return audio_id

    def ingest(self, device_id: str, clip: DiagnosticClip, audio: BinaryIO, word_id: str | None) -> Recording:
        device_id = WorkspaceService._text(device_id, 200)
        clip_id = WorkspaceService._text(clip.id, 200)
        if not isinstance(clip.phrase, str) or len(clip.phrase) > 200 or not isinstance(clip.engine, str) or len(clip.engine) > 100:
            raise ValidationError("Invalid diagnostic metadata")
        if type(clip.near_miss) is not bool or not isinstance(clip.scores, dict) or not isinstance(clip.metadata, dict):
            raise ValidationError("Invalid diagnostic metadata")
        if any(not isinstance(k, str) or type(v) not in (int, float) or not math.isfinite(v)
               for k, v in clip.scores.items()):
            raise ValidationError("Invalid diagnostic scores")
        try:
            scores = json.dumps(clip.scores, allow_nan=False)
            metadata = json.dumps(clip.metadata, allow_nan=False)
        except (TypeError, ValueError, RecursionError) as exc:
            raise ValidationError("Invalid diagnostic metadata") from exc
        if len(scores.encode()) > 4096 or len(metadata.encode()) > 16384:
            raise ValidationError("Diagnostic metadata exceeds limit")
        timestamp = self._date(clip.timestamp)
        if word_id is not None:
            WorkspaceService(self.store).get(word_id)
        original, normalized = self._prepare(audio)
        with self.store.transaction() as db:
            existing = db.execute(RECORDING_SELECT + " WHERE r.device_id=? AND r.clip_id=?", (device_id, clip_id)).fetchone()
            if existing:
                if existing["original_hash"] != original:
                    db.execute("INSERT OR IGNORE INTO recording_conflicts VALUES (?,?,?)", (existing["id"], original, self._now()))
                    db.execute("UPDATE recordings SET quarantined=1 WHERE id=?", (existing["id"],))
                # No relabel/reassignment/resurrection on repeated collection.
                return _recording(db.execute(RECORDING_SELECT + " WHERE r.id=?", (existing["id"],)).fetchone())
            if word_id is not None:
                self._word(db, word_id)
            audio_id = self._audio(db, original, normalized)
            recording_id = uuid4().hex
            db.execute("INSERT INTO recordings VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                       (recording_id, device_id, clip_id, timestamp, clip.phrase, clip.engine,
                        int(clip.near_miss), scores, metadata, audio_id, word_id, 0, self._now()))
            if word_id is not None:
                self._new_sample(db, word_id, recording_id, audio_id, "pending", "diagnostic")
            return _recording(db.execute(RECORDING_SELECT + " WHERE r.id=?", (recording_id,)).fetchone())

    def _new_sample(self, db: sqlite3.Connection, word_id: str, recording_id: str | None,
                    audio_id: str, label: str, source: str) -> Sample:
        sample_id, now = uuid4().hex, self._now()
        db.execute("INSERT INTO samples VALUES (?,?,?,?,?,0,?,0,?,?)",
                   (sample_id, word_id, recording_id, audio_id, label, source, now, now))
        return _sample(db, db.execute(SAMPLE_SELECT + " WHERE s.id=?", (sample_id,)).fetchone())

    def assign(self, recording_id: str, word_id: str) -> Sample:
        with self.store.transaction() as db:
            self._word(db, word_id)
            row = db.execute("SELECT * FROM recordings WHERE id=?", (recording_id,)).fetchone()
            if row is None:
                raise NotFound("Recording not found")
            if row["quarantined"]:
                raise Conflict("Recording is quarantined")
            if row["word_id"]:
                if row["word_id"] != word_id:
                    raise Conflict("Recording already assigned")
                return _sample(db, self._get(db, db.execute("SELECT id FROM samples WHERE recording_id=?", (recording_id,)).fetchone()[0]))
            db.execute("UPDATE recordings SET word_id=? WHERE id=?", (word_id, recording_id))
            return self._new_sample(db, word_id, recording_id, row["audio_id"], "pending", "diagnostic")

    def import_audio(self, word_id: str, label: str, audio: BinaryIO) -> Sample:
        self._label(label)
        WorkspaceService(self.store).get(word_id)
        original, normalized = self._prepare(audio)
        with self.store.transaction() as db:
            self._word(db, word_id)
            return self._new_sample(db, word_id, None, self._audio(db, original, normalized), label, "import")

    @staticmethod
    def _get(db: sqlite3.Connection, sample_id: str, word_id: str | None = None) -> sqlite3.Row:
        row = db.execute(SAMPLE_SELECT + " WHERE s.id=? AND s.deleted=0", (sample_id,)).fetchone()
        if row is None or (word_id is not None and row["word_id"] != word_id):
            raise NotFound("Sample not found")
        return row

    def get(self, sample_id: str, word_id: str | None = None) -> Sample:
        with self.store.transaction() as db:
            return _sample(db, self._get(db, sample_id, word_id))

    @staticmethod
    def _editable(db: sqlite3.Connection, row: sqlite3.Row) -> None:
        if row["recording_id"] and db.execute("SELECT quarantined FROM recordings WHERE id=?", (row["recording_id"],)).fetchone()[0]:
            raise Conflict("Recording is quarantined")

    def _change(self, db: sqlite3.Connection, row: sqlite3.Row, label: str, audio_id: str, action: str) -> Sample:
        self._editable(db, row)
        revision, now = row["revision"] + 1, self._now()
        db.execute("INSERT INTO sample_history (sample_id,revision,action,old_label,old_audio_id,new_label,new_audio_id,created_at) VALUES (?,?,?,?,?,?,?,?)",
                   (row["id"], revision, action, row["label"], row["audio_id"], label, audio_id, now))
        db.execute("UPDATE samples SET label=?,audio_id=?,revision=?,updated_at=? WHERE id=?",
                   (label, audio_id, revision, now, row["id"]))
        return _sample(db, self._get(db, row["id"]))

    def set_label(self, sample_id: str, label: str, expected_revision: int) -> Sample:
        self._label(label)
        with self.store.transaction() as db:
            row = self._get(db, sample_id)
            self._revision(row, expected_revision)
            if row["label"] == label:
                raise ValidationError("Label is unchanged")
            return self._change(db, row, label, row["audio_id"], "label")

    def undo(self, sample_id: str, expected_revision: int) -> Sample:
        with self.store.transaction() as db:
            row = self._get(db, sample_id)
            self._revision(row, expected_revision)
            self._editable(db, row)
            history = db.execute("SELECT * FROM sample_history WHERE sample_id=? AND undone=0 ORDER BY revision DESC LIMIT 1", (sample_id,)).fetchone()
            if history is None:
                raise Conflict("No change to undo")
            db.execute("UPDATE sample_history SET undone=1 WHERE id=?", (history["id"],))
            db.execute("UPDATE samples SET label=?,audio_id=?,revision=revision+1,updated_at=? WHERE id=?",
                       (history["old_label"], history["old_audio_id"], self._now(), sample_id))
            return _sample(db, self._get(db, sample_id))

    def delete(self, sample_id: str, expected_revision: int) -> None:
        with self.store.transaction() as db:
            row = self._get(db, sample_id)
            self._revision(row, expected_revision)
            db.execute("UPDATE samples SET deleted=1,revision=revision+1,updated_at=? WHERE id=?", (self._now(), sample_id))

    def audio(self, sample_id: str, word_id: str, original: bool = False) -> bytes:
        sample = self.get(sample_id, word_id)
        return self.blobs.read(sample.original_hash if original else sample.normalized_hash)

    def trim(self, sample_id: str, start_s: float, end_s: float, expected_revision: int) -> Sample:
        if any(type(v) not in (int, float) or not math.isfinite(v) for v in (start_s, end_s)) or not 0 <= start_s < end_s:
            raise ValidationError("Invalid trim interval")
        # Keep the revision claim and immutable file publication in one transaction.
        with self.store.transaction() as db:
            row = self._get(db, sample_id)
            self._revision(row, expected_revision)
            with wave.open(io.BytesIO(self.blobs.read(row["normalized_hash"])), "rb") as source:
                if end_s > source.getnframes() / 16000 or int(end_s * 16000) <= int(start_s * 16000):
                    raise ValidationError("Invalid trim interval")
                source.setpos(int(start_s * 16000))
                pcm = source.readframes(int(end_s * 16000) - int(start_s * 16000))
            output = io.BytesIO()
            with wave.open(output, "wb") as target:
                target.setparams((1, 2, 16000, 0, "NONE", "not compressed"))
                target.writeframes(pcm)
            normalized = self.blobs.put(io.BytesIO(output.getvalue())).sha256
            audio_id = self._audio(db, row["original_hash"], normalized, row, start_s, end_s)
            return self._change(db, row, row["label"], audio_id, "trim")

    def _query(self, query: SampleQuery) -> tuple[list[str], list[object]]:
        if type(query.offset) is not int or query.offset < 0 or type(query.limit) is not int or not 1 <= query.limit <= 100:
            raise ValidationError("Invalid pagination")
        if query.label not in (None, "pending", "positive", "negative", "discarded") or query.source not in (None, "diagnostic", "import"):
            raise ValidationError("Invalid filter")
        if not isinstance(query.search, str) or len(query.search) > 200 or query.near_miss not in (None, True, False):
            raise ValidationError("Invalid filter")
        clauses, params = [], []
        for column, value in (("r.device_id", query.device_id), ("r.near_miss", query.near_miss)):
            if value is not None:
                clauses.append(column + "=?")
                params.append(value)
        for op, value in ((">=", query.after), ("<=", query.before)):
            if value is not None:
                clauses.append("COALESCE(r.timestamp,r.created_at)" + op + "?")
                params.append(self._date(value))
        if query.search:
            clauses.append("instr(lower(r.phrase),lower(?))>0")
            params.append(query.search)
        return clauses, params

    def list(self, word_id: str, query: SampleQuery) -> Page[Sample]:
        clauses, params = self._query(query)
        clauses = [clause.replace("r.created_at", "s.created_at") for clause in clauses]
        clauses += ["s.word_id=?", "s.deleted=0", "COALESCE(r.quarantined,0)=0"]
        params.append(word_id)
        for column, value in (("s.label", query.label), ("s.source", query.source)):
            if value is not None:
                clauses.append(column + "=?")
                params.append(value)
        where = " WHERE " + " AND ".join(clauses)
        with self.store.transaction() as db:
            self._word(db, word_id)
            total = db.execute("SELECT count(*) FROM (" + SAMPLE_SELECT + where + ")", params).fetchone()[0]
            rows = db.execute(SAMPLE_SELECT + where + " ORDER BY s.created_at,s.id LIMIT ? OFFSET ?", params + [query.limit, query.offset]).fetchall()
            return Page([_sample(db, row) for row in rows], total, query.offset, query.limit)

    def queue(self, word_id: str, query: SampleQuery) -> Page[Sample]:
        if query.label not in (None, "pending"):
            raise ValidationError("Queue contains only pending samples")
        return self.list(word_id, replace(query, label="pending"))

    def unmapped(self, query: SampleQuery) -> Page[Recording]:
        clauses, params = self._query(query)
        if query.label is not None or query.source not in (None, "diagnostic"):
            raise ValidationError("Invalid unmapped filter")
        clauses += ["r.word_id IS NULL", "r.quarantined=0"]
        where = " WHERE " + " AND ".join(clauses)
        with self.store.transaction() as db:
            total = db.execute("SELECT count(*) FROM (" + RECORDING_SELECT + where + ")", params).fetchone()[0]
            rows = db.execute(RECORDING_SELECT + where + " ORDER BY r.created_at,r.id LIMIT ? OFFSET ?", params + [query.limit, query.offset]).fetchall()
            return Page([_recording(row) for row in rows], total, query.offset, query.limit)
