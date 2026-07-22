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
    # Living Room - Sofas
    ("sofa", "Nordic Modular Sofa", "furniture", "Sofa", 2800, ["interior"], ["living-room"], ["modern", "minimal", "scandinavian"], "Los Angeles", "CA"),
    ("sofa", "Chesterfield Leather Sofa", "furniture", "Sofa", 3200, ["interior"], ["living-room"], ["traditional", "vintage", "luxury"], "New York", "NY"),
    ("sofa", "Mid-Century Modern Sofa", "furniture", "Sofa", 2400, ["interior"], ["living-room"], ["mid-century", "retro", "modern"], "Chicago", "IL"),
    ("sofa", "Sectional Sofa with Chaise", "furniture", "Sofa", 3500, ["interior"], ["living-room"], ["contemporary", "family", "comfortable"], "Atlanta", "GA"),
    # Living Room - Coffee Tables
    ("coffee-table", "Marble Top Coffee Table", "furniture", "Coffee Table", 450, ["interior"], ["living-room"], ["modern", "luxury", "elegant"], "Miami", "FL"),
    ("coffee-table", "Wooden Industrial Coffee Table", "furniture", "Coffee Table", 280, ["interior"], ["living-room"], ["industrial", "rustic", "modern"], "Denver", "CO"),
    ("coffee-table", "Glass and Metal Coffee Table", "furniture", "Coffee Table", 320, ["interior"], ["living-room"], ["contemporary", "minimal", "sleek"], "Seattle", "WA"),
    # Living Room - TV Stands
    ("tv-stand", "Floating Wood TV Stand", "furniture", "TV Stand", 420, ["interior"], ["living-room"], ["modern", "minimal", "scandinavian"], "Portland", "OR"),
    ("tv-stand", "Industrial Metal TV Console", "furniture", "TV Stand", 380, ["interior"], ["living-room"], ["industrial", "urban", "modern"], "Austin", "TX"),
    ("tv-stand", "Classic Wooden TV Cabinet", "furniture", "TV Stand", 550, ["interior"], ["living-room"], ["traditional", "rustic", "farmhouse"], "Boston", "MA"),
    # Living Room - Rugs
    ("rug", "Geometric Pattern Rug", "decor", "Rug", 350, ["interior"], ["living-room"], ["modern", "geometric", "bold"], "San Diego", "CA"),
    ("rug", "Persian Style Wool Rug", "decor", "Rug", 800, ["interior"], ["living-room"], ["traditional", "oriental", "luxury"], "Philadelphia", "PA"),
    ("rug", "Natural Jute Rug", "decor", "Rug", 220, ["interior"], ["living-room"], ["natural", "bohemian", "textured"], "Austin", "TX"),
    # Bedroom - Beds
    ("bed", "Upholstered Platform Bed", "furniture", "Bed", 1800, ["interior"], ["bedroom"], ["modern", "minimal", "comfortable"], "Los Angeles", "CA"),
    ("bed", "Four Poster Canopy Bed", "furniture", "Bed", 3200, ["interior"], ["bedroom"], ["romantic", "traditional", "elegant"], "Charleston", "SC"),
    ("bed", "Storage Bed with Drawers", "furniture", "Bed", 2200, ["interior"], ["bedroom"], ["practical", "modern", "space-saving"], "New York", "NY"),
    # Bedroom - Nightstands
    ("nightstand", "Modern Floating Nightstand", "furniture", "Nightstand", 180, ["interior"], ["bedroom"], ["modern", "minimal", "wall-mounted"], "Seattle", "WA"),
    ("nightstand", "Rustic Wood Nightstand", "furniture", "Nightstand", 240, ["interior"], ["bedroom"], ["rustic", "farmhouse", "natural"], "Asheville", "NC"),
    ("nightstand", "Marble Top Nightstand", "furniture", "Nightstand", 320, ["interior"], ["bedroom"], ["luxury", "modern", "elegant"], "Miami", "FL"),
    # Bedroom - Dressers
    ("dresser", "6-Drawer Wide Dresser", "furniture", "Dresser", 1200, ["interior"], ["bedroom"], ["modern", "functional", "minimal"], "Chicago", "IL"),
    ("dresser", "Vintage Dresser with Mirror", "furniture", "Dresser", 950, ["interior"], ["bedroom"], ["vintage", "retro", "charming"], "Austin", "TX"),
    ("dresser", "Scandinavian 3-Drawer Dresser", "furniture", "Dresser", 850, ["interior"], ["bedroom"], ["scandinavian", "light", "airy"], "Stockholm", "ST"),  # Note: We'll adjust for US only later
    # Bedroom - Wardrobes
    ("wardrobe", "Sliding Door Wardrobe", "furniture", "Wardrobe", 1800, ["interior"], ["bedroom"], ["modern", "space-saving", "contemporary"], "Los Angeles", "CA"),
    ("wardrobe", "Walk-in Closet System", "furniture", "Wardrobe", 3500, ["interior"], ["bedroom"], ["luxury", "custom", "organized"], "New York", "NY"),
    # Dining Room - Dining Tables
    ("dining-table", "Extendable Dining Table", "furniture", "Dining Table", 2200, ["interior"], ["dining-room"], ["modern", "flexible", "family-friendly"], "Seattle", "WA"),
    ("dining-table", "Solid Wood Farmhouse Table", "furniture", "Dining Table", 1800, ["interior"], ["dining-room"], ["rustic", "farmhouse", "traditional"], "Nashville", "TN"),
    ("dining-table", "Glass Top Dining Table", "furniture", "Dining Table", 1500, ["interior"], ["dining-room"], ["contemporary", "sleek", "modern"], "Los Angeles", "CA"),
    # Dining Room - Dining Chairs
    ("dining-chair", "Upholstered Dining Chair", "furniture", "Dining Chair", 280, ["interior"], ["dining-room"], ["comfortable", "modern", "fabric"], "Chicago", "IL"),
    ("dining-chair", "Wooden Windsor Chair", "furniture", "Dining Chair", 180, ["interior"], ["dining-room"], ["traditional", "rustic", "wood"], "Boston", "MA"),
    ("dining-chair", "Metal Industrial Chair", "furniture", "Dining Chair", 150, ["interior"], ["dining-room"], ["industrial", "metal", "minimal"], "Denver", "CO"),
    # Kitchen - Cabinets
    ("kitchen-cabinet", "Shaker Style Kitchen Cabinets", "furniture", "Kitchen Cabinet", 75, ["interior"], ["kitchen"], ["classic", "timeless", "shaker"], "Portland", "OR"),
    ("kitchen-cabinet", "Modern Flat-Pack Cabinets", "furniture", "Kitchen Cabinet", 60, ["interior"], ["kitchen"], ["modern", "minimal", "flat-pack"], "Los Angeles", "CA"),
    ("kitchen-cabinet", "Rustic Wood Kitchen Cabinets", "furniture", "Kitchen Cabinet", 90, ["interior"], ["kitchen"], ["rustic", "farmhouse", "natural"], "Asheville", "NC"),
    # Kitchen - Countertops
    ("countertop", "Quartz Countertop Slab", "furniture", "Countertop", 120, ["interior"], ["kitchen"], ["durable", "low-maintenance", "modern"], "Austin", "TX"),
    ("countertop", "Marble Countertop Slab", "furniture", "Countertop", 200, ["interior"], ["kitchen"], ["luxury", "elegant", "veined"], "New York", "NY"),
    ("countertop", "Butcher Block Countertop", "furniture", "Countertop", 80, ["interior"], ["kitchen"], ["wood", "warm", "traditional"], "Seattle", "WA"),
    # Kitchen - Appliances (simplified as furniture for now)
    ("fridge", "Stainless Steel Refrigerator", "furniture", "Refrigerator", 1800, ["interior"], ["kitchen"], ["modern", "stainless", "appliance"], "Chicago", "IL"),
    ("oven", "Convection Oven", "furniture", "Oven", 1200, ["interior"], ["kitchen"], ["baking", "cooking", "modern"], "New York", "NY"),
    # Bathroom - Vanities
    ("bathroom-vanity", "Modern Floating Vanity", "furniture", "Vanity", 600, ["interior"], ["bathroom"], ["modern", "minimal", "wall-mounted"], "Los Angeles", "CA"),
    ("bathroom-vanity", "Vintage Dresser Vanity", "furniture", "Vanity", 750, ["interior"], ["bathroom"], ["vintage", "repurposed", "unique"], "Austin", "TX"),
    ("bathroom-vanity", "Double Sink Vanity", "furniture", "Vanity", 900, ["interior"], ["bathroom"], ["family", "functional", "modern"], "Atlanta", "GA"),
    # Bathroom - Mirrors
    ("bathroom-mirror", "Round Backlit Mirror", "furniture", "Mirror", 250, ["interior"], ["bathroom"], ["modern", "backlit", "round"], "Miami", "FL"),
    ("bathroom-mirror", "Antique Brass Mirror", "furniture", "Mirror", 180, ["interior"], ["bathroom"], ["vintage", "brass", "elegant"], "Charleston", "SC"),
    # Office - Desks
    ("desk", "Standing Desk", "furniture", "Desk", 450, ["interior"], ["office"], ["ergonomic", "adjustable", "modern"], "Seattle", "WA"),
    ("desk", "Executive Wood Desk", "furniture", "Desk", 800, ["interior"], ["office"], ["traditional", "executive", "luxury"], "New York", "NY"),
    ("desk", "Minimalist Writing Desk", "furniture", "Desk", 300, ["interior"], ["office"], ["minimal", "simple", "modern"], "Portland", "OR"),
    # Office - Chairs
    ("office-chair", "Ergonomic Mesh Chair", "furniture", "Office Chair", 350, ["interior"], ["office"], ["ergonomic", "breathable", "comfortable"], "Austin", "TX"),
    ("office-chair", "Leather Executive Chair", "furniture", "Office Chair", 500, ["interior"], ["office"], ["luxury", "leather", "professional"], "Chicago", "IL"),
    ("office-chair", "Vintage Swivel Chair", "furniture", "Office Chair", 250, ["interior"], ["office"], ["vintage", "retro", "unique"], "Denver", "CO"),
    # Outdoor - Patio Sets
    ("patio-set", "Outdoor Aluminum Dining Set", "furniture", "Patio Set", 1200, ["exterior"], ["patio", "outdoor"], ["modern", "weather-resistant", "aluminum"], "San Diego", "CA"),
    ("patio-set", "Wicker Patio Conversation Set", "furniture", "Patio Set", 1800, ["exterior"], ["patio", "outdoor"], ["wicker", "cozy", "outdoor-living"], "Phoenix", "AZ"),
    ("patio-set", "Wooden Picnic Table Set", "furniture", "Patio Set", 950, ["exterior"], ["patio", "outdoor"], ["rustic", "wood", "gathering"], "Asheville", "NC"),
    # Outdoor - Planters
    ("planter", "Concrete Modern Planter", "furniture", "Planter", 120, ["exterior"], ["garden", "outdoor"], ["modern", "concrete", "minimal"], "Los Angeles", "CA"),
    ("planter", "Terracotta Pot Planter", "furniture", "Planter", 45, ["exterior"], ["garden", "outdoor"], ["traditional", "terracotta", "gardening"], "Austin", "TX"),
    ("planter", "Vertical Wall Planter", "furniture", "Planter", 200, ["exterior"], ["garden", "outdoor"], ["vertical", "space-saving", "green"], "Seattle", "WA"),
    # Lighting - Chandeliers
    ("chandelier", "Crystal Chandelier", "lighting", "Chandelier", 800, ["interior"], ["dining-room", "foyer"], ["luxury", "elegant", "traditional"], "New York", "NY"),
    ("chandelier", "Modern Geometric Chandelier", "lighting", "Chandelier", 450, ["interior"], ["dining-room", "living-room"], ["modern", "geometric", "metal"], "Los Angeles", "CA"),
    ("chandelier", "Rustic Wood Chandelier", "lighting", "Chandelier", 350, ["interior"], ["dining-room", "living-room"], ["rustic", "wood", "farmhouse"], "Portland", "OR"),
    # Lighting - Floor Lamps
    ("floor-lamp", "Arc Floor Lamp", "lighting", "Floor Lamp", 220, ["interior"], ["living-room", "bedroom"], ["modern", "arc", "statement"], "Chicago", "IL"),
    ("floor-lamp", "Tripod Floor Lamp", "lighting", "Floor Lamp", 180, ["interior"], ["living-room", "bedroom"], ["scandinavian", "tripod", "minimal"], "Seattle", "WA"),
    ("floor-lamp", "Industrial Pipe Floor Lamp", "lighting", "Floor Lamp", 150, ["interior"], ["living-room", "bedroom"], ["industrial", "pipe", "rustic"], "Denver", "CO"),
    # Lighting - Table Lamps
    ("table-lamp", "Ceramic Table Lamp", "lighting", "Table Lamp", 65, ["interior"], ["bedroom", "desk"], ["ceramic", "artistic", "decorative"], "Austin", "TX"),
    ("table-lamp", "Industrial Desk Lamp", "lighting", "Table Lamp", 45, ["interior"], ["desk", "office"], ["industrial", "adjustable", "task"], "New York", "NY"),
    ("table-lamp", "Salt Crystal Lamp", "lighting", "Table Lamp", 40, ["interior"], ["bedroom"], ["natural", "calming", "unique"], "Sedona", "AZ"),
    # Decor - Wall Art
    ("wall-art", "Abstract Canvas Print", "decor", "Wall Art", 120, ["interior"], ["living-room", "bedroom", "office"], ["abstract", "modern", "colorful"], "Los Angeles", "CA"),
    ("wall-art", "Vintage Travel Poster", "decor", "Wall Art", 85, ["interior"], ["living-room", "bedroom", "office"], ["vintage", "travel", "nostalgic"], "New York", "NY"),
    ("wall-art", "Botanical Print Set", "decor", "Wall Art", 95, ["interior"], ["bathroom", "bedroom"], ["botanical", "nature", "prints"], "Portland", "OR"),
    # Decor - Throw Pillows
    ("throw-pillow", "Geometric Throw Pillow", "decor", "Throw Pillow", 45, ["interior"], ["living-room", "bedroom"], ["geometric", "modern", "accent"], "Chicago", "IL"),
    ("throw-pillow", "Velvet Throw Pillow", "decor", "Throw Pillow", 55, ["interior"], ["living-room", "bedroom"], ["velvet", "luxury", "soft"], "New York", "NY"),
    ("throw-pillow", "Linen Throw Pillow", "decor", "Throw Pillow", 40, ["interior"], ["living-room", "bedroom"], ["linen", "natural", "textured"], "Portland", "OR"),
    # Decor - Vases
    ("vase", "Ceramic Bud Vase", "decor", "Vase", 35, ["interior"], ["living-room", "dining-room"], ["ceramic", "minimal", "bud"], "Austin", "TX"),
    ("vase", "Glass Vase Set", "decor", "Vase", 50, ["interior"], ["living-room", "dining-room"], ["glass", "clear", "set"], "Seattle", "WA"),
    ("vase", "Stoneware Vase", "decor", "Vase", 45, ["interior"], ["living-room", "dining-room"], ["stoneware", "earthy", "organic"], "Asheville", "NC"),
]

# Note: We have removed non-US locations for simplicity. All cities and states are within the USA.

BLOGS = [
    ("the-power-of-neutral-palettes", "The Power of Neutral Palettes in Interior Design", "Design Tips"),
    ("mixing-vintage-and-modern", "How to Mix Vintage and Modern Furniture Successfully", "Design Tips"),
    ("small-space-solutions", "Clever Storage Solutions for Small Apartments", "Space Planning"),
    ("biophilic-design", "Bringing the Outdoors In: Biophilic Design Principles", "Trends"),
    ("lighting-layers", "The Art of Layered Lighting in Home Design", "Lighting"),
    ("sustainable-materials", "Eco-Friendly Materials for Sustainable Interior Design", "Sustainability"),
    ("color-psychology", "How Color Psychology Affects Mood in Living Spaces", "Design Theory"),
    ("maximizing-natural-light", "Maximizing Natural Light in Your Home Design", "Lighting"),
    ("textile-trends", "Current Textile Trends in Interior Design: Fabrics and Patterns", "Trends"),
    ("outdoor-living", "Creating Seamless Indoor-Outdoor Living Spaces", "Outdoor"),
    ("kitchen-work-triangle", "Understanding the Kitchen Work Triangle for Efficient Design", "Kitchen"),
    ("bathroom-spa", "Transforming Your Bathroom into a Spa-Like Retreat", "Bathroom"),
    ("home-office-setup", "Designing a Productive and Stylish Home Office", "Remote Work"),
    ("accessible-design", "Principles of Accessible Design for All Ages and Abilities", "Accessibility"),
    ("art-display", "How to Display Artwork Effectively in Your Home", "Art"),
    ("seasonal-decor", "Transitioning Your Decor with the Seasons: Tips and Ideas", "Seasonal"),
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
                "description": f"High-quality {subcategory.lower()} suitable for {room_types[0] if room_types else 'various rooms'} settings.",
                "price": price,
                "currency": "USD",
                "image_url": f"https://picsum.photos/seed/{slug}/800/600",
                "brand": "Quality Home Furnishings",
                "material": "Premium Materials",
                "color": "Neutral",
                "style_tags": style_tags,
                "item_type": item_type,
                "room_types": room_types,
                "design_types": design_types,
                "city": city,
                "state": state,
                "country": "US",
                "postal_code": None,
                "stock_status": StockStatus.IN_STOCK if index % 5 != 0 else StockStatus.LIMITED,
                "vendor_name": "Premium Home Suppliers",
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
                "excerpt": "Expert insights and practical tips for creating beautiful, functional living spaces.",
                "content": [
                    "Our design experts share valuable advice on current trends, timeless principles, and practical solutions for your home.",
                    "Learn how to make informed decisions about furniture, color schemes, lighting, and layout to create spaces that reflect your personality and lifestyle.",
                ],
                "cover_image_url": f"https://picsum.photos/seed/{slug}/1200/700",
                "author_name": "Auralis Design Team",
                "category": category,
                "tags": ["design", "interior", category.lower()],
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