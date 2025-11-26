import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductInsert, ProductService } from '@/services/product.service';
import { Supplier, SupplierService } from '@/services/supplier.service';


@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        SelectModule,
        TableModule,
        TagModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
    productData: ProductInsert = this.emptyProduct();
    suppliers: Supplier[] = [];
    isEdit = false;
    isView = false;
    productId: number | null = null;
    pageTitle = 'Add New Product';
    loading = false;

    constructor(
        private productService: ProductService,
        private supplierService: SupplierService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadSuppliers();
        
        const id = this.route.snapshot.paramMap.get('id');
        const mode = this.route.snapshot.url[0]?.path;

        if (id && mode) {
            this.productId = +id;
            this.isView = mode === 'view';
            this.isEdit = mode === 'edit';
            this.pageTitle = this.isView ? 'View Product' : 'Edit Product';
            this.loadProduct();
        }
    }

    loadSuppliers() {
        this.supplierService.getAll().subscribe({
            next: (data) => {
                this.suppliers = data;
            }
        });
    }

    loadProduct() {
        if (this.productId) {
            this.loading = true;
            this.productService.getById(this.productId).subscribe({
                next: (data) => {
                    this.productData = {
                        master: { ...data.product },
                        specifications: data.specifications.map(s => ({
                            SpecificationName: s.SpecificationName,
                            Size: s.Size,
                            OtherTerms: s.OtherTerms,
                            ProductSpecificationPrice: s.ProductSpecificationPrice
                        }))
                    };
                    this.loading = false;
                },
                error: () => {
                    this.messageService.add({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: 'Failed to load product' 
                    });
                    this.loading = false;
                    this.goBack();
                }
            });
        }
    }

    addSpecification() {
        this.productData.specifications.push({
            SpecificationName: '',
            Size: '',
            OtherTerms: '',
            ProductSpecificationPrice: 0
        });
    }

    deleteSpecification(index: number) {
        this.productData.specifications.splice(index, 1);
    }

    saveProduct() {
        if (!this.productData.master.ModelName?.trim()) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Model name is required' 
            });
            return;
        }

        this.loading = true;

        if (this.isEdit && this.productId) {
            this.productService.update(this.productId, this.productData).subscribe({
                next: () => {
                    this.messageService.add({ 
                        severity: 'success', 
                        summary: 'Success', 
                        detail: 'Product updated successfully' 
                    });
                    this.loading = false;
                    setTimeout(() => this.goBack(), 1500);
                },
                error: () => {
                    this.messageService.add({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: 'Failed to update product' 
                    });
                    this.loading = false;
                }
            });
        } else {
            this.productService.create(this.productData).subscribe({
                next: () => {
                    this.messageService.add({ 
                        severity: 'success', 
                        summary: 'Success', 
                        detail: 'Product created successfully' 
                    });
                    this.loading = false;
                    setTimeout(() => this.goBack(), 1500);
                },
                error: () => {
                    this.messageService.add({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: 'Failed to create product' 
                    });
                    this.loading = false;
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/products']);
    }

    getSupplierName(id?: number): string {
        if (!id) return 'N/A';
        const supplier = this.suppliers.find(s => s.Id === id);
        return supplier ? supplier.Name : 'N/A';
    }

    emptyProduct(): ProductInsert {
        return {
            master: {
                ModelName: '',
                Description: '',
                CountryOfOrigin: '',
                SupplierId: undefined,
                ProductPrice: 0,
                Quotation: ''
            },
            specifications: []
        };
    }
}