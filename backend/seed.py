from __future__ import annotations

from datetime import datetime, timezone

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.entities import BlogPost, Product, StockStatus, User, UserRole, UserStatus, UserUsage
from app.security.passwords import hash_password
from app.utils.auth import normalize_email


def slugify(value: str) -> str:
    return value.lower().replace("/", "").replace(" ", "-").replace("--", "-")


PRODUCTS = [
    ("sofa", "Halden 3-Seater Sofa", "furniture", "Sofa", 1890, ["interior"], ["living-room", "commercial-space"], ["modern", "minimal", "scandinavian"], "San Francisco", "CA"),
    ("bed", "Nordic Upholstered King Bed", "furniture", "Bed", 1450, ["interior"], ["bedroom"], ["minimal", "japandi", "scandinavian"], "Los Angeles", "CA"),
    ("dining-table", "Aria Extendable Dining Table", "furniture", "Dining Table", 1120, ["interior"], ["dining-room", "kitchen"], ["modern", "traditional"], "New York", "NY"),
    ("coffee-table", "Marlow Travertine Coffee Table", "furniture", "Coffee Table", 640, ["interior"], ["living-room"], ["luxury", "modern", "contemporary"], "San Francisco", "CA"),
    ("study-table", "Portola Study Table", "furniture", "Study Table", 520, ["interior"], ["office", "bedroom"], ["industrial", "modern", "minimal"], "San Jose", "CA"),
    ("wardrobe", "Linea Modular Wardrobe", "furniture", "Wardrobe", 1780, ["interior"], ["bedroom"], ["minimal", "contemporary", "luxury"], "Los Angeles", "CA"),
    ("tv-unit", "Cove Floating TV Unit", "furniture", "TV Unit", 780, ["interior"], ["living-room"], ["modern", "japandi"], "New York", "NY"),
    ("bookshelf", "Atlas Open Bookshelf", "furniture", "Bookshelf", 410, ["interior"], ["office", "living-room"], ["industrial", "modern"], "San Francisco", "CA"),
    ("accent-chair", "Lyle Accent Chair", "furniture", "Accent Chair", 420, ["interior", "exterior"], ["living-room", "bedroom", "balcony"], ["modern", "luxury"], "San Francisco", "CA"),
    ("decor-flowers", "Seasonal Decor Flowers", "decor", "Decor Flowers", 95, ["interior"], ["living-room", "bedroom", "dining-room"], ["bohemian", "traditional", "cozy"], "San Francisco", "CA"),
    ("indoor-plants", "Sculptural Indoor Planter", "decor", "Indoor Plants", 150, ["interior"], ["living-room", "bedroom", "office"], ["natural", "minimal", "bohemian"], "Los Angeles", "CA"),
    ("wall-art", "Horizon Framed Art Set", "decor", "Wall Art", 280, ["interior"], ["living-room", "bedroom", "office"], ["modern", "contemporary"], "San Francisco", "CA"),
    ("mirrors", "Arcus Brass Mirror", "decor", "Mirrors", 310, ["interior"], ["living-room", "bedroom", "bathroom"], ["luxury", "traditional"], "New York", "NY"),
    ("vases", "Mira Stoneware Vase Pair", "decor", "Vases", 120, ["interior"], ["living-room", "dining-room", "bedroom"], ["japandi", "bohemian"], "San Francisco", "CA"),
    ("sculptures", "Abstract Marble Sculpture", "decor", "Sculptures", 240, ["interior"], ["living-room", "office"], ["luxury", "modern"], "Los Angeles", "CA"),
    ("curtains", "Sheer Linen Drapery", "decor", "Curtains", 320, ["interior"], ["living-room", "bedroom"], ["minimal", "scandinavian"], "San Francisco", "CA"),
    ("rugs-carpets", "Dune Hand-Knotted Rug", "decor", "Rugs / Carpets", 560, ["interior"], ["living-room", "bedroom", "dining-room"], ["minimal", "japandi", "luxury"], "New York", "NY"),
    ("ceiling-lights", "Orbit Pendant Ceiling Light", "lighting", "Ceiling Lights", 390, ["interior"], ["living-room", "dining-room", "kitchen"], ["modern", "luxury"], "San Francisco", "CA"),
    ("floor-lamps", "Arc Floor Lamp", "lighting", "Floor Lamps", 240, ["interior"], ["living-room", "bedroom", "office"], ["modern", "industrial"], "Los Angeles", "CA"),
    ("wall-lamps", "Ridge Ceramic Wall Lamp", "lighting", "Wall Lamps", 180, ["interior", "exterior"], ["bedroom", "bathroom", "house-exterior"], ["japandi", "traditional"], "New York", "NY"),
    ("table-lamps", "Pebble Table Lamp", "lighting", "Table Lamps", 130, ["interior"], ["bedroom", "living-room", "office"], ["cozy", "minimal"], "San Francisco", "CA"),
    ("outdoor-lights", "Lumen Outdoor Lights", "lighting", "Outdoor Lights", 210, ["exterior"], ["garden", "balcony", "house-exterior"], ["modern", "minimal"], "San Francisco", "CA"),
    ("outdoor-seating", "Terra Outdoor Lounge Set", "exterior", "Outdoor Seating", 1680, ["exterior"], ["balcony", "garden", "house-exterior"], ["modern", "natural"], "Los Angeles", "CA"),
    ("garden-plants", "Terracotta Garden Planters", "exterior", "Garden Plants", 260, ["exterior"], ["garden", "balcony", "house-exterior"], ["traditional", "bohemian", "natural"], "San Francisco", "CA"),
    ("patio-table", "Slate Patio Dining Table", "exterior", "Patio Table", 890, ["exterior"], ["garden", "balcony"], ["modern", "industrial"], "New York", "NY"),
    ("wall-cladding", "Linear Stone Wall Cladding", "exterior", "Wall Cladding", 1250, ["exterior"], ["house-exterior", "commercial-space"], ["modern", "luxury"], "Los Angeles", "CA"),
    ("exterior-paint", "Mineral Exterior Paint Set", "exterior", "Exterior Paint", 430, ["exterior"], ["house-exterior", "commercial-space"], ["minimal", "traditional", "modern"], "San Francisco", "CA"),
    ("pathway-lights", "Bronze Step Pathway Lights", "exterior", "Pathway Lights", 340, ["exterior"], ["garden", "house-exterior"], ["luxury", "traditional", "modern"], "New York", "NY"),
]


BLOGS = [
    ("how-ai-is-reshaping-interior-design", "How AI Is Reshaping Interior Design in 2026", "AI & Design"),
    ("designing-a-living-room-on-any-budget", "Designing a Living Room on Any Budget", "Budgeting"),
    ("exterior-makeovers-that-boost-curb-appeal", "5 Exterior Makeovers That Boost Curb Appeal", "Exterior"),
]


def main() -> None:
    db = SessionLocal()
    try:
        if settings.admin_email and settings.admin_password and settings.admin_name:
            admin_email = normalize_email(settings.admin_email)
            existing_admin = db.query(User).filter(User.email == admin_email).one_or_none()
            if existing_admin:
                if existing_admin.role != UserRole.ADMIN.value:
                    existing_admin.role = UserRole.ADMIN.value
                if existing_admin.status != UserStatus.ACTIVE.value:
                    existing_admin.status = UserStatus.ACTIVE.value
                if not existing_admin.name:
                    existing_admin.name = settings.admin_name
            else:
                print("ADMIN_EMAIL:", repr(settings.admin_email))
                print("ADMIN_NAME:", repr(settings.admin_name))
                print("ADMIN_PASSWORD:", repr(settings.admin_password))
                print("PASSWORD LENGTH:", len(settings.admin_password or ""))
                user = User(
                    name=settings.admin_name,
                    email=admin_email,
                    password_hash=hash_password(settings.admin_password),
                    role=UserRole.ADMIN.value,
                    status=UserStatus.ACTIVE.value,
                    email_verified_at=datetime.now(timezone.utc),
                )
                db.add(user)
                db.flush()
                db.add(UserUsage(user_id=user.id))

        for index, (item_type, name, category, subcategory, price, design_types, room_types, style_tags, city, state) in enumerate(PRODUCTS, start=1):
            slug = slugify(f"{name}-{city}")
            product = db.query(Product).filter(Product.slug == slug).one_or_none()
            data = {
                "name": name,
                "slug": slug,
                "category": category,
                "subcategory": subcategory,
                "description": f"Realistic catalog item for {subcategory.lower()} selection in Auralis design concepts.",
                "price": price,
                "currency": "USD",
                "image_url": f"https://picsum.photos/seed/{slug}/900/650",
                "brand": "Auralis Partner",
                "material": "Mixed materials",
                "color": "Neutral",
                "style_tags": style_tags,
                "item_type": item_type,
                "room_types": room_types,
                "design_types": design_types,
                "city": city,
                "state": state,
                "country": "US",
                "postal_code": None,
                "stock_status": StockStatus.LIMITED if index % 7 == 0 else StockStatus.IN_STOCK,
                "vendor_name": "Auralis Vendor Network",
                "vendor_url": None,
            }
            if product:
                for key, value in data.items():
                    setattr(product, key, value)
            else:
                db.add(Product(**data))

        for slug, title, category in BLOGS:
            post = db.query(BlogPost).filter(BlogPost.slug == slug).one_or_none()
            data = {
                "slug": slug,
                "title": title,
                "excerpt": "A practical Auralis guide for AI-assisted design decisions.",
                "content": [
                    "Auralis combines user input, local product data, and AI concept generation.",
                    "The strongest proposals stay budget-aware and leave final project decisions to the design team.",
                ],
                "cover_image_url": f"https://picsum.photos/seed/{slug}/1200/700",
                "author_name": "Auralis Design Team",
                "category": category,
                "tags": ["design", "ai", category.lower()],
                "published": True,
                "published_at": datetime.now(timezone.utc),
            }
            if post:
                for key, value in data.items():
                    setattr(post, key, value)
            else:
                db.add(BlogPost(**data))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
