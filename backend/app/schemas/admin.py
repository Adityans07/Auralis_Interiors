from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from app.models.entities import (
    AdminNoteEntityType,
    BookingStatus,
    ContactMessageStatus,
    DesignRequestPriority,
    DesignRequestStatus,
    SelectedDesignStatus,
    StockStatus,
    UserStatus,
)

SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"


class PaginationIn(BaseModel):
    page: int = Field(default=1, ge=1)
    pageSize: int = Field(default=20, ge=1, le=100)
    search: str | None = Field(default=None, max_length=120)


class AdminNoteIn(BaseModel):
    entityType: AdminNoteEntityType
    entityId: str = Field(min_length=1, max_length=64)
    note: str = Field(min_length=2, max_length=5000)


class DesignRequestUpdateIn(BaseModel):
    status: DesignRequestStatus | None = None
    priority: DesignRequestPriority | None = None
    assignedToId: str | None = Field(default=None, max_length=64)
    internalStatus: str | None = Field(default=None, max_length=120)


class SelectedDesignUpdateIn(BaseModel):
    status: SelectedDesignStatus | None = None
    assignedToId: str | None = Field(default=None, max_length=64)


class BookingUpdateIn(BaseModel):
    status: BookingStatus | None = None
    preferredDate: datetime | None = None
    preferredTime: str | None = Field(default=None, max_length=120)
    assignedToId: str | None = Field(default=None, max_length=64)


class ContactMessageUpdateIn(BaseModel):
    status: ContactMessageStatus


class CustomerStatusUpdateIn(BaseModel):
    status: UserStatus


class CustomerUsageUpdateIn(BaseModel):
    action: str  # "reset" or "grant"
    amount: int | None = Field(default=None, ge=1, le=20)


class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=255, pattern=SLUG_PATTERN)
    category: str = Field(min_length=2, max_length=120)
    subcategory: str | None = Field(default=None, max_length=120)
    description: str = Field(min_length=10)
    price: Decimal = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    imageUrl: str = Field(min_length=6)
    brand: str | None = Field(default=None, max_length=255)
    material: str | None = Field(default=None, max_length=255)
    color: str | None = Field(default=None, max_length=120)
    styleTags: list[str] = Field(default_factory=list)
    itemType: str = Field(min_length=2, max_length=120)
    roomTypes: list[str] = Field(default_factory=list)
    designTypes: list[str] = Field(default_factory=list)
    city: str = Field(min_length=2, max_length=120)
    state: str | None = Field(default=None, max_length=120)
    country: str = Field(min_length=2, max_length=120)
    postalCode: str | None = Field(default=None, max_length=40)
    stockStatus: StockStatus
    vendorName: str | None = Field(default=None, max_length=255)
    vendorUrl: str | None = None

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str) -> str:
        return value.strip().lower()


class ProductPatchIn(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    slug: str | None = Field(default=None, min_length=2, max_length=255, pattern=SLUG_PATTERN)
    category: str | None = Field(default=None, min_length=2, max_length=120)
    subcategory: str | None = Field(default=None, max_length=120)
    description: str | None = Field(default=None, min_length=10)
    price: Decimal | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    imageUrl: str | None = Field(default=None, min_length=6)
    brand: str | None = Field(default=None, max_length=255)
    material: str | None = Field(default=None, max_length=255)
    color: str | None = Field(default=None, max_length=120)
    styleTags: list[str] | None = None
    itemType: str | None = Field(default=None, min_length=2, max_length=120)
    roomTypes: list[str] | None = None
    designTypes: list[str] | None = None
    city: str | None = Field(default=None, min_length=2, max_length=120)
    state: str | None = Field(default=None, max_length=120)
    country: str | None = Field(default=None, min_length=2, max_length=120)
    postalCode: str | None = Field(default=None, max_length=40)
    stockStatus: StockStatus | None = None
    vendorName: str | None = Field(default=None, max_length=255)
    vendorUrl: str | None = None
    archived: bool | None = None

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.upper()

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip().lower()


class BlogIn(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=255, pattern=SLUG_PATTERN)
    excerpt: str = Field(min_length=10)
    content: str = Field(min_length=20)
    coverImageUrl: str = Field(min_length=6)
    authorName: str = Field(min_length=2, max_length=255)
    category: str = Field(min_length=2, max_length=120)
    tags: list[str] = Field(default_factory=list)
    published: bool = False

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str) -> str:
        return value.strip().lower()


class BlogPatchIn(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    slug: str | None = Field(default=None, min_length=2, max_length=255, pattern=SLUG_PATTERN)
    excerpt: str | None = Field(default=None, min_length=10)
    content: str | None = Field(default=None, min_length=20)
    coverImageUrl: str | None = Field(default=None, min_length=6)
    authorName: str | None = Field(default=None, min_length=2, max_length=255)
    category: str | None = Field(default=None, min_length=2, max_length=120)
    tags: list[str] | None = None
    published: bool | None = None
    archived: bool | None = None

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip().lower()


class SettingsPatchIn(BaseModel):
    businessName: str | None = Field(default=None, max_length=255)
    supportEmail: str | None = Field(default=None, max_length=320)
    supportPhone: str | None = Field(default=None, max_length=80)
    defaultCurrency: str | None = Field(default=None, min_length=3, max_length=3)
    paidGenerationPrice: int | None = Field(default=None, ge=0)
    freeGenerationEnabled: bool | None = None
    bookingAvailabilityNote: str | None = Field(default=None, max_length=500)
    adminNotificationEmail: str | None = Field(default=None, max_length=320)
    aiGenerationMode: str | None = Field(default=None, max_length=60)
    maintenanceMode: bool | None = None

    @field_validator("defaultCurrency")
    @classmethod
    def normalize_currency(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.upper()


class TeamUpdateIn(BaseModel):
    role: str | None = Field(default=None, max_length=32)
    status: UserStatus | None = None
