import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products: any[] = [];
  displayedColumns: string[] = ['Id', 'ModelName', 'Description', 'CountryOfOrigin', 'ProductPrice', 'actions'];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe(data => this.products = data);
  }

  view(id: number): void {
    this.router.navigate(['/products/view', id]);
  }

  edit(id: number): void {
    this.router.navigate(['/products/edit', id]);
  }

  delete(id: number): void {
    if (confirm('Delete this product?')) {
      this.productService.delete(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  create(): void {
    this.router.navigate(['/products/create']);
  }
}