# app/repositories/permission_repository.py
from sqlalchemy.orm import Session
from app.models import Permission
from app.repositories.base_repository import BaseRepository
from typing import Optional

class PermissionRepository(BaseRepository[Permission]):
    def __init__(self, session: Session):
        super().__init__(session, Permission)

    def get_by_name(self, permission_name: str) -> Optional[Permission]:
        return self.session.query(Permission).filter(
            Permission.permission_name == permission_name
        ).first()