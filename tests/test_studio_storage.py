import hashlib
import io
import sqlite3
import tempfile
import threading
import time
import unittest
from pathlib import Path

from studio.db import Store
from studio.models import ValidationError
from studio.storage import BlobStore


class InterruptedStream:
    def __init__(self):
        self.reads = 0

    def read(self, size):
        self.reads += 1
        if self.reads == 1:
            return b"partial audio"
        raise OSError("download interrupted")


class StorageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.blobs = BlobStore(self.root / "studio/blobs", max_bytes=32)

    def test_blob_write_crash_not_visible(self):
        with self.assertRaises(OSError):
            self.blobs.put(InterruptedStream())
        self.assertEqual(list((self.root / "studio/blobs").iterdir()), [])
        # A hard process crash can leave staging files, but never a visible blob.
        stale = self.root / "studio/blobs/.partial-crashed"
        stale.write_bytes(b"unfinished")
        self.blobs.recover()
        self.assertFalse(stale.exists())
        ref = self.blobs.put(io.BytesIO(b"complete audio"))
        self.assertEqual(ref.sha256, hashlib.sha256(b"complete audio").hexdigest())
        self.assertEqual(ref.size_bytes, 14)
        self.assertEqual(self.blobs.read(ref.sha256), b"complete audio")
        self.assertEqual(self.blobs.put(io.BytesIO(b"complete audio")), ref)
        self.assertEqual(len(list((self.root / "studio/blobs").iterdir())), 1)

    def test_path_escape_and_symlink_rejected(self):
        outside = self.root / "outside"
        outside.write_bytes(b"do not touch")
        self.blobs.put(io.BytesIO(b"initialize"))
        digest = "a" * 64
        (self.root / "studio/blobs" / digest).symlink_to(outside)
        for name in ("../outside", str(outside), digest):
            with self.subTest(name=name):
                with self.assertRaises(ValidationError):
                    self.blobs.read(name)
                with self.assertRaises(ValidationError):
                    self.blobs.delete(name)
        self.assertEqual(outside.read_bytes(), b"do not touch")
        linked_root = self.root / "linked"
        linked_root.symlink_to(self.root / "studio", target_is_directory=True)
        with self.assertRaises(ValidationError):
            BlobStore(linked_root / "blobs").put(io.BytesIO(b"unsafe"))

    def test_blob_limits_and_integrity(self):
        with self.assertRaises(ValidationError):
            self.blobs.put(io.BytesIO(b"x" * 33))
        ref = self.blobs.put(io.BytesIO(b"audio"))
        (self.root / "studio/blobs" / ref.sha256).write_bytes(b"corrupt")
        with self.assertRaises(ValidationError):
            self.blobs.put(io.BytesIO(b"audio"))
        with self.assertRaises(ValidationError):
            self.blobs.read(ref.sha256)

    def test_job_and_run_directories_use_opaque_ids(self):
        store = Store.open(self.root)
        self.addCleanup(store.close)
        path = store.scoped_directory("jobs", "9c8ecdfc48c64024a07214ff017019de")
        self.assertEqual(path.parent, self.root / "studio/jobs")
        for category, name in (("jobs", "../outside"), ("runs", "/outside"), ("other", "a" * 32)):
            with self.assertRaises(ValidationError):
                store.scoped_directory(category, name)

    def test_transaction_waits_for_another_process_writer(self):
        store = Store.open(self.root)
        self.addCleanup(store.close)
        blocker = sqlite3.connect(self.root / "studio/studio.sqlite3", timeout=0, check_same_thread=False)
        self.addCleanup(blocker.close)
        blocker.execute("BEGIN IMMEDIATE")
        release = threading.Timer(0.3, blocker.rollback)
        release.start()
        self.addCleanup(release.cancel)
        started = time.monotonic()
        with store.transaction() as db:
            self.assertGreater(time.monotonic() - started, 0.2)
            self.assertEqual(db.execute("SELECT 1").fetchone()[0], 1)
