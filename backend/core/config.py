from __future__ import annotations

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment variables."""

    # AI — Groq (free tier, fast inference)
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"

    # Supabase (Phase 2+)
    supabase_url: str = ""
    supabase_key: str = ""
    # JWT Secret from Supabase Dashboard → Project Settings → API → JWT Secret
    # Required for auth (Phase 5). Leave empty to run without authentication.
    supabase_jwt_secret: str = ""

    # CORS — comma-separated list of allowed origins.
    # Dev default: localhost only. In production set via env var on Render:
    #   CORS_ORIGINS=https://your-app.vercel.app,https://custom-domain.com
    cors_origins: list[str] = ["http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        """Accept either a JSON array or a comma-separated string from env."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # App
    app_title: str = "LegacyCode Whisperer API"
    app_version: str = "0.1.0"
    debug: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
