from sqlalchemy.orm import Session
from app.repositories import ProductRepository, SpecificationRepository
from app.models import ProductMaster, ProductSpecification
from typing import List, Optional

class ProductService:
    def __init__(self, session: Session):
        self.product_repo = ProductRepository(session)
        self.spec_repo = SpecificationRepository(session)
        self.session = session

    def create_product_with_specs(self, product_data: dict, specifications: List[dict], user_id: int) -> ProductMaster:
        product_data['created_by'] = user_id
        product = self.product_repo.create_with_specifications(product_data, specifications)
        return product

    def get_product(self, product_id: int) -> Optional[ProductMaster]:
        return self.product_repo.get_with_specifications(product_id)

    def get_all_products(self, skip: int = 0, limit: int = 100) -> List[ProductMaster]:
        return self.product_repo.get_all(skip, limit)

    def search_products(self, model_name: str) -> List[ProductMaster]:
        return self.product_repo.search_by_model_name(model_name)

    def update_product(self, product_id: int, product_data: dict) -> Optional[ProductMaster]:
        return self.product_repo.update(product_id, product_data)

    def delete_product(self, product_id: int) -> bool:
        return self.product_repo.delete(product_id)