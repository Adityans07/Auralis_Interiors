import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import SessionLocal
from app.models.entities import AIGenerationLog, Product

db = SessionLocal()

print("--- LATEST LOGS ---")
logs = db.query(AIGenerationLog).order_by(AIGenerationLog.created_at.desc()).limit(3).all()
for log in logs:
    print(f"ID: {log.id}\nStatus: {log.status.value}\nError Code: {log.error_code}\nMessage: {log.error_message}\nRaw Summary: {log.raw_request_summary}\n")

print("\n--- PRODUCT COUNTS ---")
total = db.query(Product).count()
interior = db.query(Product).filter(Product.design_types.contains(["interior"])).count()
exterior = db.query(Product).filter(Product.design_types.contains(["exterior"])).count()
print(f"Total Products: {total}")
print(f"Interior Products: {interior}")
print(f"Exterior Products: {exterior}")
