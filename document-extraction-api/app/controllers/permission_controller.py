from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.models.schemas import PermissionCreate, PermissionResponse
from app.services.permission_service import PermissionService
from app.database import get_db
from app.dependencies import require_role

router = APIRouter()

@router.post("/", response_model=PermissionResponse, status_code=status.HTTP_201_CREATED)
async def create_permission(
    permission: PermissionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    service = PermissionService(db)
    return service.create_permission(
        permission.permission_name,
        permission.description,
        permission.resource,
        permission.action
    )

@router.get("/", response_model=list[PermissionResponse])
async def get_all_permissions(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    service = PermissionService(db)
    return service.get_all_permissions()