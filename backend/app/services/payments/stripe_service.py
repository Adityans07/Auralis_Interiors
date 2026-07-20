from __future__ import annotations

import stripe

from app.core.config import settings
from app.utils.responses import ApiError


def _stripe():
    if not settings.stripe_secret_key:
        raise ApiError("PAYMENT_REQUIRED", "Stripe is not configured for payments.", 402)
    stripe.api_key = settings.stripe_secret_key
    return stripe


def create_checkout_session(amount: int, currency: str, user_id: str | None, anonymous_session_id: str | None) -> stripe.checkout.Session:
    return _stripe().checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[
            {
                "quantity": 1,
                "price_data": {
                    "currency": currency.lower(),
                    "unit_amount": amount,
                    "product_data": {
                        "name": "Auralis AI Design Generation",
                        "description": "One paid AI design generation after the free trial.",
                    },
                },
            }
        ],
        success_url=f"{settings.app_base_url}/try-us?payment=success&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.app_base_url}/try-us?payment=cancelled",
        metadata={
            "userId": user_id or "",
            "anonymousSessionId": anonymous_session_id or "",
            "product": "ai-design-generation",
        },
    )


def construct_webhook_event(payload: bytes, signature: str | None):
    if not settings.stripe_webhook_secret:
        raise ApiError("VALIDATION_ERROR", "Stripe webhook secret is not configured.", 400)
    if not signature:
        raise ApiError("VALIDATION_ERROR", "Missing Stripe signature.", 400)
    return _stripe().Webhook.construct_event(payload, signature, settings.stripe_webhook_secret)
