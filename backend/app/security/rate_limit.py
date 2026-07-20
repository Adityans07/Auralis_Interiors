from __future__ import annotations

import time
from dataclasses import dataclass

from fastapi import Request, status

from app.utils.responses import ApiError


@dataclass
class Bucket:
    count: int
    reset_at: float


_buckets: dict[str, Bucket] = {}


def assert_rate_limit(request: Request, scope: str, limit: int, window_seconds: int) -> None:
    now = time.time()
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown").split(",")[0]
    ua = request.headers.get("user-agent", "unknown")[:80]
    key = f"{scope}:{ip}:{ua}"
    bucket = _buckets.get(key)
    if not bucket or bucket.reset_at <= now:
        _buckets[key] = Bucket(count=1, reset_at=now + window_seconds)
        return
    bucket.count += 1
    if bucket.count > limit:
        raise ApiError(
            "RATE_LIMITED",
            "Too many requests. Please wait a moment and try again.",
            status.HTTP_429_TOO_MANY_REQUESTS,
            {"retryAfterSeconds": int(bucket.reset_at - now)},
        )


def clear_rate_limits_for_tests() -> None:
    _buckets.clear()

