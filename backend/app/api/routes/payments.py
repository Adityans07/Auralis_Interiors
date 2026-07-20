from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.entities import Payment, PaymentStatus
from app.schemas.api import CheckoutIn
from app.security.rate_limit import assert_rate_limit
from app.security.session import RequestContext, get_request_context, owner_fields
from app.services.payments.stripe_service import construct_webhook_event, create_checkout_session
from app.utils.responses import success

router = APIRouter(tags=["payments"])


@router.post("/payments/create-checkout-session")
def create_session(
    payload: CheckoutIn,
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    assert_rate_limit(request, "checkout", 10, 3600)
    owner = owner_fields(context)
    amount = settings.design_generation_price_cents
    session = create_checkout_session(amount, payload.currency, owner["user_id"], owner["anonymous_session_id"])
    payment = Payment(
        **owner,
        stripe_checkout_session_id=session.id,
        stripe_payment_intent_id=session.get("payment_intent"),
        amount=amount,
        currency=payload.currency,
        status=PaymentStatus.PENDING,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return success(
        {
            "paymentId": payment.id,
            "checkoutSessionId": session.id,
            "checkoutUrl": session.url,
            "amount": amount,
            "currency": payload.currency,
        }
    )


@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    event = construct_webhook_event(payload, request.headers.get("stripe-signature"))
    if event["type"] in {"checkout.session.completed", "checkout.session.async_payment_succeeded"}:
        session = event["data"]["object"]
        payment = db.query(Payment).filter(Payment.stripe_checkout_session_id == session["id"]).one_or_none()
        if payment:
            payment.status = PaymentStatus.PAID
            payment.stripe_payment_intent_id = session.get("payment_intent")
            db.commit()
    if event["type"] in {"checkout.session.expired", "checkout.session.async_payment_failed"}:
        session = event["data"]["object"]
        payment = db.query(Payment).filter(Payment.stripe_checkout_session_id == session["id"]).one_or_none()
        if payment:
            payment.status = PaymentStatus.FAILED
            payment.stripe_payment_intent_id = session.get("payment_intent")
            db.commit()
    return success({"received": True})

