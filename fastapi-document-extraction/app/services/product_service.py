import pyodbc
from app.repositories.product_repository import ProductRepository
from app.repositories.supplier_repository import SupplierRepository
from app.models.product import ProductMaster, ProductSpecification, Supplier
from typing import List, Optional, Dict

class ProductService:
    def __init__(self, conn: pyodbc.Connection):
        self.product_repo = ProductRepository(conn)
        self.supplier_repo = SupplierRepository(conn)

    def create_supplier(self, supplier_data: dict) -> int:
        supplier = Supplier(**supplier_data)
        return self.supplier_repo.create_supplier(supplier)

    def get_all_suppliers(self) -> List[Supplier]:
        return self.supplier_repo.get_all_suppliers()

    def get_supplier_by_id(self, supplier_id: int) -> Optional[Supplier]:
        return self.supplier_repo.get_supplier_by_id(supplier_id)

    def get_supplier_by_name(self, name: str) -> Optional[Supplier]:
        return self.supplier_repo.get_supplier_by_name(name)

    def update_supplier(self, supplier_id: int, supplier_data: dict):
        supplier = Supplier(Id=supplier_id, **supplier_data)
        self.supplier_repo.update_supplier(supplier_id, supplier)

    def delete_supplier(self, supplier_id: int):
        self.supplier_repo.delete_supplier(supplier_id)

    def insert_product_with_specifications(self, master_data: dict, specifications_data: List[dict]) -> Dict:
        supplier_name = master_data.get('SupplierName')
        if supplier_name:
            supplier = self.get_supplier_by_name(supplier_name)
            if supplier:
                master_data['SupplierId'] = supplier.Id
            else:
                master_data['SupplierId'] = None
            del master_data['SupplierName']
        
        product = ProductMaster(**master_data)
        product_id = self.product_repo.create_product_master(product)
        
        spec_ids = []
        for spec_data in specifications_data:
            spec_data['ProductId'] = product_id
            spec = ProductSpecification(**spec_data)
            spec_id = self.product_repo.create_product_specification(spec)
            spec_ids.append(spec_id)
        
        return {
            "product_id": product_id,
            "specification_ids": spec_ids
        }

    def get_product_by_id(self, product_id: int) -> Optional[ProductMaster]:
        return self.product_repo.get_product_by_id(product_id)

    def get_all_products(self) -> List[ProductMaster]:
        return self.product_repo.get_all_products()

    def get_specifications_by_product_id(self, product_id: int) -> List[ProductSpecification]:
        return self.product_repo.get_specifications_by_product_id(product_id)

    def update_product_with_specifications(self, product_id: int, master_data: dict, specifications_data: List[dict]) -> Dict:
        supplier_name = master_data.get('SupplierName')
        if supplier_name:
            supplier = self.get_supplier_by_name(supplier_name)
            if supplier:
                master_data['SupplierId'] = supplier.Id
            else:
                master_data['SupplierId'] = None
            del master_data['SupplierName']
        
        product = ProductMaster(Id=product_id, **master_data)
        self.product_repo.update_product_master(product_id, product)
        
        self.product_repo.delete_specifications_by_product_id(product_id)
        
        spec_ids = []
        for spec_data in specifications_data:
            spec_data['ProductId'] = product_id
            spec = ProductSpecification(**spec_data)
            spec_id = self.product_repo.create_product_specification(spec)
            spec_ids.append(spec_id)
        
        return {
            "product_id": product_id,
            "specification_ids": spec_ids
        }

    def delete_product(self, product_id: int):
        self.product_repo.delete_product(product_id)