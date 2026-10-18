"""Lazy dependency construction; no background workers or import-time writes."""

import threading
from pathlib import Path

from studio.db import Store
from studio.storage import BlobStore
from studio.workspaces import WorkspaceService


class StudioRuntime:
    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self._lock = threading.RLock()
        self._store: Store | None = None
        self._workspaces: WorkspaceService | None = None
        self._blobs: BlobStore | None = None

    def startup(self) -> None:
        with self._lock:
            if self._store is not None:
                return
            store = Store.open(self.data_dir)
            try:
                blobs = BlobStore(store.root / "blobs")
                blobs.recover()
                self._blobs = blobs
                self._workspaces = WorkspaceService(store)
                self._store = store
            except BaseException:
                store.close()
                raise

    @property
    def workspaces(self) -> WorkspaceService:
        self.startup()
        assert self._workspaces is not None
        return self._workspaces

    @property
    def blobs(self) -> BlobStore:
        self.startup()
        assert self._blobs is not None
        return self._blobs

    def shutdown(self) -> None:
        with self._lock:
            if self._store is not None:
                self._store.close()
                self._store = None
                self._workspaces = None
                self._blobs = None
