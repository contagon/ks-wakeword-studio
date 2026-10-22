#!/usr/bin/env python3
"""Wakeword Studio HTTP server: the /api/studio router plus the static Vue UI.

Run with `uvicorn --factory trainer_server:create_app`.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from studio.api import create_router
from studio.runtime import StudioRuntime

STATIC_DIR = Path(__file__).resolve().parent / "static"


def create_app(runtime: StudioRuntime | None = None) -> FastAPI:
    if runtime is None:
        runtime = StudioRuntime(Path(os.environ.get("DATA_DIR", "/data")).resolve())

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        runtime.startup()
        runtime.start_workers()
        try:
            yield
        finally:
            runtime.shutdown()

    app = FastAPI(title="Wakeword Studio", lifespan=lifespan)
    app.state.runtime = runtime
    app.include_router(create_router(runtime))
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

    @app.get("/", response_class=HTMLResponse)
    def index():
        return HTMLResponse(
            (STATIC_DIR / "index.html").read_text(encoding="utf-8"),
            headers={"Cache-Control": "no-store, max-age=0"},
        )

    return app
