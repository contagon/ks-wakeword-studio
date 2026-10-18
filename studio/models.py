"""Shared domain records; no filesystem or network dependencies."""

from dataclasses import dataclass
from typing import Generic, TypeVar


class NotFound(Exception):
    pass


class Conflict(Exception):
    pass


class ValidationError(Exception):
    pass


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


T = TypeVar("T")


@dataclass(frozen=True)
class Page(Generic[T]):
    items: list[T]
    total: int
    offset: int
    limit: int
