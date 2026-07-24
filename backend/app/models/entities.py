from __future__ import annotations

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def new_id() -> str:
    return uuid.uuid4().hex


class DesignRequestStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PAYMENT_REQUIRED = "PAYMENT_REQUIRED"
    PAID = "PAID"
    GENERATING = "GENERATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SELECTED = "SELECTED"


class DesignRequestPriority(str, enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


class DesignType(str, enum.Enum):
    INTERIOR = "INTERIOR"
    EXTERIOR = "EXTERIOR"


class BudgetStatus(str, enum.Enum):
    WITHIN_BUDGET = "WITHIN_BUDGET"
    SLIGHTLY_ABOVE_BUDGET = "SLIGHTLY_ABOVE_BUDGET"
    PREMIUM_OPTION = "PREMIUM_OPTION"


class StockStatus(str, enum.Enum):
    IN_STOCK = "IN_STOCK"
    LIMITED = "LIMITED"
    OUT_OF_STOCK = "OUT_OF_STOCK"


class VendorStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class SelectedDesignStatus(str, enum.Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    CONSULTATION_BOOKED = "CONSULTATION_BOOKED"
    DEAL_FINALIZED = "DEAL_FINALIZED"
    LOST = "LOST"


class BookingStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ContactMessageStatus(str, enum.Enum):
    NEW = "NEW"
    READ = "READ"
    REPLIED = "REPLIED"


class AIGenerationStatus(str, enum.Enum):
    STARTED = "STARTED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    RETRIED = "RETRIED"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    DELETED = "DELETED"


class AdminNoteEntityType(str, enum.Enum):
    DESIGN_REQUEST = "DESIGN_REQUEST"
    SELECTED_DESIGN = "SELECTED_DESIGN"
    BOOKING = "BOOKING"
    CUSTOMER = "CUSTOMER"
    CONTACT_MESSAGE = "CONTACT_MESSAGE"
    PAYMENT = "PAYMENT"
    PRODUCT = "PRODUCT"


class CustomerAccountEventType(str, enum.Enum):
    SIGNUP = "SIGNUP"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    EMAIL_VERIFIED = "EMAIL_VERIFIED"
    PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED"
    PASSWORD_RESET_COMPLETED = "PASSWORD_RESET_COMPLETED"
    PROFILE_UPDATED = "PROFILE_UPDATED"
    ANONYMOUS_SESSION_LINKED = "ANONYMOUS_SESSION_LINKED"
    ACCOUNT_DELETE_REQUESTED = "ACCOUNT_DELETE_REQUESTED"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    name: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    phone: Mapped[str | None] = mapped_column(String(80))
    image: Mapped[str | None] = mapped_column(Text)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default=UserRole.CUSTOMER.value, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), default=UserStatus.ACTIVE.value, nullable=False, index=True)
    city: Mapped[str | None] = mapped_column(String(120))
    state: Mapped[str | None] = mapped_column(String(120))
    country: Mapped[str | None] = mapped_column(String(120))
    address: Mapped[str | None] = mapped_column(Text)
    preferred_style: Mapped[str | None] = mapped_column(String(120))
    preferred_contact_time: Mapped[str | None] = mapped_column(String(120))
    marketing_opt_in: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    signup_ip_hash: Mapped[str | None] = mapped_column(String(255))
    signup_user_agent: Mapped[str | None] = mapped_column(Text)
    signup_anonymous_session_id: Mapped[str | None] = mapped_column(
        ForeignKey("anonymous_sessions.id", ondelete="SET NULL"), index=True
    )

    usage: Mapped[UserUsage | None] = relationship(back_populates="user", uselist=False)
    design_requests: Mapped[list[DesignRequest]] = relationship(
        back_populates="user",
        foreign_keys="DesignRequest.user_id",
    )
    selected_designs: Mapped[list[SelectedDesign]] = relationship(
        back_populates="user",
        foreign_keys="SelectedDesign.user_id",
    )
    bookings: Mapped[list[Booking]] = relationship(
        back_populates="user",
        foreign_keys="Booking.user_id",
    )
    payments: Mapped[list[Payment]] = relationship(back_populates="user")
    auth_sessions: Mapped[list[UserSession]] = relationship(back_populates="user")
    password_reset_tokens: Mapped[list[PasswordResetToken]] = relationship(back_populates="user")
    email_verification_tokens: Mapped[list[EmailVerificationToken]] = relationship(back_populates="user")
    account_events: Mapped[list[CustomerAccountEvent]] = relationship(back_populates="user")
    linked_anonymous_sessions: Mapped[list[AnonymousSession]] = relationship(
        back_populates="linked_user",
        foreign_keys="AnonymousSession.linked_user_id",
    )
    assigned_design_requests: Mapped[list[DesignRequest]] = relationship(
        back_populates="assigned_to",
        foreign_keys="DesignRequest.assigned_to_id",
    )
    assigned_selected_designs: Mapped[list[SelectedDesign]] = relationship(
        back_populates="assigned_to",
        foreign_keys="SelectedDesign.assigned_to_id",
    )
    assigned_bookings: Mapped[list[Booking]] = relationship(
        back_populates="assigned_to",
        foreign_keys="Booking.assigned_to_id",
    )
    admin_notes: Mapped[list[AdminNote]] = relationship(back_populates="created_by")
    admin_audit_logs: Mapped[list[AdminAuditLog]] = relationship(back_populates="actor_user")


class AnonymousSession(TimestampMixin, Base):
    __tablename__ = "anonymous_sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    session_token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    free_generation_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    linked_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    linked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ip_hash: Mapped[str | None] = mapped_column(String(255))
    user_agent: Mapped[str | None] = mapped_column(Text)

    design_requests: Mapped[list[DesignRequest]] = relationship(back_populates="anonymous_session")
    selected_designs: Mapped[list[SelectedDesign]] = relationship(back_populates="anonymous_session")
    bookings: Mapped[list[Booking]] = relationship(back_populates="anonymous_session")
    payments: Mapped[list[Payment]] = relationship(back_populates="anonymous_session")
    linked_user: Mapped[User | None] = relationship(
        back_populates="linked_anonymous_sessions",
        foreign_keys=[linked_user_id],
    )


class UserUsage(TimestampMixin, Base):
    __tablename__ = "user_usages"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    free_generation_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    bonus_free_generations: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_generations: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    paid_generations: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped[User] = relationship(back_populates="usage")


class UserSession(TimestampMixin, Base):
    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    session_token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    csrf_token_hash: Mapped[str | None] = mapped_column(String(255))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ip_hash: Mapped[str | None] = mapped_column(String(255))
    user_agent: Mapped[str | None] = mapped_column(Text)

    user: Mapped[User] = relationship(back_populates="auth_sessions")


class DesignRequest(TimestampMixin, Base):
    __tablename__ = "design_requests"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    anonymous_session_id: Mapped[str | None] = mapped_column(
        ForeignKey("anonymous_sessions.id", ondelete="SET NULL"), index=True
    )
    status: Mapped[DesignRequestStatus] = mapped_column(Enum(DesignRequestStatus), default=DesignRequestStatus.DRAFT)
    design_type: Mapped[DesignType] = mapped_column(Enum(DesignType))
    space_type: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    uploaded_image_url: Mapped[str | None] = mapped_column(Text)
    uploaded_image_key: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(120), index=True)
    state: Mapped[str | None] = mapped_column(String(120), index=True)
    country: Mapped[str] = mapped_column(String(120), index=True)
    postal_code: Mapped[str | None] = mapped_column(String(40))
    budget: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    style: Mapped[str] = mapped_column(String(120))
    mood: Mapped[str | None] = mapped_column(String(120))
    color_preferences: Mapped[str | None] = mapped_column(Text)
    timeline: Mapped[str | None] = mapped_column(String(120))
    selected_items: Mapped[list[dict[str, Any]]] = mapped_column(JSON)
    extra_notes: Mapped[str | None] = mapped_column(Text)
    free_generation_applied: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    payment_id: Mapped[str | None] = mapped_column(ForeignKey("payments.id", ondelete="SET NULL"), index=True)
    error_message: Mapped[str | None] = mapped_column(Text)
    assigned_to_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    priority: Mapped[DesignRequestPriority] = mapped_column(
        Enum(DesignRequestPriority),
        default=DesignRequestPriority.NORMAL,
        nullable=False,
        index=True,
    )
    internal_status: Mapped[str | None] = mapped_column(String(120), index=True)
    image_generation_status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    last_admin_viewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User | None] = relationship(back_populates="design_requests", foreign_keys=[user_id])
    anonymous_session: Mapped[AnonymousSession | None] = relationship(back_populates="design_requests")
    payment: Mapped[Payment | None] = relationship(foreign_keys=[payment_id])
    generated_designs: Mapped[list[GeneratedDesign]] = relationship(
        back_populates="design_request", cascade="all, delete-orphan"
    )
    selected_design: Mapped[SelectedDesign | None] = relationship(back_populates="design_request", uselist=False)
    assigned_to: Mapped[User | None] = relationship(
        back_populates="assigned_design_requests",
        foreign_keys=[assigned_to_id],
    )
    ai_generation_logs: Mapped[list[AIGenerationLog]] = relationship(
        back_populates="design_request",
        cascade="all, delete-orphan",
    )


class GeneratedDesign(TimestampMixin, Base):
    __tablename__ = "generated_designs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    design_request_id: Mapped[str] = mapped_column(ForeignKey("design_requests.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    style: Mapped[str] = mapped_column(String(120))
    mood: Mapped[str | None] = mapped_column(String(120))
    preview_image_url: Mapped[str | None] = mapped_column(Text)
    ai_image_prompt: Mapped[str | None] = mapped_column(Text)
    ai_text_response: Mapped[dict[str, Any]] = mapped_column(JSON)
    estimated_total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    budget_status: Mapped[BudgetStatus] = mapped_column(Enum(BudgetStatus))
    design_notes: Mapped[list[str]] = mapped_column(JSON)
    rank: Mapped[int] = mapped_column(Integer)

    design_request: Mapped[DesignRequest] = relationship(back_populates="generated_designs")
    products: Mapped[list[GeneratedDesignProduct]] = relationship(
        back_populates="generated_design", cascade="all, delete-orphan"
    )
    selected_design: Mapped[SelectedDesign | None] = relationship(back_populates="generated_design", uselist=False)


class GeneratedDesignProduct(TimestampMixin, Base):
    __tablename__ = "generated_design_products"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    generated_design_id: Mapped[str] = mapped_column(ForeignKey("generated_designs.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    quantity: Mapped[int] = mapped_column(Integer)
    image_url: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(120))
    availability_status: Mapped[str] = mapped_column(String(120))
    location_label: Mapped[str] = mapped_column(String(255))
    included_by_default: Mapped[bool] = mapped_column(Boolean, default=True)

    generated_design: Mapped[GeneratedDesign] = relationship(back_populates="products")
    product: Mapped[Product | None] = relationship(back_populates="generated_design_products")


class Vendor(TimestampMixin, Base):
    __tablename__ = "vendors"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(255), index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    logo_url: Mapped[str | None] = mapped_column(Text)
    banner_url: Mapped[str | None] = mapped_column(Text)
    website_url: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    contact_person: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(320))
    phone: Mapped[str | None] = mapped_column(String(80))
    address: Mapped[str | None] = mapped_column(Text)
    status: Mapped[VendorStatus] = mapped_column(Enum(VendorStatus), default=VendorStatus.ACTIVE, index=True)

    products: Mapped[list["Product"]] = relationship(back_populates="vendor", cascade="all, delete-orphan")


class Product(TimestampMixin, Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    vendor_id: Mapped[str] = mapped_column(ForeignKey("vendors.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(120), index=True)
    subcategory: Mapped[str | None] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    image_url: Mapped[str] = mapped_column(Text)
    brand: Mapped[str | None] = mapped_column(String(255))
    material: Mapped[str | None] = mapped_column(String(255))
    color: Mapped[str | None] = mapped_column(String(120))
    style_tags: Mapped[list[str]] = mapped_column(JSON)
    item_type: Mapped[str] = mapped_column(String(120), index=True)
    room_types: Mapped[list[str]] = mapped_column(JSON)
    design_types: Mapped[list[str]] = mapped_column(JSON)
    city: Mapped[str] = mapped_column(String(120), index=True)
    state: Mapped[str | None] = mapped_column(String(120), index=True)
    country: Mapped[str] = mapped_column(String(120), index=True)
    postal_code: Mapped[str | None] = mapped_column(String(40))
    stock_status: Mapped[StockStatus] = mapped_column(Enum(StockStatus), default=StockStatus.IN_STOCK, index=True)
    vendor_name: Mapped[str | None] = mapped_column(String(255))
    vendor_url: Mapped[str | None] = mapped_column(Text)
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)

    vendor: Mapped[Vendor] = relationship(back_populates="products")
    generated_design_products: Mapped[list[GeneratedDesignProduct]] = relationship(back_populates="product")


class SelectedDesign(TimestampMixin, Base):
    __tablename__ = "selected_designs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    design_request_id: Mapped[str] = mapped_column(ForeignKey("design_requests.id", ondelete="CASCADE"), unique=True)
    generated_design_id: Mapped[str] = mapped_column(ForeignKey("generated_designs.id", ondelete="CASCADE"), unique=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    anonymous_session_id: Mapped[str | None] = mapped_column(
        ForeignKey("anonymous_sessions.id", ondelete="SET NULL"), index=True
    )
    customer_name: Mapped[str] = mapped_column(String(255))
    customer_email: Mapped[str] = mapped_column(String(320))
    customer_phone: Mapped[str] = mapped_column(String(80))
    preferred_contact_time: Mapped[str | None] = mapped_column(String(255))
    final_estimated_total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    selected_products: Mapped[list[dict[str, Any]]] = mapped_column(JSON)
    notes: Mapped[str | None] = mapped_column(Text)
    status: Mapped[SelectedDesignStatus] = mapped_column(
        Enum(SelectedDesignStatus), default=SelectedDesignStatus.NEW, index=True
    )
    assigned_to_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    last_contacted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)

    design_request: Mapped[DesignRequest] = relationship(back_populates="selected_design")
    generated_design: Mapped[GeneratedDesign] = relationship(back_populates="selected_design")
    user: Mapped[User | None] = relationship(back_populates="selected_designs", foreign_keys=[user_id])
    anonymous_session: Mapped[AnonymousSession | None] = relationship(back_populates="selected_designs")
    bookings: Mapped[list[Booking]] = relationship(back_populates="selected_design")
    assigned_to: Mapped[User | None] = relationship(
        back_populates="assigned_selected_designs",
        foreign_keys=[assigned_to_id],
    )


class Booking(TimestampMixin, Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    anonymous_session_id: Mapped[str | None] = mapped_column(
        ForeignKey("anonymous_sessions.id", ondelete="SET NULL"), index=True
    )
    selected_design_id: Mapped[str | None] = mapped_column(ForeignKey("selected_designs.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(320))
    phone: Mapped[str] = mapped_column(String(80))
    project_type: Mapped[str] = mapped_column(String(120))
    preferred_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    preferred_time: Mapped[str] = mapped_column(String(120))
    city: Mapped[str] = mapped_column(String(120))
    state: Mapped[str | None] = mapped_column(String(120))
    country: Mapped[str] = mapped_column(String(120))
    budget_range: Mapped[str] = mapped_column(String(120))
    message: Mapped[str | None] = mapped_column(Text)
    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), default=BookingStatus.REQUESTED, index=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    assigned_to_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)

    user: Mapped[User | None] = relationship(back_populates="bookings", foreign_keys=[user_id])
    anonymous_session: Mapped[AnonymousSession | None] = relationship(back_populates="bookings")
    selected_design: Mapped[SelectedDesign | None] = relationship(back_populates="bookings")
    assigned_to: Mapped[User | None] = relationship(back_populates="assigned_bookings", foreign_keys=[assigned_to_id])


class ContactMessage(TimestampMixin, Base):
    __tablename__ = "contact_messages"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(320))
    phone: Mapped[str | None] = mapped_column(String(80))
    subject: Mapped[str | None] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[ContactMessageStatus] = mapped_column(
        Enum(ContactMessageStatus), default=ContactMessageStatus.NEW
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    replied_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)


class BlogPost(TimestampMixin, Base):
    __tablename__ = "blog_posts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    excerpt: Mapped[str] = mapped_column(Text)
    content: Mapped[list[str]] = mapped_column(JSON)
    cover_image_url: Mapped[str] = mapped_column(Text)
    author_name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(120), index=True)
    tags: Mapped[list[str]] = mapped_column(JSON)
    published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)


class AIGenerationLog(TimestampMixin, Base):
    __tablename__ = "ai_generation_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    design_request_id: Mapped[str] = mapped_column(ForeignKey("design_requests.id", ondelete="CASCADE"), index=True)
    status: Mapped[AIGenerationStatus] = mapped_column(Enum(AIGenerationStatus), nullable=False, index=True)
    model_text: Mapped[str | None] = mapped_column(String(120))
    model_image: Mapped[str | None] = mapped_column(String(120))
    prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    completion_tokens: Mapped[int | None] = mapped_column(Integer)
    total_tokens: Mapped[int | None] = mapped_column(Integer)
    error_code: Mapped[str | None] = mapped_column(String(120), index=True)
    error_message: Mapped[str | None] = mapped_column(Text)
    raw_request_summary: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    raw_response_summary: Mapped[dict[str, Any] | None] = mapped_column(JSON)

    design_request: Mapped[DesignRequest] = relationship(back_populates="ai_generation_logs")


class AdminNote(TimestampMixin, Base):
    __tablename__ = "admin_notes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    entity_type: Mapped[AdminNoteEntityType] = mapped_column(Enum(AdminNoteEntityType), nullable=False, index=True)
    entity_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    note: Mapped[str] = mapped_column(Text, nullable=False)
    created_by_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    created_by: Mapped[User] = relationship(back_populates="admin_notes")


class AdminAuditLog(TimestampMixin, Base):
    __tablename__ = "admin_audit_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    actor_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    action: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    entity_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    event_metadata: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSON)

    actor_user: Mapped[User] = relationship(back_populates="admin_audit_logs")


class BusinessSetting(TimestampMixin, Base):
    __tablename__ = "business_settings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    key: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    value: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    updated_by_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)


class Payment(TimestampMixin, Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    anonymous_session_id: Mapped[str | None] = mapped_column(
        ForeignKey("anonymous_sessions.id", ondelete="SET NULL"), index=True
    )
    design_request_id: Mapped[str | None] = mapped_column(ForeignKey("design_requests.id", ondelete="SET NULL"))
    stripe_checkout_session_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(255))
    amount: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.PENDING, index=True)

    user: Mapped[User | None] = relationship(back_populates="payments")
    anonymous_session: Mapped[AnonymousSession | None] = relationship(back_populates="payments")


class PasswordResetToken(TimestampMixin, Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="password_reset_tokens")


class EmailVerificationToken(TimestampMixin, Base):
    __tablename__ = "email_verification_tokens"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="email_verification_tokens")


class CustomerAccountEvent(TimestampMixin, Base):
    __tablename__ = "customer_account_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    event_metadata: Mapped[dict[str, Any] | None] = mapped_column(JSON)

    user: Mapped[User] = relationship(back_populates="account_events")


class AdminUser(TimestampMixin, Base):
    __tablename__ = "admin_users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(80), default="ADMIN")
