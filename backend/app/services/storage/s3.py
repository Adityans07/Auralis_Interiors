from __future__ import annotations

import uuid
from datetime import datetime

import boto3
from botocore.client import Config
from fastapi import UploadFile

from app.core.config import settings
from app.utils.responses import ApiError

ALLOWED_IMAGE_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024


def _require_s3() -> None:
    missing = [
        name
        for name, value in {
            "S3_BUCKET": settings.s3_bucket,
            "S3_ACCESS_KEY_ID": settings.s3_access_key_id,
            "S3_SECRET_ACCESS_KEY": settings.s3_secret_access_key,
        }.items()
        if not value
    ]
    if missing:
        raise ApiError("UPLOAD_FAILED", f"Storage is not configured. Missing: {', '.join(missing)}", 500)


def _client():
    _require_s3()

    kwargs = {
        "region_name": settings.s3_region,
        "aws_access_key_id": settings.s3_access_key_id,
        "aws_secret_access_key": settings.s3_secret_access_key,
        "config": Config(signature_version="s3v4"),
    }

    # Only use endpoint_url if it actually has a value
    if settings.s3_endpoint and settings.s3_endpoint.strip():
        kwargs["endpoint_url"] = settings.s3_endpoint

    return boto3.client("s3", **kwargs)


def validate_image(content_type: str, size: int) -> None:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ApiError("VALIDATION_ERROR", "Only JPEG, PNG, and WebP images are allowed.")
    if size <= 0 or size > MAX_IMAGE_BYTES:
        raise ApiError("VALIDATION_ERROR", "Image must be 10 MB or smaller.")


def _key(content_type: str, folder: str = "uploads") -> str:
    ext = ALLOWED_IMAGE_TYPES[content_type]
    return f"{folder}/{datetime.utcnow().date().isoformat()}/{uuid.uuid4().hex}.{ext}"


def public_url(key: str) -> str:
    if settings.s3_public_base_url:
        return f"{settings.s3_public_base_url.rstrip('/')}/{key}"
    if settings.s3_endpoint:
        return f"{settings.s3_endpoint.rstrip('/')}/{settings.s3_bucket}/{key}"
    return f"https://{settings.s3_bucket}.s3.{settings.s3_region}.amazonaws.com/{key}"


def create_presigned_upload(content_type: str, size: int) -> dict:
    validate_image(content_type, size)
    key = _key(content_type)
    url = _client().generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.s3_bucket, "Key": key, "ContentType": content_type},
        ExpiresIn=300,
    )
    return {"uploadUrl": url, "imageUrl": public_url(key), "imageKey": key, "headers": {"Content-Type": content_type}}


async def upload_file(
    file: UploadFile, 
    location: str | None = None,
    vendor: str | None = None,
    product_name: str | None = None
) -> dict:
    content = await file.read()
    validate_image(file.content_type or "", len(content))
    
    if location and vendor and product_name:
        import re
        import logging
        logging.info(f"Uploading product image with meta: location={location}, vendor={vendor}, product_name={product_name}")
        def slugify(text: str) -> str:
            return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
        
        loc_slug = slugify(location)
        ven_slug = slugify(vendor)
        prod_slug = slugify(product_name)
        ext = ALLOWED_IMAGE_TYPES.get(file.content_type or "image/jpeg", "jpg")
        file_id = uuid.uuid4().hex[:8]
        key = f"products/{loc_slug}/{ven_slug}/{prod_slug}/{file_id}.{ext}"
    else:
        import logging
        logging.info(f"Fallback upload without meta. loc={location}, ven={vendor}, prod={product_name}")
        key = _key(file.content_type or "image/jpeg")
        
    _client().put_object(Bucket=settings.s3_bucket, Key=key, Body=content, ContentType=file.content_type)
    return {"imageUrl": public_url(key), "imageKey": key}

