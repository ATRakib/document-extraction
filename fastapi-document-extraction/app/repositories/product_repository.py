import pyodbc
import hashlib
from typing import Optional, List
from app.models.product import ProductMaster, ProductSpecification

class ProductRepository:
    def __init__(self, conn: pyodbc.Connection):
        self.conn = conn

    def check_file_processed(self, file_hash: str) -> bool:
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM ProcessedFiles WHERE FileHash = ?", file_hash)
        count = cursor.fetchone()[0]
        return count > 0

    def mark_file_as_processed(self, file_name: str, file_hash: str):
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO ProcessedFiles (FileName, FileHash) VALUES (?, ?)",
            file_name, file_hash
        )
        self.conn.commit()

    def create_product_master(self, product: ProductMaster) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            """INSERT INTO ProductMaster (ModelName, Description, CountryOfOrigin, SupplierId, ProductPrice, Quotation, FileName, FileLocation) 
               OUTPUT INSERTED.Id VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            product.ModelName, product.Description, product.CountryOfOrigin, 
            product.SupplierId, product.ProductPrice, product.Quotation, product.FileName, product.FileLocation
        )
        product_id = cursor.fetchone()[0]
        self.conn.commit()
        return product_id

    def create_product_specification(self, spec: ProductSpecification) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            """INSERT INTO ProductSpecification (ProductId, SpecificationName, Size, OtherTerms, ProductSpecificationPrice) 
               OUTPUT INSERTED.Id VALUES (?, ?, ?, ?, ?)""",
            spec.ProductId, spec.SpecificationName, spec.Size, 
            spec.OtherTerms, spec.ProductSpecificationPrice
        )
        spec_id = cursor.fetchone()[0]
        self.conn.commit()
        return spec_id

    def get_product_by_id(self, product_id: int) -> Optional[ProductMaster]:
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT Id, ModelName, Description, CountryOfOrigin, SupplierId, ProductPrice, Quotation, FileName, FileLocation, CreatedAt FROM ProductMaster WHERE Id = ?",
            product_id
        )
        row = cursor.fetchone()
        if row:
            return ProductMaster(Id=row[0], ModelName=row[1], Description=row[2], 
                               CountryOfOrigin=row[3], SupplierId=row[4], ProductPrice=row[5], 
                               Quotation=row[6], FileName=row[7], FileLocation=row[8], CreatedAt=row[9])
        return None

    def get_all_products(self) -> List[ProductMaster]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT Id, ModelName, Description, CountryOfOrigin, SupplierId, ProductPrice, Quotation, FileName, FileLocation, CreatedAt FROM ProductMaster")
        rows = cursor.fetchall()
        return [ProductMaster(Id=row[0], ModelName=row[1], Description=row[2], 
                            CountryOfOrigin=row[3], SupplierId=row[4], ProductPrice=row[5],
                            Quotation=row[6], FileName=row[7], FileLocation=row[8], CreatedAt=row[9]) for row in rows]

    def get_specifications_by_product_id(self, product_id: int) -> List[ProductSpecification]:
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT Id, ProductId, SpecificationName, Size, OtherTerms, ProductSpecificationPrice, CreatedAt FROM ProductSpecification WHERE ProductId = ?",
            product_id
        )
        rows = cursor.fetchall()
        return [ProductSpecification(Id=row[0], ProductId=row[1], SpecificationName=row[2], 
                                   Size=row[3], OtherTerms=row[4], ProductSpecificationPrice=row[5], CreatedAt=row[6]) for row in rows]

    def update_product_master(self, product_id: int, product: ProductMaster):
        cursor = self.conn.cursor()
        cursor.execute(
            """UPDATE ProductMaster SET ModelName = ?, Description = ?, CountryOfOrigin = ?, 
               SupplierId = ?, ProductPrice = ?, Quotation = ?, FileName = ?, FileLocation = ? WHERE Id = ?""",
            product.ModelName, product.Description, product.CountryOfOrigin, 
            product.SupplierId, product.ProductPrice, product.Quotation, product.FileName, product.FileLocation, product_id
        )
        self.conn.commit()

    def delete_product(self, product_id: int):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM ProductMaster WHERE Id = ?", product_id)
        self.conn.commit()

    def delete_specifications_by_product_id(self, product_id: int):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM ProductSpecification WHERE ProductId = ?", product_id)
        self.conn.commit()

