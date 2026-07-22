#!/usr/bin/env python3
"""
Test script to verify admin product update functionality works correctly.
"""

import sys
import os
from datetime import datetime, timedelta, timezone
from decimal import Decimal

# Add the backend directory to the path
sys.path.insert(0, '/Users/aditya/auralis-interiors/backend')

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models.entities import (
    Product,
    StockStatus,
    User,
    UserRole,
    UserStatus,
    AnonymousSession,
    UserSession
)
from app.schemas.admin import ProductPatchIn
from app.security.session import _hash
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient


def _seed_test_data(db):
    """Create test data for our tests"""
    # Create admin user
    admin = User(
        name="Admin",
        email="admin@example.com",
        password_hash="hashed",
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value,
    )

    # Create a regular user for context
    user = User(
        name="User",
        email="user@example.com",
        password_hash="hashed",
        role=UserRole.CUSTOMER.value,
        status=UserStatus.ACTIVE.value,
    )

    db.add_all([admin, user])
    db.flush()

    # Create sessions
    admin_token = "admin-session-token-test"
    admin_csrf = "admin-csrf-token-test"
    now = datetime.now(timezone.utc)

    db.add_all([
        UserSession(
            user_id=admin.id,
            session_token_hash=_hash(admin_token),
            csrf_token_hash=_hash(admin_csrf),
            expires_at=now + timedelta(hours=1),
        )
    ])

    # Create anonymous session for context
    anon = AnonymousSession(session_token="anon-admin-test-test")
    db.add(anon)
    db.flush()

    # Create a test product
    product = Product(
        name="Test Product",
        slug="test-product-initial",
        category="furniture",
        description="A test product for verification",
        price=Decimal('99.99'),
        currency="USD",
        image_url="https://example.com/image.jpg",
        brand="TestBrand",
        material="Wood",
        color="Brown",
        style_tags=["modern", "minimal"],
        item_type="chair",
        room_types=["living-room"],
        design_types=["interior"],
        city="Austin",
        state="TX",
        country="US",
        postal_code="78701",
        stock_status=StockStatus.IN_STOCK,
        vendor_name="Test Vendor",
        vendor_url="https://example.com/vendor",
        archived_at=None,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return admin, admin_token, admin_csrf, anon, product


def _set_auth_cookies(client, session_token: str, csrf_token: str):
    """Set authentication cookies on the test client"""
    client.cookies.set("auralis_session", session_token)
    client.cookies.set("auralis_csrf", csrf_token)
    return {"x-csrf-token": csrf_token}


def test_product_update_direct():
    """Test the product update function directly"""
    print("Testing product update function directly...")

    # Setup database
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        future=True,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    db = SessionLocal()

    try:
        # Seed test data
        admin, admin_token, admin_csrf, anon, product = _seed_test_data(db)

        # Test data for update
        update_data = ProductPatchIn(
            name="Updated Product Name",
            description="Updated description for testing",
            price=Decimal('149.99'),
            stock_status=StockStatus.OUT_OF_STOCK,  # Use correct enum value
            style_tags=["contemporary", "organic"],
            room_types=["bedroom"],
            vendor_name="Updated Vendor",
            archived=False  # Make sure it's not archived initially
        )

        # Import and test the patch function directly
        from app.api.routes.admin import patch_product

        # Call the patch function
        result = patch_product(
            product_id=product.id,
            payload=update_data,
            db=db
        )

        print(f"Update result: {result}")

        # Verify the product was updated
        db.refresh(product)

        print("\nVerifying updates:")
        print(f"  Name: {product.name} (expected: Updated Product Name)")
        print(f"  Description: {product.description} (expected: Updated description for testing)")
        print(f"  Price: {product.price} (expected: 149.99)")
        print(f"  Stock Status: {product.stock_status} (expected: OUT_OF_STOCK)")
        print(f"  Style Tags: {product.style_tags} (expected: ['contemporary', 'organic'])")
        print(f"  Room Types: {product.room_types} (expected: ['bedroom'])")
        print(f"  Vendor Name: {product.vendor_name} (expected: Updated Vendor)")
        print(f"  Archived At: {product.archived_at} (expected: None since archived=False)")

        # Assertions
        assert product.name == "Updated Product Name"
        assert product.description == "Updated description for testing"
        assert product.price == Decimal('149.99')
        assert product.stock_status.value == "OUT_OF_STOCK"
        assert product.style_tags == ["contemporary", "organic"]
        assert product.room_types == ["bedroom"]
        assert product.vendor_name == "Updated Vendor"
        assert product.archived_at is None  # Should be None since we set archived=False

        print("\n✓ Direct function test PASSED")

        # Now test archiving the product
        print("\nTesting product archiving...")
        archive_data = ProductPatchIn(archived=True)

        result_archive = patch_product(
            product_id=product.id,
            payload=archive_data,
            db=db
        )

        print(f"Archive result: {result_archive}")

        db.refresh(product)
        print(f"  Archived At: {product.archived_at} (should be a timestamp now)")

        assert product.archived_at is not None
        print("✓ Archiving test PASSED")

        # Test unarchiving
        print("\nTesting product unarchiving...")
        unarchive_data = ProductPatchIn(archived=False)

        result_unarchive = patch_product(
            product_id=product.id,
            payload=unarchive_data,
            db=db
        )

        print(f"Unarchive result: {result_unarchive}")

        db.refresh(product)
        print(f"  Archived At: {product.archived_at} (should be None again)")

        assert product.archived_at is None
        print("✓ Unarchiving test PASSED")

    except Exception as e:
        print(f"❌ Test FAILED with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

    return True


def test_product_update_via_api():
    """Test the product update via HTTP API"""
    print("\n\nTesting product update via HTTP API...")

    # Setup database
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        future=True,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    db = SessionLocal()

    try:
        # Seed test data
        admin, admin_token, admin_csrf, anon, product = _seed_test_data(db)

        # Create test app
        app = create_app()

        # Override dependency
        def override_get_db():
            try:
                yield db
            finally:
                pass

        app.dependency_overrides[get_db] = override_get_db

        # Create test client
        client = TestClient(app)

        # Set auth cookies
        headers = _set_auth_cookies(client, admin_token, admin_csrf)

        # Test PATCH request
        update_payload = {
            "name": "API Updated Product",
            "description": "Updated via API test",
            "price": 199.99,
            "stockStatus": "IN_STOCK",  # Changed from ORDER_BASED to valid value
            "styleTags": ["scandinavian", "coastal"],
            "roomTypes": ["bathroom"],
            "vendorName": "API Vendor",
            "archived": False
        }

        response = client.patch(
            f"/api/admin/products/{product.id}",
            headers=headers,
            json=update_payload
        )

        print(f"API Response Status: {response.status_code}")
        print(f"API Response Body: {response.json()}")

        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✓ API test PASSED - Product updated successfully via API")

                # Verify in database
                db.refresh(product)
                assert product.name == "API Updated Product"
                assert product.description == "Updated via API test"
                assert product.price == Decimal('199.99')
                assert product.stock_status.value == "IN_STOCK"  # Changed from ORDER_BASED
                assert product.style_tags == ["scandinavian", "coastal"]
                assert product.room_types == ["bathroom"]
                assert product.vendor_name == "API Vendor"
                assert product.archived_at is None

                print("✓ Database verification PASSED")
                return True
            else:
                print(f"❌ API test FAILED - Success flag false: {data}")
                return False
        else:
            print(f"❌ API test FAILED - Status {response.status_code}: {response.json()}")
            return False

    except Exception as e:
        print(f"❌ API test FAILED with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Testing Admin Product Update Functionality")
    print("=" * 60)

    success1 = test_product_update_direct()
    success2 = test_product_update_via_api()

    print("\n" + "=" * 60)
    if success1 and success2:
        print("🎉 ALL TESTS PASSED - Product update functionality works correctly!")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED - There may be issues with product updates")
        sys.exit(1)