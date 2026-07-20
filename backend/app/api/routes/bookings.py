from datetime import datetime

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.entities import Booking, BookingStatus, SelectedDesign
from app.schemas.api import BookingIn
from app.security.rate_limit import assert_rate_limit
from app.security.session import RequestContext, get_request_context, owner_fields
from app.services.email.send import notify_admin, send_email
from app.utils.responses import ApiError, success

router = APIRouter(prefix="/bookings", tags=["bookings"])


def parse_location(payload: BookingIn) -> tuple[str, str | None, str]:
    parts = [part.strip() for part in (payload.location or "").split(",") if part.strip()]
    city = payload.city or (parts[0] if parts else None)
    state = payload.state or (parts[1] if len(parts) > 1 else None)
    country = payload.country or (parts[2] if len(parts) > 2 else "US")
    if not city:
        raise ApiError("VALIDATION_ERROR", "City is required for booking.")
    return city, state, country


@router.post("")
async def create_booking(
    payload: BookingIn,
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    assert_rate_limit(request, "bookings", 10, 3600)
    city, state, country = parse_location(payload)
    if payload.selectedDesignId:
        selected_design = (
            db.query(SelectedDesign)
            .options(joinedload(SelectedDesign.design_request))
            .filter(SelectedDesign.id == payload.selectedDesignId)
            .one_or_none()
        )
        if not selected_design:
            raise ApiError("NOT_FOUND", "Selected design not found.")
        allowed = False
        if context.user_id:
            if selected_design.user_id == context.user_id:
                allowed = True
            elif selected_design.design_request and selected_design.design_request.user_id == context.user_id:
                allowed = True
        else:
            if selected_design.anonymous_session_id == context.anonymous_session.id:
                allowed = True
            elif (
                selected_design.design_request
                and selected_design.design_request.anonymous_session_id == context.anonymous_session.id
            ):
                allowed = True
        if not allowed:
            raise ApiError("FORBIDDEN", "You do not have access to this selected design.")

    try:
        preferred_date = datetime.fromisoformat(payload.preferredDate)
    except ValueError as exc:
        raise ApiError("VALIDATION_ERROR", "Preferred date is invalid.") from exc
    booking = Booking(
        **owner_fields(context),
        selected_design_id=payload.selectedDesignId,
        name=payload.name,
        email=str(payload.email),
        phone=payload.phone,
        project_type=payload.projectType,
        preferred_date=preferred_date,
        preferred_time=payload.preferredTime,
        city=city,
        state=state,
        country=country,
        budget_range=payload.budgetRange,
        message=payload.message,
        status=BookingStatus.REQUESTED,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    await notify_admin("New Auralis booking request", f"Booking {booking.id}\n{booking.name} <{booking.email}>")
    await send_email(booking.email, "We received your Auralis consultation request", "We will confirm availability shortly.")
    return success({"bookingId": booking.id, "message": "Your consultation request has been received."})

