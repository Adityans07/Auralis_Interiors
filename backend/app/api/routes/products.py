from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api import ProductsSearchIn
from app.services.products.matching import candidate_to_dict, search_matching_products
from app.utils.responses import success

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/search")
def search_products(payload: ProductsSearchIn, db: Session = Depends(get_db)):
    result = search_matching_products(db, payload)
    return success(
        {
            "products": [candidate_to_dict(candidate) for candidate in result["products"]],
            "groupedByItemType": result["groupedByItemType"],
        }
    )

