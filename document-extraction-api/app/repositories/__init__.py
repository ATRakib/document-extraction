# app/repositories/__init__.py
from .user_repository import UserRepository
from .product_repository import ProductRepository, SpecificationRepository
from .role_repository import RoleRepository
from .permission_repository import PermissionRepository

__all__ = [
    'UserRepository',
    'ProductRepository',
    'SpecificationRepository',
    'RoleRepository',
    'PermissionRepository'
]