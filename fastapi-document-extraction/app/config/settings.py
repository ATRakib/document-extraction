from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DB_CONNECTION_STRING: str
    GROQ_API_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    UPLOAD_DIR: str = "uploads"
    PDF_DIR: str = "uploads/pdf"
    WORD_DIR: str = "uploads/word"
    EXCEL_DIR: str = "uploads/excel"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()