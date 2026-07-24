import os
import sys

# Add the backend directory to sys.path so we can import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models.entities import Product, BlogPost

def clear_data():
    db = SessionLocal()
    try:
        products_deleted = db.query(Product).delete()
        blogs_deleted = db.query(BlogPost).delete()
        db.commit()
        print(f"Successfully deleted {products_deleted} products and {blogs_deleted} blogs.")
    except Exception as e:
        db.rollback()
        print(f"Error deleting data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_data()
