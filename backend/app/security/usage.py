from __future__ import annotations

from fastapi import status
from sqlalchemy.orm import Session

from app.models.entities import Payment, PaymentStatus, UserUsage, UserRole
from app.security.session import RequestContext
from app.utils.responses import ApiError


def get_free_generation_status_for_actor(db: Session, context: RequestContext) -> dict[str, bool | int]:
    if context.user and context.user.role == UserRole.ADMIN:
        return {
            "canUseFreeGeneration": True,
            "freeGenerationUsed": False,
            "requiresPayment": False,
            "hasUsedFreeGeneration": False,
            "generationsUsed": 0,
            "bonusFreeGenerations": 0,
        }

    if context.user_id:
        usage = db.query(UserUsage).filter(UserUsage.user_id == context.user_id).one_or_none()
        if usage is None:
            usage = UserUsage(user_id=context.user_id)
            db.add(usage)
            db.commit()
            db.refresh(usage)
        used = usage.free_generation_used
        bonus = getattr(usage, "bonus_free_generations", 0)
        can_use = (not used) or (bonus > 0)
        return {
            "canUseFreeGeneration": can_use,
            "freeGenerationUsed": used,
            "requiresPayment": not can_use,
            "hasUsedFreeGeneration": used,
            "generationsUsed": usage.total_generations,
            "bonusFreeGenerations": bonus,
        }

    used = context.anonymous_session.free_generation_used
    return {
        "canUseFreeGeneration": not used,
        "freeGenerationUsed": used,
        "requiresPayment": used,
        "hasUsedFreeGeneration": used,
        "generationsUsed": 1 if used else 0,
        "bonusFreeGenerations": 0,
    }


def resolve_entitlement(db: Session, context: RequestContext, payment_id: str | None) -> dict[str, str | bool | None]:
    state = get_free_generation_status_for_actor(db, context)
    if state["canUseFreeGeneration"]:
        return {"free_generation_applied": True, "payment_id": None}

    if not payment_id:
        raise ApiError(
            "PAYMENT_REQUIRED",
            "Payment is required for additional AI design generations.",
            status.HTTP_402_PAYMENT_REQUIRED,
            {"requiresPayment": True},
        )

    payment = db.get(Payment, payment_id)
    if not payment or payment.status != PaymentStatus.PAID:
        raise ApiError("PAYMENT_REQUIRED", "A confirmed Stripe payment is required.", status.HTTP_402_PAYMENT_REQUIRED)
    if payment.design_request_id:
        raise ApiError("PAYMENT_REQUIRED", "This payment has already been used.", status.HTTP_402_PAYMENT_REQUIRED)
    if context.user_id and payment.user_id != context.user_id:
        raise ApiError("PAYMENT_REQUIRED", "This payment does not belong to the current user.", status.HTTP_402_PAYMENT_REQUIRED)
    if not context.user_id and payment.anonymous_session_id != context.anonymous_session.id:
        raise ApiError("PAYMENT_REQUIRED", "This payment does not belong to the current session.", status.HTTP_402_PAYMENT_REQUIRED)
    return {"free_generation_applied": False, "payment_id": payment.id}


def consume_free_generation_for_actor(
    db: Session,
    context: RequestContext,
    free_generation_applied: bool,
    paid: bool,
) -> None:
    if context.user and context.user.role == UserRole.ADMIN:
        return

    if context.user_id:
        usage = db.query(UserUsage).filter(UserUsage.user_id == context.user_id).one_or_none()
        if usage is None:
            usage = UserUsage(user_id=context.user_id)
            db.add(usage)
        if free_generation_applied:
            bonus = getattr(usage, "bonus_free_generations", 0)
            if not usage.free_generation_used:
                # Consume the original free generation first
                usage.free_generation_used = True
            elif bonus > 0:
                # Consume a bonus generation
                usage.bonus_free_generations = bonus - 1
        usage.total_generations += 1
        if paid:
            usage.paid_generations += 1
    elif free_generation_applied:
        context.anonymous_session.free_generation_used = True
    db.flush()


def get_free_generation_state(db: Session, context: RequestContext) -> dict[str, bool | int]:
    return get_free_generation_status_for_actor(db, context)


def consume_successful_generation(
    db: Session,
    context: RequestContext,
    free_generation_applied: bool,
    paid: bool,
) -> None:
    consume_free_generation_for_actor(db, context, free_generation_applied, paid)
