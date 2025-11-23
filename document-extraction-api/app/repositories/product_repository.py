# app/repositories/product_repository.py
from sqlalchemy.orm import Session
from app.models import ProductMaster, ProductSpecification
from app.repositories.base_repository import BaseRepository
from typing import List, Optional

class ProductRepository(BaseRepository[ProductMaster]):
    def __init__(self, session: Session):
        super().__init__(session, ProductMaster)

    def create_with_specifications(self, product_data: dict, specifications: List[dict]) -> ProductMaster:
        product = ProductMaster(**product_data)
        self.session.add(product)
        self.session.flush()
        
        for spec_data in specifications:
            spec_data['product_id'] = product.id
            spec = ProductSpecification(**spec_data)
            self.session.add(spec)
        
        self.session.commit()
        self.session.refresh(product)
        return product

    def get_with_specifications(self, product_id: int) -> Optional[ProductMaster]:
        return self.session.query(ProductMaster).filter(
            ProductMaster.id == product_id
        ).first()

    def search_by_model_name(self, model_name: str) -> List[ProductMaster]:
        return self.session.query(ProductMaster).filter(
            ProductMaster.model_name.contains(model_name)
        ).all()

class SpecificationRepository(BaseRepository[ProductSpecification]):
    def __init__(self, session: Session):
        super().__init__(session, ProductSpecification)

    def get_by_product_id(self, product_id: int) -> List[ProductSpecification]:
        return self.session.query(ProductSpecification).filter(
            ProductSpecification.product_id == product_id
        ).all()