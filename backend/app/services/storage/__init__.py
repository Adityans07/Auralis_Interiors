from __future__ import annotations

from fastapi import UploadFile

from app.core.config import settings
from app.utils.responses import ApiError

from . import s3


def _is_s3_compatible(provider: str) -> bool:
	return provider in {"s3", "r2", "supabase"}


def create_presigned_upload(content_type: str, size: int) -> dict:
	provider = settings.storage_provider
	if _is_s3_compatible(provider):
		return s3.create_presigned_upload(content_type, size)
	raise ApiError(
		"UPLOAD_FAILED",
		f"Storage provider '{provider}' is not implemented for presigned uploads.",
		500,
	)


async def upload_file(
	file: UploadFile,
	location: str | None = None,
	vendor: str | None = None,
	product_name: str | None = None
) -> dict:
	provider = settings.storage_provider
	if _is_s3_compatible(provider):
		return await s3.upload_file(file, location, vendor, product_name)
	raise ApiError(
		"UPLOAD_FAILED",
		f"Storage provider '{provider}' is not implemented for direct uploads.",
		500,
	)

