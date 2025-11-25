from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class Supplier(BaseModel):
    Id: Optional[int] = None
    Name: str
    Address1: Optional[str] = None
    Address2: Optional[str] = None
    Country: Optional[str] = None
    Phone: Optional[str] = None
    Email: Optional[str] = None
    Fax: Optional[str] = None
    CreatedAt: Optional[datetime] = None

class ProductMaster(BaseModel):
    Id: Optional[int] = None
    ModelName: str
    Description: Optional[str] = None
    CountryOfOrigin: Optional[str] = None
    SupplierId: Optional[int] = None
    ProductPrice: Optional[Decimal] = None
    Quotation: Optional[str] = None
    FileName: Optional[str] = None
    FileLocation: Optional[str] = None
    CreatedAt: Optional[datetime] = None

class ProductSpecification(BaseModel):
    Id: Optional[int] = None
    ProductId: int
    SpecificationName: Optional[str] = None
    Size: Optional[str] = None
    OtherTerms: Optional[str] = None
    ProductSpecificationPrice: Optional[Decimal] = None
    CreatedAt: Optional[datetime] = None