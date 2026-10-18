"""SQLite lifecycle, versioned migrations, and bounded write transactions."""

import os
import re
import sqlite3
import threading
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from studio.models import ValidationError
from studio.storage import open_directory


class Store:
    def __init__(self, root: Path, connection: sqlite3.Connection):
        self.root = root
        self._connection = connection
        self._lock = threading.RLock()
        self._closed = False

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
        connection = sqlite3.connect(studio_root / "studio.sqlite3", timeout=0,
                                     isolation_level=None, check_same_thread=False)
        connection.row_factory = sqlite3.Row
        store = cls(studio_root, connection)
        try:
            connection.execute("PRAGMA foreign_keys = ON")
            connection.execute("PRAGMA journal_mode = WAL")
            connection.execute("PRAGMA synchronous = FULL")
            with store.transaction() as db:
                version = db.execute("PRAGMA user_version").fetchone()[0]
                if version > 9:
                    raise ValidationError("Unsupported studio schema version")
                if version == 0:
                    # execute complete statements individually: executescript commits implicitly.
                    store._apply_schema(db, "schema.sql")
                    db.execute("PRAGMA user_version = 1")
                if version < 2:
                    store._apply_schema(db, "schema_samples.sql")
                    db.execute("PRAGMA user_version = 2")
                if version < 3:
                    store._apply_schema(db, "schema_devices.sql")
                    db.execute("PRAGMA user_version = 3")
                if version < 4:
                    store._apply_schema(db, "schema_collection.sql")
                    db.execute("PRAGMA user_version = 4")
                if version < 5:
                    store._apply_schema(db, "schema_jobs.sql")
                    db.execute("PRAGMA user_version = 5")
                if version < 6:
                    store._apply_schema(db, "schema_datasets.sql")
                    db.execute("PRAGMA user_version = 6")
                if version < 7:
                    store._apply_schema(db, "schema_generation.sql")
                    db.execute("PRAGMA user_version = 7")
                if version < 8:
                    store._apply_schema(db, "schema_training.sql")
                    db.execute("PRAGMA user_version = 8")
                if version < 9:
                    store._apply_schema(db, "schema_deployment.sql")
                    db.execute("PRAGMA user_version = 9")
            return store
        except BaseException:
            store.close()
            raise

    @staticmethod
    def _apply_schema(db: sqlite3.Connection, filename: str) -> None:
        statement = ""
        for line in Path(__file__).with_name(filename).read_text().splitlines(True):
            statement += line
            if sqlite3.complete_statement(statement):
                db.execute(statement)
                statement = ""

    @contextmanager
    def transaction(self) -> Iterator[sqlite3.Connection]:
        with self._lock:
            for attempt in range(5):
                try:
                    self._connection.execute("BEGIN IMMEDIATE")
                    break
                except sqlite3.OperationalError as exc:
                    if exc.sqlite_errorcode not in (sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED) or attempt == 4:
                        raise
                    time.sleep(0.01 * (2 ** attempt))
            try:
                yield self._connection
                self._connection.commit()
            except BaseException:
                self._connection.rollback()
                raise

    def scoped_directory(self, category: str, opaque_id: str) -> Path:
        if category not in ("jobs", "runs") or not re.fullmatch(r"[0-9a-f]{32}", opaque_id):
            raise ValidationError("Invalid studio directory identifier")
        path = self.root / category / opaque_id
        with open_directory(path):
            pass
        return path

    def close(self) -> None:
        with self._lock:
            if not self._closed:
                self._connection.close()
                self._closed = True
