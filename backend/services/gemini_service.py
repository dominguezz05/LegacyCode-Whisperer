from __future__ import annotations

import json
import logging
import re
from collections.abc import AsyncGenerator
from typing import Any

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from core.config import get_settings
from prompts.audit_prompts import (
    TECHNICAL_DEBT_AUDIT_SYSTEM_PROMPT,
    build_user_message,
    REFACTOR_SYSTEM_PROMPT,
    build_refactor_user_message,
)

logger = logging.getLogger(__name__)


class GeminiService:
    """LLM audit service — currently backed by Groq (Llama 3.3 70B).

    Named GeminiService for API stability; the LangChain abstraction lets us
    swap providers without touching the endpoint layer (Open/Closed Principle).
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._llm = ChatGroq(
            model=settings.groq_model,
            api_key=settings.groq_api_key,
            temperature=0.1,
            max_tokens=8192,
        )

    async def audit_technical_debt(
        self, code: str, language: str
    ) -> dict[str, Any]:
        messages = [
            SystemMessage(content=TECHNICAL_DEBT_AUDIT_SYSTEM_PROMPT),
            HumanMessage(content=build_user_message(code, language)),
        ]

        logger.info("Sending code audit request to Groq (language=%s)", language)
        response = await self._llm.ainvoke(messages)
        raw_content: str = response.content  # type: ignore[assignment]

        return self._parse_json_response(raw_content)

    async def refactor_code(
        self, code: str, language: str
    ) -> dict[str, Any]:
        messages = [
            SystemMessage(content=REFACTOR_SYSTEM_PROMPT),
            HumanMessage(content=build_refactor_user_message(code, language)),
        ]

        logger.info("Sending refactor request to Groq (language=%s)", language)
        response = await self._llm.ainvoke(messages)
        raw_content: str = response.content  # type: ignore[assignment]

        return self._parse_refactor_response(raw_content)

    # ── Streaming variants ────────────────────────────────────────────────────
    # These yield raw LLM tokens one by one.  The caller is responsible for
    # accumulating the full response and calling the appropriate parse method.

    async def stream_audit_technical_debt(
        self, code: str, language: str
    ) -> AsyncGenerator[str, None]:
        messages = [
            SystemMessage(content=TECHNICAL_DEBT_AUDIT_SYSTEM_PROMPT),
            HumanMessage(content=build_user_message(code, language)),
        ]
        logger.info("Streaming code audit request to Groq (language=%s)", language)
        async for chunk in self._llm.astream(messages):
            if chunk.content:
                yield chunk.content  # type: ignore[misc]

    async def stream_refactor_code(
        self, code: str, language: str
    ) -> AsyncGenerator[str, None]:
        messages = [
            SystemMessage(content=REFACTOR_SYSTEM_PROMPT),
            HumanMessage(content=build_refactor_user_message(code, language)),
        ]
        logger.info("Streaming refactor request to Groq (language=%s)", language)
        async for chunk in self._llm.astream(messages):
            if chunk.content:
                yield chunk.content  # type: ignore[misc]

    def _parse_refactor_response(self, raw: str) -> dict[str, Any]:
        """Parse the XML-delimited refactor response.

        Using XML tags instead of JSON avoids escaping issues when the LLM
        embeds source code (which may contain quotes, backslashes, etc.).
        """
        code_match = re.search(
            r"<REFACTORED_CODE>\s*(.*?)\s*</REFACTORED_CODE>",
            raw,
            re.DOTALL,
        )
        explanation_match = re.search(
            r"<EXPLANATION>\s*(.*?)\s*</EXPLANATION>",
            raw,
            re.DOTALL,
        )

        if not code_match:
            logger.error("LLM refactor response missing <REFACTORED_CODE> tag")
            logger.debug("Raw LLM output: %s", raw)
            raise ValueError("LLM did not return a <REFACTORED_CODE> block")

        return {
            "refactored_code": code_match.group(1),
            "explanation": explanation_match.group(1) if explanation_match else "",
        }

    def _parse_json_response(self, raw: str) -> dict[str, Any]:
        cleaned = raw.strip()

        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            cleaned = "\n".join(
                line for line in lines
                if not line.strip().startswith("```")
            )

        try:
            # strict=False allows literal control characters (tabs, newlines)
            # inside JSON strings — common when LLMs embed code blocks.
            return json.loads(cleaned, strict=False)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse LLM response as JSON: %s", exc)
            logger.debug("Raw LLM output: %s", raw)
            raise ValueError(f"LLM returned non-JSON response: {exc}") from exc
