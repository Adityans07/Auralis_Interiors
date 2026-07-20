from __future__ import annotations

import hashlib
import hmac
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from fastapi import Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.entities import (
    AnonymousSession,
    Booking,
    CustomerAccountEvent,
    CustomerAccountEventType,
    DesignRequest,
    Payment,
    SelectedDesign,
    User,
    UserRole,
    UserSession,
    UserStatus,
    UserUsage,
)
from app.utils.responses import ApiError


@dataclass
class RequestContext:
    user: User | None
    anonymous_session: AnonymousSession
    auth_session: UserSession | None = None

    @property
    def user_id(self) -> str | None:
        return self.user.id if self.user else None


def _hash(value: str | None) -> str | None:
    if not value:
        return None
    return hmac.new(settings.effective_auth_secret.encode(), value.encode(), hashlib.sha256).hexdigest()


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


def log_account_event(
    db: Session,
    user_id: str,
    event_type: CustomerAccountEventType,
    metadata: dict | None = None,
) -> None:
    db.add(
        CustomerAccountEvent(
            user_id=user_id,
            event_type=event_type.value,
            event_metadata=metadata,
        )
    )


def get_or_create_anonymous_session(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> AnonymousSession:
    token = request.cookies.get(settings.anonymous_cookie_name)
    new_session = token is None
    if not token:
        token = secrets.token_urlsafe(32)

    anon = db.query(AnonymousSession).filter(AnonymousSession.session_token == token).one_or_none()
    if anon is None:
        anon = AnonymousSession(session_token=token)
        db.add(anon)

    anon.last_seen_at = datetime.now(timezone.utc)
    anon.ip_hash = _hash(_client_ip(request))
    anon.user_agent = request.headers.get("user-agent", "")[:500]
    db.commit()
    db.refresh(anon)

    if new_session:
        response.set_cookie(
            settings.anonymous_cookie_name,
            token,
            httponly=True,
            secure=settings.secure_cookies,
            samesite="lax",
            max_age=60 * 60 * 24 * 365,
            path="/",
        )

    return anon


def _resolve_legacy_user(request: Request, db: Session) -> User | None:
    user_id = request.cookies.get(settings.user_cookie_name)
    if not user_id:
        return None
    user = db.get(User, user_id)
    if not user or user.status != UserStatus.ACTIVE.value:
        return None
    return user


def _resolve_user_from_session_token(request: Request, db: Session) -> tuple[User | None, UserSession | None]:
    session_token = request.cookies.get(settings.session_cookie_name)
    if not session_token:
        return _resolve_legacy_user(request, db), None

    token_hash = _hash(session_token)
    now = datetime.now(timezone.utc)
    auth_session = (
        db.query(UserSession)
        .join(User, User.id == UserSession.user_id)
        .filter(
            UserSession.session_token_hash == token_hash,
            UserSession.revoked_at.is_(None),
            UserSession.expires_at > now,
            User.status == UserStatus.ACTIVE.value,
        )
        .one_or_none()
    )
    if not auth_session:
        return None, None

    auth_session.last_seen_at = now
    auth_session.ip_hash = _hash(_client_ip(request))
    auth_session.user_agent = request.headers.get("user-agent", "")[:500]
    db.flush()
    return auth_session.user, auth_session


def create_user_session(response: Response, request: Request, db: Session, user: User) -> dict[str, str]:
    session_token = secrets.token_urlsafe(48)
    csrf_token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    auth_session = UserSession(
        user_id=user.id,
        session_token_hash=_hash(session_token),
        csrf_token_hash=_hash(csrf_token),
        expires_at=now + timedelta(hours=settings.auth_session_ttl_hours),
        last_seen_at=now,
        ip_hash=_hash(_client_ip(request)),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    db.add(auth_session)
    db.flush()

    max_age = int(settings.auth_session_ttl_hours * 3600)
    response.set_cookie(
        settings.session_cookie_name,
        session_token,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        max_age=max_age,
        path="/",
    )
    response.set_cookie(
        settings.csrf_cookie_name,
        csrf_token,
        httponly=False,
        secure=settings.secure_cookies,
        samesite="lax",
        max_age=max_age,
        path="/",
    )
    response.delete_cookie(settings.user_cookie_name, path="/")
    return {"csrfToken": csrf_token, "sessionId": auth_session.id}


def clear_user_session(response: Response, request: Request, db: Session) -> None:
    session_token = request.cookies.get(settings.session_cookie_name)
    if session_token:
        token_hash = _hash(session_token)
        auth_session = (
            db.query(UserSession)
            .filter(UserSession.session_token_hash == token_hash, UserSession.revoked_at.is_(None))
            .one_or_none()
        )
        if auth_session:
            auth_session.revoked_at = datetime.now(timezone.utc)
            db.flush()

    response.delete_cookie(settings.session_cookie_name, path="/")
    response.delete_cookie(settings.csrf_cookie_name, path="/")
    response.delete_cookie(settings.user_cookie_name, path="/")


def invalidate_user_sessions(db: Session, user_id: str, except_session_id: str | None = None) -> int:
    now = datetime.now(timezone.utc)
    query = db.query(UserSession).filter(UserSession.user_id == user_id, UserSession.revoked_at.is_(None))
    if except_session_id:
        query = query.filter(UserSession.id != except_session_id)
    count = query.update({UserSession.revoked_at: now}, synchronize_session=False)
    return count


def assert_csrf(request: Request, db: Session) -> None:
    session_token = request.cookies.get(settings.session_cookie_name)
    if not session_token:
        return

    csrf_cookie = request.cookies.get(settings.csrf_cookie_name)
    csrf_header = request.headers.get("x-csrf-token")
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise ApiError(
            "CSRF_INVALID",
            "Invalid CSRF token.",
            status.HTTP_403_FORBIDDEN,
        )

    auth_session = (
        db.query(UserSession)
        .filter(UserSession.session_token_hash == _hash(session_token), UserSession.revoked_at.is_(None))
        .one_or_none()
    )
    if not auth_session or auth_session.csrf_token_hash != _hash(csrf_header):
        raise ApiError(
            "CSRF_INVALID",
            "Invalid CSRF token.",
            status.HTTP_403_FORBIDDEN,
        )


def get_request_context(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> RequestContext:
    anonymous_session = get_or_create_anonymous_session(request, response, db)
    user, auth_session = _resolve_user_from_session_token(request, db)
    return RequestContext(user=user, anonymous_session=anonymous_session, auth_session=auth_session)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    user, _auth_session = _resolve_user_from_session_token(request, db)
    return user


def require_user(current_user: User | None = Depends(get_current_user)) -> User:
    if not current_user:
        raise ApiError("AUTH_REQUIRED", "Login is required.", status.HTTP_401_UNAUTHORIZED)
    if current_user.status != UserStatus.ACTIVE.value:
        raise ApiError("ACCOUNT_DISABLED", "Account is not active.", status.HTTP_403_FORBIDDEN)
    return current_user


def require_admin(current_user: User = Depends(require_user)) -> User:
    if current_user.role != UserRole.ADMIN.value:
        raise ApiError("FORBIDDEN", "Admin access is required.", status.HTTP_403_FORBIDDEN)
    return current_user


def _ensure_usage_record(db: Session, user_id: str) -> UserUsage:
    usage = db.query(UserUsage).filter(UserUsage.user_id == user_id).one_or_none()
    if usage is None:
        usage = UserUsage(user_id=user_id)
        db.add(usage)
        db.flush()
    return usage


def link_anonymous_session_to_user(
    db: Session,
    anonymous_session: AnonymousSession,
    user: User,
) -> dict[str, int | bool]:
    if anonymous_session.linked_user_id and anonymous_session.linked_user_id != user.id:
        return {
            "linked": False,
            "designRequests": 0,
            "selectedDesigns": 0,
            "bookings": 0,
            "payments": 0,
            "mergedFreeGeneration": False,
        }

    design_count = (
        db.query(DesignRequest)
        .filter(DesignRequest.anonymous_session_id == anonymous_session.id, DesignRequest.user_id.is_(None))
        .update({DesignRequest.user_id: user.id}, synchronize_session=False)
    )
    selected_count = (
        db.query(SelectedDesign)
        .filter(SelectedDesign.anonymous_session_id == anonymous_session.id, SelectedDesign.user_id.is_(None))
        .update({SelectedDesign.user_id: user.id}, synchronize_session=False)
    )
    booking_count = (
        db.query(Booking)
        .filter(Booking.anonymous_session_id == anonymous_session.id, Booking.user_id.is_(None))
        .update({Booking.user_id: user.id}, synchronize_session=False)
    )
    payment_count = (
        db.query(Payment)
        .filter(Payment.anonymous_session_id == anonymous_session.id, Payment.user_id.is_(None))
        .update({Payment.user_id: user.id}, synchronize_session=False)
    )

    usage = _ensure_usage_record(db, user.id)
    merged_free_generation = bool(anonymous_session.free_generation_used and not usage.free_generation_used)
    if anonymous_session.free_generation_used:
        usage.free_generation_used = True

    anonymous_session.linked_user_id = user.id
    anonymous_session.linked_at = datetime.now(timezone.utc)

    if design_count or selected_count or booking_count or payment_count or merged_free_generation:
        log_account_event(
            db,
            user.id,
            CustomerAccountEventType.ANONYMOUS_SESSION_LINKED,
            {
                "anonymousSessionId": anonymous_session.id,
                "designRequests": design_count,
                "selectedDesigns": selected_count,
                "bookings": booking_count,
                "payments": payment_count,
                "mergedFreeGeneration": merged_free_generation,
                "linkedAt": anonymous_session.linked_at.isoformat() if anonymous_session.linked_at else None,
            },
        )

    return {
        "linked": True,
        "designRequests": design_count,
        "selectedDesigns": selected_count,
        "bookings": booking_count,
        "payments": payment_count,
        "mergedFreeGeneration": merged_free_generation,
    }


def assert_owns_design_request(
    db: Session,
    context: RequestContext,
    design_request_id: str,
    allow_current_anonymous: bool = False,
) -> DesignRequest:
    design_request = db.get(DesignRequest, design_request_id)
    if not design_request:
        raise ApiError("NOT_FOUND", "Design request not found.", status.HTTP_404_NOT_FOUND)

    if context.user_id and design_request.user_id == context.user_id:
        return design_request
    if allow_current_anonymous and design_request.anonymous_session_id == context.anonymous_session.id:
        return design_request

    raise ApiError("FORBIDDEN", "You do not have access to this design request.", status.HTTP_403_FORBIDDEN)


def assert_owns_booking(db: Session, user_id: str, booking_id: str) -> Booking:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise ApiError("NOT_FOUND", "Booking not found.", status.HTTP_404_NOT_FOUND)
    if booking.user_id != user_id:
        raise ApiError("FORBIDDEN", "You do not have access to this booking.", status.HTTP_403_FORBIDDEN)
    return booking


def assert_owns_payment(db: Session, user_id: str, payment_id: str) -> Payment:
    payment = db.get(Payment, payment_id)
    if not payment:
        raise ApiError("NOT_FOUND", "Payment not found.", status.HTTP_404_NOT_FOUND)
    if payment.user_id != user_id:
        raise ApiError("FORBIDDEN", "You do not have access to this payment.", status.HTTP_403_FORBIDDEN)
    return payment


def owner_fields(context: RequestContext) -> dict[str, str | None]:
    if context.user_id:
        return {"user_id": context.user_id, "anonymous_session_id": None}
    return {"user_id": None, "anonymous_session_id": context.anonymous_session.id}

