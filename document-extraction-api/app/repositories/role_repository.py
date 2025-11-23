# app/repositories/role_repository.py
from sqlalchemy.orm import Session
from app.models import Role, Permission, RolePermission
from app.repositories.base_repository import BaseRepository
from typing import List, Optional

class RoleRepository(BaseRepository[Role]):
    def __init__(self, session: Session):
        super().__init__(session, Role)

    def get_by_name(self, role_name: str) -> Optional[Role]:
        return self.session.query(Role).filter(Role.role_name == role_name).first()

    def get_with_permissions(self, role_id: int) -> Optional[Role]:
        return self.session.query(Role).filter(Role.id == role_id).first()

    def assign_permission(self, role_id: int, permission_id: int) -> RolePermission:
        role_perm = RolePermission(role_id=role_id, permission_id=permission_id)
        self.session.add(role_perm)
        self.session.commit()
        self.session.refresh(role_perm)
        return role_perm

    def remove_permission(self, role_id: int, permission_id: int) -> bool:
        role_perm = self.session.query(RolePermission).filter(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id
        ).first()
        if role_perm:
            self.session.delete(role_perm)
            self.session.commit()
            return True
        return False

    def get_role_permissions(self, role_id: int) -> List[Permission]:
        role = self.get_by_id(role_id)
        if role:
            return [rp.permission for rp in role.permissions]
        return []