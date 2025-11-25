import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ProductService } from '../../../core/services/product.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private supplierService = inject(SupplierService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productForm: FormGroup;
  productId: number | null = null;
  isEditMode = false;
  suppliers: Supplier[] = [];

  constructor() {
    this.productForm = this.fb.group({
      master: this.fb.group({
        ModelName: ['', Validators.required],
        Description: [''],
        CountryOfOrigin: [''],
        SupplierId: [null],
        ProductPrice: [0]
      }),
      specifications: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.supplierService.getAll().subscribe(data => this.suppliers = data);
    
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.isEditMode = true;
      this.productService.getById(this.productId).subscribe(data => {
        this.productForm.patchValue({
          master: data.product
        });
        data.specifications.forEach((spec: any) => {
          this.addSpecification(spec);
        });
      });
    } else {
      this.addSpecification();
    }
  }

  get specifications(): FormArray {
    return this.productForm.get('specifications') as FormArray;
  }

  addSpecification(data?: any): void {
    const specGroup = this.fb.group({
      SpecificationName: [data?.SpecificationName || ''],
      Size: [data?.Size || ''],
      OtherTerms: [data?.OtherTerms || ''],
      ProductSpecificationPrice: [data?.ProductSpecificationPrice || 0]
    });
    this.specifications.push(specGroup);
  }

  removeSpecification(index: number): void {
    this.specifications.removeAt(index);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      if (this.isEditMode && this.productId) {
        this.productService.update(this.productId, this.productForm.value).subscribe(() => {
          this.router.navigate(['/products']);
        });
      } else {
        this.productService.create(this.productForm.value).subscribe(() => {
          this.router.navigate(['/products']);
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}