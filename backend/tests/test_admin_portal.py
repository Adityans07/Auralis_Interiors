from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models.entities import (
    AnonymousSession,
    Booking,
    BookingStatus,
    DesignRequest,
    DesignRequestStatus,
    DesignType,
    GeneratedDesign,
    Payment,
    PaymentStatus,
    SelectedDesign,
    SelectedDesignStatus,
    User,
    UserRole,
    UserSession,
    UserStatus,
)
from app.security.session import _hash


def _seed_users(db: Session) -> tuple[User, User, str, str, str, str]:
    admin = User(
        name="Admin",
        email="admin@example.com",
        password_hash="hashed",
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value,
    )
    customer = User(
        name="Customer",
        email="customer@example.com",
        password_hash="hashed",
        role=UserRole.CUSTOMER.value,
        status=UserStatus.ACTIVE.value,
    )
    db.add_all([admin, customer])
    db.flush()

    admin_token = "admin-session-token"
    customer_token = "customer-session-token"
    admin_csrf = "admin-csrf-token"
    customer_csrf = "customer-csrf-token"
    now = datetime.now(timezone.utc)
    db.add_all(
        [
            UserSession(
                user_id=admin.id,
                session_token_hash=_hash(admin_token),
                csrf_token_hash=_hash(admin_csrf),
                expires_at=now + timedelta(hours=1),
            ),
            UserSession(
                user_id=customer.id,
                session_token_hash=_hash(customer_token),
                csrf_token_hash=_hash(customer_csrf),
                expires_at=now + timedelta(hours=1),
            ),
        ]
    )

    anon = AnonymousSession(session_token="anon-admin-test")
    db.add(anon)
    db.flush()

    request = DesignRequest(
        user_id=customer.id,
        status=DesignRequestStatus.FAILED,
        design_type=DesignType.INTERIOR,
        space_type="living-room",
        description="Need help",
        city="Austin",
        country="US",
        budget=Decimal("2500"),
        currency="USD",
        style="modern",
        selected_items=[{"label": "sofa", "category": "furniture"}],
        free_generation_applied=True,
    )
    db.add(request)
    db.flush()

    generated = GeneratedDesign(
        design_request_id=request.id,
        title="Concept A",
        description="desc",
        style="modern",
        ai_text_response={},
        estimated_total=Decimal("2300"),
        currency="USD",
        budget_status="WITHIN_BUDGET",
        design_notes=["note"],
        rank=1,
    )
    db.add(generated)
    db.flush()

    selected = SelectedDesign(
        design_request_id=request.id,
        generated_design_id=generated.id,
        user_id=customer.id,
        customer_name="Customer",
        customer_email="customer@example.com",
        customer_phone="1234567890",
        final_estimated_total=Decimal("2300"),
        selected_products=[],
        status=SelectedDesignStatus.NEW,
    )
    db.add(selected)

    booking = Booking(
        user_id=customer.id,
        selected_design_id=selected.id,
        name="Customer",
        email="customer@example.com",
        phone="1234567890",
        project_type="interior",
        preferred_date=datetime.now(timezone.utc),
        preferred_time="10:00",
        city="Austin",
        country="US",
        budget_range="$2,000-$5,000",
        status=BookingStatus.REQUESTED,
    )
    db.add(booking)

    payment = Payment(
        user_id=customer.id,
        design_request_id=request.id,
        stripe_checkout_session_id="cs_test_admin_portal",
        amount=2900,
        currency="USD",
        status=PaymentStatus.PAID,
    )
    db.add(payment)

    db.commit()
    db.refresh(admin)
    db.refresh(customer)
    db.refresh(request)
    db.refresh(selected)
    db.refresh(booking)

    return admin, customer, admin_token, customer_token, admin_csrf, customer_csrf


def _client_with_db() -> tuple[TestClient, Session, str, str, str, str, User, User, DesignRequest, SelectedDesign, Booking]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        future=True,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    db = SessionLocal()
    admin, customer, admin_token, customer_token, admin_csrf, customer_csrf = _seed_users(db)

    app = create_app()

    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    client = TestClient(app)

    request = db.query(DesignRequest).first()
    selected = db.query(SelectedDesign).first()
    booking = db.query(Booking).first()
    return client, db, admin_token, customer_token, admin_csrf, customer_csrf, admin, customer, request, selected, booking


def _set_auth_cookies(client: TestClient, session_token: str, csrf_token: str) -> dict[str, str]:
    client.cookies.set("auralis_session", session_token)
    client.cookies.set("auralis_csrf", csrf_token)
    return {"x-csrf-token": csrf_token}


def test_guest_cannot_access_admin_dashboard():
    client, db, *_ = _client_with_db()
    response = client.get("/api/admin/dashboard")
    assert response.status_code == 401
    assert response.json()["success"] is False
    db.close()


def test_customer_cannot_access_admin_dashboard():
    client, db, _admin_token, customer_token, *_ = _client_with_db()
    client.cookies.set("auralis_session", customer_token)
    response = client.get("/api/admin/dashboard")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"
    db.close()


def test_admin_can_access_dashboard():
    client, db, admin_token, *_ = _client_with_db()
    client.cookies.set("auralis_session", admin_token)
    response = client.get("/api/admin/dashboard")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "stats" in response.json()["data"]
    db.close()


def test_product_create_validation_fails_for_negative_price():
    client, db, admin_token, _customer_token, admin_csrf, *_ = _client_with_db()
    headers = _set_auth_cookies(client, admin_token, admin_csrf)
    response = client.post(
        "/api/admin/products",
        headers=headers,
        json={
            "name": "Invalid",
            "slug": "invalid-product",
            "category": "decor",
            "description": "invalid payload for testing",
            "price": -1,
            "currency": "USD",
            "imageUrl": "https://example.com/p.jpg",
            "itemType": "vase",
            "roomTypes": ["living-room"],
            "designTypes": ["interior"],
            "city": "Austin",
            "country": "US",
            "stockStatus": "IN_STOCK",
        },
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    db.close()


def test_product_update_validation_fails_for_negative_price():
    client, db, admin_token, _customer_token, admin_csrf, *_ = _client_with_db()
    headers = _set_auth_cookies(client, admin_token, admin_csrf)

    create_resp = client.post(
        "/api/admin/products",
        headers=headers,
        json={
            "name": "Chair",
            "slug": "chair-x",
            "category": "furniture",
            "description": "chair product for patch validation",
            "price": 120,
            "currency": "USD",
            "imageUrl": "https://example.com/chair.jpg",
            "itemType": "chair",
            "roomTypes": ["living-room"],
            "designTypes": ["interior"],
            "city": "Austin",
            "country": "US",
            "stockStatus": "IN_STOCK",
        },
    )
    product_id = create_resp.json()["data"]["id"]

    patch_resp = client.patch(f"/api/admin/products/{product_id}", headers=headers, json={"price": -50})
    assert patch_resp.status_code == 400
    assert patch_resp.json()["error"]["code"] == "VALIDATION_ERROR"
    db.close()


def test_blog_create_validation_fails_for_short_content():
    client, db, admin_token, _customer_token, admin_csrf, *_ = _client_with_db()
    headers = _set_auth_cookies(client, admin_token, admin_csrf)
    response = client.post(
        "/api/admin/blogs",
        headers=headers,
        json={
            "title": "A",
            "slug": "short",
            "excerpt": "short",
            "content": "too short",
            "coverImageUrl": "x",
            "authorName": "X",
            "category": "Tips",
            "tags": [],
            "published": False,
        },
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    db.close()


def test_booking_status_update_works():
    client, db, admin_token, _customer_token, admin_csrf, *_rest = _client_with_db()
    booking = db.query(Booking).first()
    headers = _set_auth_cookies(client, admin_token, admin_csrf)
    response = client.patch(f"/api/admin/bookings/{booking.id}", headers=headers, json={"status": "CONFIRMED"})
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "CONFIRMED"
    db.close()


def test_selected_design_status_update_works():
    client, db, admin_token, _customer_token, admin_csrf, *_rest = _client_with_db()
    selected = db.query(SelectedDesign).first()
    headers = _set_auth_cookies(client, admin_token, admin_csrf)
    response = client.patch(f"/api/admin/selected-designs/{selected.id}", headers=headers, json={"status": "CONTACTED"})
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "CONTACTED"
    db.close()


def test_admin_note_creation_works():
    client, db, admin_token, _customer_token, admin_csrf, *_rest = _client_with_db()
    request = db.query(DesignRequest).first()
    headers = _set_auth_cookies(client, admin_token, admin_csrf)
    response = client.post(
        f"/api/admin/design-requests/{request.id}/notes",
        headers=headers,
        json={
            "entityType": "DESIGN_REQUEST",
            "entityId": request.id,
            "note": "Followed up with customer",
        },
    )
    assert response.status_code == 201
    assert response.json()["success"] is True
    db.close()


def test_customer_detail_does_not_expose_password_hash():
    client, db, admin_token, _customer_token, _admin_csrf, _customer_csrf, _admin, customer, *_rest = _client_with_db()
    client.cookies.set("auralis_session", admin_token)
    response = client.get(f"/api/admin/customers/{customer.id}")
    assert response.status_code == 200
    payload = response.json()["data"]["customer"]
    assert "passwordHash" not in payload
    assert "password_hash" not in payload
    db.close()


def test_admin_mutation_requires_csrf_header():
    client, db, admin_token, *_ = _client_with_db()
    client.cookies.set("auralis_session", admin_token)
    client.cookies.set("auralis_csrf", "admin-csrf-token")

    response = client.post(
        "/api/admin/products",
        json={
            "name": "New Chair",
            "slug": "new-chair",
            "category": "furniture",
            "description": "chair product for csrf guard",
            "price": 120,
            "currency": "USD",
            "imageUrl": "https://example.com/chair.jpg",
            "itemType": "chair",
            "roomTypes": ["living-room"],
            "designTypes": ["interior"],
            "city": "Austin",
            "country": "US",
            "stockStatus": "IN_STOCK",
        },
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_INVALID"
    db.close()
