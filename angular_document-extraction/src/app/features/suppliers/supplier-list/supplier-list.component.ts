import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private router = inject(Router);

  suppliers: Supplier[] = [];
  displayedColumns: string[] = ['Id', 'Name', 'Country', 'Phone', 'Email', 'actions'];

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAll().subscribe(data => this.suppliers = data);
  }

  edit(id: number): void {
    this.router.navigate(['/suppliers/edit', id]);
  }

  delete(id: number): void {
    if (confirm('Delete this supplier?')) {
      this.supplierService.delete(id).subscribe(() => {
        this.loadSuppliers();
      });
    }
  }

  create(): void {
    this.router.navigate(['/suppliers/create']);
  }
}