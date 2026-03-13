from __future__ import annotations

# Set fake env vars BEFORE any app import triggers get_settings() + lru_cache.
import os
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "test-supabase-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-jwt-secret-32-chars-padding!")

import pytest
from httpx import AsyncClient, ASGITransport

from main import create_app


@pytest.fixture(scope="session")
def app():
    """Single FastAPI app instance shared across the whole test session."""
    return create_app()


@pytest.fixture
async def client(app):
    """Async HTTP client wired directly to the ASGI app (no real TCP)."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
