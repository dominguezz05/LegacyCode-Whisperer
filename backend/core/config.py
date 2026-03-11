from __future__ import annotations

from functools import lru_cache

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
