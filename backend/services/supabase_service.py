from __future__ import annotations

import logging
from typing import Any

from supabase import create_client, Client

from core.config import get_settings
from schemas.analysis import AnalysisResponse, AuditRecord

logger = logging.getLogger(__name__)

_TABLE = "audits"


def _get_client() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        raise RuntimeError("Supabase is not configured (missing URL or KEY).")
    return create_client(settings.supabase_url, settings.supabase_key)


def is_configured() -> bool:
    """Return True if Supabase credentials are present in settings."""
    s = get_settings()
    return bool(s.supabase_url and s.supabase_key)


async def save_audit(
    code: str,
    language: str,
    result: AnalysisResponse,
) -> AuditRecord | None:
    """Persist an audit result to Supabase.

    Returns the saved AuditRecord on success, or None if Supabase is not
    configured — so the /analyze endpoint can degrade gracefully in Phase 1.

    Design: we serialize the Pydantic models to dicts before inserting.
    Supabase's Python client uses the PostgREST API under the hood, so we
    need plain JSON-serialisable types.
    """
    if not is_configured():
        logger.debug("Supabase not configured — skipping audit persistence.")
        return None

    try:
        client = _get_client()
        payload: dict[str, Any] = {
            "language": language,
            "code_snippet": code,
            "maintainability_score": result.maintainability_score,
            "complexity_report": result.complexity_report,
            "security_risks": [r.model_dump() for r in result.security_risks],
            "refactoring_suggestions": [
                s.model_dump() for s in result.refactoring_suggestions
            ],
            "plain_english_summary": result.plain_english_summary,
        }

        response = client.table(_TABLE).insert(payload).execute()
        row = response.data[0]
        logger.info("Audit saved to Supabase with id=%s", row["id"])
        return _row_to_record(row)

    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to save audit to Supabase: %s", exc)
        return None


async def get_audit_history(limit: int = 20) -> list[AuditRecord]:
    """Return the most recent audits, newest first."""
    if not is_configured():
        return []

    try:
        client = _get_client()
        response = (
            client.table(_TABLE)
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return [_row_to_record(row) for row in response.data]
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to fetch audit history: %s", exc)
        return []


async def get_audit_by_id(audit_id: str) -> AuditRecord | None:
    """Return a single audit by UUID, or None if not found."""
    if not is_configured():
        return None

    try:
        client = _get_client()
        response = (
            client.table(_TABLE).select("*").eq("id", audit_id).execute()
        )
        if not response.data:
            return None
        return _row_to_record(response.data[0])
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to fetch audit %s: %s", audit_id, exc)
        return None


def _row_to_record(row: dict[str, Any]) -> AuditRecord:
    """Map a raw Supabase row dict to an AuditRecord Pydantic model."""
    return AuditRecord(
        id=row["id"],
        created_at=row["created_at"],
        language=row["language"],
        code_snippet=row["code_snippet"],
        maintainability_score=row["maintainability_score"],
        complexity_report=row["complexity_report"],
        security_risks=row["security_risks"],
        refactoring_suggestions=row["refactoring_suggestions"],
        plain_english_summary=row["plain_english_summary"],
    )
