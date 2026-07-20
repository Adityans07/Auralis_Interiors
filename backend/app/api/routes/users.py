from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.security.session import RequestContext, get_request_context
from app.security.usage import get_free_generation_state
from app.utils.responses import success

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/free-generation-status")
def free_generation_status(
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    return success(get_free_generation_state(db, context))

