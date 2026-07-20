from __future__ import annotations

import re
from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.entities import Product, StockStatus
from app.schemas.api import ProductsSearchIn, SelectedItemIn


@dataclass
class ProductCandidate:
    id: str
    name: str
    category: str
    subcategory: str | None
    description: str
    price: float
    currency: str
    imageUrl: str
    itemType: str
    stockStatus: str
    availabilityStatus: str
    locationLabel: str
    styleTags: list[str]
    roomTypes: list[str]
    designTypes: list[str]
    score: int


ALIASES = {"rug": "rugs-carpets", "rugs": "rugs-carpets", "carpet": "rugs-carpets"}


def slugify(value: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower())).strip("-")


def normalize_item_type(item: SelectedItemIn) -> str:
    raw = item.itemType or item.id or item.label or ""
    slug = slugify(raw)
    return ALIASES.get(slug, slug)


def _lower(values: list[str]) -> set[str]:
    return {v.lower() for v in values}


def _location_score(product: Product, input_data: ProductsSearchIn) -> int:
    city = input_data.location.city.lower()
    country = input_data.location.country.lower()
    if product.city.lower() == city and product.country.lower() == country:
        return 35
    if input_data.location.state and product.state and product.state.lower() == input_data.location.state.lower():
        return 25
    if product.country.lower() == country:
        return 15
    return 0


def _score(product: Product, input_data: ProductsSearchIn, selected: set[str]) -> int:
    score = 0
    if product.item_type.lower() in selected:
        score += 50
    if input_data.designType.lower() in _lower(product.design_types):
        score += 30
    if input_data.spaceType.lower() in _lower(product.room_types):
        score += 20
    if input_data.style and input_data.style.lower() in _lower(product.style_tags):
        score += 15
    score += _location_score(product, input_data)
    if product.stock_status == StockStatus.IN_STOCK:
        score += 20
    elif product.stock_status == StockStatus.LIMITED:
        score += 10
    else:
        score -= 20
    price = float(product.price or Decimal("0"))
    per_item_budget = input_data.budget / max(len(selected), 1)
    if price <= per_item_budget:
        score += 12
    elif price <= per_item_budget * 1.35:
        score += 5
    else:
        score -= 5
    return score


def _candidate(product: Product, input_data: ProductsSearchIn, score: int) -> ProductCandidate:
    city_match = (
        product.city.lower() == input_data.location.city.lower()
        and product.country.lower() == input_data.location.country.lower()
    )
    state_match = bool(
        product.state
        and input_data.location.state
        and product.state.lower() == input_data.location.state.lower()
    )
    label = (
        f"{product.city}, {product.state or product.country}"
        if city_match
        else f"{product.state}, {product.country}" if state_match else product.country
    )
    return ProductCandidate(
        id=product.id,
        name=product.name,
        category=product.category,
        subcategory=product.subcategory,
        description=product.description,
        price=float(product.price),
        currency=product.currency,
        imageUrl=product.image_url,
        itemType=product.item_type,
        stockStatus=product.stock_status.value,
        availabilityStatus=product.stock_status.value.replace("_", " "),
        locationLabel=label,
        styleTags=product.style_tags,
        roomTypes=product.room_types,
        designTypes=product.design_types,
        score=score,
    )


def candidate_to_dict(candidate: ProductCandidate) -> dict:
    return candidate.__dict__ | {
        "image": candidate.imageUrl,
        "quantity": 1,
        "locationAvailability": candidate.stockStatus != StockStatus.OUT_OF_STOCK.value,
    }


def search_matching_products(db: Session, input_data: ProductsSearchIn, per_item_limit: int = 6) -> dict:
    selected = {normalize_item_type(item) for item in input_data.selectedItems}
    products = (
        db.query(Product)
        .filter(
            or_(
                Product.country.ilike(input_data.location.country),
                Product.item_type.in_(list(selected)),
            ),
            Product.archived_at.is_(None),
        )
        .limit(250)
        .all()
    )
    scored = [
        (_score(product, input_data, selected), product)
        for product in products
        if input_data.designType.lower() in _lower(product.design_types)
    ]
    candidates = [
        _candidate(product, input_data, score)
        for score, product in sorted(scored, key=lambda pair: pair[0], reverse=True)
        if score > 0
    ]
    grouped: dict[str, list[ProductCandidate]] = {}
    for item_type in selected:
        exact = [candidate for candidate in candidates if candidate.itemType == item_type]
        fallback = [candidate for candidate in candidates if candidate.stockStatus != StockStatus.OUT_OF_STOCK.value]
        grouped[item_type] = (exact or fallback)[:per_item_limit]
    flattened: list[ProductCandidate] = []
    seen: set[str] = set()
    for candidate in [candidate for group in grouped.values() for candidate in group]:
        if candidate.id not in seen:
            flattened.append(candidate)
            seen.add(candidate.id)
    return {
        "products": flattened[:40],
        "groupedByItemType": {key: [candidate_to_dict(c) for c in value] for key, value in grouped.items()},
    }
