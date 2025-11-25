import pyodbc
from app.repositories.user_repository import UserRepository
from app.repositories.auth_repository import AuthRepository
from app.models.user import User, Role, Permission
from app.services.auth_service import AuthService
from typing import List, Optional

class UserService:
    def __init__(self, conn: pyodbc.Connection):
        self.user_repo = UserRepository(conn)
        self.auth_repo = AuthRepository(conn)

    def create_user(self, username: str, email: str, password: str) -> int:
        hashed_password = AuthService.get_password_hash(password)
        user = User(Username=username, Email=email, HashedPassword=hashed_password)
        return self.user_repo.create_user(user)

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        user = self.user_repo.get_user_by_username(username)
        if not user:
            return None
        if not AuthService.verify_password(password, user.HashedPassword):
            return None
        return user

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.user_repo.get_user_by_username(username)

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.user_repo.get_user_by_id(user_id)

    def get_all_users(self) -> List[User]:
        return self.user_repo.get_all_users()

    def create_role(self, role_name: str, description: str = None) -> int:
        role = Role(RoleName=role_name, Description=description)
        return self.auth_repo.create_role(role)

    def get_all_roles(self) -> List[Role]:
        return self.auth_repo.get_all_roles()

    def create_permission(self, permission_name: str, description: str = None) -> int:
        permission = Permission(PermissionName=permission_name, Description=description)
        return self.auth_repo.create_permission(permission)

    def get_all_permissions(self) -> List[Permission]:
        return self.auth_repo.get_all_permissions()

    def assign_role_to_user(self, user_id: int, role_id: int):
        self.auth_repo.assign_role_to_user(user_id, role_id)

    def assign_permission_to_role(self, role_id: int, permission_id: int):
        self.auth_repo.assign_permission_to_role(role_id, permission_id)

    def get_user_permissions(self, user_id: int) -> List[str]:
        return self.auth_repo.get_user_permissions(user_id)

    def get_user_roles(self, user_id: int) -> List[str]:
        return self.auth_repo.get_user_roles(user_id)