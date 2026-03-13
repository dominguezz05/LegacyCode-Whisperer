from __future__ import annotations

import pytest

from services.gemini_service import GeminiService


@pytest.fixture
def service() -> GeminiService:
    """GeminiService instance — LLM never actually called in these unit tests."""
    return GeminiService()


# ── _parse_json_response ──────────────────────────────────────────────────────

def test_parse_valid_json(service):
    raw = '{"maintainability_score": 75, "security_risks": [], "refactoring_suggestions": [], "plain_english_summary": "OK."}'
    result = service._parse_json_response(raw)
    assert result["maintainability_score"] == 75


def test_parse_strips_markdown_fence(service):
    raw = '```json\n{"maintainability_score": 60, "security_risks": [], "refactoring_suggestions": [], "plain_english_summary": "Fine."}\n```'
    result = service._parse_json_response(raw)
    assert result["maintainability_score"] == 60


def test_parse_strips_plain_fence(service):
    raw = '```\n{"maintainability_score": 55}\n```'
    result = service._parse_json_response(raw)
    assert result["maintainability_score"] == 55


def test_parse_invalid_json_raises(service):
    with pytest.raises(ValueError, match="non-JSON"):
        service._parse_json_response("this is not json")


def test_parse_empty_string_raises(service):
    with pytest.raises(ValueError):
        service._parse_json_response("")


# ── _parse_refactor_response ──────────────────────────────────────────────────

def test_parse_refactor_extracts_code(service):
    raw = "<REFACTORED_CODE>def add(a, b): return a + b</REFACTORED_CODE><EXPLANATION>Simplified.</EXPLANATION>"
    result = service._parse_refactor_response(raw)
    assert result["refactored_code"] == "def add(a, b): return a + b"


def test_parse_refactor_extracts_explanation(service):
    raw = "<REFACTORED_CODE>x = 1</REFACTORED_CODE><EXPLANATION>Used single assignment.</EXPLANATION>"
    result = service._parse_refactor_response(raw)
    assert "single assignment" in result["explanation"]


def test_parse_refactor_missing_code_tag_raises(service):
    with pytest.raises(ValueError, match="REFACTORED_CODE"):
        service._parse_refactor_response("no tags here")


def test_parse_refactor_missing_explanation_returns_empty(service):
    raw = "<REFACTORED_CODE>x = 1</REFACTORED_CODE>"
    result = service._parse_refactor_response(raw)
    assert result["explanation"] == ""


def test_parse_refactor_multiline_code(service):
    code = "def foo():\n    pass\n\ndef bar():\n    return 1"
    raw = f"<REFACTORED_CODE>{code}</REFACTORED_CODE><EXPLANATION>Split functions.</EXPLANATION>"
    result = service._parse_refactor_response(raw)
    assert "def foo" in result["refactored_code"]
    assert "def bar" in result["refactored_code"]
