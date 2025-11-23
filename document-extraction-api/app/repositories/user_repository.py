# app/repositories/user_repository.py
from sqlalchemy.orm import Session
from app.models import User, UserRole, Role
from app.repositories.base_repository import BaseRepository
from typing import Optional, List

class UserRepository(BaseRepository[User]):
    def __init__(self, session: Session):
        super().__init__(session, User)

    def get_by_username(self, username: str) -> Optional[User]:
        return self.session.query(User).filter(User.username == username).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.query(User).filter(User.email == email).first()

    def get_with_roles(self, user_id: int) -> Optional[User]:
        return self.session.query(User).filter(User.id == user_id).first()

    def assign_role(self, user_id: int, role_id: int) -> UserRole:
        user_role = UserRole(user_id=user_id, role_id=role_id)
        self.session.add(user_role)
        self.session.commit()
        self.session.refresh(user_role)
        return user_role

    def remove_role(self, user_id: int, role_id: int) -> bool:
        user_role = self.session.query(UserRole).filter(
            UserRole.user_id == user_id,
            UserRole.role_id == role_id
        ).first()
        if user_role:
            self.session.delete(user_role)
            self.session.commit()
            return True
        return False

    def get_user_roles(self, user_id: int) -> List[Role]:
        user = self.get_by_id(user_id)
        if user:
            return [ur.role for ur in user.roles]
        return []