import os
import shutil
import hashlib
from fastapi import UploadFile
from app.utils.document_parser import DocumentParser
from app.services.llm_service import LLMService
from app.config.settings import get_settings

settings = get_settings()

class ExtractionService:
    def __init__(self):
        self.llm_service = LLMService()
        self.upload_dir = settings.UPLOAD_DIR
        self.pdf_dir = settings.PDF_DIR
        self.word_dir = settings.WORD_DIR
        self.excel_dir = settings.EXCEL_DIR
        
        os.makedirs(self.pdf_dir, exist_ok=True)
        os.makedirs(self.word_dir, exist_ok=True)
        os.makedirs(self.excel_dir, exist_ok=True)

    def calculate_file_hash(self, file_content: bytes) -> str:
        return hashlib.sha256(file_content).hexdigest()

    async def save_upload_file(self, upload_file: UploadFile) -> tuple:
        ext = os.path.splitext(upload_file.filename)[1].lower()
        
        if ext == '.pdf':
            target_dir = self.pdf_dir
        elif ext in ['.docx', '.doc']:
            target_dir = self.word_dir
        elif ext in ['.xlsx', '.xls']:
            target_dir = self.excel_dir
        else:
            target_dir = self.upload_dir
        
        file_path = os.path.join(target_dir, upload_file.filename)
        
        content = await upload_file.read()
        file_hash = self.calculate_file_hash(content)
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        return file_path, upload_file.filename, file_path, file_hash

    def extract_text_from_file(self, file_path: str) -> str:
        return DocumentParser.extract_text(file_path)

    def extract_product_data_from_text(self, text: str, keywords: str = "") -> list:
        return self.llm_service.extract_product_data(text, keywords)

    async def process_document(self, file: UploadFile, keywords: str = "") -> dict:
        file_path, file_name, file_location, file_hash = await self.save_upload_file(file)
        
        extracted_text = self.extract_text_from_file(file_path)
        
        product_data_list = self.extract_product_data_from_text(extracted_text, keywords)
        
        for product_data in product_data_list:
            product_data['master']['FileName'] = file_name
            product_data['master']['FileLocation'] = file_location
        
        return {
            "extracted_text": extracted_text,
            "product_data_list": product_data_list,
            "file_hash": file_hash,
            "file_name": file_name
        }

# import os
# import shutil
# from fastapi import UploadFile
# from app.utils.document_parser import DocumentParser
# from app.services.llm_service import LLMService
# from app.config.settings import get_settings

# settings = get_settings()

# class ExtractionService:
#     def __init__(self):
#         self.llm_service = LLMService()
#         self.upload_dir = settings.UPLOAD_DIR
#         self.pdf_dir = settings.PDF_DIR
#         self.word_dir = settings.WORD_DIR
#         self.excel_dir = settings.EXCEL_DIR
        
#         os.makedirs(self.pdf_dir, exist_ok=True)
#         os.makedirs(self.word_dir, exist_ok=True)
#         os.makedirs(self.excel_dir, exist_ok=True)

#     async def save_upload_file(self, upload_file: UploadFile) -> tuple:
#         ext = os.path.splitext(upload_file.filename)[1].lower()
        
#         if ext == '.pdf':
#             target_dir = self.pdf_dir
#         elif ext in ['.docx', '.doc']:
#             target_dir = self.word_dir
#         elif ext in ['.xlsx', '.xls']:
#             target_dir = self.excel_dir
#         else:
#             target_dir = self.upload_dir
        
#         file_path = os.path.join(target_dir, upload_file.filename)
        
#         with open(file_path, "wb") as f:
#             content = await upload_file.read()
#             f.write(content)
        
#         return file_path, upload_file.filename, file_path

#     def extract_text_from_file(self, file_path: str) -> str:
#         return DocumentParser.extract_text(file_path)

#     def extract_product_data_from_text(self, text: str, keywords: str = "") -> list:
#         return self.llm_service.extract_product_data(text, keywords)

#     async def process_document(self, file: UploadFile, keywords: str = "") -> dict:
#         file_path, file_name, file_location = await self.save_upload_file(file)
        
#         extracted_text = self.extract_text_from_file(file_path)
        
#         product_data_list = self.extract_product_data_from_text(extracted_text, keywords)
        
#         for product_data in product_data_list:
#             product_data['master']['FileName'] = file_name
#             product_data['master']['FileLocation'] = file_location
        
#         return {
#             "extracted_text": extracted_text,
#             "product_data_list": product_data_list
#         }