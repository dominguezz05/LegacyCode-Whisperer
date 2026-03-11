from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status

from schemas.analysis import AuditRecord
from services import supabase_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["History"])


@router.get(
    "/",
    response_model=list[AuditRecord],
    summary="List recent audit history",
)
async def get_history(
    limit: int = Query(default=20, ge=1, le=100, description="Max records to return"),
) -> list[AuditRecord]:
    """Return the most recent audits, newest first.

    If Supabase is not configured, returns an empty list instead of erroring —
    this allows the app to run in Phase 1 mode without persistence.
    """
    return await supabase_service.get_audit_history(limit=limit)


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
