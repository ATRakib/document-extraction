from groq import Groq 
from app.config.settings import get_settings 
import json 
 
settings = get_settings() 
 
class LLMService: 
    def __init__(self): 
        self.client = Groq(api_key=settings.GROQ_API_KEY) 
 
    def extract_product_data(self, extracted_text: str, keywords: str = "") -> list: 
        system_prompt = """You are an expert data extraction system. Extract product information and supplier details from the provided text and return ONLY a valid JSON array of objects. 

CRITICAL INSTRUCTIONS:
1. Extract COMPLETE supplier information - not just the name
2. Look for supplier details in: company letterhead, sender info, "from" section, contact details, quotation issuer
3. Extract ALL specifications with their EXACT names as written in the document
4. Each specification row in tables or lists is a separate specification object
5.The Supplier must be a full JSON object with all fields (Name, Address1, Address2, Country, Phone, Email, Fax) present. Use null for missing data, but do not omit any field.
Extract the following structure for EACH product found in the text: 
[ 
  { 
    "master": { 
      "ModelName": "exact model name or product name from document", 
      "Description": "detailed product description", 
      "CountryOfOrigin": "country where product is manufactured", 
      "Supplier": {
        "Name": "full company/supplier name",
        "Address1": "primary address line",
        "Address2": "secondary address line (area, district)",
        "Country": "supplier country",
        "Phone": "contact phone number",
        "Email": "contact email",
        "Fax": "fax number if available"
      },
      "ProductPrice": 0.0, 
      "Quotation": "quotation number or reference ID" 
    }, 
    "specifications": [ 
      { 
        "SpecificationName": "EXACT specification name from document (e.g., 'Thickness', 'Material Type', 'Dimension', 'Color', 'Grade', 'Capacity', 'Voltage', 'Weight', 'Length', 'Width', 'Height', 'Power', 'Frequency', 'Temperature Range', etc.)", 
        "Size": "size or dimension value if applicable", 
        "OtherTerms": "any additional terms, conditions, or notes for this specification", 
        "ProductSpecificationPrice": 0.0 
      } 
    ] 
  } 
] 

SUPPLIER EXTRACTION RULES:
- Look in these locations: letterhead, header, footer, "Quotation By:", "Supplier:", "From:", "Company:", contact section
- Name: Extract full registered company name (e.g., "ABC Trading Ltd.", "XYZ Corporation")
- Address1: Primary street address or building info
- Address2: Area, district, or additional location details
- Country: Supplier's country
- Phone/Email/Fax: Extract from contact details section
- If supplier info is partial, extract whatever is available
- If multiple companies mentioned, extract the one issuing the quotation/document

SPECIFICATION EXTRACTION RULES:
- Look in: specification tables, technical specs section, product details tables, item lists
- Extract EACH specification parameter as a SEPARATE object
- From a single row or line, there can be a maximum of one specification
- The specification name must be 100% taken from the document. Any other or mismatched specification name will not be accepted.
- Common specification names to look for:
  * Physical: Thickness, Length, Width, Height, Diameter, Weight, Size, Dimension
  * Material: Material Type, Grade, Quality, Coating, Finish
  * Technical: Voltage, Power, Capacity, Frequency, Pressure, Temperature, Speed
  * Visual: Color, Shade, Pattern, Surface Finish
  * Packaging: Pack Size, Unit of Measure, Quantity per Pack
  * Standards: Standard Compliance, Certification, Rating
   
- SpecificationName: Use EXACT terminology from document
- Size: Put dimensional/size values here
- OtherTerms: Additional details, tolerances, conditions
- If specifications are in table format, treat each row as one specification object
- If specifications are listed as bullet points, extract each point as separate specification

PRICING RULES:
- ProductPrice: Base product price or unit price
- ProductSpecificationPrice: Price for specific specification variant if mentioned
- Extract numeric values only (remove currency symbols but note currency in OtherTerms if needed)
- Use 0.0 if price not found

GENERAL RULES:
- Extract ALL products from the document (could be multiple products in one quotation)
- If a field is not found, use null for strings, 0.0 for prices
- Preserve exact naming conventions from the document
- Return ONLY the JSON array, no markdown formatting, no explanation text
""" 
 
        user_prompt = f"""Extract product information from this text. Pay special attention to:
1. COMPLETE supplier details (name, full address, contact info)
2. ALL specification parameters with their exact names
3. Look for specifications in tables, bullet lists, or technical details sections

Text to analyze:

{extracted_text}

Focus keywords: {keywords}

Return ONLY the JSON array of products with complete supplier objects and all specifications.""" 
 
        try: 
            chat_completion = self.client.chat.completions.create( 
                messages=[ 
                    {"role": "system", "content": system_prompt}, 
                    {"role": "user", "content": user_prompt} 
                ], 
                model="llama-3.3-70b-versatile", 
                temperature=0.1, 
                max_tokens=8000  # Increased for detailed extraction
            ) 
             
            response_text = chat_completion.choices[0].message.content.strip() 
             
            # Clean markdown formatting
            if response_text.startswith("```json"): 
                response_text = response_text[7:] 
            if response_text.startswith("```"): 
                response_text = response_text[3:] 
            if response_text.endswith("```"): 
                response_text = response_text[:-3] 
             
            response_text = response_text.strip() 
             
            # Parse JSON
            extracted_data = json.loads(response_text) 
             
            # Ensure it's a list
            if not isinstance(extracted_data, list): 
                extracted_data = [extracted_data] 
             
           
            
            return extracted_data 
             
        except json.JSONDecodeError as e:
            raise Exception(f"LLM returned invalid JSON: {str(e)}\nResponse: {response_text[:500]}")
        except Exception as e: 
            raise Exception(f"LLM extraction failed: {str(e)}")
        


# from groq import Groq
# from app.config.settings import get_settings
# import json

# settings = get_settings()

# class LLMService:
#     def __init__(self):
#         self.client = Groq(api_key=settings.GROQ_API_KEY)

#     def extract_product_data(self, extracted_text: str, keywords: str = "") -> list:
#         system_prompt = """You are an expert data extraction system. Extract product information from the provided text and return ONLY a valid JSON array of objects.

# Extract the following structure for EACH product found in the text:
# [
#   {
#     "master": {
#       "ModelName": "string",
#       "Description": "string",
#       "CountryOfOrigin": "string",
#       "SupplierName": "string",
#       "ProductPrice": 0.0,
#       "Quotation": "string"
#     },
#     "specifications": [
#       {
#         "SpecificationName": "string",
#         "Size": "string",
#         "OtherTerms": "string",
#         "ProductSpecificationPrice": 0.0
#       }
#     ]
#   }
# ]

# Rules:
# - Extract ALL products from the document
# - Each product must have master and specifications
# - SupplierName should be the supplier/manufacturer name found in the document
# - Quotation should contain quotation number or reference if found
# - If a field is not found, use null or empty string
# - ProductPrice and ProductSpecificationPrice must be numbers (use 0.0 if not found)
# - Multiple specifications should be in the specifications array
# - Return ONLY the JSON array, no additional text
# """

#         user_prompt = f"""Extract product information from this text:

# {extracted_text}

# Keywords to focus on: {keywords}

# Return ONLY the JSON array of products."""

#         try:
#             chat_completion = self.client.chat.completions.create(
#                 messages=[
#                     {"role": "system", "content": system_prompt},
#                     {"role": "user", "content": user_prompt}
#                 ],
#                 model="llama-3.3-70b-versatile",
#                 temperature=0.1,
#                 max_tokens=4000
#             )
            
#             response_text = chat_completion.choices[0].message.content.strip()
            
#             if response_text.startswith("```json"):
#                 response_text = response_text[7:]
#             if response_text.startswith("```"):
#                 response_text = response_text[3:]
#             if response_text.endswith("```"):
#                 response_text = response_text[:-3]
            
#             response_text = response_text.strip()
            
#             extracted_data = json.loads(response_text)
            
#             if not isinstance(extracted_data, list):
#                 extracted_data = [extracted_data]
            
#             return extracted_data
            
#         except Exception as e:
#             raise Exception(f"LLM extraction failed: {str(e)}")