from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


# ── Request ──────────────────────────────────────────────────────────────────


class AnalysisRequest(BaseModel):
    """Payload the client sends to POST /api/v1/analyze."""

    code: str = Field(
        ...,
        min_length=10,
        description="The legacy source code string to audit.",
    )
    language: str = Field(
        default="python",
        description="Programming language of the submitted code.",
    )


# ── Sub-models ────────────────────────────────────────────────────────────────


class SecurityRisk(BaseModel):
    severity: str = Field(..., description="'critical' | 'high' | 'medium' | 'low'")
    description: str
    line_hint: str | None = None


class RefactoringSuggestion(BaseModel):
    priority: str = Field(..., description="'high' | 'medium' | 'low'")
    category: str = Field(..., description="e.g. 'naming', 'complexity', 'security'")
    description: str
    before_snippet: str | None = None
    after_snippet: str | None = None


# ── Response ──────────────────────────────────────────────────────────────────


class AnalysisResponse(BaseModel):
    """Structured audit report returned to the client."""

    maintainability_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="0 = unmaintainable, 100 = pristine.",
    )
    complexity_report: dict[str, Any] = Field(
        default_factory=dict,
        description="Raw Radon cyclomatic complexity metrics.",
    )
    security_risks: list[SecurityRisk] = Field(default_factory=list)
    refactoring_suggestions: list[RefactoringSuggestion] = Field(
        default_factory=list
    )
    plain_english_summary: str = Field(
        ...,
        description="Human-readable explanation of the code's logic and debt.",
    )


# ── Audit Record (Phase 2 — persisted) ───────────────────────────────────────


class AuditRecord(AnalysisResponse):
    """An AnalysisResponse enriched with persistence metadata."""

    id: UUID
    created_at: datetime
    language: str
    code_snippet: str
