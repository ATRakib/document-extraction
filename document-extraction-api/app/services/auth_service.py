from sqlalchemy.orm import Session
from app.repositories import UserRepository
from app.utils.password_hash import PasswordHandler
from app.utils.jwt_handler import JWTHandler
from app.models import User
from fastapi import HTTPException, status

class AuthService:
    def __init__(self, session: Session):
        self.user_repo = UserRepository(session)
        self.session = session

    def register_user(self, username: str, email: str, password: str) -> User:
        # Check if user exists
        if self.user_repo.get_by_username(username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        if self.user_repo.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        
        # Hash password and create user
        hashed_pwd = PasswordHandler.hash_password(password)
        user = self.user_repo.create({
            "username": username,
            "email": email,
            "password_hash": hashed_pwd
        })
        return user

    def login_user(self, username: str, password: str) -> dict:
        user = self.user_repo.get_by_username(username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not PasswordHandler.verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Get roles and permissions
        roles = self.user_repo.get_user_roles(user.id)
        role_names = [role.role_name for role in roles]
        
        permissions = []
        for role in roles:
            for role_perm in role.permissions:
                permissions.append(role_perm.permission.permission_name)
        
        # Create tokens
        token_data = {
            "user_id": user.id,
            "username": user.username,
            "roles": role_names,
            "permissions": permissions
        }
        
        access_token = JWTHandler.create_access_token(token_data)
        refresh_token = JWTHandler.create_refresh_token(token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {"id": user.id, "username": user.username, "email": user.email}
        }
