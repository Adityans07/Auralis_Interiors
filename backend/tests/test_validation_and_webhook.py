from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.api.routes.bookings import parse_location
from app.core.config import settings
from app.schemas.api import BookingIn, ContactIn
from app.services.payments.stripe_service import construct_webhook_event
from app.utils.responses import ApiError


def test_contact_message_requires_minimum_length():
    with pytest.raises(ValidationError):
        ContactIn(
            name="Demo",
            email="demo@example.com",
            subject="Hi",
            message="Too short",
        )


def test_booking_location_parse_supports_combined_string():
    payload = BookingIn(
        name="Demo",
        email="demo@example.com",
        phone="1234567890",
        projectType="interior",
        preferredDate="2026-07-20",
        preferredTime="10:00",
        location="Austin, TX, US",
        budgetRange="$2,000 - $5,000",
        message="Need a consultation",
    )

    city, state, country = parse_location(payload)
    assert city == "Austin"
    assert state == "TX"
    assert country == "US"


def test_booking_location_requires_city():
    payload = BookingIn(
        name="Demo",
        email="demo@example.com",
        phone="1234567890",
        projectType="interior",
        preferredDate="2026-07-20",
        preferredTime="10:00",
        location=None,
        budgetRange="$2,000 - $5,000",
        message="Need a consultation",
    )

    with pytest.raises(ApiError) as exc:
        parse_location(payload)

    assert exc.value.code == "VALIDATION_ERROR"


def test_stripe_webhook_requires_config_and_signature(monkeypatch):
    monkeypatch.setattr(settings, "stripe_webhook_secret", None)

    with pytest.raises(ApiError) as missing_secret:
        construct_webhook_event(b"{}", "sig_test")

    assert missing_secret.value.code == "VALIDATION_ERROR"

    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")

    with pytest.raises(ApiError) as missing_sig:
        construct_webhook_event(b"{}", None)

    assert missing_sig.value.code == "VALIDATION_ERROR"
