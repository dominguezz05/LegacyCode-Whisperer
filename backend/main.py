from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.endpoints.analysis import router as analysis_router
from api.v1.endpoints.history import router as history_router
from api.v1.endpoints.refactor import router as refactor_router
from core.config import get_settings

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ── App Factory ───────────────────────────────────────────────────────────────
# Using a factory function (create_app) instead of a module-level instance
# makes the app easily testable: tests can call create_app() with test config
# without triggering side effects at import time.

def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_title,
        version=settings.app_version,
        description=(
            "AI-powered technical debt auditor. "
            "Submit legacy code and receive structured JSON reports "
            "with maintainability scores, security risks, and refactoring plans."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS — allow the Next.js dev server in development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers — versioned API prefix following REST best practices
    app.include_router(analysis_router, prefix="/api/v1")
    app.include_router(history_router, prefix="/api/v1")
    app.include_router(refactor_router, prefix="/api/v1")

    @app.get("/health", tags=["Health"])
    async def health_check() -> dict[str, str]:
        """Liveness probe for container orchestration (K8s, Railway, etc.)."""
        return {"status": "ok", "version": settings.app_version}

    logger.info("LegacyCode Whisperer API v%s started.", settings.app_version)
    return app


app = create_app()
