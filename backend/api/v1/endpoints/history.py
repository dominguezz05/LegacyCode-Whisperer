from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status

from core.auth import OptionalUser
from schemas.analysis import AuditRecord
from services import supabase_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["History"])


@router.get(
    "/",
    response_model=list[AuditRecord],
    summary="List the current user's audit history",
)
async def get_history(
    user_id: OptionalUser,
    limit: int = Query(default=20, ge=1, le=100, description="Max records to return"),
) -> list[AuditRecord]:
    """Return the authenticated user's most recent audits, newest first.

    Requires a valid Supabase JWT in the Authorization header.
    Returns an empty list when unauthenticated (no 401 — keeps the frontend
    graceful until the Auth frontend is implemented in Phase 5-B).
    """
    return await supabase_service.get_audit_history(limit=limit, user_id=user_id)


@router.get(
    "/{audit_id}",
    response_model=AuditRecord,
    summary="Get a single audit by ID",
)
async def get_audit(audit_id: str) -> AuditRecord:
    """Retrieve a specific audit report by its UUID."""
    record = await supabase_service.get_audit_by_id(audit_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audit '{audit_id}' not found.",
        )
    return record
