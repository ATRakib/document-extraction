from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.models.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.database import get_db
from app.models.schemas import GenericResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    new_user = service.register_user(user.username, user.email, user.password)
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    result = service.login_user(credentials.username, credentials.password)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": result["token_type"],
        "expires_in": 1800
    }