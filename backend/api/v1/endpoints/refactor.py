from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from schemas.analysis import RefactorRequest, RefactorResponse
from services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/refactor", tags=["Refactor"])


def get_gemini_service() -> GeminiService:
    return GeminiService()


GeminiDep = Annotated[GeminiService, Depends(get_gemini_service)]


@router.post(
    "/",
    response_model=RefactorResponse,
    summary="Produce a clean, refactored version of the submitted code",
    response_description="Refactored source code and a short explanation of changes.",
    status_code=status.HTTP_200_OK,
)
async def refactor_code(
    request: RefactorRequest,
    gemini_service: GeminiDep,
) -> RefactorResponse:
    """Send code to the LLM for a full refactoring pass.

    The endpoint is intentionally thin — all intelligence lives in GeminiService.
    No static analysis is run here because Radon metrics are not relevant to
    code generation; they belong to the audit pipeline.
    """
    try:
        llm_result = await gemini_service.refactor_code(
            code=request.code,
            language=request.language,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service returned an invalid response: {exc}",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error calling Groq API for refactoring")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable.",
        ) from exc

    return RefactorResponse(
        refactored_code=llm_result.get("refactored_code", ""),
        explanation=llm_result.get("explanation", ""),
    )
