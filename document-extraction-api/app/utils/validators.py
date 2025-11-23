# app/utils/validators.py
from fastapi import UploadFile
from app.config import settings

class FileValidator:
    ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg', '.tiff'}
    
    @staticmethod
    def validate_file(file: UploadFile) -> bool:
        if not file.filename:
            raise ValueError("File name is required")
        
        ext = file.filename.split('.')[-1].lower()
        if f'.{ext}' not in FileValidator.ALLOWED_EXTENSIONS:
            raise ValueError(f"File type .{ext} not allowed")
        
        return True

    @staticmethod
    def validate_file_size(file_size: int) -> bool:
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise ValueError(f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit")
        return True