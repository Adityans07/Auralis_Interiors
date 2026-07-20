from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.entities import (
    Booking,
    BookingStatus,
    CustomerAccountEventType,
    DesignRequest,
    DesignRequestStatus,
    GeneratedDesign,
    Payment,
    SelectedDesign,
    UserStatus,
)
from app.schemas.auth import ChangePasswordIn, ProfileUpdateIn
from app.security.passwords import hash_password, validate_password_strength, verify_password
from app.security.session import (
    RequestContext,
    assert_csrf,
    assert_owns_design_request,
    get_request_context,
    invalidate_user_sessions,
    log_account_event,
)
from app.security.usage import get_free_generation_status_for_actor
from app.utils.auth import safe_user
from app.utils.responses import ApiError, success
from app.utils.serializers import design_request_to_client, generated_design_to_client

router = APIRouter(prefix="/account", tags=["account"])


def require_customer_context(context: RequestContext = Depends(get_request_context)) -> RequestContext:
    if not context.user:
        raise ApiError("AUTH_REQUIRED", "Login is required.", status.HTTP_401_UNAUTHORIZED)
    if context.user.status != UserStatus.ACTIVE.value:
        raise ApiError("ACCOUNT_DISABLED", "Account is not active.", status.HTTP_403_FORBIDDEN)
    return context


@router.get("/overview")
def account_overview(
    db: Session = Depends(get_db),
    context: RequestContext = Depends(require_customer_context),
):
    user_id = context.user_id
    assert user_id

    total_design_requests = db.query(DesignRequest).filter(DesignRequest.user_id == user_id).count()
    completed_design_requests = (
        db.query(DesignRequest)
        .filter(
            DesignRequest.user_id == user_id,
            DesignRequest.status.in_([DesignRequestStatus.COMPLETED, DesignRequestStatus.SELECTED]),
        )
        .count()
    )
    selected_designs_count = db.query(SelectedDesign).filter(SelectedDesign.user_id == user_id).count()
    upcoming_bookings_count = (
        db.query(Booking)
        .filter(
            Booking.user_id == user_id,
            Booking.status.in_([BookingStatus.REQUESTED, BookingStatus.CONFIRMED]),
            Booking.preferred_date >= datetime.now(timezone.utc),
        )
        .count()
    )
    payment_count = db.query(Payment).filter(Payment.user_id == user_id).count()

    recent_design_requests = (
        db.query(DesignRequest)
        .filter(DesignRequest.user_id == user_id)
        .order_by(DesignRequest.created_at.desc())
        .limit(5)
        .all()
    )
    recent_bookings = (
        db.query(Booking)
        .filter(Booking.user_id == user_id)
        .order_by(Booking.created_at.desc())
        .limit(5)
        .all()
    )
    recent_payments = (
        db.query(Payment)
        .filter(Payment.user_id == user_id)
        .order_by(Payment.created_at.desc())
        .limit(5)
        .all()
    )

    return success(
        {
            "userProfile": safe_user(context.user),
            "freeGenerationStatus": get_free_generation_status_for_actor(db, context),
            "totalDesignRequests": total_design_requests,
            "completedDesignRequests": completed_design_requests,
            "selectedDesignsCount": selected_designs_count,
            "upcomingBookingsCount": upcoming_bookings_count,
            "paymentCount": payment_count,
            "recentDesignRequests": [
                {
                    "id": item.id,
                    "status": item.status.value,
                    "designType": item.design_type.value,
                    "spaceType": item.space_type,
                    "createdAt": item.created_at.isoformat(),
                }
                for item in recent_design_requests
            ],
            "recentBookings": [
                {
                    "id": item.id,
                    "status": item.status.value,
                    "preferredDate": item.preferred_date.isoformat(),
                    "projectType": item.project_type,
                    "createdAt": item.created_at.isoformat(),
                }
                for item in recent_bookings
            ],
            "recentPayments": [
                {
                    "id": item.id,
                    "amount": item.amount,
                    "currency": item.currency,
                    "status": item.status.value,
                    "createdAt": item.created_at.isoformat(),
                }
                for item in recent_payments
            ],
        }
    )


@router.get("/profile")
def get_profile(context: RequestContext = Depends(require_customer_context)):
    return success({"profile": safe_user(context.user)})


@router.patch("/profile")
def update_profile(
    payload: ProfileUpdateIn,
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(require_customer_context),
):
    assert_csrf(request, db)

    updates = payload.model_dump(exclude_none=True)
    field_mapping = {
        "preferredStyle": "preferred_style",
        "preferredContactTime": "preferred_contact_time",
        "marketingOptIn": "marketing_opt_in",
    }

    changed_fields: list[str] = []
    for key, value in updates.items():
        attr = field_mapping.get(key, key)
        if hasattr(context.user, attr):
            setattr(context.user, attr, value)
            changed_fields.append(attr)

    if changed_fields:
        log_account_event(
            db,
            context.user.id,
            CustomerAccountEventType.PROFILE_UPDATED,
            {"fields": changed_fields},
        )

    db.commit()
    db.refresh(context.user)
    return success({"profile": safe_user(context.user)})


@router.patch("/password")
def change_password(
    payload: ChangePasswordIn,
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(require_customer_context),
):
    assert_csrf(request, db)

    if not context.user.password_hash:
        raise ApiError("PASSWORD_NOT_SET", "Password login is not available for this account.", status.HTTP_400_BAD_REQUEST)
    if not verify_password(payload.currentPassword, context.user.password_hash):
        raise ApiError("INVALID_CREDENTIALS", "Current password is incorrect.", status.HTTP_400_BAD_REQUEST)

    validate_password_strength(payload.newPassword)
    context.user.password_hash = hash_password(payload.newPassword)

    current_session_id = context.auth_session.id if context.auth_session else None
    revoked_sessions = invalidate_user_sessions(db, context.user.id, except_session_id=current_session_id)

    log_account_event(
        db,
        context.user.id,
        CustomerAccountEventType.PROFILE_UPDATED,
        {"passwordChanged": True, "revokedSessions": revoked_sessions},
    )

    db.commit()
    return success({"message": "Password changed successfully."})


@router.get("/design-requests")
def my_design_requests(
    db: Session = Depends(get_db),
    context: RequestContext = Depends(require_customer_context),
):
    user_id = context.user.id
    records = (
        db.query(DesignRequest)
        .options(
            joinedload(DesignRequest.generated_designs).joinedload(GeneratedDesign.products),
            joinedload(DesignRequest.selected_design),
        )
        .filter(DesignRequest.user_id == user_id)
        .order_by(DesignRequest.created_at.desc())
        .all()
    )

    items = []
    for record in records:
        selected = record.selected_design
        items.append(
            {
                "id": record.id,
                "status": record.status.value,
                "createdAt": record.created_at.isoformat(),
                "updatedAt": record.updated_at.isoformat(),
                "generatedDesignCount": len(record.generated_designs),
                "selectedDesign": {
                    "id": selected.id,
                    "status": selected.status.value,
                    "finalEstimatedTotal": float(selected.final_estimated_total),
                }
                if selected
                else None,
                "payment": {
                    "id": record.payment_id,
                    "status": record.payment.status.value,
                    "amount": record.payment.amount,
                    "currency": record.payment.currency,
                }
                if record.payment
                else None,
            }
        )

    return success(
        {
            "total": len(items),
            "items": items,
        }
    )


@router.get("/design-requests/{design_request_id}")
def design_request_detail(
    design_request_id: str,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(require_customer_context),
):
    assert_owns_design_request(db, context, design_request_id)
    record = (
        db.query(DesignRequest)
        .options(
            joinedload(DesignRequest.generated_designs).joinedload(GeneratedDesign.products),
            joinedload(DesignRequest.selected_design).joinedload(SelectedDesign.bookings),
            joinedload(DesignRequest.payment),
        )
        .filter(DesignRequest.id == design_request_id)
        .one_or_none()
    )
    if not record:
        raise ApiError("NOT_FOUND", "Design request not found.", status.HTTP_404_NOT_FOUND)

    selected = record.selected_design
    payment = record.payment
    return success(
        {
            "designRequest": design_request_to_client(record),
            "generatedDesigns": [
                generated_design_to_client(design) for design in sorted(record.generated_designs, key=lambda item: item.rank)
            ],
            "selectedDesign": {
                "id": selected.id,
                "status": selected.status.value,
                "customerName": selected.customer_name,
                "customerEmail": selected.customer_email,
                "customerPhone": selected.customer_phone,
                "preferredContactTime": selected.preferred_contact_time,
                "finalEstimatedTotal": float(selected.final_estimated_total),
                "selectedProducts": selected.selected_products,
                "notes": selected.notes,
                "createdAt": selected.created_at.isoformat(),
            }
            if selected
            else None,
            "payment": {
                "id": payment.id,
                "status": payment.status.value,
                "amount": payment.amount,
                "currency": payment.currency,
                "stripeCheckoutSessionId": payment.stripe_checkout_session_id,
                "createdAt": payment.created_at.isoformat(),
            }
            if payment
            else None,
        }
    )


@router.get("/bookings")
def my_bookings(
    db: Session = Depends(get_db),
    context: RequestContext = Depends(require_customer_context),
):
    records = (
        db.query(Booking)
        .filter(Booking.user_id == context.user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return success(
        [
            {
                "id": record.id,
                "name": record.name,
                "email": record.email,
                "phone": record.phone,
                "projectType": record.project_type,
                "preferredDate": record.preferred_date.isoformat(),
                "preferredTime": record.preferred_time,
                "city": record.city,
                "state": record.state,
                "country": record.country,
                "budgetRange": record.budget_range,
                "message": record.message,
                "status": record.status.value,
                "createdAt": record.created_at.isoformat(),
            }
            for record in records
        ]
    )


@router.get("/payments")
def my_payments(
    db: Session = Depends(get_db),
    context: RequestContext = Depends(require_customer_context),
):
    records = (
        db.query(Payment)
        .filter(Payment.user_id == context.user.id)
        .order_by(Payment.created_at.desc())
        .all()
    )
    return success(
        [
            {
                "id": record.id,
                "designRequestId": record.design_request_id,
                "amount": record.amount,
                "currency": record.currency,
                "status": record.status.value,
                "stripeCheckoutSessionId": record.stripe_checkout_session_id,
                "stripePaymentIntentId": record.stripe_payment_intent_id,
                "createdAt": record.created_at.isoformat(),
            }
            for record in records
        ]
    )


@router.post("/delete-request")
def request_account_delete(
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(require_customer_context),
):
    assert_csrf(request, db)
    log_account_event(
        db,
        context.user.id,
        CustomerAccountEventType.ACCOUNT_DELETE_REQUESTED,
        {"requestedAt": datetime.now(timezone.utc).isoformat()},
    )
    db.commit()
    return success({"message": "Account deletion request received."})
