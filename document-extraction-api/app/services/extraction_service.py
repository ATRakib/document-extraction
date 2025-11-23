from app.utils.groq_client import GroqClient
from app.utils.document_processor import DocumentProcessor
from app.models.schemas import LLMExtractionResponse
import json

class ExtractionService:
    def __init__(self):
        self.groq_client = GroqClient()

    def extract_from_file(self, file_path: str, keywords: list = None) -> LLMExtractionResponse:
        # Extract text from file
        text = DocumentProcessor.extract_text(file_path)
        
        # Send to LLM
        result = self.groq_client.extract_product_data(text, keywords)
        
        return LLMExtractionResponse(**result)
