# app/models/__init__.py
from .product import ProductMaster, ProductSpecification
from .user import User
from .role import Role, UserRole
from .permission import Permission, RolePermission

__all__ = [
    'ProductMaster',
    'ProductSpecification',
    'User',
    'Role',
    'UserRole',
    'Permission',
    'RolePermission'
]
