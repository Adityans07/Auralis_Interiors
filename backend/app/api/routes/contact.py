from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import ContactMessage, ContactMessageStatus
from app.schemas.api import ContactIn
from app.security.rate_limit import assert_rate_limit
from app.services.email.send import notify_admin
from app.utils.responses import success

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("")
async def submit_contact(payload: ContactIn, request: Request, db: Session = Depends(get_db)):
    assert_rate_limit(request, "contact", 10, 3600)
    message = ContactMessage(
        name=payload.name,
        email=str(payload.email),
        phone=payload.phone,
        subject=payload.subject,
        message=payload.message,
        status=ContactMessageStatus.NEW,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    await notify_admin(f"New Auralis contact message{': ' + payload.subject if payload.subject else ''}", payload.message)
    return success({"ticketId": message.id, "message": "Thanks for reaching out. We'll reply shortly."})

