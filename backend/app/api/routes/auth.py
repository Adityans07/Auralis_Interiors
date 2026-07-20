from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Body, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.entities import (
    CustomerAccountEventType,
    EmailVerificationToken,
    PasswordResetToken,
    User,
    UserRole,
    UserStatus,
    UserUsage,
)
from app.schemas.auth import (
    ForgotPasswordIn,
    LoginIn,
    RegisterIn,
    ResendVerificationIn,
    ResetPasswordIn,
    VerifyEmailIn,
)
from app.security.passwords import hash_password, validate_password_strength, verify_password
from app.security.rate_limit import assert_rate_limit
from app.security.session import (
    RequestContext,
    assert_csrf,
    clear_user_session,
    create_user_session,
    get_request_context,
    invalidate_user_sessions,
    link_anonymous_session_to_user,
    log_account_event,
)
from app.security.usage import get_free_generation_status_for_actor
from app.services.email.send import send_email
from app.utils.auth import hash_token, normalize_email, safe_user
from app.utils.responses import ApiError, success

router = APIRouter(prefix="/auth", tags=["auth"])


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _send_verification_email(email: str, token: str) -> None:
    verify_url = f"{settings.app_base_url}/verify-email?token={token}"
    await send_email(
        email,
        "Verify your Auralis account email",
        f"Please verify your email by opening: {verify_url}",
        f"<p>Please verify your email by clicking <a href=\"{verify_url}\">this link</a>.</p>",
    )


async def _send_password_reset_email(email: str, token: str) -> None:
    reset_url = f"{settings.app_base_url}/reset-password?token={token}"
    await send_email(
        email,
        "Reset your Auralis password",
        f"You can reset your password using this link: {reset_url}",
        f"<p>You can reset your password using <a href=\"{reset_url}\">this link</a>.</p>",
    )


async def _create_and_send_verification_token(db: Session, user: User) -> None:
    if settings.email_provider == "none":
        return
    raw_token = secrets.token_urlsafe(48)
    db.add(
        EmailVerificationToken(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=_now() + timedelta(minutes=settings.email_verification_ttl_minutes),
        )
    )
    await _send_verification_email(user.email, raw_token)


@router.post("/register")
async def register(
    payload: RegisterIn,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    assert_rate_limit(request, "auth-register", 6, 3600)
    email = normalize_email(str(payload.email))

    existing = db.query(User).filter(User.email == email).one_or_none()
    if existing:
        raise ApiError("EMAIL_EXISTS", "An account with this email already exists.", status.HTTP_409_CONFLICT)

    validate_password_strength(payload.password)

    user = User(
        name=payload.name.strip(),
        email=email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=UserRole.CUSTOMER.value,
        status=UserStatus.ACTIVE.value,
        marketing_opt_in=payload.marketingOptIn,
        signup_ip_hash=context.anonymous_session.ip_hash,
        signup_user_agent=context.anonymous_session.user_agent,
        signup_anonymous_session_id=context.anonymous_session.id,
    )
    db.add(user)
    db.flush()

    db.add(UserUsage(user_id=user.id))
    log_account_event(
        db,
        user.id,
        event_type=CustomerAccountEventType.SIGNUP,
        metadata={"anonymousSessionId": context.anonymous_session.id},
    )

    link_result = link_anonymous_session_to_user(db, context.anonymous_session, user)
    create_user_session(response, request, db, user)

    if settings.email_provider != "none":
        await _create_and_send_verification_token(db, user)

    db.commit()
    db.refresh(user)

    actor_context = RequestContext(user=user, anonymous_session=context.anonymous_session)
    return success(
        {
            "user": safe_user(user),
            "freeGenerationStatus": get_free_generation_status_for_actor(db, actor_context),
            "linkedAnonymousSession": link_result,
        },
        status_code=status.HTTP_201_CREATED,
    )


@router.post("/login")
async def login(
    payload: LoginIn,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    assert_rate_limit(request, "auth-login", 12, 3600)
    email = normalize_email(str(payload.email))
    user = db.query(User).filter(User.email == email).one_or_none()
    invalid_error = ApiError("INVALID_CREDENTIALS", "Invalid email or password.", status.HTTP_401_UNAUTHORIZED)

    if not user or not user.password_hash:
        raise invalid_error
    if user.status != UserStatus.ACTIVE.value:
        raise ApiError("ACCOUNT_DISABLED", "Account is not active.", status.HTTP_403_FORBIDDEN)
    if not verify_password(payload.password, user.password_hash):
        raise invalid_error

    user.last_login_at = _now()
    log_account_event(db, user.id, event_type=CustomerAccountEventType.LOGIN)
    link_result = link_anonymous_session_to_user(db, context.anonymous_session, user)
    create_user_session(response, request, db, user)

    db.commit()
    db.refresh(user)

    actor_context = RequestContext(user=user, anonymous_session=context.anonymous_session)
    return success(
        {
            "user": safe_user(user),
            "freeGenerationStatus": get_free_generation_status_for_actor(db, actor_context),
            "linkedAnonymousSession": link_result,
        }
    )


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    assert_csrf(request, db)
    if context.user:
        log_account_event(db, context.user.id, event_type=CustomerAccountEventType.LOGOUT)
    clear_user_session(response, request, db)
    db.commit()
    return success({"ok": True})


@router.get("/me")
def me(
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    if context.user:
        return success(
            {
                "authenticated": True,
                "user": safe_user(context.user),
                "anonymousSessionId": context.anonymous_session.id,
                "freeGenerationStatus": get_free_generation_status_for_actor(db, context),
                "csrfToken": request.cookies.get(settings.csrf_cookie_name),
            }
        )

    return success(
        {
            "authenticated": False,
            "user": None,
            "anonymousSessionId": context.anonymous_session.id,
            "freeGenerationStatus": get_free_generation_status_for_actor(db, context),
        }
    )


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordIn,
    request: Request,
    db: Session = Depends(get_db),
):
    assert_rate_limit(request, "auth-forgot-password", 8, 3600)
    email = normalize_email(str(payload.email))
    user = db.query(User).filter(User.email == email, User.status == UserStatus.ACTIVE.value).one_or_none()

    if user:
        raw_token = secrets.token_urlsafe(48)
        db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=hash_token(raw_token),
                expires_at=_now() + timedelta(minutes=settings.password_reset_ttl_minutes),
            )
        )
        log_account_event(db, user.id, event_type=CustomerAccountEventType.PASSWORD_RESET_REQUESTED)
        await _send_password_reset_email(user.email, raw_token)
        db.commit()

    return success(
        {
            "message": "If an account exists for this email, password reset instructions have been sent.",
        }
    )


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordIn,
    request: Request,
    db: Session = Depends(get_db),
):
    assert_rate_limit(request, "auth-reset-password", 8, 3600)
    validate_password_strength(payload.newPassword)

    now = _now()
    token_hash_value = hash_token(payload.token)
    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash_value,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        .one_or_none()
    )
    if not reset_token:
        raise ApiError("INVALID_TOKEN", "Password reset token is invalid or expired.", status.HTTP_400_BAD_REQUEST)

    user = db.get(User, reset_token.user_id)
    if not user or user.status != UserStatus.ACTIVE.value:
        raise ApiError("INVALID_TOKEN", "Password reset token is invalid or expired.", status.HTTP_400_BAD_REQUEST)

    user.password_hash = hash_password(payload.newPassword)
    reset_token.used_at = now
    revoked = invalidate_user_sessions(db, user.id)
    log_account_event(
        db,
        user.id,
        event_type=CustomerAccountEventType.PASSWORD_RESET_COMPLETED,
        metadata={"revokedSessions": revoked},
    )
    db.commit()

    return success({"message": "Password has been reset successfully."})


@router.post("/resend-verification")
async def resend_verification(
    request: Request,
    payload: ResendVerificationIn | None = Body(default=None),
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    assert_rate_limit(request, "auth-resend-verification", 8, 3600)

    user: User | None = context.user
    if not user and payload and payload.email:
        user = (
            db.query(User)
            .filter(User.email == normalize_email(str(payload.email)), User.status == UserStatus.ACTIVE.value)
            .one_or_none()
        )

    if user and not user.email_verified_at:
        await _create_and_send_verification_token(db, user)
        db.commit()

    return success({"message": "If verification is pending, a verification email has been sent."})


@router.post("/verify-email")
def verify_email(
    payload: VerifyEmailIn,
    request: Request,
    db: Session = Depends(get_db),
):
    assert_rate_limit(request, "auth-verify-email", 10, 3600)

    now = _now()
    token_record = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.token_hash == hash_token(payload.token),
            EmailVerificationToken.used_at.is_(None),
            EmailVerificationToken.expires_at > now,
        )
        .one_or_none()
    )
    if not token_record:
        raise ApiError("INVALID_TOKEN", "Verification token is invalid or expired.", status.HTTP_400_BAD_REQUEST)

    user = db.get(User, token_record.user_id)
    if not user:
        raise ApiError("INVALID_TOKEN", "Verification token is invalid or expired.", status.HTTP_400_BAD_REQUEST)

    token_record.used_at = now
    user.email_verified_at = now
    log_account_event(db, user.id, event_type=CustomerAccountEventType.EMAIL_VERIFIED)
    db.commit()

    return success({"message": "Email verified successfully."})


@router.get("/oauth/providers")
def oauth_providers():
    return success(
        {
            "google": {"enabled": False, "message": "Placeholder for future OAuth integration."},
            "apple": {"enabled": False, "message": "Placeholder for future OAuth integration."},
        }
    )
