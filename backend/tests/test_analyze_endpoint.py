from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport

from main import create_app
from api.v1.endpoints.analysis import get_gemini_service

# ── Shared test data ──────────────────────────────────────────────────────────

SAMPLE_CODE = "def add(a, b):\n    return a + b"

MOCK_LLM_RESULT = {
    "maintainability_score": 85,
    "security_risks": [],
    "refactoring_suggestions": [],
    "plain_english_summary": "Clean addition function with no technical debt.",
}


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_gemini() -> AsyncMock:
    service = AsyncMock()
    service.audit_technical_debt = AsyncMock(return_value=MOCK_LLM_RESULT)
    return service


@pytest.fixture
async def client_mock(mock_gemini) -> AsyncClient:
    """FastAPI client with GeminiService and Supabase fully mocked."""
    app = create_app()
    app.dependency_overrides[get_gemini_service] = lambda: mock_gemini

    with patch("services.supabase_service.save_audit", new_callable=AsyncMock) as _:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac

    app.dependency_overrides.clear()


# ── POST /api/v1/analyze/ ─────────────────────────────────────────────────────

async def test_analyze_200(client_mock):
    response = await client_mock.post(
        "/api/v1/analyze/",
        json={"code": SAMPLE_CODE, "language": "python"},
    )
    assert response.status_code == 200


async def test_analyze_response_schema(client_mock):
    data = (await client_mock.post(
        "/api/v1/analyze/",
        json={"code": SAMPLE_CODE, "language": "python"},
    )).json()

    assert "maintainability_score" in data
    assert "complexity_report" in data
    assert "security_risks" in data
    assert "refactoring_suggestions" in data
    assert "plain_english_summary" in data


async def test_analyze_score_in_range(client_mock):
    data = (await client_mock.post(
        "/api/v1/analyze/",
        json={"code": SAMPLE_CODE, "language": "python"},
    )).json()
    score = data["maintainability_score"]
    assert isinstance(score, int)
    assert 0 <= score <= 100


async def test_analyze_blends_llm_and_radon(client_mock, mock_gemini):
    """Blended score = round(llm * 0.6 + radon * 0.4) — must differ from raw LLM."""
    mock_gemini.audit_technical_debt.return_value = {**MOCK_LLM_RESULT, "maintainability_score": 0}
    data = (await client_mock.post(
        "/api/v1/analyze/",
        json={"code": SAMPLE_CODE, "language": "python"},
    )).json()
    # Radon score for simple code is high → blended > 0 even with llm_score=0
    assert data["maintainability_score"] > 0


async def test_analyze_code_too_short_422(client_mock):
    """AnalysisRequest.code has min_length=10 — short strings must be rejected."""
    response = await client_mock.post(
        "/api/v1/analyze/",
        json={"code": "x=1", "language": "python"},
    )
    assert response.status_code == 422


async def test_analyze_missing_code_field_422(client_mock):
    response = await client_mock.post(
        "/api/v1/analyze/",
        json={"language": "python"},
    )
    assert response.status_code == 422


async def test_analyze_llm_value_error_returns_502(client_mock, mock_gemini):
    """ValueError from GeminiService → 502 Bad Gateway."""
    mock_gemini.audit_technical_debt.side_effect = ValueError("bad JSON from LLM")
    response = await client_mock.post(
        "/api/v1/analyze/",
        json={"code": SAMPLE_CODE, "language": "python"},
    )
    assert response.status_code == 502


async def test_analyze_llm_generic_error_returns_503(client_mock, mock_gemini):
    """Unexpected LLM exception → 503 Service Unavailable."""
    mock_gemini.audit_technical_debt.side_effect = RuntimeError("network down")
    response = await client_mock.post(
        "/api/v1/analyze/",
        json={"code": SAMPLE_CODE, "language": "python"},
    )
    assert response.status_code == 503
