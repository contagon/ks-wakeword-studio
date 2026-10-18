"""Studio HTTP boundary with explicit public records and sanitized errors."""

from collections.abc import Callable
from fastapi import APIRouter, Depends, File, Form, Query, Request, Response, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from pydantic import BaseModel, ConfigDict

from studio.models import (Conflict, CredentialsRequired, Device, IdentityMismatch,
                           RemoteRejected, RemoteUnavailable, NotFound, Page, Recording, Sample, SampleQuery,
                           ValidationError, Wakeword, WakewordUpdate)
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
    model_id: str


class DeviceCredentials(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    token: str


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


def sample_query(offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100),
                 label: str | None = None, device_id: str | None = None,
                 near_miss: bool | None = None, source: str | None = None,
                 search: str = "", after: str | None = None, before: str | None = None) -> SampleQuery:
    return SampleQuery(offset, limit, label, device_id, near_miss, source, search, after, before)


def create_router(runtime: StudioRuntime) -> APIRouter:
    router = APIRouter(prefix="/api/studio", route_class=StudioRoute)

    @router.get("/devices", response_model=list[Device])
    def list_devices() -> list[Device]:
        return runtime.devices.list()

    @router.post("/devices", response_model=Device, status_code=201)
    def add_device(body: AddDevice) -> Device:
        return runtime.devices.add(body.url, body.token, body.role)

    @router.post("/devices/{device_id}/refresh", response_model=list[Device])
    def refresh_devices(device_id: str) -> list[Device]:
        return runtime.devices.refresh_fleet(device_id)

    @router.post("/devices/{device_id}/credentials", response_model=Device)
    def device_credentials(device_id: str, body: DeviceCredentials) -> Device:
        return runtime.devices.set_credentials(device_id, body.token)

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
