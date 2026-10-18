"""Shared domain records; no filesystem or network dependencies."""

from dataclasses import dataclass, field
from typing import Generic, TypeVar


class NotFound(Exception):
    pass


class Conflict(Exception):
    pass


class ValidationError(Exception):
    pass


class CredentialsRequired(Exception):
    pass


class IdentityMismatch(Exception):
    pass


class RemoteRejected(Exception):
    pass


class RemoteUnavailable(Exception):
    pass


@dataclass(frozen=True)
class Device:
    # The stable kiosk identity, never an address or display name.
    id: str
    url: str
    role: str
    active: bool = True
    leader_id: str | None = None
    credentials_status: str = "credentials_required"
    profile_id: str | None = None
    model_eligible: bool = False


@dataclass(frozen=True)
class KioskIdentity:
    id: str
    leader: bool
    follows: bool


@dataclass(frozen=True)
class DiagnosticListing:
    enabled: bool
    clips: list["DiagnosticClip"]


@dataclass(frozen=True)
class CommitResult:
    added: list[dict[str, str]]
    rejected: list[dict[str, str]]


@dataclass(frozen=True)
class Wakeword:
    id: str
    phrase: str
    language: str
    model_id: str
    created_at: str
    updated_at: str


@dataclass(frozen=True)
class WakewordUpdate:
    phrase: str | None = None
    language: str | None = None


@dataclass(frozen=True)
class BlobRef:
    sha256: str
    size_bytes: int


@dataclass(frozen=True)
class DiagnosticClip:
    id: str
    timestamp: str | None = None
    phrase: str = ""
    engine: str = ""
    near_miss: bool = False
    scores: dict[str, float] = field(default_factory=dict)
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True)
class Recording:
    id: str
    device_id: str
    clip_id: str
    timestamp: str | None
    phrase: str
    engine: str
    near_miss: bool
    scores: dict[str, float]
    metadata: dict[str, object]
    audio_id: str
    original_hash: str
    normalized_hash: str
    family_id: str
    word_id: str | None
    quarantined: bool
    created_at: str


@dataclass(frozen=True)
class Sample:
    id: str
    word_id: str
    recording_id: str | None
    audio_id: str
    original_hash: str
    normalized_hash: str
    family_id: str
    label: str
    revision: int
    source: str
    created_at: str
    updated_at: str
    recording: Recording | None = None


@dataclass(frozen=True)
class SampleQuery:
    offset: int = 0
    limit: int = 50
    label: str | None = None
    device_id: str | None = None
    near_miss: bool | None = None
    source: str | None = None
    search: str = ""
    after: str | None = None
    before: str | None = None


T = TypeVar("T")


@dataclass(frozen=True)
class Page(Generic[T]):
    items: list[T]
    total: int
    offset: int
    limit: int
