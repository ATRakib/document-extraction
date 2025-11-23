from fastapi import APIRouter, UploadFile, File, Depends, status, Form, HTTPException
from sqlalchemy.orm import Session
import os
import uuid
from app.models.schemas import DocumentUploadResponse, LLMExtractionResponse
from app.utils.document_processor import DocumentProcessor
from app.utils.validators import FileValidator
from app.services.extraction_service import ExtractionService
from app.services.product_service import ProductService
from app.database import get_db
from app.dependencies import require_permission
from app.config import settings

router = APIRouter()

@router.post("/document", response_model=DocumentUploadResponse, status_code=status.HTTP_200_OK)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("upload_document"))
):
    """Upload document and extract text"""
    try:
        # Validate file
        FileValidator.validate_file(file)
        
        # Create uploads directory if not exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_ext = file.filename.split('.')[-1]
        file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.{file_ext}")
        
        # Save file
        contents = await file.read()
        FileValidator.validate_file_size(len(contents))
        
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        # Extract text
        extracted_text = DocumentProcessor.extract_text(file_path)
        
        return {
            "file_id": file_id,
            "file_name": file.filename,
            "file_type": file.content_type,
            "file_path": file_path,
            "extracted_text": extracted_text
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/extract", response_model=LLMExtractionResponse)
async def extract_products(
    extracted_text: str = Form(...),
    keywords: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("create_product"))
):
    """Extract product data using GROQ LLM"""
    try:
        keywords_list = [k.strip() for k in keywords.split(',') if k.strip()] if keywords else []
        
        service = ExtractionService()
        result = service.groq_client.extract_product_data(extracted_text, keywords_list)
        
        return LLMExtractionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/extract-and-save", status_code=status.HTTP_201_CREATED)
async def extract_and_save(
    extracted_text: str = Form(...),
    keywords: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("create_product"))
):
    """Extract product data and save to database"""
    try:
        keywords_list = [k.strip() for k in keywords.split(',') if k.strip()] if keywords else []
        
        # Extract data
        service = ExtractionService()
        extraction = service.groq_client.extract_product_data(extracted_text, keywords_list)
        
        # Save to database
        product_service = ProductService(db)
        product_data = extraction["master"]
        specifications = extraction["specifications"]
        
        product = product_service.create_product_with_specs(
            product_data,
            specifications,
            current_user['user_id']
        )
        
        return {
            "success": True,
            "message": "Product extracted and saved successfully",
            "data": {
                "product_id": product.id,
                "model_name": product.model_name,
                "specifications_count": len(product.specifications)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )