from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Vendor, Product, User
from app.schemas.vendor import VendorIn, VendorPatchIn
from app.security.session import require_admin
from app.utils.responses import success

router = APIRouter()

@router.get("")
def list_vendors(
    page: int = Query(1, ge=1),
    pageSize: int = Query(50, ge=1, le=100),
    search: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Any:
    
    query = select(Vendor)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Vendor.name.ilike(search_term)) |
            (Vendor.website_url.ilike(search_term)) |
            (Vendor.description.ilike(search_term))
        )
        
    if status:
        query = query.where(Vendor.status == status)

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    query = query.order_by(Vendor.name.asc())
    query = query.offset((page - 1) * pageSize).limit(pageSize)
    
    vendors = db.execute(query).scalars().all()
    
    items = []
    for vendor in vendors:
        product_count = db.scalar(select(func.count()).select_from(Product).where(Product.vendor_id == vendor.id)) or 0
        vendor_dict = {
            "id": vendor.id,
            "name": vendor.name,
            "slug": vendor.slug,
            "logoUrl": vendor.logo_url,
            "bannerUrl": vendor.banner_url,
            "websiteUrl": vendor.website_url,
            "description": vendor.description,
            "contactPerson": vendor.contact_person,
            "email": vendor.email,
            "phone": vendor.phone,
            "address": vendor.address,
            "status": vendor.status,
            "createdAt": vendor.created_at,
            "updatedAt": vendor.updated_at,
            "productCount": product_count
        }
        items.append(vendor_dict)

    total_pages = (total + pageSize - 1) // pageSize

    return success({
        "items": items,
        "meta": {
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "totalPages": total_pages,
        }
    })


@router.post("")
def create_vendor(
    vendor_in: VendorIn,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Any:
    
    existing = db.execute(select(Vendor).where(Vendor.slug == vendor_in.slug)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Vendor with this slug already exists.")
        
    vendor = Vendor(
        name=vendor_in.name,
        slug=vendor_in.slug,
        logo_url=vendor_in.logoUrl,
        banner_url=vendor_in.bannerUrl,
        website_url=vendor_in.websiteUrl,
        description=vendor_in.description,
        contact_person=vendor_in.contactPerson,
        email=vendor_in.email,
        phone=vendor_in.phone,
        address=vendor_in.address,
        status=vendor_in.status
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    
    return success({
        "id": vendor.id,
        "name": vendor.name,
        "slug": vendor.slug,
        "logoUrl": vendor.logo_url,
        "bannerUrl": vendor.banner_url,
        "websiteUrl": vendor.website_url,
        "description": vendor.description,
        "contactPerson": vendor.contact_person,
        "email": vendor.email,
        "phone": vendor.phone,
        "address": vendor.address,
        "status": vendor.status,
        "createdAt": vendor.created_at,
        "updatedAt": vendor.updated_at,
        "productCount": 0
    })


@router.get("/{vendor_id}")
def get_vendor(
    vendor_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Any:
    
    vendor = db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    product_count = db.scalar(select(func.count()).select_from(Product).where(Product.vendor_id == vendor.id)) or 0
    
    return success({
        "id": vendor.id,
        "name": vendor.name,
        "slug": vendor.slug,
        "logoUrl": vendor.logo_url,
        "bannerUrl": vendor.banner_url,
        "websiteUrl": vendor.website_url,
        "description": vendor.description,
        "contactPerson": vendor.contact_person,
        "email": vendor.email,
        "phone": vendor.phone,
        "address": vendor.address,
        "status": vendor.status,
        "createdAt": vendor.created_at,
        "updatedAt": vendor.updated_at,
        "productCount": product_count
    })


@router.patch("/{vendor_id}")
def update_vendor(
    vendor_id: str,
    vendor_in: VendorPatchIn,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Any:
    
    vendor = db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    if vendor_in.slug is not None and vendor_in.slug != vendor.slug:
        existing = db.execute(select(Vendor).where(Vendor.slug == vendor_in.slug)).scalars().first()
        if existing:
            raise HTTPException(status_code=400, detail="Vendor with this slug already exists.")
            
    update_data = vendor_in.model_dump(exclude_unset=True)
    
    if "logoUrl" in update_data: vendor.logo_url = update_data["logoUrl"]
    if "bannerUrl" in update_data: vendor.banner_url = update_data["bannerUrl"]
    if "websiteUrl" in update_data: vendor.website_url = update_data["websiteUrl"]
    if "contactPerson" in update_data: vendor.contact_person = update_data["contactPerson"]
    
    for field in ["name", "slug", "description", "email", "phone", "address", "status"]:
        if field in update_data:
            setattr(vendor, field, update_data[field])
            
    db.commit()
    db.refresh(vendor)
    
    product_count = db.scalar(select(func.count()).select_from(Product).where(Product.vendor_id == vendor.id)) or 0
    
    return success({
        "id": vendor.id,
        "name": vendor.name,
        "slug": vendor.slug,
        "logoUrl": vendor.logo_url,
        "bannerUrl": vendor.banner_url,
        "websiteUrl": vendor.website_url,
        "description": vendor.description,
        "contactPerson": vendor.contact_person,
        "email": vendor.email,
        "phone": vendor.phone,
        "address": vendor.address,
        "status": vendor.status,
        "createdAt": vendor.created_at,
        "updatedAt": vendor.updated_at,
        "productCount": product_count
    })


@router.delete("/{vendor_id}")
def delete_vendor(
    vendor_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Any:
    
    vendor = db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    db.delete(vendor)
    db.commit()
    return success({"success": True})
