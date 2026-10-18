"""Explicit, non-destructive import of the former singleton trainer files."""

import hashlib
import io
import json
import shutil
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from studio.models import Conflict, ModelVersion, NotFound, ValidationError


@dataclass(frozen=True)
class LegacyInventory:
    fingerprint: str
    counts: dict[str, int]
    phrases: list[str]
    models: list[str]
    requires_phrase_assignment: bool
    requires_model_assignment: bool


@dataclass(frozen=True)
class LegacyImportSelection:
    phrase_assignments: dict[str, str] | None = None
    model_assignments: dict[str, str] | None = None


@dataclass(frozen=True)
class MigrationReport:
    fingerprint: str
    word_id: str
    imported_samples: int
    imported_models: int
    skipped_samples: int
    skipped_models: int


class MigrationService:
    """Copies legacy inputs into Studio; it never moves, deletes, or rewrites them."""

    def __init__(self, store, samples, training, *, legacy_active=lambda: False, clock=None):
        self.store, self.samples, self.training = store, samples, training
        self.legacy_active = legacy_active
        self.clock = clock or (lambda: datetime.now(timezone.utc))
        self.root = store.root.parent
        self.migration_root = store.root / "migration"

    def _now(self) -> str:
        return self.clock().astimezone(timezone.utc).isoformat()

    def _paths(self) -> dict[str, Path]:
        return {"personal": self.root / "personal_samples", "negative": self.root / "negative_samples",
                "captured": self.root / "captured_audio", "models": self.root / "trained_wake_words"}

    @staticmethod
    def _safe_json(path: Path) -> dict:
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
            return value if isinstance(value, dict) else {}
        except (OSError, ValueError):
            return {}

    def _audio(self) -> list[tuple[str, Path, str]]:
        rows: list[tuple[str, Path, str]] = []
        for category, directory in self._paths().items():
            if category == "models" or not directory.is_dir():
                continue
            label = "positive" if category == "personal" else "negative" if category == "negative" else "pending"
            for path in sorted(directory.glob("*.wav")):
                rows.append((category, path, label))
        return rows

    def _models(self) -> list[tuple[str, Path, Path | None, str]]:
        directory = self._paths()["models"]
        rows: list[tuple[str, Path, Path | None, str]] = []
        if not directory.is_dir():
            return rows
        for weights in sorted(directory.glob("*.tflite")):
            metadata = weights.with_suffix(".json")
            data = self._safe_json(metadata) if metadata.is_file() else {}
            identity = weights.stem
            phrase = str(data.get("wake_word") or "").strip()
            rows.append((identity, weights, metadata if metadata.is_file() else None, phrase))
        return rows

    def _fingerprint(self) -> str:
        digest = hashlib.sha256()
        for category, path, label in self._audio():
            digest.update(f"{category}:{path.name}:{label}:".encode())
            digest.update(hashlib.sha256(path.read_bytes()).digest())
            sidecar = path.with_suffix(".json")
            if sidecar.is_file():
                digest.update(hashlib.sha256(sidecar.read_bytes()).digest())
        for identity, weights, metadata, phrase in self._models():
            digest.update(f"model:{identity}:{phrase}:".encode())
            digest.update(hashlib.sha256(weights.read_bytes()).digest())
            if metadata:
                digest.update(hashlib.sha256(metadata.read_bytes()).digest())
        return digest.hexdigest()

    def inspect(self) -> LegacyInventory:
        phrases = sorted({str(self._safe_json(path.with_suffix(".json")).get("wake_word") or "").strip()
                          for category, path, _ in self._audio() if category == "captured"
                          and str(self._safe_json(path.with_suffix(".json")).get("wake_word") or "").strip()})
        models = [identity for identity, _weights, _metadata, _phrase in self._models()]
        known = {row[0] for row in self.store._connection.execute("SELECT model_id FROM wakewords").fetchall()}
        return LegacyInventory(self._fingerprint(), {"personal": sum(1 for c, _, _ in self._audio() if c == "personal"),
            "negative": sum(1 for c, _, _ in self._audio() if c == "negative"),
            "captured": sum(1 for c, _, _ in self._audio() if c == "captured"), "models": len(models)},
            phrases, models, bool(phrases), any(identity not in known for identity in models))

    def _validate_assignments(self, word_id: str, selection: LegacyImportSelection, inventory: LegacyInventory) -> None:
        if not isinstance(selection, LegacyImportSelection):
            raise ValidationError("Invalid migration selection")
        phrases = selection.phrase_assignments or {}
        models = selection.model_assignments or {}
        if not isinstance(phrases, dict) or not isinstance(models, dict):
            raise ValidationError("Invalid migration selection")
        if any(phrases.get(phrase) != word_id for phrase in inventory.phrases):
            raise ValidationError("Explicit workspace assignment is required for legacy phrases")
        known = {row[0] for row in self.store._connection.execute("SELECT model_id FROM wakewords").fetchall()}
        if any(models.get(identity) != word_id for identity in inventory.models if identity not in known):
            raise ValidationError("Explicit workspace assignment is required for legacy models")

    def _assert_idle(self) -> None:
        if self.legacy_active():
            raise Conflict("Legacy training or review is active; import is blocked")
        row = self.store._connection.execute("SELECT 1 FROM studio_jobs WHERE status IN ('queued','running','cancelling') LIMIT 1").fetchone()
        if row:
            raise Conflict("Studio jobs are active; import is blocked")

    def _backup(self, fingerprint: str) -> None:
        destination = self.migration_root / "backups" / fingerprint
        if destination.exists():
            return
        for category, directory in self._paths().items():
            if not directory.is_dir():
                continue
            for path in directory.iterdir():
                if path.is_file() and (path.suffix.lower() in {".wav", ".json", ".tflite"}):
                    target = destination / category / path.name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(path, target)
        destination.parent.mkdir(parents=True, exist_ok=True)
        (self.migration_root / "inventory.json").write_text(json.dumps(asdict(self.inspect()), sort_keys=True), encoding="utf-8")

    def _import_model(self, word, identity: str, source: Path, metadata: Path | None, fingerprint: str) -> None:
        version_id, run_id, now = uuid4().hex, uuid4().hex, self._now()
        parent = self.store.root / "models" / word["id"]
        stage = parent / (".legacy-" + version_id)
        destination = parent / version_id
        stage.mkdir(parents=True)
        weights = stage / f"{word['model_id']}.tflite"
        shutil.copy2(source, weights)
        data = self._safe_json(metadata) if metadata else {}
        data.update({"type": data.get("type", "micro"), "model": weights.name, "wake_word": word['phrase']})
        manifest = stage / f"{word['model_id']}.json"
        manifest.write_text(json.dumps(data, sort_keys=True), encoding="utf-8")
        checksums = {path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in (weights, manifest)}
        version = ModelVersion(version_id, word['id'], word['model_id'], run_id, now, str(destination), fingerprint, checksums, {"source": "legacy"})
        run = {"schema_version": 1, "run_id": run_id, "word_id": word['id'], "model_id": word['model_id'],
               "phrase": word['phrase'], "language": word['language'], "audio": [], "datasets": [], "selected_batches": [],
               "fingerprint": fingerprint, "created_at": now, "legacy_identity": identity}
        stage.rename(destination)
        with self.store.transaction() as db:
            db.execute("INSERT INTO studio_jobs(id,kind,word_id,resource,payload,status,created_at,started_at,finished_at,result) VALUES (?,?,?,?,?,'complete',?,?,?,?)",
                       (run_id, "train", word['id'], "gpu", "{}", now, now, now, json.dumps({"legacy": True})))
            db.execute("INSERT INTO training_runs VALUES (?,?,?)", (run_id, word['id'], json.dumps(run, sort_keys=True)))
            db.execute("INSERT INTO model_versions VALUES (?,?,?,?)", (version_id, word['id'], run_id, json.dumps(asdict(version), sort_keys=True)))
            db.execute("INSERT INTO migration_model_provenance VALUES (?,?,?)", (version_id, str(source.relative_to(self.root)), fingerprint))

    def _import_audio(self, word_id: str, path: Path, label: str):
        if label != "pending":
            return self.samples.import_audio(word_id, label, io.BytesIO(path.read_bytes()))
        original, normalized = self.samples._prepare(io.BytesIO(path.read_bytes()))
        with self.store.transaction() as db:
            self.samples._word(db, word_id)
            audio_id = self.samples._audio(db, original, normalized)
            return self.samples._new_sample(db, word_id, None, audio_id, "pending", "import")

    def import_into(self, word_id: str, selection: LegacyImportSelection) -> MigrationReport:
        word = self.store._connection.execute("SELECT * FROM wakewords WHERE id=?", (word_id,)).fetchone()
        if word is None:
            raise NotFound("Workspace not found")
        inventory = self.inspect()
        self._validate_assignments(word_id, selection, inventory)
        self._assert_idle()
        with self.store.transaction() as db:
            previous = db.execute("SELECT report FROM migration_imports WHERE fingerprint=? AND word_id=?", (inventory.fingerprint, word_id)).fetchone()
            if previous:
                saved = json.loads(previous[0])
                return MigrationReport(inventory.fingerprint, word_id, 0, 0, saved["imported_samples"], saved["imported_models"])
        self._backup(inventory.fingerprint)
        imported_samples = 0
        for category, path, label in self._audio():
            # Captures retain human review as pending, instead of silently classifying them.
            sample = self._import_audio(word_id, path, label)
            with self.store.transaction() as db:
                db.execute("INSERT INTO migration_sample_provenance VALUES (?,?,?,?)", (sample.id, "legacy", str(path.relative_to(self.root)), inventory.fingerprint))
            imported_samples += 1
        imported_models = 0
        for identity, weights, metadata, _phrase in self._models():
            assignment = (selection.model_assignments or {}).get(identity)
            if identity == word["model_id"] or assignment == word_id:
                self._import_model(word, identity, weights, metadata, inventory.fingerprint)
                imported_models += 1
        report = MigrationReport(inventory.fingerprint, word_id, imported_samples, imported_models, 0, 0)
        with self.store.transaction() as db:
            db.execute("INSERT INTO migration_imports VALUES (?,?,?,?)", (inventory.fingerprint, word_id, self._now(), json.dumps(asdict(report), sort_keys=True)))
        return report
