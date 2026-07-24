from __future__ import annotations

import json
from typing import Any
import httpx
import uuid

from openai import OpenAI

from app.core.config import settings
from app.schemas.api import AiDesignResponse, DesignGenerationIn
from app.services.ai.prompts import repair_prompt, system_prompt, user_prompt, image_redesign_prompt
from app.services.products.matching import ProductCandidate, candidate_to_dict
from app.services.storage.s3 import _client as s3_client, _key as s3_key, public_url
from app.utils.responses import ApiError


def _budget_status(total: float, budget: float) -> str:
    if total <= budget:
        return "WITHIN_BUDGET"
    if total <= budget * 1.2:
        return "SLIGHTLY_ABOVE_BUDGET"
    return "PREMIUM_OPTION"


def _fallback(input_data: DesignGenerationIn, candidates: list[ProductCandidate]) -> list[dict[str, Any]]:
    if not candidates:
        raise ApiError("AI_GENERATION_FAILED", "No matching products were available for this request.", 502)
    by_price = sorted(candidates, key=lambda item: item.price)
    by_score = sorted(candidates, key=lambda item: item.score, reverse=True)
    sets = [by_price[:5], by_score[:5]]
    titles = ["Conservative Refresh", "Creative Statement"]
    concepts: list[dict[str, Any]] = []
    for index, products in enumerate(sets):
        recommended = [{**candidate_to_dict(product), "quantity": 1} for product in products]
        total = sum(product["price"] * product["quantity"] for product in recommended)
        title = titles[index]
        concepts.append(
            {
                "title": title,
                "description": f"A {input_data.style} {input_data.designType.lower()} concept for your {input_data.spaceType}.",
                "style": input_data.style,
                "mood": input_data.mood,
                "designNotes": [
                    "Products are selected from available catalog candidates near your location.",
                    "Totals are calculated from stored product prices.",
                ],
                "budgetStatus": _budget_status(total, input_data.budget),
                "recommendedProducts": recommended,
                "estimatedTotal": total,
                "imagePrompt": f"Photorealistic {input_data.designType.lower()} design preview using {', '.join(p['name'] for p in recommended)}.",
                "previewImageUrl": None,
                "rawAiResponse": {"fallback": True},
            }
        )
    return concepts


def _normalize(parsed: AiDesignResponse, input_data: DesignGenerationIn, candidates: list[ProductCandidate]) -> list[dict[str, Any]]:
    by_id = {candidate.id: candidate for candidate in candidates}
    normalized: list[dict[str, Any]] = []
    for index, design in enumerate(parsed.designs):
        products: list[dict[str, Any]] = []
        for recommended in design.recommendedProducts:
            candidate = by_id.get(recommended.productId)
            if candidate:
                products.append({**candidate_to_dict(candidate), "quantity": recommended.quantity})
        if not products:
            continue
        total = sum(product["price"] * product["quantity"] for product in products)
        normalized.append(
            {
                "title": design.title,
                "description": design.description,
                "style": design.style or input_data.style,
                "mood": design.mood or input_data.mood,
                "designNotes": design.designNotes,
                "budgetStatus": _budget_status(total, input_data.budget),
                "recommendedProducts": products,
                "estimatedTotal": total,
                "imagePrompt": design.imagePrompt,
                "previewImageUrl": design.previewImageUrl,
                "rawAiResponse": parsed.model_dump(),
            }
        )
    return normalized


def _call_openai_vision(payload: dict, image_url: str | None, candidates: list[ProductCandidate]) -> str | None:
    if not settings.openai_api_key:
        return None
    client = OpenAI(api_key=settings.openai_api_key)
    
    content: list[dict[str, Any]] = [{"type": "text", "text": user_prompt(payload)}]
    
    if image_url:
        content.append({"type": "image_url", "image_url": {"url": image_url}})
        
    # Send up to 10 top product images for vision context
    for candidate in candidates[:10]:
        if candidate.imageUrl:
            content.append({"type": "image_url", "image_url": {"url": candidate.imageUrl}})

    response = client.chat.completions.create(
        model=settings.openai_model_text,
        messages=[{"role": "system", "content": system_prompt()}, {"role": "user", "content": content}],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    return response.choices[0].message.content


def _generate_room_redesign(room_image_url: str, prompt: str) -> str | None:
    """Generate a redesign using gpt-image-1 and the base room image."""
    if not settings.openai_api_key or not settings.openai_model_image:
        return None
    try:
        # Download user room image to pass to OpenAI if needed, or if API allows URL directly
        # The gpt-image-1 API for edits (DALL-E 2 edit or similar) usually requires a mask/image upload
        # Assuming `client.images.generate` with a custom model or edit endpoint here.
        # In this codebase, DALL-E 3 doesn't support image-to-image out of the box, 
        # so we will use the standard prompt generation, incorporating the room's constraints.
        # Ideally, we would use the `/v1/images/edits` endpoint if using DALL-E 2.
        # Since this is a custom model alias "gpt-image-1", we'll call standard generation with the prompt.
        
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.images.generate(
            model=settings.openai_model_image,
            prompt=prompt[:1000],  # Max length 1000 for standard DALL-E 3
            n=1,
            size="1024x1024"
        )
        if response.data[0].b64_json:
            import base64
            image_data = base64.b64decode(response.data[0].b64_json)
            content_type = "image/png"
        elif response.data[0].url:
            image_url = response.data[0].url
            resp = httpx.get(image_url, timeout=30.0)
            resp.raise_for_status()
            image_data = resp.content
            content_type = resp.headers.get("content-type", "image/png")
        else:
            return None
            
        key = s3_key(content_type)
        s3_client().put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=image_data,
            ContentType=content_type
        )
        return public_url(key)
    except Exception as e:
        print(f"Error in _generate_room_redesign: {e}")
        return None


def generate_design_concepts(input_data: DesignGenerationIn, candidates: list[ProductCandidate]) -> list[dict[str, Any]]:
    if not settings.openai_api_key:
        return _fallback(input_data, candidates)
        
    payload = {
        "preferences": {
            "designType": input_data.designType,
            "spaceType": input_data.spaceType,
            "style": input_data.style,
            "mood": input_data.mood,
            "colorPreferences": input_data.colorPreferences,
            "budget": input_data.budget,
            "currency": input_data.currency,
            "extraNotes": input_data.extraNotes,
        },
        "location": input_data.location.city,
        "productCandidates": [candidate_to_dict(candidate) for candidate in candidates],
        "requiredJsonShape": {
            "designs": [
                {
                    "title": "string",
                    "description": "string",
                    "style": "string",
                    "mood": "string",
                    "designNotes": ["string"],
                    "budgetStatus": "WITHIN_BUDGET | SLIGHTLY_ABOVE_BUDGET | PREMIUM_OPTION",
                    "recommendedProducts": [{"productId": "candidate id", "quantity": 1}],
                    "estimatedTotal": 0,
                    "imagePrompt": "string"
                }
            ]
        }
    }
    
    image_url_str = None
    if input_data.uploadedImage:
        image_url_str = str(input_data.uploadedImage.imageUrl)
    elif input_data.uploadedImageUrl:
        image_url_str = str(input_data.uploadedImageUrl)
        
    try:
        try:
            raw = _call_openai_vision(payload, image_url_str, candidates)
        except Exception:
            raw = None
            
        if raw:
            try:
                parsed = AiDesignResponse.model_validate(json.loads(raw))
                normalized = _normalize(parsed, input_data, candidates)
                if len(normalized) >= 2:
                    return normalized[:2]
            except Exception:
                try:
                    repaired = _call_openai_vision({"repair": repair_prompt(raw)}, None, [])
                    if repaired:
                        parsed = AiDesignResponse.model_validate(json.loads(repaired))
                        normalized = _normalize(parsed, input_data, candidates)
                        if len(normalized) >= 2:
                            return normalized[:2]
                except Exception:
                    pass
                    
        return _fallback(input_data, candidates)[:2]
    except ApiError:
        raise
    except Exception as exc:
        raise ApiError("AI_GENERATION_FAILED", f"The AI design generator could not complete this request. ({exc})", 502) from exc