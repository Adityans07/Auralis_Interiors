from __future__ import annotations

import httpx
from decimal import Decimal

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.db.session import get_db
from app.models.entities import (
    AIGenerationLog,
    AIGenerationStatus,
    BudgetStatus,
    DesignRequest,
    DesignRequestStatus,
    DesignType,
    GeneratedDesign,
    GeneratedDesignProduct,
    Payment,
    UserRole,
)
from app.schemas.api import DesignGenerationIn, ProductsSearchIn, SelectDesignIn
from app.security.rate_limit import assert_rate_limit
from app.security.session import RequestContext, assert_owns_design_request, get_request_context, owner_fields
from app.security.usage import consume_successful_generation, resolve_entitlement
from app.services.ai.generator import generate_design_concepts
from app.services.email.send import notify_admin, send_email
from app.services.products.matching import search_matching_products
from app.services.storage.s3 import upload_file, public_url
from app.services.ai.image_worker import spawn_image_worker
from app.utils.responses import ApiError, success
from app.utils.serializers import design_request_to_client, generated_design_to_client

router = APIRouter(prefix="/designs", tags=["designs"])


@router.post("/generate")
def generate_designs(
    payload: DesignGenerationIn,
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    if not (context.user and context.user.role == UserRole.ADMIN):
        assert_rate_limit(request, "design-generate", 5, 3600)
    payment_id = payload.paymentId
    if not payment_id and payload.stripeCheckoutSessionId:
        payment = (
            db.query(Payment)
            .filter(Payment.stripe_checkout_session_id == payload.stripeCheckoutSessionId)
            .one_or_none()
        )
        payment_id = payment.id if payment else None

    entitlement = resolve_entitlement(db, context, payment_id)
    image_url = str(payload.uploadedImage.imageUrl) if payload.uploadedImage else str(payload.uploadedImageUrl) if payload.uploadedImageUrl else None
    image_key = payload.uploadedImage.imageKey if payload.uploadedImage else payload.uploadedImageKey
    design_request = DesignRequest(
        **owner_fields(context),
        status=DesignRequestStatus.GENERATING,
        design_type=DesignType(payload.designType),
        space_type=payload.spaceType,
        description=payload.description or "",
        uploaded_image_url=image_url,
        uploaded_image_key=image_key,
        city=payload.location.city,
        state=payload.location.state,
        country=payload.location.country,
        postal_code=payload.location.postalCode or payload.location.zip,
        budget=Decimal(str(payload.budget)),
        currency=payload.currency,
        style=payload.style,
        mood=payload.mood,
        color_preferences=payload.colorPreferences,
        timeline=payload.timeline,
        selected_items=[item.model_dump() for item in payload.selectedItems],
        extra_notes=payload.extraNotes,
        free_generation_applied=bool(entitlement["free_generation_applied"]),
        payment_id=entitlement["payment_id"],
    )
    db.add(design_request)
    db.commit()
    db.refresh(design_request)

    ai_log = AIGenerationLog(
        design_request_id=design_request.id,
        status=AIGenerationStatus.STARTED,
        model_text=settings.openai_model_text,
        model_image=settings.openai_model_image,
        raw_request_summary={
            "designType": payload.designType,
            "spaceType": payload.spaceType,
            "style": payload.style,
            "budget": payload.budget,
            "currency": payload.currency,
            "city": payload.location.city,
            "country": payload.location.country,
            "selectedItemsCount": len(payload.selectedItems),
        },
    )
    db.add(ai_log)
    db.commit()
    db.refresh(ai_log)

    try:
        product_input = ProductsSearchIn(
            location=payload.location,
            selectedItems=payload.selectedItems,
            budget=payload.budget,
            style=payload.style,
            designType=payload.designType,
            spaceType=payload.spaceType,
        )
        matches = search_matching_products(db, product_input)
        concepts = generate_design_concepts(payload, matches["products"])
        if len(concepts) < 2:
            raise ApiError("AI_GENERATION_FAILED", "The AI generator returned too few valid concepts.", 502)

        for index, concept in enumerate(concepts, start=1):
            generated = GeneratedDesign(
                design_request_id=design_request.id,
                title=concept["title"],
                description=concept["description"],
                style=concept["style"],
                mood=concept.get("mood"),
                preview_image_url=concept.get("previewImageUrl"),
                ai_image_prompt=concept.get("imagePrompt"),
                ai_text_response=concept.get("rawAiResponse", {}),
                estimated_total=Decimal(str(concept["estimatedTotal"])),
                currency=payload.currency,
                budget_status=BudgetStatus(concept["budgetStatus"]),
                design_notes=concept["designNotes"],
                rank=index,
            )
            db.add(generated)
            db.flush()
            for product in concept["recommendedProducts"]:
                db.add(
                    GeneratedDesignProduct(
                        generated_design_id=generated.id,
                        product_id=product.get("id") or product.get("productId"),
                        name=product["name"],
                        category=product["category"],
                        description=product["description"],
                        price=Decimal(str(product["price"])),
                        currency=product["currency"],
                        quantity=product["quantity"],
                        image_url=product.get("imageUrl"),
                        source="product_database",
                        availability_status=product["availabilityStatus"],
                        location_label=product["locationLabel"],
                        included_by_default=True,
                    )
                )

        design_request.status = DesignRequestStatus.COMPLETED
        if entitlement["payment_id"]:
            payment = db.get(Payment, entitlement["payment_id"])
            if payment:
                payment.design_request_id = design_request.id
        consume_successful_generation(
            db,
            context,
            free_generation_applied=bool(entitlement["free_generation_applied"]),
            paid=bool(entitlement["payment_id"]),
        )
        ai_log.status = AIGenerationStatus.COMPLETED
        ai_log.raw_response_summary = {"conceptCount": len(concepts)}
        ai_log.error_code = None
        ai_log.error_message = None
        db.commit()
    except Exception as exc:
        db.rollback()
        failed = db.get(DesignRequest, design_request.id)
        failed_log = db.get(AIGenerationLog, ai_log.id)
        if failed:
            failed.status = DesignRequestStatus.FAILED
            failed.error_message = str(exc)[:1000]
        if failed_log:
            failed_log.status = AIGenerationStatus.FAILED
            failed_log.error_code = exc.code if isinstance(exc, ApiError) else "AI_GENERATION_FAILED"
            failed_log.error_message = str(exc)[:1000]
            db.commit()
        raise

    completed = (
        db.query(DesignRequest)
        .options(joinedload(DesignRequest.generated_designs).joinedload(GeneratedDesign.products))
        .filter(DesignRequest.id == design_request.id)
        .one()
    )
    
    spawn_image_worker(completed.id)
    
    return success(
        {
            "designRequestId": completed.id,
            "freeGenerationApplied": completed.free_generation_applied,
            "remainingFreeGenerations": 0,
            "paymentRequired": False,
            "designs": [generated_design_to_client(design) for design in sorted(completed.generated_designs, key=lambda d: d.rank)],
        }
    )


@router.get("/{design_request_id}/images-status")
def get_images_status(
    design_request_id: str,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    req = db.query(DesignRequest).filter(DesignRequest.id == design_request_id).first()
    if not req:
        raise ApiError("NOT_FOUND", "Design request not found", 404)
        
    assert_owns_design_request(db, context, req.id)
    
    return success({
        "imageGenerationStatus": req.image_generation_status,
        "designs": [{"id": d.id, "previewImageUrl": d.preview_image_url} for d in req.generated_designs]
    })


@router.get("/{design_request_id}/status")
def design_status(
    design_request_id: str,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    design_request = (
        db.query(DesignRequest)
        .options(joinedload(DesignRequest.generated_designs).joinedload(GeneratedDesign.products))
        .filter(DesignRequest.id == design_request_id)
        .one_or_none()
    )
    if not design_request:
        raise ApiError("NOT_FOUND", "Design request not found.", status.HTTP_404_NOT_FOUND)
    is_owner = False
    if context.user_id and design_request.user_id == context.user_id:
        is_owner = True
    if design_request.anonymous_session_id == context.anonymous_session.id:
        is_owner = True
    if not is_owner:
        raise ApiError("FORBIDDEN", "You do not have access to this design request.", status.HTTP_403_FORBIDDEN)
    data = design_request_to_client(design_request)
    data["progressMessage"] = {
        DesignRequestStatus.GENERATING: "Creating design concepts...",
        DesignRequestStatus.COMPLETED: "Designs are ready.",
        DesignRequestStatus.FAILED: "Design generation failed.",
    }.get(design_request.status, "Design request received.")
    return success(data)


@router.post("/select")
async def select_design(
    payload: SelectDesignIn,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    design_request = assert_owns_design_request(
        db,
        context,
        payload.designRequestId,
        allow_current_anonymous=True,
    )
    generated = (
        db.query(GeneratedDesign)
        .options(joinedload(GeneratedDesign.products), joinedload(GeneratedDesign.design_request))
        .filter(GeneratedDesign.id == payload.generatedDesignId)
        .one_or_none()
    )
    if not generated or generated.design_request_id != payload.designRequestId:
        raise ApiError("NOT_FOUND", "Generated design not found for this request.", status.HTTP_404_NOT_FOUND)
    if generated.design_request_id != design_request.id:
        raise ApiError("FORBIDDEN", "You do not have access to this design request.", status.HTTP_403_FORBIDDEN)
    if design_request.selected_design is not None:
        raise ApiError("CONFLICT", "A design has already been selected for this request.", status.HTTP_409_CONFLICT)

    ids = {
        value
        for product in payload.selectedProducts
        for value in [product.id, product.generatedDesignProductId, product.productId]
        if value
    }
    selected_products = [
        product
        for product in generated.products
        if not ids or product.id in ids or (product.product_id and product.product_id in ids)
    ]
    total = sum(float(product.price) * product.quantity for product in selected_products)
    selected_json = [
        {
            "generatedDesignProductId": product.id,
            "productId": product.product_id,
            "name": product.name,
            "category": product.category,
            "price": float(product.price),
            "currency": product.currency,
            "quantity": product.quantity,
            "imageUrl": product.image_url,
            "locationLabel": product.location_label,
            "availabilityStatus": product.availability_status,
        }
        for product in selected_products
    ]
    from app.models.entities import SelectedDesign, SelectedDesignStatus

    selected = SelectedDesign(
        design_request_id=payload.designRequestId,
        generated_design_id=payload.generatedDesignId,
        **owner_fields(context),
        customer_name=payload.customerName,
        customer_email=str(payload.customerEmail),
        customer_phone=payload.customerPhone,
        preferred_contact_time=payload.preferredContactTime,
        final_estimated_total=Decimal(str(total)),
        selected_products=selected_json,
        notes=payload.notes,
        status=SelectedDesignStatus.NEW,
    )
    db.add(selected)
    design_request.status = DesignRequestStatus.SELECTED
    db.commit()
    db.refresh(selected)

    text = f"Selected design {selected.id}\nCustomer: {selected.customer_name} <{selected.customer_email}>\nTotal: {generated.currency} {total:.2f}"
    await notify_admin("New Auralis selected design", text)
    await send_email(selected.customer_email, "We received your Auralis design selection", "The Auralis team will contact you to finalize details.")
    return success({"selectedDesignId": selected.id, "referenceId": selected.id, "finalEstimatedTotal": total, "message": "Your design selection has been received."})
