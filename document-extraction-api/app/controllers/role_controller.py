from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.models.schemas import RoleCreate, RoleResponse, RoleDetailResponse
from app.services.role_service import RoleService
from app.database import get_db
from app.dependencies import require_role

router = APIRouter()

@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role: RoleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    service = RoleService(db)
    return service.create_role(role.role_name, role.description)

@router.get("/{role_id}", response_model=RoleDetailResponse)
async def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    service = RoleService(db)
    role = service.get_role(role_id)
    if not role:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.get("/", response_model=list[RoleResponse])
async def get_all_roles(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    service = RoleService(db)
    return service.get_all_roles()
