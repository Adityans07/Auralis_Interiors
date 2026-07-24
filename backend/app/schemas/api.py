from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator, model_validator


SUPPORTED_CITIES = {"Noida", "Prayagraj", "Patna", "Jaipur", "Chandigarh", "Kolkata"}

class LocationIn(BaseModel):
    city: str
    state: str | None = None
    country: str
    postalCode: str | None = None
    zip: str | None = None

    @field_validator("city")
    @classmethod
    def validate_city(cls, value: str) -> str:
        if value not in SUPPORTED_CITIES:
            raise ValueError(f"City must be one of {', '.join(SUPPORTED_CITIES)}")
        return value


class SelectedItemIn(BaseModel):
    id: str | None = None
    label: str | None = None
    category: str | None = None
    itemType: str | None = None


class UploadedImageIn(BaseModel):
    imageUrl: HttpUrl
    imageKey: str


class DesignGenerationIn(BaseModel):
    designType: str
    spaceType: str
    description: str | None = None
    uploadedImage: UploadedImageIn | None = None
    uploadedImageUrl: HttpUrl | None = None
    uploadedImageKey: str | None = None
    imageName: str | None = None
    location: LocationIn
    budget: float = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    style: str
    mood: str | None = None
    colorPreferences: str | None = None
    selectedItems: list[SelectedItemIn] = Field(min_length=1)
    timeline: str | None = None
    extraNotes: str | None = None
    paymentId: str | None = None
    stripeCheckoutSessionId: str | None = None

    @field_validator("designType")
    @classmethod
    def normalize_design_type(cls, value: str) -> str:
        normalized = value.upper()
        if normalized not in {"INTERIOR", "EXTERIOR"}:
            raise ValueError("designType must be interior or exterior")
        return normalized

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()

    @model_validator(mode="after")
    def require_image(self):
        if not (self.uploadedImage or self.uploadedImageUrl or self.imageName):
            raise ValueError("A room photo is required for the redesign.")
        return self


class ProductsSearchIn(BaseModel):
    location: LocationIn
    selectedItems: list[SelectedItemIn] = Field(min_length=1)
    budget: float = Field(gt=0)
    style: str | None = None
    designType: str
    spaceType: str

    @field_validator("designType")
    @classmethod
    def normalize_design_type(cls, value: str) -> str:
        normalized = value.upper()
        if normalized not in {"INTERIOR", "EXTERIOR"}:
            raise ValueError("designType must be interior or exterior")
        return normalized


class SelectedProductIn(BaseModel):
    id: str | None = None
    generatedDesignProductId: str | None = None
    productId: str | None = None
    quantity: int | None = Field(default=None, gt=0)
    included: bool | None = None


class SelectDesignIn(BaseModel):
    designRequestId: str
    generatedDesignId: str
    selectedProducts: list[SelectedProductIn] = Field(default_factory=list)
    customerName: str
    customerEmail: EmailStr
    customerPhone: str
    preferredContactTime: str | None = None
    notes: str | None = None


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    subject: str | None = None
    message: str = Field(min_length=10)


class BookingIn(BaseModel):
    name: str
    email: EmailStr
    phone: str
    projectType: str
    preferredDate: str
    preferredTime: str
    city: str | None = None
    state: str | None = None
    country: str | None = None
    location: str | None = None
    budgetRange: str
    message: str | None = None
    selectedDesignId: str | None = None


class CheckoutIn(BaseModel):
    designRequestDraft: dict | None = None
    designGenerationPayload: dict | None = None
    amount: int | None = Field(default=None, gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class PresignUploadIn(BaseModel):
    fileName: str | None = None
    contentType: str
    size: int = Field(gt=0, le=10 * 1024 * 1024)

    @field_validator("contentType")
    @classmethod
    def allowed_type(cls, value: str) -> str:
        if value not in {"image/jpeg", "image/png", "image/webp"}:
            raise ValueError("Only JPEG, PNG, and WebP images are allowed")
        return value


class AiRecommendedProduct(BaseModel):
    productId: str
    quantity: int = Field(gt=0, le=20)
    reason: str | None = None


class AiDesign(BaseModel):
    title: str
    description: str
    style: str
    mood: str | None = None
    designNotes: list[str]
    budgetStatus: str
    recommendedProducts: list[AiRecommendedProduct]
    estimatedTotal: float
    imagePrompt: str
    previewImageUrl: str | None = None


class AiDesignResponse(BaseModel):
    designs: list[AiDesign] = Field(min_length=2, max_length=2)
