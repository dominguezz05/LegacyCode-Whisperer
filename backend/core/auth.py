from __future__ import annotations

import logging
from functools import lru_cache
from typing import Annotated

import jwt
from jwt import PyJWKClient
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.config import get_settings

logger = logging.getLogger(__name__)

_bearer = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _get_jwks_client(supabase_url: str) -> PyJWKClient:
    """Return a cached JWKS client for the Supabase project.

    PyJWKClient fetches and caches the public keys from:
      <supabase_url>/auth/v1/.well-known/jwks.json

    lru_cache avoids an HTTP call on every request while still allowing
    the server to pick up new keys after a restart.
    """
    url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
    logger.info("Auth: initialising JWKS client → %s", url)
    return PyJWKClient(url)


def get_current_user_id(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(_bearer)
    ] = None,
) -> str | None:
    """Extract the Supabase user UUID from a Bearer JWT.

    Verification strategy (in order):
      1. JWKS / ES256  — Supabase's new default (ECC P-256).
         The public key is fetched automatically from the JWKS endpoint;
         no secret needed in .env — only SUPABASE_URL is required.
      2. Legacy HS256  — fallback for projects still on the old symmetric key.
         Requires SUPABASE_JWT_SECRET in .env.

    Returns the user UUID (``sub`` claim) or None.
    Auth is optional — missing/invalid tokens never raise 401 at this layer.
    """
    if not credentials:
        return None

    settings = get_settings()
    token = credentials.credentials

    # ── Strategy 1: JWKS / ES256 (current Supabase default) ──────────────────
    if settings.supabase_url:
        try:
            client = _get_jwks_client(settings.supabase_url)
            signing_key = client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                options={"verify_aud": False},
            )
            return payload.get("sub")
        except jwt.ExpiredSignatureError:
            logger.warning("Auth: JWT expired (ES256)")
            return None
        except jwt.InvalidTokenError as exc:
            logger.debug("Auth: ES256 verification failed, trying HS256 — %s", exc)

    # ── Strategy 2: Legacy HS256 shared secret ────────────────────────────────
    if settings.supabase_jwt_secret:
        try:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            return payload.get("sub")
        except jwt.ExpiredSignatureError:
            logger.warning("Auth: JWT expired (HS256)")
        except jwt.InvalidTokenError as exc:
            logger.warning("Auth: HS256 verification failed — %s", exc)

    return None


OptionalUser = Annotated[str | None, Depends(get_current_user_id)]
