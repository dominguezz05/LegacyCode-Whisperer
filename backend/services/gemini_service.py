from __future__ import annotations

import json
import logging
from typing import Any

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from core.config import get_settings
from prompts.audit_prompts import (
    TECHNICAL_DEBT_AUDIT_SYSTEM_PROMPT,
    build_user_message,
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

    def _parse_json_response(self, raw: str) -> dict[str, Any]:
        cleaned = raw.strip()

        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            cleaned = "\n".join(
                line for line in lines
                if not line.strip().startswith("```")
            )

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse LLM response as JSON: %s", exc)
            logger.debug("Raw LLM output: %s", raw)
            raise ValueError(f"LLM returned non-JSON response: {exc}") from exc
