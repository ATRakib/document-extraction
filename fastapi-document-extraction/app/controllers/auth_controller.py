from fastapi import APIRouter, Depends, HTTPException, status, Response

from fastapi.responses import HTMLResponse
from app.config.settings import get_settings
settings = get_settings()
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService
from app.services.auth_service import AuthService
from app.config.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
import pyodbc
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, conn: pyodbc.Connection = Depends(get_db)):
    user_service = UserService(conn)
    
    existing_user = user_service.get_user_by_username(user_data.Username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_id = user_service.create_user(user_data.Username, user_data.Email, user_data.Password)
    
    return {"message": "User created successfully", "user_id": user_id}

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, response: Response, conn: pyodbc.Connection = Depends(get_db)):
    user_service = UserService(conn)
    
    user = user_service.authenticate_user(login_data.Username, login_data.Password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES )
    access_token = AuthService.create_access_token(
        data={"sub": user.Username, "user_id": user.Id},
        expires_delta=access_token_expires
    )
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=1800,
        expires=1800,
        samesite="lax",
        secure=False
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        Id=current_user.Id,
        Username=current_user.Username,
        Email=current_user.Email,
        IsActive=current_user.IsActive
    )