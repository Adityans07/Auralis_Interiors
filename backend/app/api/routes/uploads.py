from fastapi import APIRouter, File, Request, UploadFile

from app.schemas.api import PresignUploadIn
from app.security.rate_limit import assert_rate_limit
from app.services.storage import create_presigned_upload, upload_file
from app.utils.responses import success

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/presign")
def presign_upload(payload: PresignUploadIn, request: Request):
    assert_rate_limit(request, "uploads-presign", 20, 3600)
    return success(create_presigned_upload(payload.contentType, payload.size))


@router.post("")
async def upload_image(request: Request, file: UploadFile = File(...)):
    assert_rate_limit(request, "uploads", 10, 3600)
    return success(await upload_file(file))
