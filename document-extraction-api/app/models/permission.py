# app/models/permission.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    permission_name = Column(String(100), unique=True, nullable=False)
    description = Column(String(500))
    resource = Column(String(100))
    action = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    roles = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan")

class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    
    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission", back_populates="roles")