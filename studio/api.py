"""Studio HTTP boundary with explicit public records and sanitized errors."""

from collections.abc import Callable
from fastapi import APIRouter, Depends, File, Form, Query, Request, Response, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.routing import APIRoute
from pydantic import BaseModel, ConfigDict, SecretStr

from studio.models import (CollectionRun, Conflict, CredentialsRequired, Device, IdentityMismatch, SourceMapping,
                           RemoteRejected, RemoteUnavailable, NotFound, Page, Recording, Sample, SampleQuery,
                           ValidationError, Wakeword, WakewordUpdate, Job, Schedule, WorkerHealth, Dataset,
                           Batch, GenerationRecipe, TrainingSettings, RunManifest, ModelVersion, Publication,
                           DeploymentCapabilities, StudioCapabilities, LegacyRun)
from studio.migration import LegacyImportSelection, LegacyInventory, MigrationReport
from studio.runtime import StudioRuntime
from studio.storage import AUDIO_MIMES


class StudioRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        handler = super().get_route_handler()

        async def sanitized(request: Request) -> Response:
            try:
                return await handler(request)
            except (RequestValidationError, ValidationError):
                # Framework validation details can echo credentials from rejected input.
                return JSONResponse({"detail": "Invalid studio request"}, status_code=422)
            except NotFound:
                return JSONResponse({"detail": "Studio record not found"}, status_code=404)
            except Conflict:
                return JSONResponse({"detail": "Studio record conflict"}, status_code=409)
            except IdentityMismatch:
                return JSONResponse({"detail": "Kiosk identity changed"}, status_code=409)
            except CredentialsRequired:
                return JSONResponse({"detail": "Kiosk admin credentials required"}, status_code=403)
            except RemoteRejected:
                return JSONResponse({"detail": "Kiosk rejected request"}, status_code=502)
            except RemoteUnavailable:
                return JSONResponse({"detail": "Kiosk unavailable"}, status_code=503)

        return sanitized


class CreateWakeword(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    phrase: str
    language: str
    model_id: str | None = None


class DeviceCredentials(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    password: SecretStr


class AddDevice(DeviceCredentials):
    url: str
    role: str


class UpdateWakeword(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    phrase: str | None = None
    language: str | None = None


class RevisionBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    expected_revision: int


class LabelBody(RevisionBody):
    label: str


class TrimBody(RevisionBody):
    start_s: float
    end_s: float


class AssignBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    word_id: str


class ScrapeBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    device_ids: list[str] | None = None


class SourceMappingBody(AssignBody):
    engine: str
    source_phrase: str


class ScheduleBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    cron: str
    timezone: str = 'UTC'
    enabled: bool


class JobBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    kind: str
    word_id: str | None = None
    payload: dict = {}
    dedupe_key: str | None = None


class DatasetSelectionBody(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    dataset_ids: list[str]


class GenerationRecipeBody(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    language: str
    english_accent: str
    tts_mode: str
    samples: int
    batch_size: int
    engines: list[str] | None = None


class MigrationImportBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    word_id: str
    phrase_assignments: dict[str, str] = {}
    model_assignments: dict[str, str] = {}


class BatchSelectionBody(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    batch_ids: list[str]


class TrainingSettingsBody(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    training_steps: int


class PublishBody(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    version_id: str


def sample_query(offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100),
                 label: str | None = None, device_id: str | None = None,
                 near_miss: bool | None = None, source: str | None = None,
                 search: str = "", after: str | None = None, before: str | None = None) -> SampleQuery:
    return SampleQuery(offset, limit, label, device_id, near_miss, source, search, after, before)


def create_router(runtime: StudioRuntime) -> APIRouter:
    router = APIRouter(prefix="/api/studio", route_class=StudioRoute)

    @router.get('/capabilities', response_model=StudioCapabilities)
    def capabilities() -> StudioCapabilities:
        return runtime.capabilities()

    @router.get('/migration', response_model=LegacyInventory)
    def inspect_migration() -> LegacyInventory:
        return runtime.migration.inspect()

    @router.post('/migration/import', response_model=MigrationReport)
    def import_migration(body: MigrationImportBody) -> MigrationReport:
        # Workspace is chosen only through an explicit assignment, never browser state.
        if any(value != body.word_id for value in (*body.phrase_assignments.values(), *body.model_assignments.values())):
            raise ValidationError('Legacy assignments must use the chosen workspace')
        return runtime.migration.import_into(body.word_id, LegacyImportSelection(
            phrase_assignments=body.phrase_assignments, model_assignments=body.model_assignments))

    @router.get('/deployment/capabilities', response_model=DeploymentCapabilities)
    def deployment_capabilities():
        """Static operational prerequisites, not a remote staging-cleanliness probe."""
        return DeploymentCapabilities()

    @router.get('/wakewords/{word_id}/training/settings', response_model=TrainingSettings)
    def training_settings(word_id: str):
        return runtime.training.settings(word_id)

    @router.put('/wakewords/{word_id}/training/settings', response_model=TrainingSettings)
    def save_training_settings(word_id: str, body: TrainingSettingsBody):
        return runtime.training.save_settings(word_id, TrainingSettings(**body.model_dump()))

    @router.get('/wakewords/{word_id}/training/counts', response_model=dict[str, int])
    def training_counts(word_id: str):
        return runtime.training.counts(word_id)

    @router.post('/wakewords/{word_id}/training/jobs', response_model=Job, status_code=201)
    def train(word_id: str):
        return runtime.training.enqueue(word_id, 'manual')

    @router.get('/wakewords/{word_id}/training/runs', response_model=Page[Job])
    def training_runs(word_id: str, offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)):
        return runtime.training.runs(word_id, offset, limit)

    @router.get('/wakewords/{word_id}/training/runs/{run_id}', response_model=RunManifest | LegacyRun)
    def training_manifest(word_id: str, run_id: str):
        return runtime.training.get_manifest(word_id, run_id)

    @router.get('/wakewords/{word_id}/models', response_model=Page[ModelVersion])
    def models(word_id: str, offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)):
        return runtime.training.versions(word_id, offset, limit)

    @router.get('/wakewords/{word_id}/models/{version_id}', response_model=ModelVersion)
    def model_version(word_id: str, version_id: str):
        return runtime.deployment.version(version_id, word_id)

    @router.get('/wakewords/{word_id}/models/{version_id}/archive')
    def model_archive(word_id: str, version_id: str):
        chunks = runtime.deployment.archive(version_id, word_id)
        return StreamingResponse(chunks, media_type='application/zip',
                                 headers={'Content-Disposition': 'attachment; filename="model-archive.zip"'})

    @router.get('/wakewords/{word_id}/models/{version_id}/archive/{name}')
    def model_file(word_id: str, version_id: str, name: str):
        version = runtime.deployment.version(version_id, word_id)
        # Serve only validated deployable basenames, never arbitrary server paths.
        artifacts = runtime.deployment.artifacts(version)
        if name not in artifacts:
            raise NotFound('Artifact not found')
        return Response(artifacts[name], media_type='application/octet-stream',
                               headers={'Content-Disposition': f'attachment; filename="{name}"'})

    @router.get('/wakewords/{word_id}/deployment/status', response_model=list[Publication],
                description='Publication observations, not proof of clean upload staging. '
                            'See GET /api/studio/deployment/capabilities for required staging ownership '
                            'and quarantine/operator-action notices.')
    def publication_status(word_id: str):
        return runtime.deployment.status(word_id)

    @router.get('/wakewords/{word_id}/deployment/history', response_model=Page[Publication])
    def publication_history(word_id: str, offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)):
        return runtime.deployment.history(word_id, offset, limit)

    @router.post('/wakewords/{word_id}/deployment/publish', response_model=list[Publication])
    def publish_version(word_id: str, body: PublishBody):
        runtime.deployment.version(body.version_id, word_id)
        return runtime.deployment.publish(body.version_id)

    @router.post('/wakewords/{word_id}/deployment/rollback', response_model=list[Publication])
    def rollback_version(word_id: str, body: PublishBody):
        return runtime.deployment.rollback(word_id, body.version_id)

    @router.get('/generation/catalog')
    def generation_catalog():
        return runtime.generation.catalog()

    @router.get('/wakewords/{word_id}/generation/selection', response_model=list[str])
    def generation_selection(word_id: str):
        return runtime.generation.selection(word_id)

    @router.get('/wakewords/{word_id}/generation/recipe', response_model=GenerationRecipe)
    def generation_recipe(word_id: str) -> GenerationRecipe:
        return runtime.generation.get_recipe(word_id)

    @router.put('/wakewords/{word_id}/generation/recipe', response_model=GenerationRecipe)
    def save_generation_recipe(word_id: str, body: GenerationRecipeBody) -> GenerationRecipe:
        return runtime.generation.save_recipe(word_id, GenerationRecipe(**body.model_dump()))

    @router.post('/wakewords/{word_id}/generation/jobs', response_model=Job, status_code=201)
    def generate_batch(word_id: str, body: GenerationRecipeBody | None = None) -> Job:
        return runtime.generation.enqueue(word_id, GenerationRecipe(**body.model_dump()) if body else None)

    @router.post('/wakewords/{word_id}/generation/previews', response_model=Job, status_code=201)
    def generate_preview(word_id: str, body: GenerationRecipeBody) -> Job:
        return runtime.generation.enqueue_preview(word_id, GenerationRecipe(**body.model_dump()))

    @router.get('/wakewords/{word_id}/generation/previews/{job_id}/audio')
    def preview_audio(word_id: str, job_id: str):
        return Response(runtime.generation.preview_audio(word_id, job_id), media_type='audio/wav',
                        headers={'Cache-Control': 'no-store'})

    @router.get('/wakewords/{word_id}/generation/batches', response_model=Page[Batch])
    def batches(word_id: str, offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)) -> Page[Batch]:
        return runtime.generation.list(word_id, offset, limit)

    @router.get('/wakewords/{word_id}/generation/batches/{batch_id}', response_model=Batch)
    def batch(word_id: str, batch_id: str) -> Batch:
        return runtime.generation.get_batch(word_id, batch_id)

    @router.put('/wakewords/{word_id}/generation/batches', response_model=Page[Batch])
    def select_batches(word_id: str, body: BatchSelectionBody) -> Page[Batch]:
        runtime.generation.select_batches(word_id, body.batch_ids)
        return runtime.generation.list(word_id)

    @router.get('/wakewords/{word_id}/datasets', response_model=Page[Dataset])
    def datasets(word_id: str, search: str = '', status: str | None = None,
                 offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)) -> Page[Dataset]:
        return runtime.datasets.list(word_id, search, status, offset, limit)

    @router.put('/wakewords/{word_id}/datasets', response_model=Page[Dataset])
    def select_datasets(word_id: str, body: DatasetSelectionBody) -> Page[Dataset]:
        runtime.datasets.select(word_id, body.dataset_ids)
        return runtime.datasets.list(word_id)

    @router.post('/datasets/{dataset_id}/download', response_model=Job, status_code=201)
    def download_dataset(dataset_id: str) -> Job:
        return runtime.datasets.download(dataset_id)

    @router.get('/schedules', response_model=list[Schedule])
    def schedules() -> list[Schedule]:
        return runtime.schedules.list()

    @router.put('/schedules/{scope}', response_model=Schedule)
    def save_schedule(scope: str, body: ScheduleBody) -> Schedule:
        return runtime.schedules.save(scope, body.cron, body.timezone, body.enabled)

    @router.post('/jobs', response_model=Job, status_code=201)
    def enqueue_job(body: JobBody) -> Job:
        return runtime.jobs.enqueue(body.kind, body.word_id, body.payload, body.dedupe_key)

    @router.get('/jobs', response_model=Page[Job])
    def jobs(offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)) -> Page[Job]:
        return runtime.jobs.list(offset, limit)

    @router.get('/jobs/health', response_model=WorkerHealth)
    def worker_health() -> WorkerHealth:
        return runtime.health()

    @router.get('/jobs/{job_id}', response_model=Job)
    def job(job_id: str) -> Job:
        return runtime.jobs.get(job_id)

    @router.get('/jobs/{job_id}/logs', response_model=dict[str, str])
    def job_logs(job_id: str, limit: int = Query(8192, ge=1, le=65536)) -> dict[str, str]:
        return {'text': runtime.jobs.log_tail(job_id, limit)}

    @router.post('/jobs/{job_id}/cancel', response_model=Job)
    def cancel_job(job_id: str) -> Job:
        return runtime.jobs.cancel(job_id)

    @router.post("/scrape", response_model=CollectionRun)
    def scrape(body: ScrapeBody = ScrapeBody()) -> CollectionRun:
        return runtime.collection.run(body.device_ids)

    @router.get("/scrape/runs", response_model=Page[CollectionRun])
    def scrape_runs(offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)) -> Page[CollectionRun]:
        return runtime.collection.list_runs(offset, limit)

    @router.get("/devices/{device_id}/source-mappings", response_model=list[SourceMapping])
    def source_mappings(device_id: str) -> list[SourceMapping]:
        return runtime.workspaces.source_mappings(device_id)

    @router.put("/devices/{device_id}/source-mappings", response_model=SourceMapping)
    def set_source_mapping(device_id: str, body: SourceMappingBody) -> SourceMapping:
        runtime.workspaces.set_source_mapping(device_id, body.engine, body.source_phrase, body.word_id)
        return SourceMapping(device_id, body.engine, body.source_phrase, body.word_id)

    @router.get("/devices", response_model=list[Device])
    def list_devices() -> list[Device]:
        return runtime.devices.list()

    @router.post("/devices", response_model=Device, status_code=201)
    def add_device(body: AddDevice) -> Device:
        return runtime.devices.add_with_password(body.url, body.password.get_secret_value(), body.role)

    @router.post("/devices/{device_id}/refresh", response_model=list[Device])
    def refresh_devices(device_id: str) -> list[Device]:
        return runtime.devices.refresh_fleet(device_id)

    @router.post("/devices/{device_id}/credentials", response_model=Device)
    def device_credentials(device_id: str, body: DeviceCredentials) -> Device:
        return runtime.devices.set_password(device_id, body.password.get_secret_value())

    @router.post("/wakewords", response_model=Wakeword, status_code=201)
    def create_word(body: CreateWakeword) -> Wakeword:
        return runtime.workspaces.create(body.phrase, body.language, body.model_id)

    @router.get("/wakewords", response_model=Page[Wakeword])
    def list_words(offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)) -> Page[Wakeword]:
        return runtime.workspaces.list(offset, limit)

    @router.get("/wakewords/{word_id}", response_model=Wakeword)
    def get_word(word_id: str) -> Wakeword:
        return runtime.workspaces.get(word_id)

    @router.patch("/wakewords/{word_id}", response_model=Wakeword)
    def update_word(word_id: str, body: UpdateWakeword) -> Wakeword:
        return runtime.workspaces.update(word_id, WakewordUpdate(body.phrase, body.language))

    @router.delete("/wakewords/{word_id}", status_code=204)
    def delete_word(word_id: str) -> Response:
        runtime.workspaces.delete(word_id)
        return Response(status_code=204)

    @router.get("/wakewords/{word_id}/samples", response_model=Page[Sample])
    def list_samples(word_id: str, query: SampleQuery = Depends(sample_query)) -> Page[Sample]:
        return runtime.samples.list(word_id, query)

    @router.get("/wakewords/{word_id}/queue", response_model=Page[Sample])
    def review_queue(word_id: str, query: SampleQuery = Depends(sample_query)) -> Page[Sample]:
        return runtime.samples.queue(word_id, query)

    @router.get("/recordings/unmapped", response_model=Page[Recording])
    def unmapped(query: SampleQuery = Depends(sample_query)) -> Page[Recording]:
        return runtime.samples.unmapped(query)

    @router.post("/recordings/{recording_id}/assign", response_model=Sample)
    def assign(recording_id: str, body: AssignBody) -> Sample:
        return runtime.samples.assign(recording_id, body.word_id)

    @router.post("/wakewords/{word_id}/samples/import", response_model=Sample, status_code=201)
    def import_audio(word_id: str, label: str = Form(...), audio: UploadFile = File(...)) -> Sample:
        # Filenames are neither paths nor metadata: content determines decoding.
        if audio.content_type not in AUDIO_MIMES:
            raise ValidationError("Unsupported audio MIME")
        return runtime.samples.import_audio(word_id, label, audio.file)

    @router.get("/wakewords/{word_id}/samples/{sample_id}", response_model=Sample)
    def get_sample(word_id: str, sample_id: str) -> Sample:
        return runtime.samples.get(sample_id, word_id)

    @router.post("/wakewords/{word_id}/samples/{sample_id}/label", response_model=Sample)
    def label_sample(word_id: str, sample_id: str, body: LabelBody) -> Sample:
        runtime.samples.get(sample_id, word_id)
        return runtime.samples.set_label(sample_id, body.label, body.expected_revision)

    @router.post("/wakewords/{word_id}/samples/{sample_id}/undo", response_model=Sample)
    def undo_sample(word_id: str, sample_id: str, body: RevisionBody) -> Sample:
        runtime.samples.get(sample_id, word_id)
        return runtime.samples.undo(sample_id, body.expected_revision)

    @router.post("/wakewords/{word_id}/samples/{sample_id}/trim", response_model=Sample)
    def trim_sample(word_id: str, sample_id: str, body: TrimBody) -> Sample:
        runtime.samples.get(sample_id, word_id)
        return runtime.samples.trim(sample_id, body.start_s, body.end_s, body.expected_revision)

    @router.delete("/wakewords/{word_id}/samples/{sample_id}", status_code=204)
    def delete_sample(word_id: str, sample_id: str, expected_revision: int = Query(..., ge=0)) -> Response:
        runtime.samples.get(sample_id, word_id)
        runtime.samples.delete(sample_id, expected_revision)
        return Response(status_code=204)

    @router.get("/wakewords/{word_id}/samples/{sample_id}/audio")
    def sample_audio(word_id: str, sample_id: str, original: bool = False) -> Response:
        data = runtime.samples.audio(sample_id, word_id, original)
        mime = "audio/wav" if not original or data[:4] == b"RIFF" else "application/octet-stream"
        return Response(data, media_type=mime, headers={"Cache-Control": "private, no-store",
                                                       "X-Content-Type-Options": "nosniff"})

    return router
