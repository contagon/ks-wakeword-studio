"""Explicit, non-destructive import of real files from the former singleton trainer."""

import hashlib
import io
import json
import os
import stat
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
    skipped_samples: int = 0
    skipped_models: int = 0


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


@dataclass(frozen=True)
class _LegacyFile:
    path: Path
    root: Path
    device: int
    inode: int


@dataclass(frozen=True)
class _LegacyInputs:
    audio: list[tuple[str, _LegacyFile, str]]
    models: list[tuple[str, _LegacyFile, _LegacyFile | None, str]]
    skipped_samples: int
    skipped_models: int


class MigrationService:
    """Copies verified legacy inputs into Studio; it never moves, deletes, or rewrites them."""

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
    def _contained(path: Path, root: Path) -> bool:
        try:
            path.relative_to(root)
            return True
        except ValueError:
            return False

    def _checked_root(self, path: Path) -> Path | None:
        """Return a real legacy directory only when it is contained and never a symlink."""
        try:
            root_stat = os.lstat(path)
            if stat.S_ISLNK(root_stat.st_mode) or not stat.S_ISDIR(root_stat.st_mode):
                return None
            root = path.resolve(strict=True)
            configured_root = self.root.resolve(strict=True)
            return root if self._contained(root, configured_root) else None
        except OSError:
            return None

    def _checked_file(self, path: Path, legacy_root: Path) -> _LegacyFile | None:
        """Validate a legacy file without following its final path component.

        The caller must use the returned object with ``_read_file`` rather than
        ``Path.read_bytes`` or ``shutil.copy2`` so each data read retains the
        lstat/O_NOFOLLOW boundary.
        """
        root = self._checked_root(legacy_root)
        if root is None:
            return None
        try:
            path_stat = os.lstat(path)
            if stat.S_ISLNK(path_stat.st_mode) or not stat.S_ISREG(path_stat.st_mode):
                return None
            resolved = path.resolve(strict=True)
            if not self._contained(resolved, root):
                return None
            flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
            descriptor = os.open(path, flags)
            try:
                opened = os.fstat(descriptor)
            finally:
                os.close(descriptor)
            if (not stat.S_ISREG(opened.st_mode)
                    or (opened.st_dev, opened.st_ino) != (path_stat.st_dev, path_stat.st_ino)):
                return None
            return _LegacyFile(path, legacy_root, int(path_stat.st_dev), int(path_stat.st_ino))
        except OSError:
            return None

    def _read_file(self, item: _LegacyFile) -> bytes | None:
        """Read a file only after re-checking containment and its inode identity."""
        checked = self._checked_file(item.path, item.root)
        if checked is None or (checked.device, checked.inode) != (item.device, item.inode):
            return None
        try:
            descriptor = os.open(item.path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
            with os.fdopen(descriptor, "rb") as handle:
                opened = os.fstat(handle.fileno())
                if (not stat.S_ISREG(opened.st_mode)
                        or (opened.st_dev, opened.st_ino) != (item.device, item.inode)):
                    return None
                return handle.read()
        except OSError:
            return None

    def _safe_json(self, item: _LegacyFile | None) -> dict:
        if item is None:
            return {}
        try:
            value = json.loads((self._read_file(item) or b"").decode("utf-8"))
            return value if isinstance(value, dict) else {}
        except (UnicodeDecodeError, ValueError):
            return {}

    def _files(self, category: str, suffix: str) -> tuple[Path | None, list[_LegacyFile], int]:
        directory = self._paths()[category]
        root = self._checked_root(directory)
        if root is None:
            # A configured legacy root that exists but is unsafe is explicitly
            # reported as skipped without scanning through its symlink.
            return None, [], int(os.path.lexists(directory))
        files: list[_LegacyFile] = []
        skipped = 0
        try:
            with os.scandir(root) as entries:
                for entry in entries:
                    if not entry.name.lower().endswith(suffix):
                        continue
                    checked = self._checked_file(Path(entry.path), root)
                    if checked is None:
                        skipped += 1
                    else:
                        files.append(checked)
        except OSError:
            return root, files, skipped + 1
        return root, sorted(files, key=lambda item: item.path.name), skipped

    def _inputs(self) -> _LegacyInputs:
        audio: list[tuple[str, _LegacyFile, str]] = []
        skipped_samples = 0
        for category, label in (("personal", "positive"), ("negative", "negative"), ("captured", "pending")):
            _root, files, skipped = self._files(category, ".wav")
            skipped_samples += skipped
            for path in files:
                sidecar = path.path.with_suffix(".json")
                if os.path.lexists(sidecar) and self._checked_file(sidecar, path.root) is None:
                    skipped_samples += 1
                audio.append((category, path, label))
        model_root, weights, skipped_models = self._files("models", ".tflite")
        models: list[tuple[str, _LegacyFile, _LegacyFile | None, str]] = []
        for weight in weights:
            metadata_path = weight.path.with_suffix(".json")
            metadata = self._checked_file(metadata_path, model_root) if model_root else None
            if os.path.lexists(metadata_path) and metadata is None:
                skipped_models += 1
            models.append((weight.path.stem, weight, metadata, str(self._safe_json(metadata).get("wake_word") or "").strip()))
        return _LegacyInputs(audio, models, skipped_samples, skipped_models)

    def _fingerprint(self, inputs: _LegacyInputs) -> str:
        digest = hashlib.sha256()
        for category, path, label in inputs.audio:
            data = self._read_file(path)
            if data is None:
                continue
            digest.update(f"{category}:{path.path.name}:{label}:".encode())
            digest.update(hashlib.sha256(data).digest())
            sidecar = self._checked_file(path.path.with_suffix(".json"), path.root)
            sidecar_data = self._read_file(sidecar) if sidecar else None
            if sidecar_data is not None:
                digest.update(hashlib.sha256(sidecar_data).digest())
        for identity, weights, metadata, phrase in inputs.models:
            data = self._read_file(weights)
            if data is None:
                continue
            digest.update(f"model:{identity}:{phrase}:".encode())
            digest.update(hashlib.sha256(data).digest())
            metadata_data = self._read_file(metadata) if metadata else None
            if metadata_data is not None:
                digest.update(hashlib.sha256(metadata_data).digest())
        return digest.hexdigest()

    def _inventory(self, inputs: _LegacyInputs) -> LegacyInventory:
        phrases = sorted({str(self._safe_json(self._checked_file(path.path.with_suffix(".json"), path.root)).get("wake_word") or "").strip()
                          for category, path, _ in inputs.audio if category == "captured"
                          and str(self._safe_json(self._checked_file(path.path.with_suffix(".json"), path.root)).get("wake_word") or "").strip()})
        models = [identity for identity, _weights, _metadata, _phrase in inputs.models]
        known = {row[0] for row in self.store._connection.execute("SELECT model_id FROM wakewords").fetchall()}
        return LegacyInventory(self._fingerprint(inputs), {"personal": sum(1 for c, _, _ in inputs.audio if c == "personal"),
            "negative": sum(1 for c, _, _ in inputs.audio if c == "negative"),
            "captured": sum(1 for c, _, _ in inputs.audio if c == "captured"), "models": len(models)},
            phrases, models, bool(phrases), any(identity not in known for identity in models),
            inputs.skipped_samples, inputs.skipped_models)

    def inspect(self) -> LegacyInventory:
        return self._inventory(self._inputs())

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

    def _backup_file(self, source: _LegacyFile, target: Path) -> bool:
        data = self._read_file(source)
        if data is None:
            return False
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        return True

    def _backup(self, fingerprint: str, inputs: _LegacyInputs, inventory: LegacyInventory) -> None:
        destination = self.migration_root / "backups" / fingerprint
        if not destination.exists():
            for category, path, _label in inputs.audio:
                if self._backup_file(path, destination / category / path.path.name):
                    sidecar = self._checked_file(path.path.with_suffix(".json"), path.root)
                    if sidecar:
                        self._backup_file(sidecar, destination / category / sidecar.path.name)
            for _identity, weights, metadata, _phrase in inputs.models:
                if self._backup_file(weights, destination / "models" / weights.path.name) and metadata:
                    self._backup_file(metadata, destination / "models" / metadata.path.name)
        destination.parent.mkdir(parents=True, exist_ok=True)
        (self.migration_root / "inventory.json").write_text(json.dumps(asdict(inventory), sort_keys=True), encoding="utf-8")

    def _import_model(self, word, identity: str, source: _LegacyFile, metadata: _LegacyFile | None, fingerprint: str) -> bool:
        source_data = self._read_file(source)
        if source_data is None:
            return False
        version_id, run_id, now = uuid4().hex, uuid4().hex, self._now()
        parent = self.store.root / "models" / word["id"]
        stage = parent / (".legacy-" + version_id)
        destination = parent / version_id
        stage.mkdir(parents=True)
        weights = stage / f"{word['model_id']}.tflite"
        weights.write_bytes(source_data)
        data = self._safe_json(metadata)
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
            db.execute("INSERT INTO migration_model_provenance VALUES (?,?,?)", (version_id, str(source.path.relative_to(self.root)), fingerprint))
        return True

    def _import_audio(self, word_id: str, path: _LegacyFile, label: str):
        data = self._read_file(path)
        if data is None:
            return None
        if label != "pending":
            return self.samples.import_audio(word_id, label, io.BytesIO(data))
        original, normalized = self.samples._prepare(io.BytesIO(data))
        with self.store.transaction() as db:
            self.samples._word(db, word_id)
            audio_id = self.samples._audio(db, original, normalized)
            return self.samples._new_sample(db, word_id, None, audio_id, "pending", "import")

    def import_into(self, word_id: str, selection: LegacyImportSelection) -> MigrationReport:
        word = self.store._connection.execute("SELECT * FROM wakewords WHERE id=?", (word_id,)).fetchone()
        if word is None:
            raise NotFound("Workspace not found")
        inputs = self._inputs()
        inventory = self._inventory(inputs)
        self._validate_assignments(word_id, selection, inventory)
        self._assert_idle()
        with self.store.transaction() as db:
            previous = db.execute("SELECT report FROM migration_imports WHERE fingerprint=? AND word_id=?", (inventory.fingerprint, word_id)).fetchone()
            if previous:
                saved = json.loads(previous[0])
                return MigrationReport(inventory.fingerprint, word_id, 0, 0,
                                       int(saved.get("imported_samples", 0)) + inventory.skipped_samples,
                                       int(saved.get("imported_models", 0)) + inventory.skipped_models)
        self._backup(inventory.fingerprint, inputs, inventory)
        imported_samples, skipped_samples = 0, inventory.skipped_samples
        for category, path, label in inputs.audio:
            # Captures retain human review as pending, instead of silently classifying them.
            sample = self._import_audio(word_id, path, label)
            if sample is None:
                skipped_samples += 1
                continue
            with self.store.transaction() as db:
                db.execute("INSERT INTO migration_sample_provenance VALUES (?,?,?,?)", (sample.id, "legacy", str(path.path.relative_to(self.root)), inventory.fingerprint))
            imported_samples += 1
        imported_models, skipped_models = 0, inventory.skipped_models
        for identity, weights, metadata, _phrase in inputs.models:
            assignment = (selection.model_assignments or {}).get(identity)
            if identity == word["model_id"] or assignment == word_id:
                if self._import_model(word, identity, weights, metadata, inventory.fingerprint):
                    imported_models += 1
                else:
                    skipped_models += 1
        report = MigrationReport(inventory.fingerprint, word_id, imported_samples, imported_models, skipped_samples, skipped_models)
        with self.store.transaction() as db:
            db.execute("INSERT INTO migration_imports VALUES (?,?,?,?)", (inventory.fingerprint, word_id, self._now(), json.dumps(asdict(report), sort_keys=True)))
        return report
