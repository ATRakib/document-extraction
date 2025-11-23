from fastapi import APIRouter
from app.controllers import auth_controller, product_controller, role_controller, permission_controller
from app.controllers import upload_controller

def include_routes(app):
    """Include all routes in the application"""
    
    # Auth routes
    app.include_router(
        auth_controller.router,
        prefix="/api/auth",
        tags=["Authentication"]
    )
    
    # Product routes
    app.include_router(
        product_controller.router,
        prefix="/api/products",
        tags=["Products"]
    )
    
    # Upload/Extract routes
    app.include_router(
        upload_controller.router,
        prefix="/api/upload",
        tags=["Upload & Extraction"]
    )
    
    # Role routes
    app.include_router(
        role_controller.router,
        prefix="/api/roles",
        tags=["Roles"]
    )
    
    # Permission routes
    app.include_router(
        permission_controller.router,
        prefix="/api/permissions",
        tags=["Permissions"]
    )