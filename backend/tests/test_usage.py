from __future__ import annotations

import uuid

import pytest
from sqlalchemy.orm import Session

from app.models.entities import Payment, PaymentStatus, User
from app.security.session import RequestContext
from app.security.usage import (
    consume_successful_generation,
    get_free_generation_status_for_actor,
    resolve_entitlement,
)
from app.utils.responses import ApiError


def test_free_generation_consumed_only_after_success(db_session: Session, anonymous_session):
    context = RequestContext(user=None, anonymous_session=anonymous_session)

    entitlement = resolve_entitlement(db_session, context, payment_id=None)
    assert entitlement["free_generation_applied"] is True

    state_before = get_free_generation_status_for_actor(db_session, context)
    assert state_before["freeGenerationUsed"] is False

    consume_successful_generation(
        db_session,
        context,
        free_generation_applied=True,
        paid=False,
    )
    db_session.commit()

    state_after = get_free_generation_status_for_actor(db_session, context)
    assert state_after["freeGenerationUsed"] is True
    assert state_after["requiresPayment"] is True


def test_payment_required_after_free_generation_used(db_session: Session, anonymous_session):
    anonymous_session.free_generation_used = True
    db_session.commit()

    context = RequestContext(user=None, anonymous_session=anonymous_session)

    with pytest.raises(ApiError) as exc:
        resolve_entitlement(db_session, context, payment_id=None)

    assert exc.value.code == "PAYMENT_REQUIRED"


def test_paid_generation_allowed_with_confirmed_payment(db_session: Session, anonymous_session):
    anonymous_session.free_generation_used = True
    db_session.commit()

    payment = Payment(
        anonymous_session_id=anonymous_session.id,
        stripe_checkout_session_id=f"cs_test_{uuid.uuid4().hex}",
        amount=2900,
        currency="USD",
        status=PaymentStatus.PAID,
    )
    db_session.add(payment)
    db_session.commit()
    db_session.refresh(payment)

    context = RequestContext(user=None, anonymous_session=anonymous_session)
    entitlement = resolve_entitlement(db_session, context, payment_id=payment.id)

    assert entitlement["free_generation_applied"] is False
    assert entitlement["payment_id"] == payment.id


def test_user_usage_record_created_and_updated(db_session: Session, anonymous_session):
    user = User(name="Demo", email=f"demo-{uuid.uuid4().hex}@example.com")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    context = RequestContext(user=user, anonymous_session=anonymous_session)
    initial = get_free_generation_status_for_actor(db_session, context)

    assert initial["canUseFreeGeneration"] is True
    assert initial["generationsUsed"] == 0

    consume_successful_generation(
        db_session,
        context,
        free_generation_applied=True,
        paid=False,
    )
    db_session.commit()

    final = get_free_generation_status_for_actor(db_session, context)
    assert final["freeGenerationUsed"] is True
    assert final["generationsUsed"] == 1
