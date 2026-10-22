"""Bounded, content-addressed blobs with atomic durable publication."""

import hashlib
import io
import os
import re
import shutil
import stat
import subprocess
import tempfile
import wave
from contextlib import contextmanager
from pathlib import Path
from typing import BinaryIO, Iterator
from uuid import uuid4

from studio.models import BlobRef, ValidationError


MAX_AUDIO_SECONDS = 600
AUDIO_MIMES = frozenset({"audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave",
                         "audio/mpeg", "audio/mp3", "audio/ogg", "application/ogg",
                         "audio/flac", "audio/x-flac", "audio/webm", "video/webm",
                         "audio/mp4", "video/mp4", "audio/aac", "application/octet-stream"})


def canonical_wav(data: bytes, *, truncate: bool = False) -> bytes:
    """Validate decoded PCM and strip container metadata for stable content identity."""
    try:
        with wave.open(io.BytesIO(data), "rb") as source:
            channels, width, rate, frames, compression, _ = source.getparams()
            if (channels, width, rate, compression) != (1, 2, 16000, "NONE"):
                raise ValidationError("Audio needs conversion")
            if frames <= 0 or (frames > rate * MAX_AUDIO_SECONDS and not truncate):
                raise ValidationError("Invalid audio duration")
            pcm = source.readframes(frames)
            if len(pcm) != frames * width:
                raise ValidationError("Truncated audio")
            if truncate:
                pcm = pcm[:rate * MAX_AUDIO_SECONDS * width]
    except (wave.Error, EOFError, ValueError) as exc:
        raise ValidationError("Invalid WAV audio") from exc
    output = io.BytesIO()
    with wave.open(output, "wb") as target:
        target.setparams((1, 2, 16000, 0, "NONE", "not compressed"))
        target.writeframes(pcm)
    return output.getvalue()


def normalize_audio(data: bytes, max_bytes: int, *, truncate: bool = False) -> bytes:
    """Same ffmpeg PCM target as legacy uploads, without importing legacy workers.

    Inputs are sniffed, never interpreted as filenames/playlists. Conversion is
    bounded and local-only; neither uploaded names nor decoder diagnostics escape.
    Capture may truncate timer overshoot to MAX_AUDIO_SECONDS while retaining the
    original blob separately. Ordinary imports keep strict duration validation.
    """
    if not data or len(data) > max_bytes:
        raise ValidationError("Invalid audio size")
    if data.startswith(b"RIFF") and data[8:12] == b"WAVE":
        try:
            with wave.open(io.BytesIO(data), "rb") as source:
                channels, width, rate, frames, compression, _ = source.getparams()
                if not 0 < rate <= 192000 or not 1 <= channels <= 8 or not 1 <= width <= 4:
                    raise ValidationError("Invalid WAV parameters")
                if frames <= 0 or (frames > rate * MAX_AUDIO_SECONDS and not truncate):
                    raise ValidationError("Invalid audio duration")
                if len(source.readframes(frames)) != frames * channels * width:
                    raise ValidationError("Truncated audio")
            if (channels, width, rate, compression) == (1, 2, 16000, "NONE"):
                return canonical_wav(data, truncate=truncate)
        except (wave.Error, EOFError, ValueError) as exc:
            raise ValidationError("Invalid WAV audio") from exc
        container = "wav"
    elif data.startswith(b"fLaC"):
        container = "flac"
    elif data.startswith(b"OggS"):
        container = "ogg"
    elif data.startswith(b"\x1aE\xdf\xa3"):
        container = "matroska"
    elif len(data) >= 12 and data[4:8] == b"ftyp":
        container = "mov"
    elif data.startswith(b"ID3") or (len(data) > 1 and data[0] == 255 and data[1] & 224 == 224):
        container = "aac" if data[0] == 255 and data[1] & 246 == 240 else "mp3"
    else:
        raise ValidationError("Unsupported audio content")
    executable = shutil.which("ffmpeg")
    if executable is None:
        raise ValidationError("Audio conversion unavailable")
    with tempfile.TemporaryDirectory(prefix="studio-audio-") as directory:
        source = Path(directory) / "source.audio"
        target = Path(directory) / "normalized.wav"
        source.write_bytes(data)
        command = [executable, "-nostdin", "-v", "error", "-y", "-protocol_whitelist", "file,pipe",
                   "-f", container, "-i", str(source), "-map", "0:a:0", "-vn", "-ac", "1",
                   "-ar", "16000", "-c:a", "pcm_s16le", "-t", str(MAX_AUDIO_SECONDS + 1),
                   "-fs", str(max_bytes + 1), str(target)]
        try:
            result = subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30)
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise ValidationError("Audio conversion failed") from exc
        if result.returncode or not target.exists() or target.stat().st_size > max_bytes:
            raise ValidationError("Audio conversion failed")
        return canonical_wav(target.read_bytes(), truncate=truncate)


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
