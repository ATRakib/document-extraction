from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.user import (
    UserResponse, RoleCreate, RoleResponse, 
    PermissionCreate, PermissionResponse,
    AssignRoleRequest, AssignPermissionRequest
)
from app.services.user_service import UserService
from app.config.database import get_db
from app.utils.security import check_permission
import pyodbc

router = APIRouter(prefix="/api/users", tags=["User Management"])

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Read"))
):
    user_service = UserService(conn)
    users = user_service.get_all_users()
    return [UserResponse(Id=u.Id, Username=u.Username, Email=u.Email, IsActive=u.IsActive) for u in users]

@router.post("/roles", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_role(
    role_data: RoleCreate,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Create"))
):
    user_service = UserService(conn)
    role_id = user_service.create_role(role_data.RoleName, role_data.Description)
    return {"message": "Role created successfully", "role_id": role_id}

@router.get("/roles", response_model=List[RoleResponse])
def get_all_roles(
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Read"))
):
    user_service = UserService(conn)
    roles = user_service.get_all_roles()
    return [RoleResponse(Id=r.Id, RoleName=r.RoleName, Description=r.Description) for r in roles]

@router.post("/permissions", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_permission(
    permission_data: PermissionCreate,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Create"))
):
    user_service = UserService(conn)
    permission_id = user_service.create_permission(permission_data.PermissionName, permission_data.Description)
    return {"message": "Permission created successfully", "permission_id": permission_id}

@router.get("/permissions", response_model=List[PermissionResponse])
def get_all_permissions(
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Read"))
):
    user_service = UserService(conn)
    permissions = user_service.get_all_permissions()
    return [PermissionResponse(Id=p.Id, PermissionName=p.PermissionName, Description=p.Description) for p in permissions]

@router.post("/assign-role", response_model=dict)
def assign_role_to_user(
    request: AssignRoleRequest,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Create"))
):
    user_service = UserService(conn)
    user_service.assign_role_to_user(request.UserId, request.RoleId)
    return {"message": "Role assigned successfully"}

@router.post("/assign-permission", response_model=dict)
def assign_permission_to_role(
    request: AssignPermissionRequest,
    conn: pyodbc.Connection = Depends(get_db),
    current_user = Depends(check_permission("Create"))
):
    user_service = UserService(conn)
    user_service.assign_permission_to_role(request.RoleId, request.PermissionId)
    return {"message": "Permission assigned successfully"}