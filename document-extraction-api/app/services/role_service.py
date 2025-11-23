from sqlalchemy.orm import Session
from app.repositories import RoleRepository, PermissionRepository
from app.models import Role, Permission
from typing import List, Optional

class RoleService:
    def __init__(self, session: Session):
        self.role_repo = RoleRepository(session)
        self.perm_repo = PermissionRepository(session)

    def create_role(self, role_name: str, description: str = None) -> Role:
        return self.role_repo.create({
            "role_name": role_name,
            "description": description
        })

    def get_role(self, role_id: int) -> Optional[Role]:
        return self.role_repo.get_by_id(role_id)

    def get_all_roles(self, skip: int = 0, limit: int = 100) -> List[Role]:
        return self.role_repo.get_all(skip, limit)

    def assign_permission_to_role(self, role_id: int, permission_id: int):
        return self.role_repo.assign_permission(role_id, permission_id)

    def remove_permission_from_role(self, role_id: int, permission_id: int) -> bool:
        return self.role_repo.remove_permission(role_id, permission_id)

    def get_role_permissions(self, role_id: int) -> List[Permission]:
        return self.role_repo.get_role_permissions(role_id)