from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.services.auth_service import AuthService
from app.config.database import get_db_connection
from app.services.user_service import UserService

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth for public endpoints
        public_paths = ["/api/auth/register", "/api/auth/login", "/docs", "/openapi.json", "/redoc"]
        
        if request.url.path in public_paths or request.url.path == "/":
            return await call_next(request)
        
        # Get token from header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header"
            )
        
        token = auth_header.split(" ")[1]
        payload = AuthService.decode_access_token(token)
        
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Add user info to request state
        request.state.user_id = payload.get("user_id")
        request.state.username = payload.get("sub")
        
        response = await call_next(request)
        return response