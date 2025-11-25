import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/products', icon: 'inventory_2', label: 'Products' },
    { path: '/suppliers', icon: 'local_shipping', label: 'Suppliers' },
    { path: '/upload', icon: 'upload_file', label: 'Upload Document' },
    { path: '/users', icon: 'group', label: 'Users' },
    { path: '/roles', icon: 'admin_panel_settings', label: 'Roles' },
    { path: '/permissions', icon: 'security', label: 'Permissions' }
  ];
}