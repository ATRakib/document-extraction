from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from typing import List, Dict, Any
from app.services.extraction_service import ExtractionService
from app.services.product_service import ProductService
from app.repositories.product_repository import ProductRepository
from app.config.database import get_db
from app.utils.security import check_permission
import pyodbc

router = APIRouter(prefix="/api/upload", tags=["Document Upload & Extraction"])

@router.post("/extract/preview")
async def extract_preview(
    file: UploadFile = File(...),
    keywords: str = Form(""),
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Read"))
):
    extraction_service = ExtractionService()
    product_repo = ProductRepository(conn)
    
    try:
        result = await extraction_service.process_document(file, keywords)
        
        # Check if file already processed
        is_duplicate = product_repo.check_file_processed(result["file_hash"])
        
        return {
            "message": "Preview generated successfully",
            "product_data_list": result["product_data_list"],
            "is_duplicate": is_duplicate,
            "file_hash": result["file_hash"],
            "file_name": result["file_name"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

@router.post("/save/extracted")
async def save_extracted_products(
    data: Dict[str, Any] = Body(...),
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Create"))
):
    product_service = ProductService(conn)
    product_repo = ProductRepository(conn)
    
    product_data_list = data.get("product_data_list", [])
    file_hash = data.get("file_hash", "")
    file_name = data.get("file_name", "")
    
    try:
        # Check if file already processed
        if product_repo.check_file_processed(file_hash):
            raise HTTPException(
                status_code=400, 
                detail=f"Duplicate file detected! '{file_name}' has already been processed."
            )
        
        inserted_products = []
        for product_data in product_data_list:
            insert_result = product_service.insert_product_with_specifications(
                product_data["master"],
                product_data["specifications"]
            )
            inserted_products.append(insert_result)
        
        # Mark file as processed
        product_repo.mark_file_as_processed(file_name, file_hash)
        
        return {
            "message": f"{len(inserted_products)} product(s) saved successfully",
            "products": inserted_products
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Save failed: {str(e)}")

# from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
# from typing import List, Dict, Any
# from app.services.extraction_service import ExtractionService
# from app.services.product_service import ProductService
# from app.config.database import get_db
# from app.utils.security import check_permission
# import pyodbc

# router = APIRouter(prefix="/api/upload", tags=["Document Upload & Extraction"])

# @router.post("/document")
# async def upload_document(
#     file: UploadFile = File(...),
#     keywords: str = Form(""),
#     conn: pyodbc.Connection = Depends(get_db),
#     current_user = Depends(check_permission("Create"))
# ):
#     extraction_service = ExtractionService()
    
#     try:
#         result = await extraction_service.process_document(file, keywords)
#         return {
#             "message": "Document processed successfully",
#             "extracted_text": result["extracted_text"][:500] + "...",
#             "product_data_list": result["product_data_list"]
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

# @router.post("/extract/products")
# async def extract_and_insert_products(
#     file: UploadFile = File(...),
#     keywords: str = Form(""),
#     conn: pyodbc.Connection = Depends(get_db),
#     current_user = Depends(check_permission("Create"))
# ):
#     extraction_service = ExtractionService()
#     product_service = ProductService(conn)
    
#     try:
#         result = await extraction_service.process_document(file, keywords)
#         product_data_list = result["product_data_list"]
        
#         inserted_products = []
#         for product_data in product_data_list:
#             insert_result = product_service.insert_product_with_specifications(
#                 product_data["master"],
#                 product_data["specifications"]
#             )
#             inserted_products.append(insert_result)
        
#         return {
#             "message": f"{len(inserted_products)} product(s) extracted and inserted successfully",
#             "products": inserted_products
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Process failed: {str(e)}")

# @router.post("/extract/preview")
# async def extract_preview(
#     file: UploadFile = File(...),
#     keywords: str = Form(""),
#     conn: pyodbc.Connection = Depends(get_db),
#     current_user = Depends(check_permission("Read"))
# ):
#     extraction_service = ExtractionService()
    
#     try:
#         result = await extraction_service.process_document(file, keywords)
#         return {
#             "message": "Preview generated successfully",
#             "product_data_list": result["product_data_list"]
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

# @router.post("/save/extracted")
# async def save_extracted_products(
#     product_data_list: List[Dict[str, Any]] = Body(...),
#     conn: pyodbc.Connection = Depends(get_db),
#     current_user = Depends(check_permission("Create"))
# ):
#     product_service = ProductService(conn)
    
#     try:
#         inserted_products = []
#         for product_data in product_data_list:
#             insert_result = product_service.insert_product_with_specifications(
#                 product_data["master"],
#                 product_data["specifications"]
#             )
#             inserted_products.append(insert_result)
        
#         return {
#             "message": f"{len(inserted_products)} product(s) saved successfully",
#             "products": inserted_products
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Save failed: {str(e)}")

