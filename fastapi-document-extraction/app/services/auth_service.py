from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from app.config.settings import get_settings
from app.models.user import User
from typing import Optional
import secrets

settings = get_settings()

class AuthService:
    active_sessions = {}
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    @staticmethod
    def get_password_hash(password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        
        session_id = secrets.token_urlsafe(32)
        to_encode.update({"exp": expire, "session_id": session_id})
        
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        
        AuthService.active_sessions[session_id] = {
            "username": data.get("sub"),
            "user_id": data.get("user_id"),
            "created_at": datetime.utcnow(),
            "expires_at": expire
        }
        
        return encoded_jwt

    @staticmethod
    def decode_access_token(token: str):
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            session_id = payload.get("session_id")
            
            if session_id not in AuthService.active_sessions:
                return None
            
            session = AuthService.active_sessions[session_id]
            if session["expires_at"] < datetime.utcnow():
                del AuthService.active_sessions[session_id]
                return None
            
            return payload
        except JWTError:
            return None

    @staticmethod
    def revoke_session(token: str):
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            session_id = payload.get("session_id")
            
            if session_id in AuthService.active_sessions:
                del AuthService.active_sessions[session_id]
                return True
        except:
            pass
        return False

    @staticmethod
    def cleanup_expired_sessions():
        current_time = datetime.utcnow()
        expired_sessions = [
            sid for sid, session in AuthService.active_sessions.items()
            if session["expires_at"] < current_time
        ]
        for sid in expired_sessions:
            del AuthService.active_sessions[sid]