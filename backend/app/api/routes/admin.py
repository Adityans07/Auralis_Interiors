from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.db.session import get_db
from app.models.entities import (
    AIGenerationLog,
    AIGenerationStatus,
    AdminAuditLog,
    AdminNote,
    AdminNoteEntityType,
    BlogPost,
    Booking,
    BookingStatus,
    BusinessSetting,
    ContactMessage,
    ContactMessageStatus,
    DesignRequest,
    DesignRequestStatus,
    DesignType,
    GeneratedDesign,
    Payment,
    PaymentStatus,
    Product,
    SelectedDesign,
    SelectedDesignStatus,
    StockStatus,
    User,
    UserRole,
    UserStatus,
    UserUsage,
)
from app.schemas.admin import (
    AdminNoteIn,
    BlogIn,
    BlogPatchIn,
    BookingUpdateIn,
    ContactMessageUpdateIn,
    CustomerStatusUpdateIn,
    DesignRequestUpdateIn,
    PaginationIn,
    ProductIn,
    ProductPatchIn,
    SelectedDesignUpdateIn,
    SettingsPatchIn,
    TeamUpdateIn,
)
from app.security.session import require_admin
from app.security.session import assert_csrf
from app.utils.auth import safe_user
from app.utils.responses import ApiError, success
from app.utils.serializers import design_request_to_client, generated_design_to_client


def enforce_admin_csrf(
    request: Request,
    db: Session = Depends(get_db),
) -> None:
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        assert_csrf(request, db)


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(enforce_admin_csrf)])


def _page_meta(total: int, page: int, page_size: int) -> dict:
    return {
        "page": page,
        "pageSize": page_size,
        "total": total,
        "totalPages": max(1, (total + page_size - 1) // page_size),
    }


def _parse_pagination(page: int, page_size: int, search: str | None) -> PaginationIn:
    return PaginationIn(page=page, pageSize=page_size, search=search)


def _paginate(query, page: int, page_size: int):
    total = query.order_by(None).count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return total, items


def _add_audit_log(
    db: Session,
    actor: User,
    action: str,
    entity_type: str,
    entity_id: str,
    metadata: dict | None = None,
) -> None:
    db.add(
        AdminAuditLog(
            actor_user_id=actor.id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            event_metadata=metadata,
        )
    )


def _serialize_note(note: AdminNote) -> dict:
    return {
        "id": note.id,
        "entityType": note.entity_type.value,
        "entityId": note.entity_id,
        "note": note.note,
        "createdById": note.created_by_id,
        "createdAt": note.created_at.isoformat(),
        "updatedAt": note.updated_at.isoformat(),
    }


def _entity_exists(db: Session, entity_type: AdminNoteEntityType, entity_id: str) -> bool:
    if entity_type == AdminNoteEntityType.DESIGN_REQUEST:
        return db.get(DesignRequest, entity_id) is not None
    if entity_type == AdminNoteEntityType.SELECTED_DESIGN:
        return db.get(SelectedDesign, entity_id) is not None
    if entity_type == AdminNoteEntityType.BOOKING:
        return db.get(Booking, entity_id) is not None
    if entity_type == AdminNoteEntityType.CUSTOMER:
        return db.get(User, entity_id) is not None
    if entity_type == AdminNoteEntityType.CONTACT_MESSAGE:
        return db.get(ContactMessage, entity_id) is not None
    if entity_type == AdminNoteEntityType.PAYMENT:
        return db.get(Payment, entity_id) is not None
    if entity_type == AdminNoteEntityType.PRODUCT:
        return db.get(Product, entity_id) is not None
    return False


def _load_notes(db: Session, entity_type: AdminNoteEntityType, entity_id: str) -> list[dict]:
    notes = (
        db.query(AdminNote)
        .filter(AdminNote.entity_type == entity_type, AdminNote.entity_id == entity_id)
        .order_by(AdminNote.created_at.desc())
        .all()
    )
    return [_serialize_note(note) for note in notes]


def _upsert_settings(db: Session, key: str, value: dict, actor_id: str | None) -> BusinessSetting:
    setting = db.query(BusinessSetting).filter(BusinessSetting.key == key).one_or_none()
    if not setting:
        setting = BusinessSetting(key=key, value=value, updated_by_id=actor_id)
        db.add(setting)
        db.flush()
        return setting

    setting.value = value
    setting.updated_by_id = actor_id
    db.flush()
    return setting


def _redact_sensitive(value: Any) -> Any:
    sensitive_keys = {
        "password",
        "password_hash",
        "token",
        "session_token",
        "csrf",
        "secret",
        "api_key",
        "authorization",
    }
    if isinstance(value, dict):
        redacted: dict[str, Any] = {}
        for key, item in value.items():
            normalized = key.lower()
            if any(marker in normalized for marker in sensitive_keys):
                redacted[key] = "[REDACTED]"
            else:
                redacted[key] = _redact_sensitive(item)
        return redacted
    if isinstance(value, list):
        return [_redact_sensitive(item) for item in value]
    return value


@router.get("/dashboard")
def get_admin_dashboard(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_design_requests = db.query(DesignRequest).count()
    new_design_requests_today = db.query(DesignRequest).filter(
        DesignRequest.created_at >= today_start).count()
    completed_ai_generations = db.query(AIGenerationLog).filter(
        AIGenerationLog.status == AIGenerationStatus.COMPLETED).count()
    failed_ai_generations = db.query(AIGenerationLog).filter(
        AIGenerationLog.status == AIGenerationStatus.FAILED).count()
    selected_designs = db.query(SelectedDesign).count()
    pending_bookings = db.query(Booking).filter(Booking.status == BookingStatus.REQUESTED).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == BookingStatus.CONFIRMED).count()
    unread_contacts = db.query(ContactMessage).filter(
        ContactMessage.status == ContactMessageStatus.NEW).count()
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER.value).count()
    paid_generations = db.query(
        func.coalesce(
            func.sum(
                UserUsage.paid_generations),
            0)).scalar() or 0
    estimated_revenue_cents = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.status == PaymentStatus.PAID)
        .scalar()
        or 0
    )
    conversion_rate = round((selected_designs / total_design_requests)
                            * 100, 2) if total_design_requests else 0

    latest_design_requests = (
        db.query(DesignRequest)
        .options(joinedload(DesignRequest.user))
        .order_by(DesignRequest.created_at.desc())
        .limit(pageSize)
        .all()
    )
    latest_selected_designs = (
        db.query(SelectedDesign)
        .order_by(SelectedDesign.created_at.desc())
        .limit(pageSize)
        .all()
    )
    latest_bookings = db.query(Booking).order_by(Booking.created_at.desc()).limit(pageSize).all()
    latest_contacts = db.query(ContactMessage).order_by(
        ContactMessage.created_at.desc()).limit(pageSize).all()
    latest_failures = (
        db.query(AIGenerationLog)
        .filter(AIGenerationLog.status == AIGenerationStatus.FAILED)
        .order_by(AIGenerationLog.created_at.desc())
        .limit(pageSize)
        .all()
    )

    # Keep chart payloads simple and chart-ready in v1.
    last_requests = (
        db.query(DesignRequest)
        .filter(DesignRequest.created_at >= today_start.replace(day=max(1, today_start.day - 13)))
        .order_by(DesignRequest.created_at.asc())
        .all()
    )
    requests_by_day: dict[str, int] = {}
    for request in last_requests:
        key = request.created_at.date().isoformat()
        requests_by_day[key] = requests_by_day.get(key, 0) + 1

    style_counts = (
        db.query(DesignRequest.style, func.count(DesignRequest.id))
        .group_by(DesignRequest.style)
        .order_by(func.count(DesignRequest.id).desc())
        .limit(8)
        .all()
    )
    space_counts = (
        db.query(DesignRequest.space_type, func.count(DesignRequest.id))
        .group_by(DesignRequest.space_type)
        .order_by(func.count(DesignRequest.id).desc())
        .limit(8)
        .all()
    )

    return success(
        {
            "stats": {
                "totalDesignRequests": total_design_requests,
                "newDesignRequestsToday": new_design_requests_today,
                "completedAiGenerations": completed_ai_generations,
                "failedAiGenerations": failed_ai_generations,
                "selectedDesigns": selected_designs,
                "pendingBookings": pending_bookings,
                "confirmedBookings": confirmed_bookings,
                "contactMessagesUnread": unread_contacts,
                "totalCustomers": total_customers,
                "paidGenerations": int(paid_generations),
                "estimatedRevenue": float(Decimal(estimated_revenue_cents) / Decimal(100)),
                "conversionRate": conversion_rate,
            },
            "charts": {
                "designRequestsOverTime": [{"date": date, "count": count} for date, count in sorted(requests_by_day.items())],
                "popularStyles": [{"style": style, "count": count} for style, count in style_counts],
                "popularSpaceTypes": [{"spaceType": space_type, "count": count} for space_type, count in space_counts],
            },
            "recent": {
                "designRequests": [
                    {
                        "id": request.id,
                        "customerName": request.user.name if request.user else "Guest",
                        "status": request.status.value,
                        "createdAt": request.created_at.isoformat(),
                    }
                    for request in latest_design_requests
                ],
                "selectedDesigns": [
                    {
                        "id": selected.id,
                        "customerName": selected.customer_name,
                        "status": selected.status.value,
                        "createdAt": selected.created_at.isoformat(),
                    }
                    for selected in latest_selected_designs
                ],
                "bookings": [
                    {
                        "id": booking.id,
                        "name": booking.name,
                        "status": booking.status.value,
                        "createdAt": booking.created_at.isoformat(),
                    }
                    for booking in latest_bookings
                ],
                "contactMessages": [
                    {
                        "id": contact.id,
                        "name": contact.name,
                        "status": contact.status.value,
                        "createdAt": contact.created_at.isoformat(),
                    }
                    for contact in latest_contacts
                ],
                "failedAiGenerations": [
                    {
                        "id": log.id,
                        "designRequestId": log.design_request_id,
                        "errorCode": log.error_code,
                        "errorMessage": log.error_message,
                        "createdAt": log.created_at.isoformat(),
                    }
                    for log in latest_failures
                ],
            },
            "meta": _page_meta(len(latest_design_requests), page, pageSize),
            "actor": {"id": admin_user.id, "email": admin_user.email},
        }
    )


@router.get("/design-requests")
def get_design_requests(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    statusValue: DesignRequestStatus | None = Query(default=None, alias="status"),
    designType: DesignType | None = Query(default=None),
    spaceType: str | None = Query(default=None),
    city: str | None = Query(default=None),
    freePaid: str | None = Query(default=None),
    budgetMin: float | None = Query(default=None, ge=0),
    budgetMax: float | None = Query(default=None, ge=0),
    hasUploadedImage: bool | None = Query(default=None),
    customerType: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)

    query = (
        db.query(DesignRequest)
        .options(joinedload(DesignRequest.user), joinedload(DesignRequest.assigned_to))
        .outerjoin(User, DesignRequest.user_id == User.id)
        .order_by(DesignRequest.created_at.desc())
    )

    if statusValue:
        query = query.filter(DesignRequest.status == statusValue)
    if designType:
        query = query.filter(DesignRequest.design_type == designType)
    if spaceType:
        query = query.filter(DesignRequest.space_type.ilike(f"%{spaceType}%"))
    if city:
        query = query.filter(DesignRequest.city.ilike(f"%{city}%"))
    if freePaid == "free":
        query = query.filter(DesignRequest.free_generation_applied.is_(True))
    if freePaid == "paid":
        query = query.filter(DesignRequest.free_generation_applied.is_(False))
    if budgetMin is not None:
        query = query.filter(DesignRequest.budget >= budgetMin)
    if budgetMax is not None:
        query = query.filter(DesignRequest.budget <= budgetMax)
    if hasUploadedImage is True:
        query = query.filter(DesignRequest.uploaded_image_url.is_not(None))
    if hasUploadedImage is False:
        query = query.filter(DesignRequest.uploaded_image_url.is_(None))
    if customerType == "customer":
        query = query.filter(DesignRequest.user_id.is_not(None))
    if customerType == "guest":
        query = query.filter(DesignRequest.user_id.is_(None))
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(
            or_(
                DesignRequest.id.ilike(needle),
                DesignRequest.city.ilike(needle),
                DesignRequest.style.ilike(needle),
                User.name.ilike(needle),
                User.email.ilike(needle),
            )
        )

    total, records = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": record.id,
                    "customer": {
                        "id": record.user.id if record.user else None,
                        "name": record.user.name if record.user else "Guest",
                        "email": record.user.email if record.user else None,
                    },
                    "designType": record.design_type.value,
                    "spaceType": record.space_type,
                    "city": record.city,
                    "budget": float(record.budget),
                    "currency": record.currency,
                    "style": record.style,
                    "status": record.status.value,
                    "priority": record.priority.value,
                    "freeGenerationApplied": record.free_generation_applied,
                    "assignedTo": {
                        "id": record.assigned_to.id,
                        "name": record.assigned_to.name,
                        "email": record.assigned_to.email,
                    }
                    if record.assigned_to
                    else None,
                    "createdAt": record.created_at.isoformat(),
                }
                for record in records
            ],
            "meta": _page_meta(total, params.page, params.pageSize),
        }
    )


@router.get("/design-requests/{design_request_id}")
def get_design_request_detail(
    design_request_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    record = (
        db.query(DesignRequest)
        .options(
            joinedload(DesignRequest.user),
            joinedload(DesignRequest.generated_designs).joinedload(GeneratedDesign.products),
            joinedload(DesignRequest.selected_design),
            joinedload(DesignRequest.payment),
            joinedload(DesignRequest.assigned_to),
        )
        .filter(DesignRequest.id == design_request_id)
        .one_or_none()
    )
    if not record:
        raise ApiError("NOT_FOUND", "Design request not found.", status.HTTP_404_NOT_FOUND)

    logs = (
        db.query(AIGenerationLog)
        .filter(AIGenerationLog.design_request_id == design_request_id)
        .order_by(AIGenerationLog.created_at.desc())
        .all()
    )

    return success(
        {
            "designRequest": design_request_to_client(record),
            "customer": safe_user(record.user) if record.user else None,
            "selectedDesign": {
                "id": record.selected_design.id,
                "status": record.selected_design.status.value,
                "customerName": record.selected_design.customer_name,
                "customerEmail": record.selected_design.customer_email,
                "customerPhone": record.selected_design.customer_phone,
                "preferredContactTime": record.selected_design.preferred_contact_time,
                "finalEstimatedTotal": float(record.selected_design.final_estimated_total),
                "selectedProducts": record.selected_design.selected_products,
                "notes": record.selected_design.notes,
                "createdAt": record.selected_design.created_at.isoformat(),
            }
            if record.selected_design
            else None,
            "payment": {
                "id": record.payment.id,
                "status": record.payment.status.value,
                "amount": record.payment.amount,
                "currency": record.payment.currency,
                "createdAt": record.payment.created_at.isoformat(),
            }
            if record.payment
            else None,
            "aiLogs": [
                {
                    "id": log.id,
                    "status": log.status.value,
                    "errorCode": log.error_code,
                    "errorMessage": log.error_message,
                    "modelText": log.model_text,
                    "modelImage": log.model_image,
                    "createdAt": log.created_at.isoformat(),
                }
                for log in logs
            ],
            "notes": _load_notes(db, AdminNoteEntityType.DESIGN_REQUEST, record.id),
        }
    )


@router.patch("/design-requests/{design_request_id}")
def patch_design_request(
    design_request_id: str,
    payload: DesignRequestUpdateIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    record = db.get(DesignRequest, design_request_id)
    if not record:
        raise ApiError("NOT_FOUND", "Design request not found.", status.HTTP_404_NOT_FOUND)

    updates = payload.model_dump(exclude_none=True)
    if "status" in updates:
        record.status = updates["status"]
    if "priority" in updates:
        record.priority = updates["priority"]
    if "assignedToId" in updates:
        if updates["assignedToId"]:
            assignee = db.get(User, updates["assignedToId"])
            if not assignee or assignee.role != UserRole.ADMIN.value:
                raise ApiError(
                    "VALIDATION_ERROR",
                    "Assigned user must be an admin.",
                    status.HTTP_400_BAD_REQUEST)
        record.assigned_to_id = updates["assignedToId"]
    if "internalStatus" in updates:
        record.internal_status = updates["internalStatus"]

    record.last_admin_viewed_at = datetime.now(timezone.utc)
    _add_audit_log(db, admin_user, "DESIGN_REQUEST_UPDATED", "DESIGN_REQUEST", record.id, updates)
    db.commit()
    return success({"id": record.id,
                    "status": record.status.value,
                    "priority": record.priority.value})


@router.post("/design-requests/{design_request_id}/notes")
def add_design_request_note(
    design_request_id: str,
    payload: AdminNoteIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    if payload.entityType != AdminNoteEntityType.DESIGN_REQUEST or payload.entityId != design_request_id:
        raise ApiError(
            "VALIDATION_ERROR",
            "Entity type or ID mismatch.",
            status.HTTP_400_BAD_REQUEST)
    if not _entity_exists(db, payload.entityType, payload.entityId):
        raise ApiError("NOT_FOUND", "Entity not found.", status.HTTP_404_NOT_FOUND)

    note = AdminNote(
        entity_type=payload.entityType,
        entity_id=payload.entityId,
        note=payload.note,
        created_by_id=admin_user.id,
    )
    db.add(note)
    _add_audit_log(db, admin_user, "ADMIN_NOTE_CREATED", payload.entityType.value,
                   payload.entityId, {"noteLength": len(payload.note)})
    db.commit()
    db.refresh(note)
    return success(_serialize_note(note), status_code=status.HTTP_201_CREATED)


@router.post("/design-requests/{design_request_id}/retry-generation")
def retry_generation(
    design_request_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    record = db.get(DesignRequest, design_request_id)
    if not record:
        raise ApiError("NOT_FOUND", "Design request not found.", status.HTTP_404_NOT_FOUND)

    log = AIGenerationLog(
        design_request_id=record.id,
        status=AIGenerationStatus.RETRIED,
        model_text=settings.openai_model_text,
        model_image=settings.openai_model_image,
        raw_request_summary={"requestedBy": admin_user.id, "reason": "manual_retry"},
    )
    db.add(log)
    record.internal_status = "RETRY_REQUESTED"
    _add_audit_log(db, admin_user, "DESIGN_REQUEST_RETRY_REQUESTED", "DESIGN_REQUEST", record.id)
    db.commit()
    return success({"id": record.id, "retryLogged": True,
                   "message": "Retry was recorded for follow-up processing."})


@router.get("/generated-designs")
def get_generated_designs(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = (
        db.query(GeneratedDesign) .options(
            joinedload(
                GeneratedDesign.design_request).joinedload(
                DesignRequest.user),
            joinedload(
                GeneratedDesign.products),
            joinedload(
                GeneratedDesign.selected_design)) .join(
            DesignRequest,
            GeneratedDesign.design_request_id == DesignRequest.id) .outerjoin(
            User,
            DesignRequest.user_id == User.id) .order_by(
            GeneratedDesign.created_at.desc()))
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(GeneratedDesign.title.ilike(needle), GeneratedDesign.style.ilike(
            needle), DesignRequest.id.ilike(needle), User.email.ilike(needle)))

    total, records = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": design.id,
                    "title": design.title,
                    "designRequestId": design.design_request_id,
                    "customerName": design.design_request.user.name if design.design_request and design.design_request.user else "Guest",
                    "style": design.style,
                    "estimatedTotal": float(design.estimated_total),
                    "currency": design.currency,
                    "budgetStatus": design.budget_status.value,
                    "productCount": len(design.products),
                    "selected": design.selected_design is not None,
                    "createdAt": design.created_at.isoformat(),
                }
                for design in records
            ],
            "meta": _page_meta(total, params.page, params.pageSize),
        }
    )


@router.get("/generated-designs/{generated_design_id}")
def get_generated_design_detail(
    generated_design_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    record = (
        db.query(GeneratedDesign) .options(
            joinedload(
                GeneratedDesign.products), joinedload(
                GeneratedDesign.design_request).joinedload(
                    DesignRequest.user)) .filter(
                        GeneratedDesign.id == generated_design_id) .one_or_none())
    if not record:
        raise ApiError("NOT_FOUND", "Generated design not found.", status.HTTP_404_NOT_FOUND)
    return success(generated_design_to_client(record))


@router.get("/selected-designs")
def get_selected_designs(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    statusValue: SelectedDesignStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = db.query(SelectedDesign).order_by(SelectedDesign.created_at.desc())
    if statusValue:
        query = query.filter(SelectedDesign.status == statusValue)
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(SelectedDesign.id.ilike(needle), SelectedDesign.customer_name.ilike(
            needle), SelectedDesign.customer_email.ilike(needle), SelectedDesign.customer_phone.ilike(needle)))

    total, records = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": record.id,
                    "customerName": record.customer_name,
                    "email": record.customer_email,
                    "phone": record.customer_phone,
                    "selectedDesignId": record.generated_design_id,
                    "finalEstimatedTotal": float(record.final_estimated_total),
                    "status": record.status.value,
                    "preferredContactTime": record.preferred_contact_time,
                    "createdAt": record.created_at.isoformat(),
                }
                for record in records
            ],
            "meta": _page_meta(total, params.page, params.pageSize),
        }
    )


@router.get("/selected-designs/{selected_design_id}")
def get_selected_design_detail(
    selected_design_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    record = (
        db.query(SelectedDesign) .options(
            joinedload(
                SelectedDesign.design_request), joinedload(
                SelectedDesign.generated_design), joinedload(
                    SelectedDesign.bookings), joinedload(
                        SelectedDesign.user), joinedload(
                            SelectedDesign.assigned_to)) .filter(
                                SelectedDesign.id == selected_design_id) .one_or_none())
    if not record:
        raise ApiError("NOT_FOUND", "Selected design not found.", status.HTTP_404_NOT_FOUND)
    return success({"id": record.id,
                    "designRequestId": record.design_request_id,
                    "generatedDesignId": record.generated_design_id,
                    "customer": {"userId": record.user_id,
                                 "name": record.customer_name,
                                 "email": record.customer_email,
                                 "phone": record.customer_phone,
                                 },
                    "status": record.status.value,
                    "finalEstimatedTotal": float(record.final_estimated_total),
                    "selectedProducts": record.selected_products,
                    "notes": record.notes,
                    "assignedTo": {"id": record.assigned_to.id,
                                   "name": record.assigned_to.name,
                                   "email": record.assigned_to.email} if record.assigned_to else None,
                    "createdAt": record.created_at.isoformat(),
                    "updatedAt": record.updated_at.isoformat(),
                    "bookings": [{"id": booking.id,
                                  "status": booking.status.value} for booking in record.bookings],
                    "internalNotes": _load_notes(db,
                                                 AdminNoteEntityType.SELECTED_DESIGN,
                                                 record.id),
                    })


@router.patch("/selected-designs/{selected_design_id}")
def patch_selected_design(
    selected_design_id: str,
    payload: SelectedDesignUpdateIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    record = db.get(SelectedDesign, selected_design_id)
    if not record:
        raise ApiError("NOT_FOUND", "Selected design not found.", status.HTTP_404_NOT_FOUND)

    updates = payload.model_dump(exclude_none=True)
    if "status" in updates:
        record.status = updates["status"]
        if updates["status"] in {
                SelectedDesignStatus.CONTACTED,
                SelectedDesignStatus.CONSULTATION_BOOKED,
                SelectedDesignStatus.DEAL_FINALIZED}:
            record.last_contacted_at = datetime.now(timezone.utc)
    if "assignedToId" in updates:
        if updates["assignedToId"]:
            assignee = db.get(User, updates["assignedToId"])
            if not assignee or assignee.role != UserRole.ADMIN.value:
                raise ApiError(
                    "VALIDATION_ERROR",
                    "Assigned user must be an admin.",
                    status.HTTP_400_BAD_REQUEST)
        record.assigned_to_id = updates["assignedToId"]

    _add_audit_log(db, admin_user, "SELECTED_DESIGN_UPDATED", "SELECTED_DESIGN", record.id, updates)
    db.commit()
    return success({"id": record.id, "status": record.status.value})


@router.post("/selected-designs/{selected_design_id}/notes")
def add_selected_design_note(
    selected_design_id: str,
    payload: AdminNoteIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    if payload.entityType != AdminNoteEntityType.SELECTED_DESIGN or payload.entityId != selected_design_id:
        raise ApiError(
            "VALIDATION_ERROR",
            "Entity type or ID mismatch.",
            status.HTTP_400_BAD_REQUEST)
    if not _entity_exists(db, payload.entityType, payload.entityId):
        raise ApiError("NOT_FOUND", "Entity not found.", status.HTTP_404_NOT_FOUND)

    note = AdminNote(
        entity_type=payload.entityType,
        entity_id=payload.entityId,
        note=payload.note,
        created_by_id=admin_user.id)
    db.add(note)
    _add_audit_log(db, admin_user, "ADMIN_NOTE_CREATED", payload.entityType.value,
                   payload.entityId, {"noteLength": len(payload.note)})
    db.commit()
    db.refresh(note)
    return success(_serialize_note(note), status_code=status.HTTP_201_CREATED)


@router.get("/bookings")
def get_bookings(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    statusValue: BookingStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = db.query(Booking).options(
        joinedload(
            Booking.selected_design), joinedload(
            Booking.user)).order_by(
                Booking.created_at.desc())
    if statusValue:
        query = query.filter(Booking.status == statusValue)
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(Booking.id.ilike(needle),
                                 Booking.name.ilike(needle),
                                 Booking.email.ilike(needle),
                                 Booking.phone.ilike(needle),
                                 Booking.city.ilike(needle)))

    total, records = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": record.id,
                    "customerName": record.name,
                    "email": record.email,
                    "phone": record.phone,
                    "projectType": record.project_type,
                    "preferredDate": record.preferred_date.isoformat(),
                    "preferredTime": record.preferred_time,
                    "city": record.city,
                    "budgetRange": record.budget_range,
                    "status": record.status.value,
                    "selectedDesignId": record.selected_design_id,
                    "createdAt": record.created_at.isoformat(),
                }
                for record in records
            ],
            "meta": _page_meta(total, params.page, params.pageSize),
        }
    )


@router.get("/bookings/{booking_id}")
def get_booking_detail(
    booking_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    booking = db.query(Booking).options(
        joinedload(
            Booking.selected_design), joinedload(
            Booking.user), joinedload(
                Booking.assigned_to)).filter(
                    Booking.id == booking_id).one_or_none()
    if not booking:
        raise ApiError("NOT_FOUND", "Booking not found.", status.HTTP_404_NOT_FOUND)

    return success({"id": booking.id,
                    "name": booking.name,
                    "email": booking.email,
                    "phone": booking.phone,
                    "projectType": booking.project_type,
                    "preferredDate": booking.preferred_date.isoformat(),
                    "preferredTime": booking.preferred_time,
                    "city": booking.city,
                    "state": booking.state,
                    "country": booking.country,
                    "budgetRange": booking.budget_range,
                    "message": booking.message,
                    "status": booking.status.value,
                    "selectedDesignId": booking.selected_design_id,
                    "assignedTo": {"id": booking.assigned_to.id,
                                   "name": booking.assigned_to.name} if booking.assigned_to else None,
                    "createdAt": booking.created_at.isoformat(),
                    "notes": _load_notes(db,
                                         AdminNoteEntityType.BOOKING,
                                         booking.id),
                    })


@router.patch("/bookings/{booking_id}")
def patch_booking(
    booking_id: str,
    payload: BookingUpdateIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise ApiError("NOT_FOUND", "Booking not found.", status.HTTP_404_NOT_FOUND)

    updates = payload.model_dump(exclude_none=True)
    if "status" in updates:
        booking.status = updates["status"]
        now = datetime.now(timezone.utc)
        if booking.status == BookingStatus.CONFIRMED:
            booking.confirmed_at = now
        elif booking.status == BookingStatus.COMPLETED:
            booking.completed_at = now
        elif booking.status == BookingStatus.CANCELLED:
            booking.cancelled_at = now
    if "preferredDate" in updates:
        booking.preferred_date = updates["preferredDate"]
    if "preferredTime" in updates:
        booking.preferred_time = updates["preferredTime"]
    if "assignedToId" in updates:
        if updates["assignedToId"]:
            assignee = db.get(User, updates["assignedToId"])
            if not assignee or assignee.role != UserRole.ADMIN.value:
                raise ApiError(
                    "VALIDATION_ERROR",
                    "Assigned user must be an admin.",
                    status.HTTP_400_BAD_REQUEST)
        booking.assigned_to_id = updates["assignedToId"]

    _add_audit_log(db, admin_user, "BOOKING_UPDATED", "BOOKING", booking.id, updates)
    db.commit()
    return success({"id": booking.id, "status": booking.status.value})


@router.post("/bookings/{booking_id}/notes")
def add_booking_note(
    booking_id: str,
    payload: AdminNoteIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    if payload.entityType != AdminNoteEntityType.BOOKING or payload.entityId != booking_id:
        raise ApiError(
            "VALIDATION_ERROR",
            "Entity type or ID mismatch.",
            status.HTTP_400_BAD_REQUEST)
    if not _entity_exists(db, payload.entityType, payload.entityId):
        raise ApiError("NOT_FOUND", "Entity not found.", status.HTTP_404_NOT_FOUND)

    note = AdminNote(
        entity_type=payload.entityType,
        entity_id=payload.entityId,
        note=payload.note,
        created_by_id=admin_user.id)
    db.add(note)
    _add_audit_log(db, admin_user, "ADMIN_NOTE_CREATED", payload.entityType.value, payload.entityId)
    db.commit()
    db.refresh(note)
    return success(_serialize_note(note), status_code=status.HTTP_201_CREATED)


@router.get("/customers")
def get_customers(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    statusValue: UserStatus | None = Query(default=None, alias="status"),
    emailVerified: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = db.query(User).filter(
        User.role == UserRole.CUSTOMER.value).order_by(
        User.created_at.desc())
    if statusValue:
        query = query.filter(User.status == statusValue.value)
    if emailVerified is True:
        query = query.filter(User.email_verified_at.is_not(None))
    if emailVerified is False:
        query = query.filter(User.email_verified_at.is_(None))
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(User.name.ilike(needle), User.email.ilike(
            needle), User.phone.ilike(needle), User.city.ilike(needle)))

    total, records = _paginate(query, params.page, params.pageSize)
    items = []
    for user in records:
        usage = db.query(UserUsage).filter(UserUsage.user_id == user.id).one_or_none()
        items.append(
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "city": user.city,
                "status": user.status,
                "emailVerified": bool(
                    user.email_verified_at),
                "freeGenerationUsed": bool(
                    usage.free_generation_used) if usage else False,
                "totalDesignRequests": db.query(DesignRequest).filter(
                    DesignRequest.user_id == user.id).count(),
                "totalBookings": db.query(Booking).filter(
                    Booking.user_id == user.id).count(),
                "totalPayments": db.query(Payment).filter(
                    Payment.user_id == user.id,
                    Payment.status == PaymentStatus.PAID).count(),
                "createdAt": user.created_at.isoformat(),
                "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
            })

    return success({"items": items, "meta": _page_meta(total, params.page, params.pageSize)})


@router.get("/customers/{customer_id}")
def get_customer_detail(
    customer_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.get(User, customer_id)
    if not user or user.role != UserRole.CUSTOMER.value:
        raise ApiError("NOT_FOUND", "Customer not found.", status.HTTP_404_NOT_FOUND)

    usage = db.query(UserUsage).filter(UserUsage.user_id == user.id).one_or_none()
    design_requests = db.query(DesignRequest).filter(
        DesignRequest.user_id == user.id).order_by(
        DesignRequest.created_at.desc()).all()
    selected_designs = db.query(SelectedDesign).filter(
        SelectedDesign.user_id == user.id).order_by(
        SelectedDesign.created_at.desc()).all()
    bookings = db.query(Booking).filter(
        Booking.user_id == user.id).order_by(
        Booking.created_at.desc()).all()
    payments = db.query(Payment).filter(
        Payment.user_id == user.id).order_by(
        Payment.created_at.desc()).all()
    contacts = db.query(ContactMessage).filter(
        ContactMessage.email == user.email).order_by(
        ContactMessage.created_at.desc()).all()

    safe = safe_user(user)
    safe.pop("role", None)
    safe.pop("status", None)

    return success({"customer": {**safe,
                                 "status": user.status,
                                 "role": user.role,
                                 "usage": {"freeGenerationUsed": bool(usage.free_generation_used) if usage else False,
                                           "totalGenerations": usage.total_generations if usage else 0,
                                           "paidGenerations": usage.paid_generations if usage else 0,
                                           },
                                 },
                    "designRequests": [{"id": item.id,
                                        "status": item.status.value,
                                        "createdAt": item.created_at.isoformat()} for item in design_requests],
                    "selectedDesigns": [{"id": item.id,
                                         "status": item.status.value,
                                         "createdAt": item.created_at.isoformat()} for item in selected_designs],
                    "bookings": [{"id": item.id,
                                  "status": item.status.value,
                                  "createdAt": item.created_at.isoformat()} for item in bookings],
                    "payments": [{"id": item.id,
                                  "status": item.status.value,
                                  "amount": item.amount,
                                  "currency": item.currency,
                                  "createdAt": item.created_at.isoformat()} for item in payments],
                    "contactHistory": [{"id": item.id,
                                        "subject": item.subject,
                                        "status": item.status.value,
                                        "createdAt": item.created_at.isoformat()} for item in contacts],
                    "notes": _load_notes(db,
                                         AdminNoteEntityType.CUSTOMER,
                                         user.id),
                    })


@router.patch("/customers/{customer_id}/status")
def update_customer_status(
    customer_id: str,
    payload: CustomerStatusUpdateIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    user = db.get(User, customer_id)
    if not user or user.role != UserRole.CUSTOMER.value:
        raise ApiError("NOT_FOUND", "Customer not found.", status.HTTP_404_NOT_FOUND)

    user.status = payload.status.value
    _add_audit_log(db, admin_user, "CUSTOMER_STATUS_UPDATED",
                   "CUSTOMER", user.id, {"status": user.status})
    db.commit()
    return success({"id": user.id, "status": user.status})


@router.post("/customers/{customer_id}/notes")
def add_customer_note(
    customer_id: str,
    payload: AdminNoteIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    if payload.entityType != AdminNoteEntityType.CUSTOMER or payload.entityId != customer_id:
        raise ApiError(
            "VALIDATION_ERROR",
            "Entity type or ID mismatch.",
            status.HTTP_400_BAD_REQUEST)
    if not _entity_exists(db, payload.entityType, payload.entityId):
        raise ApiError("NOT_FOUND", "Entity not found.", status.HTTP_404_NOT_FOUND)

    note = AdminNote(
        entity_type=payload.entityType,
        entity_id=payload.entityId,
        note=payload.note,
        created_by_id=admin_user.id)
    db.add(note)
    _add_audit_log(db, admin_user, "ADMIN_NOTE_CREATED", payload.entityType.value, payload.entityId)
    db.commit()
    db.refresh(note)
    return success(_serialize_note(note), status_code=status.HTTP_201_CREATED)


@router.get("/products")
def get_products(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    itemType: str | None = Query(default=None),
    city: str | None = Query(default=None),
    stockStatus: StockStatus | None = Query(default=None),
    includeArchived: bool = Query(default=False),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = db.query(Product).order_by(Product.updated_at.desc())
    if not includeArchived:
        query = query.filter(Product.archived_at.is_(None))
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if itemType:
        query = query.filter(Product.item_type.ilike(f"%{itemType}%"))
    if city:
        query = query.filter(Product.city.ilike(f"%{city}%"))
    if stockStatus:
        query = query.filter(Product.stock_status == stockStatus)
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(Product.name.ilike(needle),
                                 Product.vendor_name.ilike(needle),
                                 Product.category.ilike(needle),
                                 Product.item_type.ilike(needle),
                                 Product.city.ilike(needle)))

    total, records = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": record.id,
                    "name": record.name,
                    "slug": record.slug,
                    "imageUrl": record.image_url,
                    "category": record.category,
                    "itemType": record.item_type,
                    "price": float(record.price),
                    "currency": record.currency,
                    "city": record.city,
                    "state": record.state,
                    "country": record.country,
                    "stockStatus": record.stock_status.value,
                    "styleTags": record.style_tags,
                    "vendor": record.vendor_name,
                    "updatedAt": record.updated_at.isoformat(),
                    "archivedAt": record.archived_at.isoformat() if record.archived_at else None,
                }
                for record in records
            ],
            "meta": _page_meta(total, params.page, params.pageSize),
        }
    )


@router.post("/products")
def create_product(
    payload: ProductIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    existing = db.query(Product).filter(Product.slug == payload.slug).one_or_none()
    if existing:
        raise ApiError(
            "CONFLICT",
            "A product with this slug already exists.",
            status.HTTP_409_CONFLICT)

    product = Product(
        name=payload.name,
        slug=payload.slug,
        category=payload.category,
        subcategory=payload.subcategory,
        description=payload.description,
        price=payload.price,
        currency=payload.currency,
        image_url=payload.imageUrl,
        brand=payload.brand,
        material=payload.material,
        color=payload.color,
        style_tags=payload.styleTags,
        item_type=payload.itemType,
        room_types=payload.roomTypes,
        design_types=payload.designTypes,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        postal_code=payload.postalCode,
        stock_status=payload.stockStatus,
        vendor_name=payload.vendorName,
        vendor_url=payload.vendorUrl,
    )
    db.add(product)
    db.flush()
    _add_audit_log(db, admin_user, "PRODUCT_CREATED", "PRODUCT", product.id, {"slug": product.slug})
    db.commit()
    db.refresh(product)
    return success({"id": product.id}, status_code=status.HTTP_201_CREATED)


@router.get("/products/{product_id}")
def get_product_detail(
    product_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise ApiError("NOT_FOUND", "Product not found.", status.HTTP_404_NOT_FOUND)
    return success(
        {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "category": product.category,
            "subcategory": product.subcategory,
            "description": product.description,
            "price": float(product.price),
            "currency": product.currency,
            "imageUrl": product.image_url,
            "brand": product.brand,
            "material": product.material,
            "color": product.color,
            "styleTags": product.style_tags,
            "itemType": product.item_type,
            "roomTypes": product.room_types,
            "designTypes": product.design_types,
            "city": product.city,
            "state": product.state,
            "country": product.country,
            "postalCode": product.postal_code,
            "stockStatus": product.stock_status.value,
            "vendorName": product.vendor_name,
            "vendorUrl": product.vendor_url,
            "archivedAt": product.archived_at.isoformat() if product.archived_at else None,
            "notes": _load_notes(db, AdminNoteEntityType.PRODUCT, product.id),
        }
    )


@router.patch("/products/{product_id}")
def patch_product(
    product_id: str,
    payload: ProductPatchIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise ApiError("NOT_FOUND", "Product not found.", status.HTTP_404_NOT_FOUND)

    updates = payload.model_dump(exclude_none=True)
    if "slug" in updates and updates["slug"] != product.slug:
        if db.query(Product).filter(
            and_(
                Product.slug == updates["slug"],
                Product.id != product.id)).one_or_none():
            raise ApiError(
                "CONFLICT",
                "A product with this slug already exists.",
                status.HTTP_409_CONFLICT)

    mapping = {
        "imageUrl": "image_url",
        "styleTags": "style_tags",
        "itemType": "item_type",
        "roomTypes": "room_types",
        "designTypes": "design_types",
        "postalCode": "postal_code",
        "stockStatus": "stock_status",
        "vendorName": "vendor_name",
        "vendorUrl": "vendor_url",
    }
    for key, value in updates.items():
        if key == "archived":
            product.archived_at = datetime.now(timezone.utc) if value else None
            continue
        setattr(product, mapping.get(key, key), value)

    _add_audit_log(db, admin_user, "PRODUCT_UPDATED", "PRODUCT",
                   product.id, {"fields": list(updates.keys())})
    db.commit()
    return success({"id": product.id})


@router.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise ApiError("NOT_FOUND", "Product not found.", status.HTTP_404_NOT_FOUND)
    db.delete(product)
    _add_audit_log(db, admin_user, "PRODUCT_DELETED", "PRODUCT", product.id)
    db.commit()
    return success({"id": product.id, "deleted": True})


@router.get("/blogs")
def get_admin_blogs(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = db.query(BlogPost).order_by(BlogPost.updated_at.desc())
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(BlogPost.title.ilike(needle), BlogPost.slug.ilike(
            needle), BlogPost.category.ilike(needle), BlogPost.author_name.ilike(needle)))

    total, records = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": post.id,
                    "title": post.title,
                    "slug": post.slug,
                    "category": post.category,
                    "published": post.published,
                    "author": post.author_name,
                    "publishedAt": post.published_at.isoformat() if post.published_at else None,
                    "updatedAt": post.updated_at.isoformat(),
                }
                for post in records
            ],
            "meta": _page_meta(total, params.page, params.pageSize),
        }
    )


@router.post("/blogs")
def create_blog(
    payload: BlogIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    existing = db.query(BlogPost).filter(BlogPost.slug == payload.slug).one_or_none()
    if existing:
        raise ApiError(
            "CONFLICT",
            "A blog with this slug already exists.",
            status.HTTP_409_CONFLICT)

    content_blocks = [block.strip() for block in payload.content.split("\n\n") if block.strip()]
    post = BlogPost(
        title=payload.title,
        slug=payload.slug,
        excerpt=payload.excerpt,
        content=content_blocks,
        cover_image_url=payload.coverImageUrl,
        author_name=payload.authorName,
        category=payload.category,
        tags=payload.tags,
        published=payload.published,
        published_at=datetime.now(timezone.utc) if payload.published else None,
    )
    db.add(post)
    db.flush()
    _add_audit_log(db, admin_user, "BLOG_CREATED", "BLOG", post.id, {"published": post.published})
    db.commit()
    db.refresh(post)
    return success({"id": post.id}, status_code=status.HTTP_201_CREATED)


@router.get("/blogs/{blog_id}")
def get_blog_detail(
    blog_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    post = db.get(BlogPost, blog_id)
    if not post:
        raise ApiError("NOT_FOUND", "Blog not found.", status.HTTP_404_NOT_FOUND)
    return success(
        {
            "id": post.id,
            "title": post.title,
            "slug": post.slug,
            "excerpt": post.excerpt,
            "content": "\n\n".join(post.content),
            "coverImageUrl": post.cover_image_url,
            "authorName": post.author_name,
            "category": post.category,
            "tags": post.tags,
            "published": post.published,
            "publishedAt": post.published_at.isoformat() if post.published_at else None,
            "archivedAt": post.archived_at.isoformat() if post.archived_at else None,
        }
    )


@router.patch("/blogs/{blog_id}")
def patch_blog(
    blog_id: str,
    payload: BlogPatchIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    post = db.get(BlogPost, blog_id)
    if not post:
        raise ApiError("NOT_FOUND", "Blog not found.", status.HTTP_404_NOT_FOUND)

    updates = payload.model_dump(exclude_none=True)
    if "slug" in updates and updates["slug"] != post.slug:
        if db.query(BlogPost).filter(
            and_(
                BlogPost.slug == updates["slug"],
                BlogPost.id != post.id)).one_or_none():
            raise ApiError(
                "CONFLICT",
                "A blog with this slug already exists.",
                status.HTTP_409_CONFLICT)

    if "content" in updates:
        post.content = [block.strip()
                        for block in updates["content"].split("\n\n") if block.strip()]
        updates.pop("content")
    if "coverImageUrl" in updates:
        post.cover_image_url = updates.pop("coverImageUrl")
    if "authorName" in updates:
        post.author_name = updates.pop("authorName")
    if "archived" in updates:
        post.archived_at = datetime.now(timezone.utc) if updates.pop("archived") else None
    for key, value in updates.items():
        setattr(post, key, value)

    if payload.published is True and not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    if payload.published is False:
        post.published_at = None

    _add_audit_log(
        db, admin_user, "BLOG_UPDATED", "BLOG", post.id, {
            "fields": list(
                payload.model_dump(
                    exclude_none=True).keys())})
    db.commit()
    return success({"id": post.id, "published": post.published})


@router.delete("/blogs/{blog_id}")
def delete_blog(
    blog_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    post = db.get(BlogPost, blog_id)
    if not post:
        raise ApiError("NOT_FOUND", "Blog not found.", status.HTTP_404_NOT_FOUND)
    db.delete(post)
    _add_audit_log(db, admin_user, "BLOG_DELETED", "BLOG", post.id)
    db.commit()
    return success({"id": post.id, "deleted": True})


@router.get("/contact-messages")
def get_contact_messages(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    statusValue: ContactMessageStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = db.query(ContactMessage).order_by(ContactMessage.created_at.desc())
    if statusValue:
        query = query.filter(ContactMessage.status == statusValue)
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(ContactMessage.name.ilike(needle), ContactMessage.email.ilike(
            needle), ContactMessage.subject.ilike(needle), ContactMessage.message.ilike(needle)))

    total, records = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": record.id,
                    "name": record.name,
                    "email": record.email,
                    "phone": record.phone,
                    "subject": record.subject,
                    "messagePreview": record.message[:140],
                    "status": record.status.value,
                    "createdAt": record.created_at.isoformat(),
                }
                for record in records
            ],
            "meta": _page_meta(total, params.page, params.pageSize),
        }
    )


@router.get("/contact-messages/{message_id}")
def get_contact_message_detail(
    message_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    message = db.get(ContactMessage, message_id)
    if not message:
        raise ApiError("NOT_FOUND", "Contact message not found.", status.HTTP_404_NOT_FOUND)
    return success(
        {
            "id": message.id,
            "name": message.name,
            "email": message.email,
            "phone": message.phone,
            "subject": message.subject,
            "message": message.message,
            "status": message.status.value,
            "readAt": message.read_at.isoformat() if message.read_at else None,
            "repliedAt": message.replied_at.isoformat() if message.replied_at else None,
            "createdAt": message.created_at.isoformat(),
            "notes": _load_notes(db, AdminNoteEntityType.CONTACT_MESSAGE, message.id),
        }
    )


@router.patch("/contact-messages/{message_id}")
def patch_contact_message(
    message_id: str,
    payload: ContactMessageUpdateIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    message = db.get(ContactMessage, message_id)
    if not message:
        raise ApiError("NOT_FOUND", "Contact message not found.", status.HTTP_404_NOT_FOUND)

    message.status = payload.status
    now = datetime.now(timezone.utc)
    if payload.status == ContactMessageStatus.READ and not message.read_at:
        message.read_at = now
    if payload.status == ContactMessageStatus.REPLIED and not message.replied_at:
        message.replied_at = now

    _add_audit_log(db, admin_user, "CONTACT_MESSAGE_UPDATED", "CONTACT_MESSAGE",
                   message.id, {"status": payload.status.value})
    db.commit()
    return success({"id": message.id, "status": message.status.value})


@router.post("/contact-messages/{message_id}/notes")
def add_contact_message_note(
    message_id: str,
    payload: AdminNoteIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    if payload.entityType != AdminNoteEntityType.CONTACT_MESSAGE or payload.entityId != message_id:
        raise ApiError(
            "VALIDATION_ERROR",
            "Entity type or ID mismatch.",
            status.HTTP_400_BAD_REQUEST)
    if not _entity_exists(db, payload.entityType, payload.entityId):
        raise ApiError("NOT_FOUND", "Entity not found.", status.HTTP_404_NOT_FOUND)

    note = AdminNote(
        entity_type=payload.entityType,
        entity_id=payload.entityId,
        note=payload.note,
        created_by_id=admin_user.id)
    db.add(note)
    _add_audit_log(db, admin_user, "ADMIN_NOTE_CREATED", payload.entityType.value, payload.entityId)
    db.commit()
    db.refresh(note)
    return success(_serialize_note(note), status_code=status.HTTP_201_CREATED)


@router.get("/payments")
def get_payments(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    statusValue: PaymentStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = db.query(Payment).options(joinedload(Payment.user)).order_by(Payment.created_at.desc())
    if statusValue:
        query = query.filter(Payment.status == statusValue)
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(Payment.id.ilike(needle),
                                 Payment.stripe_checkout_session_id.ilike(needle),
                                 Payment.stripe_payment_intent_id.ilike(needle)))

    total, records = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": payment.id,
                    "customer": {
                        "id": payment.user.id if payment.user else None,
                        "name": payment.user.name if payment.user else "Guest",
                        "email": payment.user.email if payment.user else None,
                    },
                    "designRequestId": payment.design_request_id,
                    "stripeSessionId": payment.stripe_checkout_session_id,
                    "amount": payment.amount,
                    "currency": payment.currency,
                    "status": payment.status.value,
                    "createdAt": payment.created_at.isoformat(),
                }
                for payment in records
            ],
            "meta": _page_meta(total, params.page, params.pageSize),
        }
    )


@router.get("/payments/{payment_id}")
def get_payment_detail(
    payment_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    payment = db.query(Payment).options(
        joinedload(
            Payment.user)).filter(
        Payment.id == payment_id).one_or_none()
    if not payment:
        raise ApiError("NOT_FOUND", "Payment not found.", status.HTTP_404_NOT_FOUND)
    return success({"id": payment.id,
                    "designRequestId": payment.design_request_id,
                    "customer": {"id": payment.user.id,
                                 "name": payment.user.name,
                                 "email": payment.user.email} if payment.user else None,
                    "stripeSessionId": payment.stripe_checkout_session_id,
                    "stripePaymentIntentId": payment.stripe_payment_intent_id,
                    "amount": payment.amount,
                    "currency": payment.currency,
                    "status": payment.status.value,
                    "createdAt": payment.created_at.isoformat(),
                    })


@router.get("/ai-logs")
def get_ai_logs(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    statusValue: AIGenerationStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = db.query(AIGenerationLog).order_by(AIGenerationLog.created_at.desc())
    if statusValue:
        query = query.filter(AIGenerationLog.status == statusValue)
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(AIGenerationLog.id.ilike(needle), AIGenerationLog.design_request_id.ilike(
            needle), AIGenerationLog.error_code.ilike(needle), AIGenerationLog.error_message.ilike(needle)))

    total, logs = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": log.id,
                    "designRequestId": log.design_request_id,
                    "status": log.status.value,
                    "errorCode": log.error_code,
                    "errorMessage": log.error_message,
                    "modelText": log.model_text,
                    "modelImage": log.model_image,
                    "promptTokens": log.prompt_tokens,
                    "completionTokens": log.completion_tokens,
                    "totalTokens": log.total_tokens,
                    "createdAt": log.created_at.isoformat(),
                    "completedAt": log.updated_at.isoformat() if log.status in {
                        AIGenerationStatus.COMPLETED,
                        AIGenerationStatus.FAILED} else None,
                } for log in logs],
            "meta": _page_meta(
                total,
                params.page,
                params.pageSize),
        })


@router.get("/ai-logs/{log_id}")
def get_ai_log_detail(
    log_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    log = db.get(AIGenerationLog, log_id)
    if not log:
        raise ApiError("NOT_FOUND", "AI log not found.", status.HTTP_404_NOT_FOUND)
    return success(
        {
            "id": log.id,
            "designRequestId": log.design_request_id,
            "status": log.status.value,
            "modelText": log.model_text,
            "modelImage": log.model_image,
            "promptTokens": log.prompt_tokens,
            "completionTokens": log.completion_tokens,
            "totalTokens": log.total_tokens,
            "errorCode": log.error_code,
            "errorMessage": log.error_message,
            "rawRequestSummary": _redact_sensitive(log.raw_request_summary),
            "rawResponseSummary": _redact_sensitive(log.raw_response_summary),
            "createdAt": log.created_at.isoformat(),
        }
    )


@router.get("/settings")
def get_admin_settings(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    setting = db.query(BusinessSetting).filter(BusinessSetting.key == "admin.portal").one_or_none()
    default_settings = {
        "businessName": "Auralis Interiors",
        "supportEmail": settings.admin_notification_email,
        "supportPhone": None,
        "defaultCurrency": "USD",
        "paidGenerationPrice": settings.design_generation_price_cents,
        "freeGenerationEnabled": True,
        "bookingAvailabilityNote": None,
        "adminNotificationEmail": settings.admin_notification_email,
        "aiGenerationMode": "TEXT_AND_IMAGE_PROMPTS",
        "maintenanceMode": False,
    }
    return success(setting.value if setting else default_settings)


@router.patch("/settings")
def patch_admin_settings(
    payload: SettingsPatchIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    current = db.query(BusinessSetting).filter(BusinessSetting.key == "admin.portal").one_or_none()
    value = dict(current.value) if current else {}
    value.update(payload.model_dump(exclude_none=True))
    setting = _upsert_settings(db, "admin.portal", value, admin_user.id)
    _add_audit_log(db, admin_user, "BUSINESS_SETTINGS_UPDATED", "SETTINGS", setting.id, {
                   "fields": list(payload.model_dump(exclude_none=True).keys())})
    db.commit()
    return success(setting.value)


@router.get("/team")
def get_admin_team(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    params = _parse_pagination(page, pageSize, search)
    query = db.query(User).filter(
        User.role == UserRole.ADMIN.value).order_by(
        User.created_at.desc())
    if params.search:
        needle = f"%{params.search}%"
        query = query.filter(or_(User.name.ilike(needle), User.email.ilike(needle)))
    total, users = _paginate(query, params.page, params.pageSize)
    return success(
        {
            "items": [
                {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                    "status": user.status,
                    "createdAt": user.created_at.isoformat(),
                }
                for user in users
            ],
            "meta": _page_meta(total, params.page, params.pageSize),
        }
    )


@router.patch("/team/{user_id}")
def patch_team_member(
    user_id: str,
    payload: TeamUpdateIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user or user.role != UserRole.ADMIN.value:
        raise ApiError("NOT_FOUND", "Admin user not found.", status.HTTP_404_NOT_FOUND)
    if user.id == admin_user.id and payload.role and payload.role != UserRole.ADMIN.value:
        raise ApiError(
            "FORBIDDEN",
            "You cannot remove your own admin role.",
            status.HTTP_403_FORBIDDEN)
    if user.id == admin_user.id and payload.status and payload.status != UserStatus.ACTIVE:
        raise ApiError(
            "FORBIDDEN",
            "You cannot disable your own admin account.",
            status.HTTP_403_FORBIDDEN)

    role_downgrade = payload.role is not None and payload.role != UserRole.ADMIN.value
    status_downgrade = payload.status is not None and payload.status != UserStatus.ACTIVE
    if role_downgrade or status_downgrade:
        active_other_admins = (
            db.query(User)
            .filter(
                User.role == UserRole.ADMIN.value,
                User.status == UserStatus.ACTIVE.value,
                User.id != user.id,
            )
            .count()
        )
        if active_other_admins == 0:
            raise ApiError(
                "FORBIDDEN",
                "At least one active admin must remain.",
                status.HTTP_403_FORBIDDEN)

    if payload.role:
        if payload.role not in {UserRole.ADMIN.value, UserRole.CUSTOMER.value}:
            raise ApiError("VALIDATION_ERROR", "Invalid role.", status.HTTP_400_BAD_REQUEST)
        user.role = payload.role
    if payload.status:
        user.status = payload.status.value

    _add_audit_log(
        db,
        admin_user,
        "TEAM_MEMBER_UPDATED",
        "TEAM",
        user.id,
        payload.model_dump(
            exclude_none=True))
    db.commit()
    return success({"id": user.id, "role": user.role, "status": user.status})
