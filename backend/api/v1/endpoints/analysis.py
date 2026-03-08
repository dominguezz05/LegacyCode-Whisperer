from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from schemas.analysis import AnalysisRequest, AnalysisResponse
from services.gemini_service import GeminiService
from utils.static_analysis import compute_complexity_report, mi_to_score

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["Analysis"])


# ── Dependency ────────────────────────────────────────────────────────────────
# FastAPI's Depends() system handles service instantiation and makes
# the endpoint easy to unit-test by swapping the dependency.

def get_gemini_service() -> GeminiService:
    return GeminiService()


GeminiDep = Annotated[GeminiService, Depends(get_gemini_service)]


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=AnalysisResponse,
    summary="Audit legacy code for technical debt",
    response_description="Structured JSON report with score, risks, and refactoring plan.",
    status_code=status.HTTP_200_OK,
)
async def analyze_code(
    request: AnalysisRequest,
    gemini_service: GeminiDep,
) -> AnalysisResponse:
    """Receive a code snippet and return a full technical debt audit.

    Pipeline:
    1. Run Radon static analysis (sync, fast) to get cyclomatic complexity.
    2. Combine MI score with LLM score for a blended maintainability metric.
    3. Call Gemini via GeminiService for deep semantic analysis.
    4. Merge static metrics into the LLM response and validate with Pydantic.

    The endpoint stays thin — all intelligence is in the service layer.
    """
    # Step 1: Static analysis (pure Python, no API call)
    complexity_report = compute_complexity_report(request.code)
    radon_score = mi_to_score(complexity_report.get("maintainability_index", 50.0))

    # Step 2: LLM audit
    try:
        llm_result = await gemini_service.audit_technical_debt(
            code=request.code,
            language=request.language,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service returned an invalid response: {exc}",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error calling Gemini API")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable.",
        ) from exc

    # Step 3: Blend scores — 60% LLM judgement, 40% static metric
    llm_score: int = llm_result.get("maintainability_score", radon_score)
    blended_score = round(llm_score * 0.6 + radon_score * 0.4)

    return AnalysisResponse(
        maintainability_score=blended_score,
        complexity_report=complexity_report,
        security_risks=llm_result.get("security_risks", []),
        refactoring_suggestions=llm_result.get("refactoring_suggestions", []),
        plain_english_summary=llm_result.get("plain_english_summary", ""),
    )
