"""Rolling diagnostic collection; no clearing, selection changes, or workers.

The device file lock spans listing, download, and the sample service's durable
identity claim. flock also serializes separate runtimes/processes and releases
on process death. SQLite transactions never span a network request.
"""

from __future__ import annotations

import fcntl
import hashlib
import json
import os
from collections.abc import Callable
from contextlib import contextmanager
from dataclasses import asdict
from datetime import datetime, timedelta, timezone
from typing import Iterator
from uuid import uuid4

from studio.db import Store
from studio.devices import DeviceService
from studio.models import (CollectionCounters, CollectionRun, CredentialsRequired,
                           DeviceCollectionResult, IdentityMismatch, Page, RemoteRejected,
                           RemoteUnavailable, ValidationError)
from studio.samples import SampleService
from studio.storage import open_directory
from studio.workspaces import WorkspaceService, utc_now


COUNTERS = tuple(CollectionCounters.__dataclass_fields__)


def error_code(error: Exception) -> str:
    # Never persist str(error), remote bodies, endpoints, tokens, or traceback text.
    for kind, code in ((CredentialsRequired, "credentials_required"),
                       (IdentityMismatch, "identity_mismatch"),
                       (RemoteUnavailable, "unavailable"),
                       (RemoteRejected, "remote_rejected"),
                       (ValidationError, "invalid_audio_or_metadata")):
        if isinstance(error, kind):
            return code
    return "collection_failed"


class CollectionService:
    def __init__(self, store: Store, samples: SampleService, devices: DeviceService,
                 *, clock: Callable[[], datetime] = utc_now):
        self.store = store
        self.samples = samples
        self.devices = devices
        self.workspaces = WorkspaceService(store)
        self.clock = clock

    def _now(self) -> str:
        return self.clock().astimezone(timezone.utc).isoformat()

    @contextmanager
    def _lock(self, identity: str, *, blocking: bool = True) -> Iterator[bool]:
        name = hashlib.sha256(identity.encode()).hexdigest()
        with open_directory(self.store.root / "collection-locks") as directory:
            fd = os.open(name, os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW | os.O_NONBLOCK,
                         0o600, dir_fd=directory)
            try:
                try:
                    fcntl.flock(fd, fcntl.LOCK_EX | (0 if blocking else fcntl.LOCK_NB))
                except BlockingIOError:
                    yield False
                else:
                    yield True
            finally:
                os.close(fd)

    def _save(self, run_id: str, result: DeviceCollectionResult) -> None:
        result.errors = list(dict.fromkeys(result.errors))
        with self.store.transaction() as db:
            db.execute("UPDATE collection_devices SET status=?,result=? WHERE run_id=? AND device_id=?",
                       (result.status, json.dumps(asdict(result)), run_id, result.device_id))

    def _finish(self, run_id: str) -> None:
        with self.store.transaction() as db:
            states = [row[0] for row in db.execute("SELECT status FROM collection_devices WHERE run_id=?", (run_id,))]
            if any(state in ("running", "queued") for state in states):
                return
            status = "interrupted" if "interrupted" in states else (
                "complete" if all(s == "complete" for s in states) else "partial")
            db.execute("UPDATE collection_runs SET finished_at=?,status=? WHERE id=?",
                       (self._now(), status, run_id))

    def _recover_device(self, device_id: str) -> None:
        # Probe run locks non-blockingly so a live run waiting on another device
        # is never mistaken for a dead collector (nor a lock-order deadlock).
        with self.store.transaction() as db:
            runs = [row[0] for row in db.execute("SELECT run_id FROM collection_devices WHERE device_id=? AND status IN ('running','queued')",
                                               (device_id,))]
        for run_id in runs:
            with self._lock("run:" + run_id, blocking=False) as acquired:
                if acquired:
                    self._recover_run(run_id)

    def _recover_run(self, run_id: str) -> None:
        # The run lock proves the old owner is dead. Include its queued sources,
        # even if this manual call only selects one of the old run's devices.
        with self.store.transaction() as db:
            rows = db.execute("SELECT device_id,result FROM collection_devices WHERE run_id=? AND status IN ('running','queued')",
                              (run_id,)).fetchall()
            for row in rows:
                device_id = row["device_id"]
                result = DeviceCollectionResult(**json.loads(row["result"]))
                # The sample identity claim can commit just before a process dies,
                # before the progress snapshot is saved. Reconcile from this run's
                # durable attempts, not from an unverified second download.
                successes = db.execute("""SELECT count(*),COALESCE(sum(r.word_id IS NULL),0)
                    FROM collection_attempts a JOIN recordings r
                    ON r.device_id=a.device_id AND r.clip_id=a.clip_id
                    WHERE a.run_id=? AND a.device_id=? AND a.state IN ('downloading','complete')
                    AND r.quarantined=0""", (run_id, device_id)).fetchone()
                result.new = max(result.new, successes[0])
                result.unmapped = max(result.unmapped, successes[1])
                result.status = "interrupted"
                result.errors = list(dict.fromkeys(result.errors + ["interrupted"]))
                db.execute("UPDATE collection_devices SET status='interrupted',result=? WHERE run_id=? AND device_id=?",
                           (json.dumps(asdict(result)), run_id, device_id))
                db.execute("""UPDATE collection_attempts SET state='complete',next_retry_at=NULL,error_code=NULL
                    WHERE run_id=? AND device_id=? AND state='downloading' AND EXISTS (
                    SELECT 1 FROM recordings r WHERE r.device_id=collection_attempts.device_id
                    AND r.clip_id=collection_attempts.clip_id AND r.quarantined=0)""", (run_id, device_id))
        self._finish(run_id)

    def run(self, device_ids: list[str] | None = None) -> CollectionRun:
        if device_ids is not None and (not isinstance(device_ids, list) or
                any(not isinstance(i, str) or not i for i in device_ids)):
            raise ValidationError("Invalid device selection")
        refresh_failed = set()
        if device_ids is None:
            for device in self.devices.list():
                if device.role != "leader":
                    continue
                if not device.active or device.credentials_status != "ready":
                    refresh_failed.add(device.id)
                else:
                    try:
                        self.devices.refresh_fleet(device.id)
                    except Exception:
                        refresh_failed.add(device.id)
            selected = self.devices.list()  # Real refreshed roster, not a cached UI list.
        else:
            selected = [self.devices.get(i) for i in dict.fromkeys(device_ids)]
        run_id = uuid4().hex
        with self._lock("run:" + run_id):
            with self.store.transaction() as db:
                db.execute("INSERT INTO collection_runs VALUES (?,?,NULL,'running')", (run_id, self._now()))
                for device in selected:
                    result = DeviceCollectionResult(device_id=device.id, status="queued")
                    db.execute("INSERT INTO collection_devices VALUES (?,?,'queued',?)",
                               (run_id, device.id, json.dumps(asdict(result))))
            for device in selected:
                with self._lock("device:" + device.id):
                    self._recover_device(device.id)
                    self._collect(run_id, device.id, refresh_failed)
            self._finish(run_id)
        return self.get_run(run_id)

    def collect_device(self, device_id: str) -> DeviceCollectionResult:
        return self.run([device_id]).devices[0]

    def _attempt(self, run_id: str, device_id: str, clip_id: str, state: str, code: str | None = None) -> None:
        with self.store.transaction() as db:
            row = db.execute("SELECT attempts FROM collection_attempts WHERE device_id=? AND clip_id=?",
                             (device_id, clip_id)).fetchone()
            attempts = min(16, (row[0] if row else 0) + (state == "downloading"))
            retry = (self.clock().astimezone(timezone.utc) + timedelta(seconds=min(300, 2 ** attempts))).isoformat() if state == "failed" else None
            db.execute("""INSERT INTO collection_attempts VALUES (?,?,?,?,?,?,?,?)
                          ON CONFLICT(device_id,clip_id) DO UPDATE SET state=excluded.state,
                          run_id=excluded.run_id,
                          attempts=excluded.attempts,next_retry_at=excluded.next_retry_at,
                          error_code=excluded.error_code,updated_at=excluded.updated_at""",
                       (device_id, clip_id, run_id, state, attempts, retry, code, self._now()))

    def _seen(self, device_id: str, clip_id: str) -> bool:
        with self.store.transaction() as db:
            return db.execute("SELECT 1 FROM recordings WHERE device_id=? AND clip_id=?",
                              (device_id, clip_id)).fetchone() is not None

    def _collect(self, run_id: str, device_id: str, refresh_failed: set[str]) -> None:
        result = DeviceCollectionResult(device_id=device_id)
        self._save(run_id, result)
        try:
            device = self.devices.get(device_id)  # Recheck activity after waiting for lock.
            if not device.active:
                result.status = "inactive"
                return
            if device.credentials_status != "ready":
                result.status, result.errors = "credentials_required", ["credentials_required"]
                return
            if device.id in refresh_failed or device.leader_id in refresh_failed:
                result.status, result.errors = "fleet_refresh_failed", ["fleet_refresh_failed"]
                return
            listing = self.devices.client.diagnostics(device)  # Client verifies pinned identity.
            result.listed = len(listing.clips)
            if not listing.enabled:
                result.errors.append("diagnostics_disabled")
            self._save(run_id, result)
            visited = set()
            for clip in listing.clips:
                # Remote duplicates within one list are not separate source identities.
                if clip.id in visited:
                    continue
                visited.add(clip.id)
                if self._seen(device_id, clip.id):
                    result.already_seen += 1
                    self._save(run_id, result)
                    continue
                with self.store.transaction() as db:
                    attempt = db.execute("SELECT * FROM collection_attempts WHERE device_id=? AND clip_id=?",
                                         (device_id, clip.id)).fetchone()
                if attempt and attempt["next_retry_at"] and attempt["next_retry_at"] > self._now():
                    result.failed += 1
                    result.errors.append("retry_deferred")
                    self._save(run_id, result)
                    continue
                self._attempt(run_id, device_id, clip.id, "downloading")
                try:
                    content = self.devices.client.audio(device, clip.id)
                    if not isinstance(content, bytes) or len(content) > self.samples.blobs.max_bytes:
                        raise ValidationError("Invalid audio size")
                    # Anonymous, private staging file: crash cannot expose a partial
                    # blob or leave named staging debris. Ingest publishes blobs
                    # before its transactional (device, clip) identity claim.
                    with open_directory(self.store.root / "collection-staging") as directory:
                        name = uuid4().hex
                        fd = os.open(name, os.O_RDWR | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                                     0o600, dir_fd=directory)
                        os.unlink(name, dir_fd=directory)
                        with os.fdopen(fd, "w+b") as staged:
                            staged.write(content)
                            staged.flush()
                            os.fsync(staged.fileno())
                            staged.seek(0)
                            word_id = self.workspaces.resolve_source(device_id, clip.engine, clip.phrase)
                            recording = self.samples.ingest(device_id, clip, staged, word_id)
                    if recording.quarantined:
                        raise ValidationError("Quarantined source identity")
                    self._attempt(run_id, device_id, clip.id, "complete")
                    result.new += 1
                    result.unmapped += recording.word_id is None
                except Exception as error:
                    code, evicted = error_code(error), False
                    # The transport deliberately hides remote free-form errors.
                    # Confirm an eviction by a fresh verified list, never by prose.
                    if isinstance(error, RemoteRejected):
                        try:
                            fresh = self.devices.client.diagnostics(device)
                            evicted = not any(item.id == clip.id for item in fresh.clips)
                        except Exception:
                            pass
                    if evicted:
                        result.evicted += 1
                        code = "evicted"
                        self._attempt(run_id, device_id, clip.id, "evicted", code)
                    else:
                        result.failed += 1
                        self._attempt(run_id, device_id, clip.id, "failed", code)
                    result.errors.append(code)
                self._save(run_id, result)
            result.status = "partial" if result.failed or result.evicted else ("diagnostics_disabled" if not listing.enabled else "complete")
        except Exception as error:
            code = error_code(error)
            result.failed += 1
            result.errors.append(code)
            result.status = code
        finally:
            # BaseException (e.g. process cancellation) remains visibly incomplete;
            # the next owner of the device lock records it as interrupted.
            result.errors = list(dict.fromkeys(result.errors))
            self._save(run_id, result)

    def get_run(self, run_id: str) -> CollectionRun:
        from studio.models import NotFound

        with self.store.transaction() as db:
            row = db.execute("SELECT * FROM collection_runs WHERE id=?", (run_id,)).fetchone()
            if row is None:
                raise NotFound("Collection run not found")
            devices = [DeviceCollectionResult(**json.loads(item[0])) for item in db.execute(
                "SELECT result FROM collection_devices WHERE run_id=? ORDER BY rowid", (run_id,))]
        totals = {key: sum(getattr(device, key) for device in devices) for key in COUNTERS}
        return CollectionRun(**dict(row), **totals, devices=devices)

    def list_runs(self, offset: int = 0, limit: int = 50) -> Page[CollectionRun]:
        if type(offset) is not int or offset < 0 or type(limit) is not int or not 1 <= limit <= 100:
            raise ValidationError("Invalid pagination")
        with self.store.transaction() as db:
            total = db.execute("SELECT count(*) FROM collection_runs").fetchone()[0]
            ids = [row[0] for row in db.execute("SELECT id FROM collection_runs ORDER BY rowid DESC LIMIT ? OFFSET ?", (limit, offset))]
        return Page([self.get_run(i) for i in ids], total, offset, limit)
