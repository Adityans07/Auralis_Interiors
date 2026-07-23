from __future__ import annotations

import json
from typing import Any
import httpx

from openai import OpenAI

from app.core.config import settings
from app.schemas.api import AiDesignResponse, DesignGenerationIn
from app.services.ai.prompts import repair_prompt, system_prompt, user_prompt
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
    premium = sorted(candidates, key=lambda item: item.price, reverse=True)
    sets = [by_price[:5], by_score[:5], premium[:5]]
    titles = ["Budget Smart Refresh", "Balanced Signature Scheme", "Premium Statement Concept"]
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
                    "Final construction or electrical decisions should be reviewed with the Auralis team.",
                ],
                "budgetStatus": _budget_status(total, input_data.budget),
                "recommendedProducts": recommended,
                "estimatedTotal": total,
                "imagePrompt": f"Photorealistic {input_data.designType.lower()} design preview using {', '.join(p['name'] for p in recommended)}.",
                "previewImageUrl": _preview(f"{title}-{input_data.spaceType}-{input_data.style}"),
                "rawAiResponse": {"fallback": True},
            }
        )
    return concepts


def _preview(seed: str) -> str:
    return f"https://picsum.photos/seed/{seed.replace(' ', '-')}/900/600"


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
                "previewImageUrl": design.previewImageUrl or _preview(f"{design.title}-{index}"),
                "rawAiResponse": parsed.model_dump(),
            }
        )
    return normalized


def _call_openai(prompt: str, image_url: str | None = None) -> str | None:
    if not settings.openai_api_key:
        return None
    client = OpenAI(api_key=settings.openai_api_key)
    
    user_content: str | list[dict[str, Any]] = prompt
    if image_url:
        user_content = [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": image_url}}
        ]
        
    response = client.chat.completions.create(
        model=settings.openai_model_text,
        messages=[{"role": "system", "content": system_prompt()}, {"role": "user", "content": user_content}],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    return response.choices[0].message.content


def _generate_and_upload_image(prompt: str) -> str | None:
    """Generate an image using OpenAI's DALL·E model and upload it to S3.
    Returns the public URL of the uploaded image, or None if failed.
    """
    if not settings.openai_api_key or not settings.openai_model_image:
        return None
    try:
        client = OpenAI(api_key=settings.openai_api_key)
        # Using the OpenAI API to generate an image
        response = client.images.generate(
            model=settings.openai_model_image,
            prompt=prompt,
            n=1,
            size="1024x1024",  # Adjust as needed based on your model and requirements
        )
        # The response contains a URL to the image (temporary)
        image_url = response.data[0].url
        if not image_url:
            return None
        # Download the image
        resp = httpx.get(image_url, timeout=30.0)
        resp.raise_for_status()
        image_data = resp.content
        content_type = resp.headers.get("content-type", "image/png")
        # Upload to S3
        key = s3_key(content_type)
        s3_client().put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=image_data,
            ContentType=content_type
        )
        return public_url(key)
    except Exception as _:
        # Log the error? For now, just return None to fall back
        # You can add logging here if you have a logger configured
        return None


def generate_design_concepts(input_data: DesignGenerationIn, candidates: list[ProductCandidate]) -> list[dict[str, Any]]:
    if not settings.openai_api_key:
        return _fallback(input_data, candidates)
    payload = {
        "brief": input_data.model_dump(mode="json"),
        "productCandidates": [candidate_to_dict(candidate) for candidate in candidates],
    }
    
    image_url_str = None
    if input_data.uploadedImage:
        image_url_str = str(input_data.uploadedImage.imageUrl)
    elif input_data.uploadedImageUrl:
        image_url_str = str(input_data.uploadedImageUrl)
        
    try:
        raw = _call_openai(user_prompt(payload), image_url=image_url_str)
        if raw:
            try:
                parsed = AiDesignResponse.model_validate(json.loads(raw))
                normalized = _normalize(parsed, input_data, candidates)
                if len(normalized) >= 3:
                    # Generate images for each concept if image model is configured
                    if settings.openai_api_key and settings.openai_model_image:
                        for concept in normalized:
                            prompt = concept.get("imagePrompt", "")
                            if not prompt:
                                # Fallback to a combination of title and description if no imagePrompt
                                prompt = f"{concept.get('title', '')} {concept.get('description', '')}"
                            image_url = _generate_and_upload_image(prompt)
                            if image_url:
                                concept["previewImageUrl"] = image_url
                    return normalized
            except Exception:
                repaired = _call_openai(repair_prompt(raw))
                if repaired:
                    parsed = AiDesignResponse.model_validate(json.loads(repaired))
                    normalized = _normalize(parsed, input_data, candidates)
                    if len(normalized) >= 3:
                        # Generate images for each concept if image model is configured
                        if settings.openai_api_key and settings.openai_model_image:
                            for concept in normalized:
                                prompt = concept.get("imagePrompt", "")
                                if not prompt:
                                    # Fallback to a combination of title and description if no imagePrompt
                                    prompt = f"{concept.get('title', '')} {concept.get('description', '')}"
                                image_url = _generate_and_upload_image(prompt)
                                if image_url:
                                    concept["previewImageUrl"] = image_url
                        return normalized
        # If we get here, fall back to the fallback method
        fallback_result = _fallback(input_data, candidates)
        # Generate images for each fallback concept if image model is configured
        if settings.openai_api_key and settings.openai_model_image:
            for concept in fallback_result:
                prompt = concept.get("imagePrompt", "")
                if not prompt:
                    # Fallback to a combination of title and description if no imagePrompt
                    prompt = f"{concept.get('title', '')} {concept.get('description', '')}"
                image_url = _generate_and_upload_image(prompt)
                if image_url:
                    concept["previewImageUrl"] = image_url
        return fallback_result
    except Exception as exc:
        raise ApiError("AI_GENERATION_FAILED", "The AI design generator could not complete this request.", 502) from exc