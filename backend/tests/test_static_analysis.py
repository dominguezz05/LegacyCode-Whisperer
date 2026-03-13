from __future__ import annotations

import pytest

from utils.static_analysis import compute_complexity_report, mi_to_score

# ── Fixtures ──────────────────────────────────────────────────────────────────

SIMPLE_CODE = """\
def add(a, b):
    return a + b
"""

COMPLEX_CODE = """\
def process(x):
    if x > 0:
        if x > 10:
            for i in range(x):
                if i % 2 == 0:
                    print(i)
                else:
                    print(-i)
        elif x > 5:
            return x * 2
    elif x == 0:
        return 0
    else:
        return -x
"""

BROKEN_CODE = "def broken("


# ── compute_complexity_report ─────────────────────────────────────────────────

def test_report_keys_present():
    report = compute_complexity_report(SIMPLE_CODE)
    assert "functions" in report
    assert "average_complexity" in report
    assert "maintainability_index" in report
    assert "radon_mi_rank" in report


def test_simple_code_has_function_entry():
    report = compute_complexity_report(SIMPLE_CODE)
    assert len(report["functions"]) == 1
    assert report["functions"][0]["name"] == "add"


def test_complex_code_higher_complexity():
    simple = compute_complexity_report(SIMPLE_CODE)["average_complexity"]
    complex_ = compute_complexity_report(COMPLEX_CODE)["average_complexity"]
    assert complex_ > simple


def test_mi_rank_is_valid_value():
    report = compute_complexity_report(SIMPLE_CODE)
    assert report["radon_mi_rank"] in ("A", "B", "C")


def test_syntax_error_does_not_raise():
    # Must degrade gracefully — never crash the endpoint
    report = compute_complexity_report(BROKEN_CODE)
    assert "parse_error" in report


def test_maintainability_index_non_negative():
    report = compute_complexity_report(SIMPLE_CODE)
    assert report["maintainability_index"] >= 0


# ── mi_to_score ───────────────────────────────────────────────────────────────

@pytest.mark.parametrize("mi, expected", [
    (-10, 0),     # clamp below 0
    (0,    0),
    (50,  50),
    (100, 100),
    (150, 100),   # clamp above 100
])
def test_mi_to_score_clamps(mi, expected):
    assert mi_to_score(mi) == expected


def test_mi_to_score_rounds():
    assert mi_to_score(72.6) == 73
    assert mi_to_score(72.4) == 72
