# app/models/product.py
from sqlalchemy import Column, Integer, String, Text, DECIMAL, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ProductMaster(Base):
    __tablename__ = "product_master"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(255), nullable=False)
    description = Column(Text)
    country_of_origin = Column(String(100))
    manufacturer_id = Column(Integer)
    product_price = Column(DECIMAL(10, 2))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    specifications = relationship("ProductSpecification", back_populates="product", cascade="all, delete-orphan")

class ProductSpecification(Base):
    __tablename__ = "product_specification"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product_master.id"), nullable=False)
    specification_name = Column(String(255), nullable=False)
    size = Column(String(100))
    other_terms = Column(Text)
    product_specification_price = Column(DECIMAL(10, 2))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    product = relationship("ProductMaster", back_populates="specifications")