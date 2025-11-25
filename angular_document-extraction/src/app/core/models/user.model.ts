export interface User {
  Id: number;
  Username: string;
  Email: string;
  IsActive: boolean;
}

export interface Role {
  Id: number;
  RoleName: string;
  Description?: string;
}

export interface Permission {
  Id: number;
  PermissionName: string;
  Description?: string;
}

export interface AssignRoleRequest {
  UserId: number;
  RoleId: number;
}

export interface AssignPermissionRequest {
  RoleId: number;
  PermissionId: number;
}