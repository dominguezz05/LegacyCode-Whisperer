from __future__ import annotations

import json
import logging
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from schemas.analysis import AnalysisRequest, AnalysisResponse
from services.gemini_service import GeminiService
from services import supabase_service
from utils.static_analysis import compute_complexity_report, mi_to_score

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["Analysis"])


# ── Dependency ────────────────────────────────────────────────────────────────

def get_gemini_service() -> GeminiService:
    return GeminiService()


GeminiDep = Annotated[GeminiService, Depends(get_gemini_service)]


# ── SSE helper ────────────────────────────────────────────────────────────────

def _sse(event_type: str, **kwargs: object) -> str:
    return f"data: {json.dumps({'type': event_type, **kwargs})}\n\n"


# ── Standard endpoint ─────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=AnalysisResponse,
    summary="Audit legacy code for technical debt",
    status_code=status.HTTP_200_OK,
)
async def analyze_code(
    request: AnalysisRequest,
    gemini_service: GeminiDep,
) -> AnalysisResponse:
    """Full audit — waits for the complete LLM response. Use /stream for real-time UI."""
    complexity_report = compute_complexity_report(request.code)
    radon_score = mi_to_score(complexity_report.get("maintainability_index", 50.0))

    try:
        llm_result = await gemini_service.audit_technical_debt(
            code=request.code,
            language=request.language,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f"AI service returned an invalid response: {exc}") from exc
    except Exception as exc:
        logger.exception("Unexpected error calling Groq API")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="AI service is temporarily unavailable.") from exc

    llm_score: int = llm_result.get("maintainability_score", radon_score)
    blended_score = round(llm_score * 0.6 + radon_score * 0.4)

    result = AnalysisResponse(
        maintainability_score=blended_score,
        complexity_report=complexity_report,
        security_risks=llm_result.get("security_risks", []),
        refactoring_suggestions=llm_result.get("refactoring_suggestions", []),
        plain_english_summary=llm_result.get("plain_english_summary", ""),
    )

    await supabase_service.save_audit(code=request.code, language=request.language, result=result)
    return result


# ── Streaming endpoint ────────────────────────────────────────────────────────

@router.post("/stream", summary="Audit with real-time token streaming (SSE)")
async def analyze_code_stream(
    request: AnalysisRequest,
    gemini_service: GeminiDep,
) -> StreamingResponse:
    """Stream the audit as Server-Sent Events.

    Event sequence:
      {"type":"phase",  "phase":"static_analysis", "label":"..."}
      {"type":"phase",  "phase":"ai_audit",         "label":"..."}
      {"type":"token",  "content":"<chunk>"}         <- repeated
      {"type":"phase",  "phase":"building",          "label":"..."}
      {"type":"result", "data":{...AnalysisResponse...}}
      {"type":"done"}
    On error: {"type":"error", "message":"..."}
    """
    async def _generate() -> AsyncGenerator[str, None]:
        yield _sse("phase", phase="static_analysis", label="Running static analysis...")
        complexity_report = compute_complexity_report(request.code)
        radon_score = mi_to_score(complexity_report.get("maintainability_index", 50.0))

        yield _sse("phase", phase="ai_audit", label="Auditing with Groq AI...")
        full_response = ""
        try:
            async for token in gemini_service.stream_audit_technical_debt(
                request.code, request.language
            ):
                full_response += token
                yield _sse("token", content=token)
        except Exception as exc:
            logger.exception("Error during streaming audit")
            yield _sse("error", message=str(exc))
            return

        yield _sse("phase", phase="building", label="Building report...")
        try:
            llm_result = gemini_service._parse_json_response(full_response)
        except ValueError as exc:
            yield _sse("error", message=str(exc))
            return

        llm_score: int = llm_result.get("maintainability_score", radon_score)
        blended_score = round(llm_score * 0.6 + radon_score * 0.4)
        result = AnalysisResponse(
            maintainability_score=blended_score,
            complexity_report=complexity_report,
            security_risks=llm_result.get("security_risks", []),
            refactoring_suggestions=llm_result.get("refactoring_suggestions", []),
            plain_english_summary=llm_result.get("plain_english_summary", ""),
        )

        await supabase_service.save_audit(
            code=request.code, language=request.language, result=result
        )
        yield _sse("result", data=result.model_dump())
        yield _sse("done")

    return StreamingResponse(
        _generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
