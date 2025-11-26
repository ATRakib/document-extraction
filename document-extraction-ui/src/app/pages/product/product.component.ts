import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
// PrimeNG Modules
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
// Custom Services/Interfaces
import { Product, ProductService, ProductInsert } from '../../services/product.service';
import { Supplier, SupplierService } from '../../services/supplier.service';

@Component({
    selector: 'app-product',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        ToolbarModule,
        ConfirmDialogModule,
        ToastModule,
        TooltipModule,
        CurrencyPipe
    ],
    providers: [ConfirmationService, MessageService],
    styles: [
        `
        :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: 0.5rem 0.5rem; 
            vertical-align: middle;
        }
        :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            padding: 0.75rem 0.5rem; 
        }
        :host ::ng-deep .p-button-icon-only {
            width: 2rem !important;
            height: 2rem !important;
        }
        .p-input-icon-right {
            width: 100%;
        }
        @media (min-width: 640px) {
            .p-input-icon-right {
                width: auto;
            }
        }
        `
    ],
    template: `
        <div class="p-0 bg-gray-50 min-h-screen">
            <p-toast position="top-right" />
            <p-confirmDialog [style]="{width: '50vw'}" key="productConfirm" />

            <div class="card p-4 shadow-lg rounded-lg bg-white">
                <h2 class="text-2xl font-semibold mb-4 text-gray-800">Product Management</h2>

                <p-toolbar styleClass="mb-4 p-3 border-b border-gray-200">
                    <ng-template pTemplate="start">
                        <p-button label="New Product" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                    </ng-template>
                    <ng-template pTemplate="end">
                        <span class="p-input-icon-right mr-2 w-full sm:w-48">
                           
                            <input pInputText type="text" (input)="dt.filterGlobal($any($event.target)?.value, 'contains')" placeholder="Global Search" 
                                class="w-full" /> 
                        </span>
                        <p-button icon="pi pi-refresh" severity="secondary" (onClick)="loadProducts()" />
                    </ng-template>
                </p-toolbar>

                <p-table #dt [value]="products" [paginator]="true" [rows]="10" [showCurrentPageReport]="true" dataKey="Id"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products" 
                    [rowsPerPageOptions]="[10, 25, 50]" [globalFilterFields]="['ModelName', 'CountryOfOrigin', 'SupplierName']"
                    styleClass="p-datatable-gridlines p-datatable-responsive-demo" [tableStyle]="{'min-width': '60rem'}">
                    
                    <ng-template pTemplate="caption">
                        <div class="text-lg font-medium text-gray-700">List of Registered Products</div>
                    </ng-template>

                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="ModelName" class="w-40">Model <p-sortIcon field="ModelName"></p-sortIcon></th>
                            <th pSortableColumn="Description">Description <p-sortIcon field="Description"></p-sortIcon></th>
                            <th pSortableColumn="ProductPrice" class="w-32">Price <p-sortIcon field="ProductPrice"></p-sortIcon></th>
                            <th pSortableColumn="CountryOfOrigin" class="w-32">Country <p-sortIcon field="CountryOfOrigin"></p-sortIcon></th>
                            <th pSortableColumn="SupplierName" class="w-32">Supplier <p-sortIcon field="SupplierName"></p-sortIcon></th>
                            <th class="w-24">Actions</th>
                        </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="body" let-product>
                        <tr>
                            <td class="font-medium">{{ product.ModelName }}</td>
                            <td pTooltip="{{ product.Description }}" tooltipPosition="top">
                                {{ (product.Description || 'N/A').substring(0, 50) }}{{ product.Description && product.Description.length > 50 ? '...' : '' }}
                            </td>
                            <td>{{ product.ProductPrice | currency:'USD':'symbol':'1.2-2' }}</td>
                            <td>{{ product.CountryOfOrigin || 'N/A' }}</td>
                            <td>{{ product.SupplierName || 'N/A' }}</td>
                            <td class="whitespace-nowrap">
                                <p-button icon="pi pi-eye" severity="secondary" [rounded]="true" [text]="true" class="mr-1" (click)="viewProduct(product)" pTooltip="View Details" tooltipPosition="top" />
                                <p-button icon="pi pi-pencil" severity="secondary" [rounded]="true" [text]="true" class="mr-1" (click)="editProduct(product)" pTooltip="Edit" tooltipPosition="top" />
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true" (click)="deleteProduct(product)" pTooltip="Delete" tooltipPosition="top" />
                            </td>
                        </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-4 text-gray-500">No products found.</td>
                        </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="paginatorleft">
                        <p-button type="button" icon="pi pi-list" [text]="true" severity="secondary" pTooltip="Display Options"></p-button>
                    </ng-template>

                </p-table>
            </div>


        </div>
    `
})
export class ProductComponent implements OnInit {
    @ViewChild('dt') dt!: Table;

    products: Product[] = [];
    suppliers: Supplier[] = [];
    productData: ProductInsert = this.emptyProduct();
    productDialog = false;
    isEdit = false;
    isView = false;
    submitted = false;
    dialogHeader = 'Product Details';
    currentProductId: number | null | undefined = null;

    constructor(
        private productService: ProductService,
        private supplierService: SupplierService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadProducts();
        this.loadSuppliers();
    }

    loadProducts() {
        this.productService.getAll().subscribe({
            next: (data) => {
                this.products = data;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products' });
            }
        });
    }

    loadSuppliers() {
        this.supplierService.getAll().subscribe({
            next: (data) => {
                this.suppliers = data;
            }
        });
    }

    openNew() {
        this.productData = this.emptyProduct();
        this.isEdit = false;
        this.isView = false;
        this.submitted = false;
        this.dialogHeader = 'New Product';
        this.currentProductId = null;
        this.productDialog = true;
    }

    viewProduct(product: Product) {
        if (product.Id) {
            this.productService.getById(product.Id).subscribe({
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
                    this.isView = true;
                    this.isEdit = false;
                    this.dialogHeader = `View Product: ${data.product.ModelName}`;
                    this.productDialog = true;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load product details' });
                }
            });
        }
    }

    editProduct(product: Product) {
        if (product.Id) {
            this.productService.getById(product.Id).subscribe({
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
                    this.isEdit = true;
                    this.isView = false;
                    this.submitted = false;
                    this.dialogHeader = `Edit Product: ${data.product.ModelName}`;
                    this.currentProductId = product.Id;
                    this.productDialog = true;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load product for editing' });
                }
            });
        }
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    saveProduct() {
        this.submitted = true;

        if (!this.productData.master.ModelName?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Model name is required' });
            return;
        }
        
        const operation = this.isEdit && this.currentProductId
            ? this.productService.update(this.currentProductId, this.productData)
            : this.productService.create(this.productData);

        const successMessage = this.isEdit ? 'Product updated successfully' : 'Product created successfully';
        const failureMessage = this.isEdit ? 'Update failed' : 'Creation failed';

        operation.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: successMessage });
                this.loadProducts();
                this.hideDialog();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: failureMessage });
            }
        });
    }

    deleteProduct(product: Product) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete product: ${product.ModelName}?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (product.Id) {
                    this.productService.delete(product.Id).subscribe({
                        next: () => {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product deleted successfully' });
                            this.loadProducts();
                        },
                        error: () => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
                        }
                    });
                }
            },
            key: 'productConfirm'
        });
    }

    addSpecification() {
        this.productData.specifications.push({
            SpecificationName: '',
            Size: '',
            OtherTerms: '',
            ProductSpecificationPrice: 0
        });
    }

    removeSpecification(index: number) {
        this.productData.specifications.splice(index, 1);
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