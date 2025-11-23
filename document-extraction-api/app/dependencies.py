from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from app.utils.jwt_handler import JWTHandler
from app.database import get_db
from sqlalchemy.orm import Session

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = JWTHandler.verify_token(token)
    
    user_id = payload.get("user_id")
    username = payload.get("username")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return {
        "user_id": user_id,
        "username": username,
        "roles": payload.get("roles", []),
        "permissions": payload.get("permissions", [])
    }

def require_permission(permission: str):
    """Dependency to check if user has specific permission"""
    async def check_permission(current_user: dict = Depends(get_current_user)):
        if permission not in current_user.get("permissions", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required"
            )
        return current_user
    return check_permission

def require_role(role: str):
    """Dependency to check if user has specific role"""
    async def check_role(current_user: dict = Depends(get_current_user)):
        if role not in current_user.get("roles", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role}' required"
            )
        return current_user
    return check_role