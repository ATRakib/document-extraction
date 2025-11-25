import pyodbc
from typing import Optional, List
from app.models.user import User, Role, Permission

class UserRepository:
    def __init__(self, conn: pyodbc.Connection):
        self.conn = conn

    def create_user(self, user: User) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO Users (Username, Email, HashedPassword, IsActive) OUTPUT INSERTED.Id VALUES (?, ?, ?, ?)",
            user.Username, user.Email, user.HashedPassword, user.IsActive
        )
        user_id = cursor.fetchone()[0]
        self.conn.commit()
        return user_id

    def get_user_by_username(self, username: str) -> Optional[User]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT Id, Username, Email, HashedPassword, IsActive, CreatedAt FROM Users WHERE Username = ?", username)
        row = cursor.fetchone()
        if row:
            return User(Id=row[0], Username=row[1], Email=row[2], HashedPassword=row[3], IsActive=row[4], CreatedAt=row[5])
        return None

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT Id, Username, Email, HashedPassword, IsActive, CreatedAt FROM Users WHERE Id = ?", user_id)
        row = cursor.fetchone()
        if row:
            return User(Id=row[0], Username=row[1], Email=row[2], HashedPassword=row[3], IsActive=row[4], CreatedAt=row[5])
        return None

    def get_all_users(self) -> List[User]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT Id, Username, Email, HashedPassword, IsActive, CreatedAt FROM Users")
        rows = cursor.fetchall()
        return [User(Id=row[0], Username=row[1], Email=row[2], HashedPassword=row[3], IsActive=row[4], CreatedAt=row[5]) for row in rows]