from __future__ import annotations

import logging
from typing import Any

from radon.complexity import cc_visit, cc_rank
from radon.metrics import mi_visit

logger = logging.getLogger(__name__)

# Radon MI thresholds — A (100-20) is maintainable, C (<10) is not.
# We map the MI index to our 0-100 score so the frontend has a single metric.
_MI_MAX = 100.0


def compute_complexity_report(source_code: str) -> dict[str, Any]:
    """Run Radon cyclomatic complexity analysis on the provided source code.

    Returns a dict with:
    - functions: list of per-function complexity entries
    - average_complexity: mean CC score across all blocks
    - maintainability_index: Radon's MI (0-100, higher is better)
    - radon_mi_rank: 'A' | 'B' | 'C'

    Why Radon?
    Cyclomatic complexity (McCabe, 1976) is the industry-standard proxy for
    "how hard is this code to test?". Radon computes it without executing the
    code, making it safe for auditing untrusted legacy files.
    """
    report: dict[str, Any] = {
        "functions": [],
        "average_complexity": 0.0,
        "maintainability_index": 0.0,
        "radon_mi_rank": "N/A",
    }

    try:
        blocks = cc_visit(source_code)
        if blocks:
            entries = [
                {
                    "name": block.name,
                    "complexity": block.complexity,
                    "rank": cc_rank(block.complexity),
                    "lineno": block.lineno,
                }
                for block in blocks
            ]
            report["functions"] = entries
            report["average_complexity"] = round(
                sum(b.complexity for b in blocks) / len(blocks), 2
            )

        mi_score: float = mi_visit(source_code, multi=True)
        report["maintainability_index"] = round(mi_score, 2)
        # Radon MI rank: A ≥ 20, B 10-19, C < 10
        if mi_score >= 20:
            report["radon_mi_rank"] = "A"
        elif mi_score >= 10:
            report["radon_mi_rank"] = "B"
        else:
            report["radon_mi_rank"] = "C"

    except SyntaxError as exc:
        logger.warning("Radon could not parse code (SyntaxError): %s", exc)
        report["parse_error"] = str(exc)
    except Exception as exc:  # noqa: BLE001
        logger.error("Unexpected error in static analysis: %s", exc)
        report["parse_error"] = str(exc)

    return report


def mi_to_score(mi_index: float) -> int:
    """Convert Radon Maintainability Index (0-100) to our display score (0-100).

    Radon's MI can exceed 100 for trivial files, so we clamp it.
    This gives us a single numeric health score to show in the UI.
    """
    return max(0, min(100, round(mi_index)))
