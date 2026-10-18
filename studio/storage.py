"""Bounded, content-addressed blobs with atomic durable publication."""

import hashlib
import os
import re
import stat
from contextlib import contextmanager
from pathlib import Path
from typing import BinaryIO, Iterator
from uuid import uuid4

from studio.models import BlobRef, ValidationError


@contextmanager
def open_directory(path: Path) -> Iterator[int]:
    """Create/open a directory, refusing symlinks in every path component."""
    path = Path(os.path.abspath(path))
    fd = os.open(path.anchor, os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in path.parts[1:]:
            try:
                os.mkdir(part, mode=0o700, dir_fd=fd)
                os.fsync(fd)
            except FileExistsError:
                pass
            try:
                child = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            except OSError as exc:
                raise ValidationError("Unsafe storage directory") from exc
            os.close(fd)
            fd = child
        yield fd
    finally:
        os.close(fd)


class BlobStore:
    def __init__(self, root: Path, max_bytes: int = 64 * 1024 * 1024):
        if max_bytes < 1:
            raise ValueError("max_bytes must be positive")
        self.root = Path(root)
        self.max_bytes = max_bytes

    @staticmethod
    def _validate(sha256: str) -> None:
        if not isinstance(sha256, str) or not re.fullmatch(r"[0-9a-f]{64}", sha256):
            raise ValidationError("Invalid blob identifier")

    def _read(self, directory: int, sha256: str) -> bytes:
        try:
            fd = os.open(sha256, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=directory)
        except FileNotFoundError:
            raise
        except OSError as exc:
            raise ValidationError("Unsafe blob") from exc
        with os.fdopen(fd, "rb") as stream:
            if not stat.S_ISREG(os.fstat(stream.fileno()).st_mode):
                raise ValidationError("Unsafe blob")
            content = stream.read(self.max_bytes + 1)
        if len(content) > self.max_bytes or hashlib.sha256(content).hexdigest() != sha256:
            raise ValidationError("Blob integrity check failed")
        return content

    def put(self, stream: BinaryIO) -> BlobRef:
        with open_directory(self.root) as directory:
            temporary = f".partial-{uuid4().hex}"
            fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                         0o600, dir_fd=directory)
            try:
                digest = hashlib.sha256()
                size = 0
                with os.fdopen(fd, "wb") as output:
                    while chunk := stream.read(min(1024 * 1024, self.max_bytes + 1 - size)):
                        size += len(chunk)
                        if size > self.max_bytes:
                            raise ValidationError("Blob exceeds size limit")
                        digest.update(chunk)
                        output.write(chunk)
                    output.flush()
                    os.fsync(output.fileno())
                sha256 = digest.hexdigest()
                try:
                    # Unlike replace(), link() cannot overwrite an existing immutable blob.
                    os.link(temporary, sha256, src_dir_fd=directory, dst_dir_fd=directory,
                            follow_symlinks=False)
                except FileExistsError:
                    self._read(directory, sha256)
                os.fsync(directory)
                return BlobRef(sha256, size)
            finally:
                os.unlink(temporary, dir_fd=directory)
                os.fsync(directory)

    def read(self, sha256: str) -> bytes:
        self._validate(sha256)
        with open_directory(self.root) as directory:
            return self._read(directory, sha256)

    def delete(self, sha256: str) -> None:
        """Low-level removal; callers must first establish that no references remain."""
        self._validate(sha256)
        with open_directory(self.root) as directory:
            if not stat.S_ISREG(os.stat(sha256, dir_fd=directory, follow_symlinks=False).st_mode):
                raise ValidationError("Unsafe blob")
            os.unlink(sha256, dir_fd=directory)
            os.fsync(directory)

    def recover(self) -> None:
        """Remove abandoned staging files at startup, before accepting writes."""
        with open_directory(self.root) as directory:
            for name in os.listdir(directory):
                if name.startswith(".partial-"):
                    mode = os.stat(name, dir_fd=directory, follow_symlinks=False).st_mode
                    if stat.S_ISREG(mode):
                        os.unlink(name, dir_fd=directory)
            os.fsync(directory)
