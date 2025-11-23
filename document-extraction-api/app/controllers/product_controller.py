from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.models.schemas import ProductMasterResponse, ProductDetailResponse, ProductMasterCreate
from app.services.product_service import ProductService
from app.database import get_db
from app.dependencies import get_current_user, require_permission

router = APIRouter()

@router.post("/", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductMasterCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("create_product"))
):
    service = ProductService(db)
    product_data = product.model_dump(exclude={'specifications'})
    specs = [s.model_dump() for s in product.specifications]
    result = service.create_product_with_specs(product_data, specs, current_user['user_id'])
    return result

@router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("read_product"))
):
    service = ProductService(db)
    product = service.get_product(product_id)
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/", response_model=list[ProductMasterResponse])
async def get_all_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("read_product"))
):
    service = ProductService(db)
    return service.get_all_products(skip, limit)

@router.put("/{product_id}", response_model=ProductDetailResponse)
async def update_product(
    product_id: int,
    product: ProductMasterCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("update_product"))
):
    service = ProductService(db)
    product_data = product.model_dump(exclude={'specifications'})
    result = service.update_product(product_id, product_data)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    return result

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("delete_product"))
):
    service = ProductService(db)
    success = service.delete_product(product_id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
