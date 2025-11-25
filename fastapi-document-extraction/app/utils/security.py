from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth_service import AuthService
from app.config.database import get_db
from app.services.user_service import UserService
from typing import Optional
import pyodbc

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), conn: pyodbc.Connection = Depends(get_db)):
    token = credentials.credentials
    payload = AuthService.decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_service = UserService(conn)
    user = user_service.get_user_by_username(username)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

def get_current_user_optional(request: Request, conn: pyodbc.Connection = Depends(get_db)):
    try:
        token = request.cookies.get("access_token")
        if not token:
            return None
        
        if token.startswith("Bearer "):
            token = token[7:]
        
        payload = AuthService.decode_access_token(token)
        if payload is None:
            return None
        
        username = payload.get("sub")
        if username is None:
            return None
        
        user_service = UserService(conn)
        user = user_service.get_user_by_username(username)
        return user
    except:
        return None

def check_permission(required_permission: str):
    def permission_checker(credentials: HTTPAuthorizationCredentials = Depends(security), conn: pyodbc.Connection = Depends(get_db)):
        user = get_current_user(credentials, conn)
        
        user_service = UserService(conn)
        permissions = user_service.get_user_permissions(user.Id)
        
        if required_permission not in permissions and "Custom" not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required: {required_permission}"
            )
        
        return user
    
    return permission_checker