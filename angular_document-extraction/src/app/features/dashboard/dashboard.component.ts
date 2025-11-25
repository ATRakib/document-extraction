import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../core/services/product.service';
import { SupplierService } from '../../core/services/supplier.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private supplierService = inject(SupplierService);
  private userService = inject(UserService);

  stats = {
    totalProducts: 0,
    totalSuppliers: 0,
    totalUsers: 0,
    totalRoles: 0
  };

  recentProducts: any[] = [];

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentProducts();
  }

  loadStats(): void {
    this.productService.getAll().subscribe(data => {
      this.stats.totalProducts = data.length;
    });

    this.supplierService.getAll().subscribe(data => {
      this.stats.totalSuppliers = data.length;
    });

    this.userService.getUsers().subscribe(data => {
      this.stats.totalUsers = data.length;
    });

    this.userService.getRoles().subscribe(data => {
      this.stats.totalRoles = data.length;
    });
  }

  loadRecentProducts(): void {
    this.productService.getAll().subscribe(data => {
      this.recentProducts = data.slice(0, 5);
    });
  }
}