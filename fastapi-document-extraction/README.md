# Document Extraction & RBAC System

FastAPI application with document extraction, LLM processing using GROQ, and comprehensive role-based access control.

## Features

- Document upload (PDF, DOCX, Images)
- Text extraction from documents
- LLM-based structured data extraction using GROQ
- Automatic insertion into MS SQL Server
- Full RBAC with roles, permissions, and user management
- JWT authentication
- Repository pattern architecture

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install SQL Server ODBC Driver 17

3. Configure `.env` file with your credentials

4. Run SQL schema:
```bash
# Execute database_schema.sql in your SQL Server
```
python -m venv venv
venv\Scripts\activate
5. Run the application:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login and get JWT token

### User Management
- GET `/api/users/` - Get all users
- POST `/api/users/roles` - Create role
- GET `/api/users/roles` - Get all roles
- POST `/api/users/permissions` - Create permission
- GET `/api/users/permissions` - Get all permissions
- POST `/api/users/assign-role` - Assign role to user
- POST `/api/users/assign-permission` - Assign permission to role

### Products
- POST `/api/products/suppliers` - Create supplier
- GET `/api/products/suppliers` - Get all suppliers
- POST `/api/products/insert` - Insert product with specifications
- GET `/api/products/` - Get all products
- GET `/api/products/{id}` - Get product with specifications

### Document Processing
- POST `/api/upload/document` - Upload and extract text
- POST `/api/upload/extract/products` - Extract and insert products

## Usage Examples

See EXAMPLES.md for detailed cURL and JSON examples.