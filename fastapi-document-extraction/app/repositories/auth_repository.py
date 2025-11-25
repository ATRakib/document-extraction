import pyodbc
from typing import List, Optional
from app.models.user import Role, Permission

class AuthRepository:
    def __init__(self, conn: pyodbc.Connection):
        self.conn = conn

    def create_role(self, role: Role) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO Roles (RoleName, Description) OUTPUT INSERTED.Id VALUES (?, ?)",
            role.RoleName, role.Description
        )
        role_id = cursor.fetchone()[0]
        self.conn.commit()
        return role_id

    def get_all_roles(self) -> List[Role]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT Id, RoleName, Description, CreatedAt FROM Roles")
        rows = cursor.fetchall()
        return [Role(Id=row[0], RoleName=row[1], Description=row[2], CreatedAt=row[3]) for row in rows]

    def create_permission(self, permission: Permission) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO Permissions (PermissionName, Description) OUTPUT INSERTED.Id VALUES (?, ?)",
            permission.PermissionName, permission.Description
        )
        permission_id = cursor.fetchone()[0]
        self.conn.commit()
        return permission_id

    def get_all_permissions(self) -> List[Permission]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT Id, PermissionName, Description, CreatedAt FROM Permissions")
        rows = cursor.fetchall()
        return [Permission(Id=row[0], PermissionName=row[1], Description=row[2], CreatedAt=row[3]) for row in rows]

    def assign_role_to_user(self, user_id: int, role_id: int):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO UserRoles (UserId, RoleId) VALUES (?, ?)", user_id, role_id)
        self.conn.commit()

    def assign_permission_to_role(self, role_id: int, permission_id: int):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO RolePermissions (RoleId, PermissionId) VALUES (?, ?)", role_id, permission_id)
        self.conn.commit()

    def get_user_permissions(self, user_id: int) -> List[str]:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT DISTINCT p.PermissionName
            FROM Permissions p
            INNER JOIN RolePermissions rp ON p.Id = rp.PermissionId
            INNER JOIN UserRoles ur ON rp.RoleId = ur.RoleId
            WHERE ur.UserId = ?
        """, user_id)
        rows = cursor.fetchall()
        return [row[0] for row in rows]

    def get_user_roles(self, user_id: int) -> List[str]:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT r.RoleName
            FROM Roles r
            INNER JOIN UserRoles ur ON r.Id = ur.RoleId
            WHERE ur.UserId = ?
        """, user_id)
        rows = cursor.fetchall()
        return [row[0] for row in rows]