from __future__ import annotations

import json
from typing import Any

from openai import OpenAI

from app.core.config import settings
from app.schemas.api import AiDesignResponse, DesignGenerationIn
from app.services.ai.prompts import repair_prompt, system_prompt, user_prompt
from app.services.products.matching import ProductCandidate, candidate_to_dict
from app.utils.responses import ApiError


def _budget_status(total: float, budget: float) -> str:
    if total <= budget:
        return "WITHIN_BUDGET"
    if total <= budget * 1.2:
        return "SLIGHTLY_ABOVE_BUDGET"
    return "PREMIUM_OPTION"


def _preview(seed: str) -> str:
    return f"https://picsum.photos/seed/{seed.replace(' ', '-')}/900/600"


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


def _call_openai(prompt: str) -> str | None:
    if not settings.openai_api_key:
        return None
    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_model_text,
        messages=[{"role": "system", "content": system_prompt()}, {"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    return response.choices[0].message.content


def generate_design_concepts(input_data: DesignGenerationIn, candidates: list[ProductCandidate]) -> list[dict[str, Any]]:
    if not settings.openai_api_key:
        return _fallback(input_data, candidates)
    payload = {
        "brief": input_data.model_dump(mode="json"),
        "productCandidates": [candidate_to_dict(candidate) for candidate in candidates],
    }
    try:
        raw = _call_openai(user_prompt(payload))
        if raw:
            try:
                parsed = AiDesignResponse.model_validate(json.loads(raw))
                normalized = _normalize(parsed, input_data, candidates)
                if len(normalized) >= 3:
                    return normalized
            except Exception:
                repaired = _call_openai(repair_prompt(raw))
                if repaired:
                    parsed = AiDesignResponse.model_validate(json.loads(repaired))
                    normalized = _normalize(parsed, input_data, candidates)
                    if len(normalized) >= 3:
                        return normalized
        return _fallback(input_data, candidates)
    except Exception as exc:
        raise ApiError("AI_GENERATION_FAILED", "The AI design generator could not complete this request.", 502) from exc
