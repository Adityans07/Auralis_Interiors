from fastapi import APIRouter

from app.api.routes import account, admin, auth, blogs, bookings, contact, designs, payments, products, uploads, users, vendors

api_router = APIRouter(prefix="/api")
api_router.include_router(designs.router)
api_router.include_router(products.router)
api_router.include_router(users.router)
api_router.include_router(auth.router)
api_router.include_router(account.router)
api_router.include_router(payments.router)
api_router.include_router(uploads.router)
api_router.include_router(bookings.router)
api_router.include_router(contact.router)
api_router.include_router(blogs.router)
api_router.include_router(admin.router)
api_router.include_router(vendors.router, prefix="/admin/vendors", tags=["Admin Vendors"])

