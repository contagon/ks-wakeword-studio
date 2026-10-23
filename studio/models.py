"""Shared domain records; no filesystem or network dependencies."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Generic, Literal, TypeVar


class NotFound(Exception):
    pass


@dataclass(frozen=True)
class DatasetInput:
    id: str
    path: str
    representation: str
    split: str
    adapter: str
    fingerprint: str


@dataclass(frozen=True)
class Dataset:
    id: str
    name: str
    description: str
    source: str
    license: str
    representation: str
    split: str
    adapter: str
    purpose: str
    download_bytes: int | None
    installed_bytes: int | None
    fingerprint: str | None
    selected: bool
    status: str
    job_id: str | None
    error_code: str | None
    sample_count: int | None = None


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
class Schedule:
    scope: str
    cron: str
    timezone: str
    enabled: bool
    next_run_at: str


@dataclass(frozen=True)
class AutomationSchedule:
    enabled: bool = False
    cron: str = '*/30 * * * *'
    timezone: str = 'UTC'


@dataclass(frozen=True)
class ClassificationPolicy:
    enabled: bool = False
    trigger: Literal['after_collection', 'schedule'] = 'after_collection'
    # One switch per (clip kind x what speech recognition heard) cell.
    confirm_activations: bool = False
    auto_negatives: bool = True
    promote_close_misses: bool = False
    near_miss_negatives: bool = False


@dataclass(frozen=True)
class DeploymentPolicy:
    after_training: bool = False


@dataclass(frozen=True)
class AutomationSettings:
    collection: AutomationSchedule = field(default_factory=AutomationSchedule)
    classification: ClassificationPolicy = field(default_factory=ClassificationPolicy)
    classification_schedule: AutomationSchedule = field(default_factory=lambda: AutomationSchedule(cron='0 * * * *'))
    training: AutomationSchedule = field(default_factory=lambda: AutomationSchedule(cron='0 2 * * *'))
    skip_unchanged: bool = True
    deployment: AutomationSchedule = field(default_factory=lambda: AutomationSchedule(cron='0 4 * * *'))
    deployment_policy: DeploymentPolicy = field(default_factory=DeploymentPolicy)


@dataclass(frozen=True)
class AutomationStatus:
    settings: AutomationSettings
    schedules: list[Schedule]
    last_jobs: dict[str, 'Job | None']


@dataclass(frozen=True)
class Job:
    id: str
    kind: str
    word_id: str | None
    resource: str
    payload: dict
    status: str
    created_at: str
    started_at: str | None
    finished_at: str | None
    result: dict
    run_number: int | None = None


@dataclass(frozen=True)
class GenerationRecipe:
    language: str
    english_accent: str
    tts_mode: str
    samples: int
    batch_size: int
    engines: list[str] | None = None
    moss_source_batch_ids: list[str] = field(default_factory=list)
    moss_after_current: bool = False
    moss_samples: int | None = None


@dataclass(frozen=True)
class GenerationSubmission:
    id: str
    jobs: list[Job]
    batch_ids: list[str]


@dataclass(frozen=True)
class GenerationSource:
    id: str
    phrase: str
    language: str
    providers: list[str]
    sample_count: int
    created_at: str


@dataclass(frozen=True)
class BatchAudio:
    audio_id: str
    original_hash: str
    normalized_hash: str
    family_id: str


@dataclass(frozen=True)
class Batch:
    id: str
    word_id: str
    phrase: str
    recipe: GenerationRecipe
    status: str
    created_at: str
    finished_at: str | None
    audio: list[BatchAudio]
    selected: bool


@dataclass(frozen=True)
class TrainingSettings:
    training_steps: int = 40000


@dataclass(frozen=True)
class TrainingAudio:
    audio_id: str
    original_hash: str
    normalized_hash: str
    family_id: str
    path: str
    label: str
    split: str
    sample_id: str | None = None
    revision: int | None = None
    batch_id: str | None = None


@dataclass(frozen=True)
class AugmentationInput:
    id: str
    path: str
    fingerprint: str


@dataclass(frozen=True)
class RunManifest:
    schema_version: int
    run_id: str
    word_id: str
    model_id: str
    phrase: str
    language: str
    config: TrainingSettings
    seed: int
    audio: tuple[TrainingAudio, ...]
    datasets: tuple[DatasetInput, ...]
    selected_batches: tuple[str, ...]
    fingerprint: str
    created_at: str
    augmentation: tuple[AugmentationInput, ...] = ()


@dataclass(frozen=True)
class LegacyRun:
    schema_version: int
    run_id: str
    word_id: str
    model_id: str
    phrase: str
    language: str
    fingerprint: str
    created_at: str
    legacy_identity: str
    kind: Literal['legacy'] = 'legacy'


@dataclass(frozen=True)
class TrainingResult:
    artifacts: dict[str, str]
    checksums: dict[str, str]
    metrics: dict
    validated: bool


@dataclass(frozen=True)
class ModelVersion:
    id: str
    word_id: str
    model_id: str
    run_id: str
    trained_at: str
    path: str
    fingerprint: str
    checksums: dict[str, str]
    metrics: dict
    origin: str = 'training'
    validation_state: str = 'validated'
    run_number: int | None = None


@dataclass(frozen=True)
class LoopHealth:
    component: str
    status: str = 'pending'
    failure_count: int = 0
    consecutive_failures: int = 0
    last_error_code: str | None = None
    last_failure_at: str | None = None
    last_success_at: str | None = None


@dataclass(frozen=True)
class WorkerHealth:
    workers_started: bool
    degraded: bool
    loops: list[LoopHealth]


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
    name: str | None = None


@dataclass(frozen=True)
class KioskIdentity:
    id: str
    leader: bool
    follows: bool
    name: str | None = None


@dataclass(frozen=True)
class DiagnosticListing:
    enabled: bool
    clips: list["DiagnosticClip"]


@dataclass(frozen=True)
class CommitResult:
    added: list[dict[str, str]]
    rejected: list[dict[str, str]]


@dataclass(frozen=True)
class Publication:
    word_id: str
    device_id: str
    desired_version: str
    revision: int
    state: str
    attempts: int
    next_retry: str | None
    manifest_state: str
    refresh_state: str
    runtime_state: str
    error_code: str | None
    updated_at: str
    cache_effect: str = ('Refresh restarts detection, clears downloaded model caches for all engines and may '
                          're-download other selected remote models; selections are unchanged.')
    run_number: int | None = None
    published_at: str | None = None


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
class CapturePreview:
    duration_s: float
    start_s: float
    end_s: float
    trim_method: str
    warning: str | None
    duration_limited: bool = False


@dataclass(frozen=True)
class CaptureMetadata:
    trim_method: str
    start_s: float
    end_s: float
    duration_s: float


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
    labelled_by: str | None = None  # 'auto', 'manual', or None while pending
    recording: Recording | None = None
    capture: CaptureMetadata | None = None


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
    labelled_by: str | None = None


T = TypeVar("T")


@dataclass(frozen=True)
class SourceMapping:
    device_id: str
    engine: str
    source_phrase: str
    word_id: str


@dataclass
class CollectionCounters:
    listed: int = 0
    new: int = 0
    already_seen: int = 0
    unmapped: int = 0
    evicted: int = 0
    failed: int = 0


@dataclass
class DeviceCollectionResult(CollectionCounters):
    device_id: str = ""
    status: str = "running"
    errors: list[str] = field(default_factory=list)


@dataclass
class CollectionRun(CollectionCounters):
    id: str = ""
    started_at: str = ""
    finished_at: str | None = None
    status: str = "running"
    devices: list[DeviceCollectionResult] = field(default_factory=list)


@dataclass(frozen=True)
class Page(Generic[T]):
    items: list[T]
    total: int
    offset: int
    limit: int


def check_page(offset, limit, message="Invalid pagination"):
    if type(offset) is not int or offset < 0 or type(limit) is not int or not 1 <= limit <= 100:
        raise ValidationError(message)


def utc_now():
    return datetime.now(timezone.utc)


def aware_utc(value):
    if not isinstance(value, datetime) or value.tzinfo is None or value.utcoffset() is None:
        raise ValidationError('Timezone-aware time required')
    return value.astimezone(timezone.utc)


def iso_now(clock):
    return aware_utc(clock()).isoformat()
