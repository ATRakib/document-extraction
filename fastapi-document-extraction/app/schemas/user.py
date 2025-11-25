from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserCreate(BaseModel):
    Username: str
    Email: EmailStr
    Password: str

class UserResponse(BaseModel):
    Id: int
    Username: str
    Email: str
    IsActive: bool

class RoleCreate(BaseModel):
    RoleName: str
    Description: Optional[str] = None

class RoleResponse(BaseModel):
    Id: int
    RoleName: str
    Description: Optional[str] = None

class PermissionCreate(BaseModel):
    PermissionName: str
    Description: Optional[str] = None

class PermissionResponse(BaseModel):
    Id: int
    PermissionName: str
    Description: Optional[str] = None

class AssignRoleRequest(BaseModel):
    UserId: int
    RoleId: int

class AssignPermissionRequest(BaseModel):
    RoleId: int
    PermissionId: int