import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'users', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent) 
  },
  { 
    path: 'roles', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/role-list/role-list.component').then(m => m.RoleListComponent) 
  },
  { 
    path: 'permissions', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/permission-list/permission-list.component').then(m => m.PermissionListComponent) 
  },
  { 
    path: 'suppliers', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/suppliers/supplier-list/supplier-list.component').then(m => m.SupplierListComponent) 
  },
  { 
    path: 'suppliers/create', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/suppliers/supplier-form/supplier-form.component').then(m => m.SupplierFormComponent) 
  },
  { 
    path: 'suppliers/edit/:id', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/suppliers/supplier-form/supplier-form.component').then(m => m.SupplierFormComponent) 
  },
  { 
    path: 'products', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) 
  },
  { 
    path: 'products/create', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent) 
  },
  { 
    path: 'products/edit/:id', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent) 
  },
  { 
    path: 'products/view/:id', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent) 
  },
  { 
    path: 'upload', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/upload/document-upload/document-upload.component').then(m => m.DocumentUploadComponent) 
  },
  { 
    path: 'upload/json-editor', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/upload/json-editor/json-editor.component').then(m => m.JsonEditorComponent) 
  }
];