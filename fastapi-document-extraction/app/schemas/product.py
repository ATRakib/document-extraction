from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class SupplierCreate(BaseModel):
    Name: str
    Address1: Optional[str] = None
    Address2: Optional[str] = None
    Country: Optional[str] = None
    Phone: Optional[str] = None
    Email: Optional[str] = None
    Fax: Optional[str] = None

class SupplierResponse(BaseModel):
    Id: int
    Name: str
    Address1: Optional[str] = None
    Address2: Optional[str] = None
    Country: Optional[str] = None
    Phone: Optional[str] = None
    Email: Optional[str] = None
    Fax: Optional[str] = None

class ProductMasterCreate(BaseModel):
    ModelName: str
    Description: Optional[str] = None
    CountryOfOrigin: Optional[str] = None
    SupplierId: Optional[int] = None
    ProductPrice: Optional[Decimal] = None
    Quotation: Optional[str] = None
    FileName: Optional[str] = None
    FileLocation: Optional[str] = None

class ProductSpecificationCreate(BaseModel):
    SpecificationName: Optional[str] = None
    Size: Optional[str] = None
    OtherTerms: Optional[str] = None
    ProductSpecificationPrice: Optional[Decimal] = None

class ProductExtractResponse(BaseModel):
    master: dict
    specifications: List[dict]

class ProductInsertRequest(BaseModel):
    master: dict
    specifications: List[dict]