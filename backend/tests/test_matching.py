from __future__ import annotations

from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.entities import Product, StockStatus
from app.schemas.api import ProductsSearchIn
from app.services.products.matching import search_matching_products


def _product(
    *,
    slug: str,
    item_type: str,
    city: str,
    state: str,
    country: str,
    stock_status: StockStatus,
    design_types: list[str],
    room_types: list[str],
    style_tags: list[str],
):
    return Product(
        name=slug.replace("-", " ").title(),
        slug=slug,
        category="furniture",
        subcategory="Sofa",
        description="Test product",
        price=Decimal("1200"),
        currency="USD",
        image_url="https://example.com/product.jpg",
        style_tags=style_tags,
        item_type=item_type,
        room_types=room_types,
        design_types=design_types,
        city=city,
        state=state,
        country=country,
        postal_code=None,
        stock_status=stock_status,
        vendor_name="Vendor",
        vendor_url=None,
    )


def test_product_matching_groups_results_by_selected_item(db_session: Session):
    db_session.add_all(
        [
            _product(
                slug="sofa-san-francisco",
                item_type="sofa",
                city="San Francisco",
                state="CA",
                country="US",
                stock_status=StockStatus.IN_STOCK,
                design_types=["interior"],
                room_types=["living-room"],
                style_tags=["modern"],
            ),
            _product(
                slug="sofa-los-angeles",
                item_type="sofa",
                city="Los Angeles",
                state="CA",
                country="US",
                stock_status=StockStatus.LIMITED,
                design_types=["interior"],
                room_types=["living-room"],
                style_tags=["modern"],
            ),
            _product(
                slug="outdoor-seating-sf",
                item_type="outdoor-seating",
                city="San Francisco",
                state="CA",
                country="US",
                stock_status=StockStatus.IN_STOCK,
                design_types=["exterior"],
                room_types=["garden"],
                style_tags=["modern"],
            ),
        ]
    )
    db_session.commit()

    payload = ProductsSearchIn(
        location={"city": "Noida", "state": "UP", "country": "IN"},
        selectedItems=[{"id": "sofa", "label": "Sofa", "category": "furniture"}],
        budget=5000,
        style="modern",
        designType="INTERIOR",
        spaceType="living-room",
    )

    result = search_matching_products(db_session, payload)

    assert result["products"]
    assert "sofa" in result["groupedByItemType"]
    assert result["groupedByItemType"]["sofa"]
    assert all("interior" in p["designTypes"] for p in result["groupedByItemType"]["sofa"])
