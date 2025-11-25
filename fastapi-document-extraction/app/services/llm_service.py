from groq import Groq
from app.config.settings import get_settings
import json

settings = get_settings()

class LLMService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def extract_product_data(self, extracted_text: str, keywords: str = "") -> list:
        system_prompt = """You are an expert data extraction system. Extract product information from the provided text and return ONLY a valid JSON array of objects.

Extract the following structure for EACH product found in the text:
[
  {
    "master": {
      "ModelName": "string",
      "Description": "string",
      "CountryOfOrigin": "string",
      "SupplierName": "string",
      "ProductPrice": 0.0,
      "Quotation": "string"
    },
    "specifications": [
      {
        "SpecificationName": "string",
        "Size": "string",
        "OtherTerms": "string",
        "ProductSpecificationPrice": 0.0
      }
    ]
  }
]

Rules:
- Extract ALL products from the document
- Each product must have master and specifications
- SupplierName should be the supplier/manufacturer name found in the document
- Quotation should contain quotation number or reference if found
- If a field is not found, use null or empty string
- ProductPrice and ProductSpecificationPrice must be numbers (use 0.0 if not found)
- Multiple specifications should be in the specifications array
- Return ONLY the JSON array, no additional text
"""

        user_prompt = f"""Extract product information from this text:

{extracted_text}

Keywords to focus on: {keywords}

Return ONLY the JSON array of products."""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                max_tokens=4000
            )
            
            response_text = chat_completion.choices[0].message.content.strip()
            
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            extracted_data = json.loads(response_text)
            
            if not isinstance(extracted_data, list):
                extracted_data = [extracted_data]
            
            return extracted_data
            
        except Exception as e:
            raise Exception(f"LLM extraction failed: {str(e)}")