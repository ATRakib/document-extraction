# app/utils/groq_client.py
from groq import Groq
from app.config import settings
import json

class GroqClient:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.1-70b-versatile"

    def extract_product_data(self, extracted_text: str, keywords: list = None) -> dict:
        """Extract structured product data using GROQ LLM"""
        
        keywords_str = ", ".join(keywords) if keywords else ""
        
        system_prompt = """You are an expert data extraction system. Extract product information from documents and return ONLY valid JSON.
        
Extract the following:
1. ProductMaster: model_name, description, country_of_origin, manufacturer_id, product_price
2. ProductSpecifications (array): specification_name, size, other_terms, product_specification_price

Return ONLY JSON in this exact format:
{
    "master": {
        "model_name": "string",
        "description": "string or null",
        "country_of_origin": "string or null",
        "manufacturer_id": number or null,
        "product_price": number or null
    },
    "specifications": [
        {
            "specification_name": "string",
            "size": "string or null",
            "other_terms": "string or null",
            "product_specification_price": number or null
        }
    ]
}

Do NOT include any text outside the JSON."""

        user_message = f"""Extract product data from this text:

TEXT:
{extracted_text}

KEYWORDS TO FOCUS ON:
{keywords_str if keywords_str else 'None'}

Return ONLY the JSON structure with extracted data."""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": user_message}
                ],
                system=system_prompt
            )
            
            response_text = message.content[0].text
            
            # Clean up response
            response_text = response_text.strip()
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()
            
            result = json.loads(response_text)
            return result
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse LLM response as JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"GROQ API Error: {str(e)}")