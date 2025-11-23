from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserDetailResponse(UserResponse):
    roles: List['RoleResponse'] = []

# Role Schemas
class RoleBase(BaseModel):
    role_name: str = Field(..., min_length=3)
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    role_name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class RoleResponse(RoleBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class RoleDetailResponse(RoleResponse):
    permissions: List['PermissionResponse'] = []

# Permission Schemas
class PermissionBase(BaseModel):
    permission_name: str
    description: Optional[str] = None
    resource: str
    action: str

class PermissionCreate(PermissionBase):
    pass

class PermissionResponse(PermissionBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductSpecificationCreate(BaseModel):
    specification_name: str
    size: Optional[str] = None
    other_terms: Optional[str] = None
    product_specification_price: Optional[Decimal] = None

class ProductSpecificationResponse(ProductSpecificationCreate):
    id: int
    product_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductMasterBase(BaseModel):
    model_name: str
    description: Optional[str] = None
    country_of_origin: Optional[str] = None
    manufacturer_id: Optional[int] = None
    product_price: Optional[Decimal] = None

class ProductMasterCreate(ProductMasterBase):
    specifications: List[ProductSpecificationCreate] = []

class ProductMasterResponse(ProductMasterBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductDetailResponse(ProductMasterResponse):
    specifications: List[ProductSpecificationResponse] = []

# LLM Extraction Schemas
class LLMExtractionRequest(BaseModel):
    extracted_text: str
    keywords: List[str] = []

class ProductMasterExtraction(BaseModel):
    model_name: str
    description: Optional[str] = None
    country_of_origin: Optional[str] = None
    manufacturer_id: Optional[int] = None
    product_price: Optional[Decimal] = None

class ProductSpecificationExtraction(BaseModel):
    specification_name: str
    size: Optional[str] = None
    other_terms: Optional[str] = None
    product_specification_price: Optional[Decimal] = None

class LLMExtractionResponse(BaseModel):
    master: ProductMasterExtraction
    specifications: List[ProductSpecificationExtraction]

# Authentication Schemas
class TokenData(BaseModel):
    user_id: int
    username: str
    roles: List[str]
    permissions: List[str]

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int

# Upload Schemas
class DocumentUploadResponse(BaseModel):
    file_id: str
    file_name: str
    file_type: str
    file_path: str
    extracted_text: str

# Assign Role to User
class AssignRoleRequest(BaseModel):
    user_id: int
    role_id: int

# Assign Permission to Role
class AssignPermissionRequest(BaseModel):
    role_id: int
    permission_id: int

# Generic Response
class GenericResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    data: List[dict]

# Update model forward references
UserDetailResponse.model_rebuild()
RoleDetailResponse.model_rebuild()