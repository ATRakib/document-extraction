from sqlalchemy.orm import Session
from app.repositories import PermissionRepository
from app.models import Permission
from typing import List, Optional

class PermissionService:
    def __init__(self, session: Session):
        self.perm_repo = PermissionRepository(session)

    def create_permission(self, permission_name: str, description: str = None, 
                         resource: str = None, action: str = None) -> Permission:
        return self.perm_repo.create({
            "permission_name": permission_name,
            "description": description,
            "resource": resource,
            "action": action
        })

    def get_permission(self, permission_id: int) -> Optional[Permission]:
        return self.perm_repo.get_by_id(permission_id)

    def get_all_permissions(self, skip: int = 0, limit: int = 100) -> List[Permission]:
        return self.perm_repo.get_all(skip, limit)