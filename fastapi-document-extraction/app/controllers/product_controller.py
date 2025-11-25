from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.product import SupplierCreate, SupplierResponse, ProductInsertRequest
from app.services.product_service import ProductService
from app.config.database import get_db
from app.utils.security import check_permission
import pyodbc

router = APIRouter(prefix="/api/products", tags=["Products"])

# ==================== SUPPLIER CRUD ====================

@router.post("/suppliers", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier_data: SupplierCreate,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Create"))
):
    product_service = ProductService(conn)
    supplier_id = product_service.create_supplier(supplier_data.dict())
    return {"message": "Supplier created successfully", "supplier_id": supplier_id}

@router.get("/suppliers", response_model=List[SupplierResponse])
def get_all_suppliers(
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Read"))
):
    product_service = ProductService(conn)
    suppliers = product_service.get_all_suppliers()
    return [SupplierResponse(**s.dict()) for s in suppliers]

@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
def get_supplier_by_id(
    supplier_id: int,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Read"))
):
    product_service = ProductService(conn)
    supplier = product_service.get_supplier_by_id(supplier_id)
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return SupplierResponse(**supplier.dict())

@router.put("/suppliers/{supplier_id}", response_model=dict)
def update_supplier(
    supplier_id: int,
    supplier_data: SupplierCreate,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Update"))
):
    product_service = ProductService(conn)
    
    existing_supplier = product_service.get_supplier_by_id(supplier_id)
    if not existing_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    product_service.update_supplier(supplier_id, supplier_data.dict())
    return {"message": "Supplier updated successfully", "supplier_id": supplier_id}

@router.delete("/suppliers/{supplier_id}", response_model=dict)
def delete_supplier(
    supplier_id: int,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Delete"))
):
    product_service = ProductService(conn)
    
    existing_supplier = product_service.get_supplier_by_id(supplier_id)
    if not existing_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    product_service.delete_supplier(supplier_id)
    return {"message": "Supplier deleted successfully", "supplier_id": supplier_id}

# ==================== PRODUCT CRUD ====================

@router.post("/insert", response_model=dict, status_code=status.HTTP_201_CREATED)
def insert_product(
    request: ProductInsertRequest,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Create"))
):
    product_service = ProductService(conn)
    result = product_service.insert_product_with_specifications(
        request.master,
        request.specifications
    )
    return {"message": "Product inserted successfully", "data": result}

@router.get("/", response_model=List[dict])
def get_all_products(
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Read"))
):
    product_service = ProductService(conn)
    products = product_service.get_all_products()
    return [p.dict() for p in products]

@router.get("/{product_id}", response_model=dict)
def get_product_by_id(
    product_id: int,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Read"))
):
    product_service = ProductService(conn)
    product = product_service.get_product_by_id(product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    specifications = product_service.get_specifications_by_product_id(product_id)
    
    return {
        "product": product.dict(),
        "specifications": [s.dict() for s in specifications]
    }

@router.put("/{product_id}", response_model=dict)
def update_product(
    product_id: int,
    request: ProductInsertRequest,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Update"))
):
    product_service = ProductService(conn)
    
    existing_product = product_service.get_product_by_id(product_id)
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    result = product_service.update_product_with_specifications(
        product_id,
        request.master,
        request.specifications
    )
    return {"message": "Product updated successfully", "data": result}

@router.delete("/{product_id}", response_model=dict)
def delete_product(
    product_id: int,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Delete"))
):
    product_service = ProductService(conn)
    
    existing_product = product_service.get_product_by_id(product_id)
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_service.delete_product(product_id)
    return {"message": "Product deleted successfully", "product_id": product_id}