from __future__ import annotations

import re

from passlib.context import CryptContext

from app.utils.responses import ApiError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


_PASSWORD_MIN_LENGTH = 8
_UPPER_RE = re.compile(r"[A-Z]")
_LOWER_RE = re.compile(r"[a-z]")
_DIGIT_RE = re.compile(r"\d")
_SYMBOL_RE = re.compile(r"[^A-Za-z0-9]")


def validate_password_strength(password: str) -> None:
    if len(password) < _PASSWORD_MIN_LENGTH:
        raise ApiError("WEAK_PASSWORD", "Password must be at least 8 characters long.")
    if not _UPPER_RE.search(password):
        raise ApiError("WEAK_PASSWORD", "Password must include at least one uppercase letter.")
    if not _LOWER_RE.search(password):
        raise ApiError("WEAK_PASSWORD", "Password must include at least one lowercase letter.")
    if not _DIGIT_RE.search(password):
        raise ApiError("WEAK_PASSWORD", "Password must include at least one number.")
    if not _SYMBOL_RE.search(password):
        raise ApiError("WEAK_PASSWORD", "Password must include at least one special character.")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)
