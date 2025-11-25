from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User(BaseModel):
    Id: Optional[int] = None
    Username: str
    Email: str
    HashedPassword: str
    IsActive: bool = True
    CreatedAt: Optional[datetime] = None

class Role(BaseModel):
    Id: Optional[int] = None
    RoleName: str
    Description: Optional[str] = None
    CreatedAt: Optional[datetime] = None

class Permission(BaseModel):
    Id: Optional[int] = None
    PermissionName: str
    Description: Optional[str] = None
    CreatedAt: Optional[datetime] = None