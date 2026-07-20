from fastapi import Request, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.config import settings
from app.models.entities import User, UserRole, UserSession, UserStatus
from app.security.session import _hash
from app.utils.responses import ApiError


def require_admin(request: Request, db: Session) -> str:
    session_token = request.cookies.get(settings.session_cookie_name)
    if session_token:
        now = datetime.now(timezone.utc)
        auth_session = (
            db.query(UserSession)
            .filter(
                UserSession.session_token_hash == _hash(session_token),
                UserSession.revoked_at.is_(None),
                UserSession.expires_at > now,
            )
            .one_or_none()
        )
        if auth_session:
            user = db.get(User, auth_session.user_id)
            if user and user.status == UserStatus.ACTIVE.value and user.role == UserRole.ADMIN.value:
                return user.email

    raise ApiError("FORBIDDEN", "Admin access is required.", status.HTTP_403_FORBIDDEN)

