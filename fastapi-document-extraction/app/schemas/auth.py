from pydantic import BaseModel

class LoginRequest(BaseModel):
    Username: str
    Password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str