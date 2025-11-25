from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.controllers import auth_controller, user_controller, product_controller, upload_controller, web_controller
from app.config.settings import get_settings
import os

settings = get_settings()

app = FastAPI(
    title="Document Extraction & RBAC System",
    description="FastAPI application with document extraction, LLM processing, and role-based access control",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/pdf", exist_ok=True)
os.makedirs("uploads/word", exist_ok=True)
os.makedirs("uploads/excel", exist_ok=True)
os.makedirs("static", exist_ok=True)
os.makedirs("templates", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(web_controller.router)
app.include_router(auth_controller.router)
app.include_router(user_controller.router)
app.include_router(product_controller.router)
app.include_router(upload_controller.router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.controllers import auth_controller, user_controller, product_controller, upload_controller
# import os

# app = FastAPI(
#     title="Document Extraction & RBAC System",
#     description="FastAPI application with document extraction, LLM processing, and role-based access control",
#     version="1.0.0"
# )

# # CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Create uploads directory
# os.makedirs("uploads", exist_ok=True)

# # Include routers
# app.include_router(auth_controller.router)
# app.include_router(user_controller.router)
# app.include_router(product_controller.router)
# app.include_router(upload_controller.router)

# @app.get("/")
# def root():
#     return {
#         "message": "Document Extraction & RBAC System API",
#         "version": "1.0.0",
#         "docs": "/docs"
#     }

# @app.get("/health")
# def health_check():
#     return {"status": "healthy"}