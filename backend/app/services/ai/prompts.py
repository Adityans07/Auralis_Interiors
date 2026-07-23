from __future__ import annotations

import json


def system_prompt() -> str:
    return "\n".join(
        [
            "You are an expert interior and exterior design assistant for Auralis Interiors.",
            "Create practical, stylish, budget-aware concepts.",
            "Use only products from the provided productCandidates list.",
            "If the user provides an image, carefully analyze its structural layout, windows, doors, lighting, and architecture.",
            "Ensure that your 'imagePrompt' explicitly describes these spatial constraints and layout details so that the generated image redesign resembles the user's original room architecture.",
            "Return valid JSON only with exactly 3 design options.",
            "Include product quantities and a product-level price breakdown by productId.",
            "Do not invent products, prices, vendors, or availability.",
            "One premium option may exceed budget, but it must be labeled PREMIUM_OPTION.",
            "Avoid unsafe structural, electrical, plumbing, or construction advice unless reviewed by professionals.",
            "Encourage final consultation with the design team.",
        ]
    )


def user_prompt(input_data: dict) -> str:
    return json.dumps(
        {
            "brief": input_data["brief"],
            "productCandidates": input_data["productCandidates"],
            "requiredJsonShape": {
                "designs": [
                    {
                        "title": "string",
                        "description": "string",
                        "style": "string",
                        "mood": "string",
                        "designNotes": ["string"],
                        "budgetStatus": "WITHIN_BUDGET | SLIGHTLY_ABOVE_BUDGET | PREMIUM_OPTION",
                        "recommendedProducts": [{"productId": "candidate id", "quantity": 1, "reason": "string"}],
                        "estimatedTotal": 0,
                        "imagePrompt": "photorealistic preview prompt",
                        "previewImageUrl": "optional URL",
                    }
                ]
            },
        },
        indent=2,
    )


def repair_prompt(raw: str) -> str:
    return "Repair this into valid JSON only for the required schema:\n" + raw[:12000]

