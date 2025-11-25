import pyodbc
from typing import Optional, List
from app.models.product import Supplier

class SupplierRepository:
    def __init__(self, conn: pyodbc.Connection):
        self.conn = conn

    def create_supplier(self, supplier: Supplier) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            """INSERT INTO Supplier (Name, Address1, Address2, Country, Phone, Email, Fax) 
               OUTPUT INSERTED.Id VALUES (?, ?, ?, ?, ?, ?, ?)""",
            supplier.Name, supplier.Address1, supplier.Address2, 
            supplier.Country, supplier.Phone, supplier.Email, supplier.Fax
        )
        supplier_id = cursor.fetchone()[0]
        self.conn.commit()
        return supplier_id

    def get_supplier_by_id(self, supplier_id: int) -> Optional[Supplier]:
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT Id, Name, Address1, Address2, Country, Phone, Email, Fax, CreatedAt FROM Supplier WHERE Id = ?",
            supplier_id
        )
        row = cursor.fetchone()
        if row:
            return Supplier(Id=row[0], Name=row[1], Address1=row[2], Address2=row[3], 
                          Country=row[4], Phone=row[5], Email=row[6], Fax=row[7], CreatedAt=row[8])
        return None

    def get_supplier_by_name(self, name: str) -> Optional[Supplier]:
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT Id, Name, Address1, Address2, Country, Phone, Email, Fax, CreatedAt FROM Supplier WHERE Name = ?",
            name
        )
        row = cursor.fetchone()
        if row:
            return Supplier(Id=row[0], Name=row[1], Address1=row[2], Address2=row[3], 
                          Country=row[4], Phone=row[5], Email=row[6], Fax=row[7], CreatedAt=row[8])
        return None

    def get_all_suppliers(self) -> List[Supplier]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT Id, Name, Address1, Address2, Country, Phone, Email, Fax, CreatedAt FROM Supplier")
        rows = cursor.fetchall()
        return [Supplier(Id=row[0], Name=row[1], Address1=row[2], Address2=row[3], 
                        Country=row[4], Phone=row[5], Email=row[6], Fax=row[7], CreatedAt=row[8]) for row in rows]

    def update_supplier(self, supplier_id: int, supplier: Supplier):
        cursor = self.conn.cursor()
        cursor.execute(
            """UPDATE Supplier SET Name = ?, Address1 = ?, Address2 = ?, Country = ?, 
               Phone = ?, Email = ?, Fax = ? WHERE Id = ?""",
            supplier.Name, supplier.Address1, supplier.Address2, 
            supplier.Country, supplier.Phone, supplier.Email, supplier.Fax, supplier_id
        )
        self.conn.commit()

    def delete_supplier(self, supplier_id: int):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM Supplier WHERE Id = ?", supplier_id)
        self.conn.commit()