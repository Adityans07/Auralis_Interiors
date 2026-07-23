import os
import sys
import traceback
from sqlalchemy.orm import sessionmaker
from app.db.session import SessionLocal
from app.models.entities import AIGenerationLog, Product, DesignRequest
from app.schemas.api import DesignGenerationIn, LocationIn, SelectedItemIn
from app.services.ai.generator import generate_design_concepts
from app.services.products.matching import search_matching_products, ProductsSearchIn

db = SessionLocal()
log = db.query(AIGenerationLog).order_by(AIGenerationLog.created_at.desc()).first()
req = db.get(DesignRequest, log.design_request_id)

payload = DesignGenerationIn(
    designType=log.raw_request_summary["designType"],
    spaceType=log.raw_request_summary["spaceType"],
    description="Test description",
    uploadedImageUrl=req.uploaded_image_url,
    location=LocationIn(
        city=log.raw_request_summary["city"],
        country=log.raw_request_summary["country"]
    ),
    budget=log.raw_request_summary["budget"],
    currency=log.raw_request_summary["currency"],
    style=log.raw_request_summary["style"],
    mood="cozy",
    colorPreferences="warm",
    selectedItems=[SelectedItemIn(id="sofa", label="Sofa", itemType="sofas")],
)

product_input = ProductsSearchIn(
    location=payload.location,
    selectedItems=payload.selectedItems,
    budget=payload.budget,
    style=payload.style,
    designType=payload.designType,
    spaceType=payload.spaceType,
)

matches = search_matching_products(db, product_input)
try:
    concepts = generate_design_concepts(payload, matches["products"])
    print(f"Success! Generated {len(concepts)} concepts")
except Exception as e:
    print(f"FAILED: {e}")
