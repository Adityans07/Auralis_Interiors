import os
import sys
import traceback
from sqlalchemy.orm import sessionmaker
from app.db.session import SessionLocal
from app.models.entities import AIGenerationLog, Product
from app.schemas.api import DesignGenerationIn, LocationIn, SelectedItemIn
from app.services.ai.generator import generate_design_concepts
from app.services.products.matching import search_matching_products, ProductsSearchIn

db = SessionLocal()
log = db.query(AIGenerationLog).order_by(AIGenerationLog.created_at.desc()).first()

print(f"Testing for Log ID: {log.id}")
print(f"Raw Summary: {log.raw_request_summary}")

payload = DesignGenerationIn(
    designType=log.raw_request_summary["designType"],
    spaceType=log.raw_request_summary["spaceType"],
    description="Test description",
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
print(f"Found {len(matches['products'])} matching products")

try:
    concepts = generate_design_concepts(payload, matches["products"])
    print(f"Success! Generated {len(concepts)} concepts")
except Exception as e:
    print("FAILED!")
    traceback.print_exc()
    if getattr(e, "__cause__", None):
        print("CAUSED BY:")
        traceback.print_exception(type(e.__cause__), e.__cause__, e.__cause__.__traceback__)
