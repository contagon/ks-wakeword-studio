"""SQLite lifecycle, versioned migrations, and bounded write transactions."""

import os
import re
import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from studio.models import ValidationError
from studio.storage import ensure_directory, open_directory


# Applied in order; user_version is the count applied. Never edit a released file.
MIGRATIONS = (
    "schema.sql",
    "schema_samples.sql",
    "schema_devices.sql",
    "schema_collection.sql",
    "schema_jobs.sql",
    "schema_datasets.sql",
    "schema_generation.sql",
    "schema_training.sql",
    "schema_deployment.sql",
    "schema_deployment_staging.sql",
    "schema_migration.sql",
    "schema_migration_claims.sql",
    "schema_automation.sql",
    "schema_device_management.sql",
    "schema_device_names.sql",
    "schema_capture.sql",
    "schema_dataset_preferences.sql",
    "schema_training_run_numbers.sql",
    "schema_drop_unused.sql",
    "schema_publication_time.sql",
)


class Store:
    def __init__(self, root: Path, connection: sqlite3.Connection):
        self.root = root
        self._connection = connection
        self._lock = threading.RLock()
        self._closed = False

    @property
    def data_dir(self) -> Path:
        """The shared DATA_DIR holding studio/, tools, caches and corpora."""
        return self.root.parent

    @classmethod
    def open(cls, root: Path) -> "Store":
        studio_root = Path(os.path.abspath(root)) / "studio"
        with open_directory(studio_root) as directory:
            try:
                fd = os.open("studio.sqlite3", os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW,
                             0o600, dir_fd=directory)
            except OSError as exc:
                raise ValidationError("Unsafe database path") from exc
            os.close(fd)
            for suffix in ("-wal", "-shm"):
                if (studio_root / f"studio.sqlite3{suffix}").is_symlink():
                    raise ValidationError("Unsafe database path")
        connection = sqlite3.connect(studio_root / "studio.sqlite3", timeout=5,
                                     isolation_level=None, check_same_thread=False)
        connection.row_factory = sqlite3.Row
        store = cls(studio_root, connection)
        try:
            connection.execute("PRAGMA foreign_keys = ON")
            connection.execute("PRAGMA journal_mode = WAL")
            connection.execute("PRAGMA synchronous = FULL")
            with store.transaction() as db:
                version = db.execute("PRAGMA user_version").fetchone()[0]
                if version > len(MIGRATIONS):
                    raise ValidationError("Unsupported studio schema version")
                for number, filename in enumerate(MIGRATIONS[version:], version + 1):
                    store._apply_schema(db, filename)
                    db.execute(f"PRAGMA user_version = {number}")
            return store
        except BaseException:
            store.close()
            raise

    @staticmethod
    def _apply_schema(db: sqlite3.Connection, filename: str) -> None:
        # Execute complete statements individually: executescript commits implicitly.
        statement = ""
        for line in Path(__file__).with_name(filename).read_text().splitlines(True):
            statement += line
            if sqlite3.complete_statement(statement):
                db.execute(statement)
                statement = ""

    @contextmanager
    def transaction(self) -> Iterator[sqlite3.Connection]:
        with self._lock:
            # Other processes' writers are waited on by the 5 s busy timeout.
            self._connection.execute("BEGIN IMMEDIATE")
            try:
                yield self._connection
                self._connection.commit()
            except BaseException:
                self._connection.rollback()
                raise

    def scoped_directory(self, category: str, opaque_id: str) -> Path:
        if category != "jobs" or not re.fullmatch(r"[0-9a-f]{32}", opaque_id):
            raise ValidationError("Invalid studio directory identifier")
        path = self.root / category / opaque_id
        ensure_directory(path)
        return path

    def close(self) -> None:
        with self._lock:
            if not self._closed:
                self._connection.close()
                self._closed = True
