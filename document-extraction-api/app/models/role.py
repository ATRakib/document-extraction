# app/models/role.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(100), unique=True, nullable=False)
    description = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")
    users = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="roles")
    role = relationship("Role", back_populates="users")
