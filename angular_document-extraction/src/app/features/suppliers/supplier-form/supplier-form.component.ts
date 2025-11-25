import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supplierService = inject(SupplierService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  supplierForm: FormGroup;
  supplierId: number | null = null;
  isEditMode = false;

  constructor() {
    this.supplierForm = this.fb.group({
      Name: ['', Validators.required],
      Address1: [''],
      Address2: [''],
      Country: [''],
      Phone: [''],
      Email: ['', Validators.email],
      Fax: ['']
    });
  }

  ngOnInit(): void {
    this.supplierId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.supplierId) {
      this.isEditMode = true;
      this.supplierService.getById(this.supplierId).subscribe(data => {
        this.supplierForm.patchValue(data);
      });
    }
  }

  onSubmit(): void {
    if (this.supplierForm.valid) {
      if (this.isEditMode && this.supplierId) {
        this.supplierService.update(this.supplierId, this.supplierForm.value).subscribe(() => {
          this.router.navigate(['/suppliers']);
        });
      } else {
        this.supplierService.create(this.supplierForm.value).subscribe(() => {
          this.router.navigate(['/suppliers']);
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/suppliers']);
  }
}