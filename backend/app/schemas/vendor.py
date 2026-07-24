from __future__ import annotations

import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator
from app.models.entities import VendorStatus

SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"


class VendorIn(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=255, pattern=SLUG_PATTERN)
    logoUrl: str | None = None
    bannerUrl: str | None = None
    websiteUrl: str | None = None
    description: str | None = None
    contactPerson: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=80)
    address: str | None = None
    status: VendorStatus = Field(default=VendorStatus.ACTIVE)

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str) -> str:
        return value.strip().lower()


class VendorPatchIn(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    slug: str | None = Field(default=None, min_length=2, max_length=255, pattern=SLUG_PATTERN)
    logoUrl: str | None = None
    bannerUrl: str | None = None
    websiteUrl: str | None = None
    description: str | None = None
    contactPerson: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=80)
    address: str | None = None
    status: VendorStatus | None = None

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str | None) -> str | None:
        if value is not None:
            return value.strip().lower()
        return value


class VendorOut(BaseModel):
    id: str
    name: str
    slug: str
    logoUrl: str | None
    bannerUrl: str | None
    websiteUrl: str | None
    description: str | None
    contactPerson: str | None
    email: str | None
    phone: str | None
    address: str | None
    status: VendorStatus
    createdAt: datetime
    updatedAt: datetime
    productCount: int | None = None

    class Config:
        from_attributes = True


class VendorListOut(BaseModel):
    items: list[VendorOut]
    total: int
    page: int
    pageSize: int
    totalPages: int
