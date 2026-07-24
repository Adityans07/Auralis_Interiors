import sys
import os
import random
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.entities import Product, StockStatus

def run():
    db = SessionLocal()
    
    cities = ["Noida", "Prayagraj", "Patna", "Jaipur", "Chandigarh", "Kolkata"]
    states = ["Uttar Pradesh", "Uttar Pradesh", "Bihar", "Rajasthan", "Chandigarh", "West Bengal"]
    
    categories = ["furniture", "decor", "lighting"]
    
    products_to_add = [
        {"name": "Royal Velvet Sofa", "item_type": "sofa", "category": "furniture", "price": 45000},
        {"name": "Teak Wood Coffee Table", "item_type": "table", "category": "furniture", "price": 12000},
        {"name": "Handwoven Jaipur Rug", "item_type": "rug", "category": "decor", "price": 8500},
        {"name": "Brass Pendant Light", "item_type": "lighting", "category": "lighting", "price": 4200},
        {"name": "Minimalist Bookcase", "item_type": "storage", "category": "furniture", "price": 18000},
        {"name": "Ceramic Floor Vase", "item_type": "vase", "category": "decor", "price": 3500},
        {"name": "Modern Sectional", "item_type": "sofa", "category": "furniture", "price": 65000},
        {"name": "Rattan Armchair", "item_type": "chair", "category": "furniture", "price": 15000},
    ]
    
    for i, city in enumerate(cities):
        state = states[i]
        
        # Check if products already exist for this city
        existing = db.query(Product).filter(Product.city == city).count()
        if existing > 0:
            print(f"Skipping {city}, already has {existing} products.")
            continue
            
        print(f"Adding products for {city}...")
        for p in products_to_add:
            slug = f"{p['name'].lower().replace(' ', '-')}-{city.lower()}"
            prod = Product(
                slug=slug,
                name=p["name"],
                description=f"Beautiful {p['name']} available in {city}. High quality craftsmanship.",
                item_type=p["item_type"],
                category=p["category"],
                currency="INR",
                price=p["price"],
                stock_status=StockStatus.IN_STOCK,
                room_types=["living-room", "bedroom", "office"],
                design_types=["INTERIOR"],
                style_tags=["modern", "minimalist", "luxury"],
                city=city,
                state=state,
                country="India",
                image_url="https://images.unsplash.com/photo-1598928506311-c55d43f1ca0b"
            )
            db.add(prod)
            
    db.commit()
    print("Seeding complete.")

if __name__ == "__main__":
    run()
