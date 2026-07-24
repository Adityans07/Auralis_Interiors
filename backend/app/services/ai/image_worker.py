from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.entities import DesignRequest, GeneratedDesign
from app.services.ai.generator import _generate_room_redesign
from app.services.ai.prompts import image_redesign_prompt
import threading

def _run_image_generation(design_request_id: str):
    db: Session = SessionLocal()
    try:
        request = db.query(DesignRequest).filter_by(id=design_request_id).first()
        if not request:
            return
            
        request.image_generation_status = "generating"
        db.commit()

        base_description = request.description or "A standard room"
        room_image_url = request.uploaded_image_url

        designs = db.query(GeneratedDesign).filter_by(design_request_id=design_request_id).all()
        for design in designs:
            prompt = image_redesign_prompt(
                design_concept={
                    "title": design.title,
                    "style": design.style,
                    "mood": design.mood,
                    "description": design.description,
                    "imagePrompt": design.ai_image_prompt
                },
                base_description=base_description
            )
            image_url = _generate_room_redesign(room_image_url or "", prompt)
            if image_url:
                design.preview_image_url = image_url
                
        request.image_generation_status = "ready"
        db.commit()
    except Exception as e:
        db.rollback()
        request = db.query(DesignRequest).filter_by(id=design_request_id).first()
        if request:
            request.image_generation_status = "failed"
            db.commit()
    finally:
        db.close()


def spawn_image_worker(design_request_id: str):
    thread = threading.Thread(target=_run_image_generation, args=(design_request_id,), daemon=True)
    thread.start()
