import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Role, Permission, AssignRoleRequest, AssignPermissionRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  createRole(data: { RoleName: string; Description?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles`, data);
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`);
  }

  createPermission(data: { PermissionName: string; Description?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/permissions`, data);
  }

  assignRole(data: AssignRoleRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign-role`, data);
  }

  assignPermission(data: AssignPermissionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign-permission`, data);
  }
}