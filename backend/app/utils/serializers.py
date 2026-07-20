from __future__ import annotations

from app.models.entities import DesignRequest, GeneratedDesign, GeneratedDesignProduct, Product


def budget_status_client(value: str) -> str:
    return {
        "WITHIN_BUDGET": "within-budget",
        "SLIGHTLY_ABOVE_BUDGET": "slightly-above",
        "PREMIUM_OPTION": "premium-option",
    }.get(value, "premium-option")


def product_to_client(product: Product) -> dict:
    return {
        "id": product.id,
        "name": product.name,
        "category": product.category,
        "subcategory": product.subcategory,
        "description": product.description,
        "price": float(product.price),
        "currency": product.currency,
        "imageUrl": product.image_url,
        "image": product.image_url,
        "itemType": product.item_type,
        "styleTags": product.style_tags,
        "roomTypes": product.room_types,
        "designTypes": product.design_types,
        "city": product.city,
        "state": product.state,
        "country": product.country,
        "stockStatus": product.stock_status.value,
        "quantity": 1,
        "locationAvailability": product.stock_status.value != "OUT_OF_STOCK",
    }


def generated_product_to_client(product: GeneratedDesignProduct) -> dict:
    return {
        "id": product.id,
        "generatedDesignProductId": product.id,
        "productId": product.product_id,
        "name": product.name,
        "category": product.category,
        "description": product.description,
        "price": float(product.price),
        "currency": product.currency,
        "quantity": product.quantity,
        "imageUrl": product.image_url,
        "image": product.image_url or "",
        "source": product.source,
        "availabilityStatus": product.availability_status,
        "locationLabel": product.location_label,
        "includedByDefault": product.included_by_default,
        "included": product.included_by_default,
        "locationAvailability": product.availability_status != "OUT OF STOCK",
    }


def generated_design_to_client(design: GeneratedDesign) -> dict:
    return {
        "id": design.id,
        "designRequestId": design.design_request_id,
        "title": design.title,
        "description": design.description,
        "style": design.style,
        "mood": design.mood,
        "previewImageUrl": design.preview_image_url,
        "previewImage": design.preview_image_url or "",
        "aiImagePrompt": design.ai_image_prompt,
        "estimatedTotal": float(design.estimated_total),
        "currency": design.currency,
        "budgetStatus": budget_status_client(design.budget_status.value),
        "designNotes": design.design_notes,
        "products": [generated_product_to_client(product) for product in sorted(design.products, key=lambda p: p.created_at)],
    }


def design_request_to_client(request: DesignRequest) -> dict:
    return {
        "id": request.id,
        "status": request.status.value,
        "designType": request.design_type.value.lower(),
        "spaceType": request.space_type,
        "description": request.description,
        "uploadedImageUrl": request.uploaded_image_url,
        "city": request.city,
        "state": request.state,
        "country": request.country,
        "postalCode": request.postal_code,
        "budget": float(request.budget),
        "currency": request.currency,
        "style": request.style,
        "mood": request.mood,
        "freeGenerationApplied": request.free_generation_applied,
        "error": request.error_message,
        "designs": [generated_design_to_client(design) for design in sorted(request.generated_designs, key=lambda d: d.rank)],
    }
