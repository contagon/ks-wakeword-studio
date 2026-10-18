"""Studio HTTP boundary with explicit public records and sanitized errors."""

from collections.abc import Callable
from fastapi import APIRouter, Query, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from pydantic import BaseModel, ConfigDict

from studio.models import Conflict, NotFound, Page, ValidationError, Wakeword, WakewordUpdate
from studio.runtime import StudioRuntime


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
                return JSONResponse({"detail": "Wakeword not found"}, status_code=404)
            except Conflict:
                return JSONResponse({"detail": "Model identifier already exists"}, status_code=409)

        return sanitized


class CreateWakeword(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    phrase: str
    language: str
    model_id: str


class UpdateWakeword(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    phrase: str | None = None
    language: str | None = None


def create_router(runtime: StudioRuntime) -> APIRouter:
    router = APIRouter(prefix="/api/studio", route_class=StudioRoute)

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

    return router
