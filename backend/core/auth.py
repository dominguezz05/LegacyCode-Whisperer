from __future__ import annotations

import logging
from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.config import get_settings

logger = logging.getLogger(__name__)

# HTTPBearer reads the `Authorization: Bearer <token>` header.
# auto_error=False means FastAPI will NOT raise 401 automatically when the
# header is missing — we handle the None case ourselves so auth stays optional.
_bearer = HTTPBearer(auto_error=False)


def get_current_user_id(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(_bearer)
    ] = None,
) -> str | None:
    """Extract the Supabase user UUID from a Bearer JWT.

    Returns:
      - The user's UUID string (``sub`` claim) if the token is valid.
      - ``None`` if no token was provided OR if JWT verification is not
        configured (``SUPABASE_JWT_SECRET`` is empty).

    Design — optional auth:
      Returning None instead of raising 401 lets every endpoint work without
      authentication during development. Endpoints that *require* a logged-in
      user should call ``require_user`` instead.

    Why PyJWT + HS256?
      Supabase JWTs are signed with a symmetric secret (HS256). We verify them
      locally — no round-trip to Supabase needed on every request.
    """
    settings = get_settings()

    if not credentials or not settings.supabase_jwt_secret:
        return None

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase omits `aud` in some tokens
        )
        user_id: str | None = payload.get("sub")
        return user_id
    except jwt.ExpiredSignatureError:
        logger.warning("Auth: JWT has expired")
        return None
    except jwt.InvalidTokenError as exc:
        logger.warning("Auth: invalid JWT — %s", exc)
        return None


# Convenience type alias used in endpoint signatures
OptionalUser = Annotated[str | None, Depends(get_current_user_id)]
