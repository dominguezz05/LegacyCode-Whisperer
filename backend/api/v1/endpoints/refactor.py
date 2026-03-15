from __future__ import annotations

import json
import logging
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from schemas.analysis import RefactorRequest, RefactorResponse
from services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/refactor", tags=["Refactor"])


def get_gemini_service() -> GeminiService:
    return GeminiService()


GeminiDep = Annotated[GeminiService, Depends(get_gemini_service)]


def _sse(event_type: str, **kwargs: object) -> str:
    return f"data: {json.dumps({'type': event_type, **kwargs})}\n\n"


# ── Standard endpoint ─────────────────────────────────────────────────────────

@router.post("/", response_model=RefactorResponse, status_code=status.HTTP_200_OK,
             summary="Refactor code (blocking)")
async def refactor_code(
    request: RefactorRequest,
    gemini_service: GeminiDep,
) -> RefactorResponse:
    """Full refactor — waits for the complete LLM response. Use /stream for real-time UI."""
    try:
        llm_result = await gemini_service.refactor_code(
            code=request.code, language=request.language
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f"AI service returned an invalid response: {exc}") from exc
    except Exception as exc:
        logger.exception("Unexpected error calling Groq API for refactoring")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="AI service is temporarily unavailable.") from exc

    return RefactorResponse(
        refactored_code=llm_result.get("refactored_code", ""),
        explanation=llm_result.get("explanation", ""),
    )


# ── Streaming endpoint ────────────────────────────────────────────────────────

@router.post("/stream", summary="Refactor with real-time token streaming (SSE)")
async def refactor_code_stream(
    request: RefactorRequest,
    gemini_service: GeminiDep,
) -> StreamingResponse:
    """Stream the refactoring as Server-Sent Events.

    Event sequence:
      {"type":"phase",  "phase":"refactoring", "label":"..."}
      {"type":"token",  "content":"<chunk>"}    <- repeated (the code being generated)
      {"type":"phase",  "phase":"building",     "label":"..."}
      {"type":"result", "data":{...RefactorResponse...}}
      {"type":"done"}
    On error: {"type":"error", "message":"..."}
    """
    async def _generate() -> AsyncGenerator[str, None]:
        yield _sse("phase", phase="refactoring", label="Refactoring with Groq AI...")
        full_response = ""
        try:
            async for token in gemini_service.stream_refactor_code(
                request.code, request.language
            ):
                full_response += token
                yield _sse("token", content=token)
        except Exception as exc:
            logger.exception("Error during streaming refactor")
            yield _sse("error", message=str(exc))
            return

        yield _sse("phase", phase="building", label="Extracting refactored code...")
        try:
            llm_result = gemini_service._parse_refactor_response(full_response)
        except ValueError as exc:
            yield _sse("error", message=str(exc))
            return

        yield _sse("refactor_result", data={
            "refactored_code": llm_result.get("refactored_code", ""),
            "explanation": llm_result.get("explanation", ""),
        })
        yield _sse("done")

    return StreamingResponse(
        _generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
