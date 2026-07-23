import os
from sqlalchemy.orm import sessionmaker
from app.db.session import SessionLocal
from app.models.entities import DesignRequest, AIGenerationLog

db = SessionLocal()
log = db.query(AIGenerationLog).order_by(AIGenerationLog.created_at.desc()).first()
req = db.get(DesignRequest, log.design_request_id)
print(f"Uploaded Image URL: {req.uploaded_image_url}")
print(f"Error Message: {req.error_message}")
