from __future__ import annotations

import hashlib
import hmac
from datetime import datetime

from app.core.config import settings
from app.models.entities import User


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_token(token: str) -> str:
    return hmac.new(settings.effective_auth_secret.encode(), token.encode(), hashlib.sha256).hexdigest()


def safe_user(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "emailVerified": bool(user.email_verified_at),
        "emailVerifiedAt": user.email_verified_at.isoformat() if user.email_verified_at else None,
        "phone": user.phone,
        "image": user.image,
        "role": user.role,
        "status": user.status,
        "city": user.city,
        "state": user.state,
        "country": user.country,
        "address": user.address,
        "preferredStyle": user.preferred_style,
        "preferredContactTime": user.preferred_contact_time,
        "marketingOptIn": user.marketing_opt_in,
        "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
        "createdAt": user.created_at.isoformat() if isinstance(user.created_at, datetime) else None,
        "updatedAt": user.updated_at.isoformat() if isinstance(user.updated_at, datetime) else None,
    }
