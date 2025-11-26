import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UploadService } from '../../services/upload.service';
import { ProductInsert } from '../../services/product.service';
import { Supplier, SupplierService } from '../../services/supplier.service';

@Component({
    selector: 'app-upload',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        FileUploadModule,
        InputTextModule,
        CardModule,
        MessageModule,
        DialogModule,
        InputNumberModule,
        TextareaModule,
        SelectModule,
        ToastModule,
        ConfirmDialogModule,
        TableModule,
        TagModule,
        DividerModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
    selectedFile: File | null = null;
    keywords = '';
    extractedProducts: ProductInsert[] = [];
    isDuplicate = false;
    fileHash = '';
    fileName = '';
    editDialog = false;
    currentProduct: ProductInsert | null = null;
    currentIndex = -1;
    suppliers: Supplier[] = [];

    constructor(
        private uploadService: UploadService,
        private supplierService: SupplierService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadSuppliers();
    }

    loadSuppliers() {
        this.supplierService.getAll().subscribe({
            next: (data) => {
                this.suppliers = data;
            }
        });
    }

    onFileSelect(event: any) {
        this.selectedFile = event.target.files[0];
    }

    extractDocument() {
        if (!this.selectedFile) return;

        this.uploadService.extractPreview(this.selectedFile, this.keywords).subscribe({
            next: (data) => {
                this.extractedProducts = data.product_data_list;
                this.isDuplicate = data.is_duplicate;
                this.fileHash = data.file_hash;
                this.fileName = data.file_name;
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Success', 
                    detail: `Successfully extracted ${this.extractedProducts.length} product(s)` 
                });
            },
            error: () => {
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'Extraction failed. Please try again.' 
                });
            }
        });
    }

    editProduct(index: number) {
        this.currentProduct = JSON.parse(JSON.stringify(this.extractedProducts[index]));
        this.currentIndex = index;
        this.editDialog = true;
    }

    saveEdit() {
        if (this.currentProduct && this.currentIndex >= 0) {
            this.extractedProducts[this.currentIndex] = this.currentProduct;
            this.editDialog = false;
            this.messageService.add({ 
                severity: 'success', 
                summary: 'Success', 
                detail: 'Product changes saved successfully' 
            });
        }
    }

    saveAll() {
        if (this.isDuplicate) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Cannot save duplicate file!' 
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to save ${this.extractedProducts.length} product(s)?`,
            header: 'Confirm Save',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.uploadService.saveExtracted({
                    product_data_list: this.extractedProducts,
                    file_hash: this.fileHash,
                    file_name: this.fileName
                }).subscribe({
                    next: (data) => {
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: 'Success', 
                            detail: data.message 
                        });
                        this.extractedProducts = [];
                        this.selectedFile = null;
                        this.isDuplicate = false;
                    },
                    error: (err) => {
                        this.messageService.add({ 
                            severity: 'error', 
                            summary: 'Error', 
                            detail: err.error?.detail || 'Save failed' 
                        });
                    }
                });
            }
        });
    }

    getSupplierName(id?: number): string {
        if (!id) return 'N/A';
        const supplier = this.suppliers.find(s => s.Id === id);
        return supplier ? supplier.Name : 'N/A';
    }

    deleteSpecification(specIndex: number) {
        if (this.currentProduct) {
            this.currentProduct.specifications.splice(specIndex, 1);
        }
    }

    addSpecification() {
        if (this.currentProduct) {
            this.currentProduct.specifications.push({
                SpecificationName: '',
                Size: '',
                ProductSpecificationPrice: 0,
                OtherTerms: ''
            });
        }
    }
}


// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { FileUploadModule } from 'primeng/fileupload';
// import { InputTextModule } from 'primeng/inputtext';
// import { CardModule } from 'primeng/card';
// import { MessageModule } from 'primeng/message';
// import { DialogModule } from 'primeng/dialog';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { TextareaModule } from 'primeng/textarea';
// import { SelectModule } from 'primeng/select';
// import { ConfirmationService, MessageService } from 'primeng/api';
// import { ToastModule } from 'primeng/toast';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { UploadService } from '../../services/upload.service';
// import { ProductInsert } from '../../services/product.service';
// import { Supplier, SupplierService } from '../../services/supplier.service';

// @Component({
//     selector: 'app-upload',
//     standalone: true,
//     imports: [
//         CommonModule,
//         FormsModule,
//         ButtonModule,
//         FileUploadModule,
//         InputTextModule,
//         CardModule,
//         MessageModule,
//         DialogModule,
//         InputNumberModule,
//         TextareaModule,
//         SelectModule,
//         ToastModule,
//         ConfirmDialogModule
//     ],
//     providers: [MessageService, ConfirmationService],
//     template: `
//         <p-toast />
//         <p-confirmDialog />

//         <p-card header="Document Upload & Extraction">
//             <p-message *ngIf="isDuplicate" severity="warn" text="⚠️ Duplicate File Detected: This file has already been processed. You can preview the data but cannot save it again." styleClass="mb-4 w-full"></p-message>

//             <div class="grid">
//                 <div class="col-12">
//                     <label class="block font-bold mb-2">Select File (PDF, Word, Excel)</label>
//                     <input type="file" (change)="onFileSelect($event)" accept=".pdf,.doc,.docx,.xls,.xlsx" class="w-full p-3 border border-gray-300 rounded">
//                 </div>
//                 <div class="col-12">
//                     <label class="block font-bold mb-2">Keywords (optional)</label>
//                     <input type="text" pInputText [(ngModel)]="keywords" placeholder="e.g., model, price, specifications" fluid />
//                 </div>
//                 <div class="col-12">
//                     <p-button label="Extract & Preview" icon="pi pi-search" (onClick)="extractDocument()" [disabled]="!selectedFile" />
//                 </div>
//             </div>
//         </p-card>

//         <p-card *ngIf="extractedProducts.length > 0" header="Extracted Products" styleClass="mt-4">
//             <div class="grid">
//                 <div *ngFor="let product of extractedProducts; let i = index" class="col-12 lg:col-6">
//                     <div class="border-2 border-blue-200 rounded p-4 bg-blue-50 mb-3">
//                         <div class="mb-3 pb-3 border-b-2 border-blue-300">
//                             <h4 class="font-bold text-lg mb-2">📦 Product Master</h4>
//                             <div class="grid text-sm">
//                                 <div class="col-6"><span class="font-bold">Model:</span> {{ product.master.ModelName || 'N/A' }}</div>
//                                 <div class="col-6"><span class="font-bold">Price:</span> {{ product.master.ProductPrice | currency }}</div>
//                                 <div class="col-6"><span class="font-bold">Country:</span> {{ product.master.CountryOfOrigin || 'N/A' }}</div>
//                                 <div class="col-6"><span class="font-bold">Supplier:</span> {{ getSupplierName(product.master.SupplierId) || 'N/A' }}</div>
//                                 <div class="col-12"><span class="font-bold">Description:</span> {{ product.master.Description || 'No description' }}</div>
//                             </div>
//                         </div>
//                         <div class="mb-3">
//                             <h5 class="font-bold mb-2">📋 Specifications ({{ product.specifications.length }})</h5>
//                             <div *ngFor="let spec of product.specifications.slice(0, 2)" class="text-sm mb-1">
//                                 <span class="font-bold">{{ spec.SpecificationName || 'N/A' }}:</span> {{ spec.Size || 'N/A' }} - {{ spec.ProductSpecificationPrice | currency }}
//                             </div>
//                             <div *ngIf="product.specifications.length > 2" class="text-sm text-gray-600">
//                                 ... and {{ product.specifications.length - 2 }} more
//                             </div>
//                         </div>
//                         <p-button label="✏️ Edit Product" (onClick)="editProduct(i)" styleClass="w-full" />
//                     </div>
//                 </div>
//                 <div class="col-12">
//                     <p-button label="Save All Products" icon="pi pi-save" severity="success" (onClick)="saveAll()" [disabled]="isDuplicate" styleClass="w-full" />
//                 </div>
//             </div>
//         </p-card>

//         <p-dialog [(visible)]="editDialog" [style]="{width: '900px'}" header="Edit Product & Specifications" [modal]="true">
//             <ng-template #content>
//                 <div *ngIf="currentProduct" class="flex flex-col gap-4">
//                     <div class="border-2 border-blue-200 rounded p-4 bg-blue-50">
//                         <h4 class="font-bold text-lg mb-3">📦 Product Master</h4>
//                         <div class="grid">
//                             <div class="col-12">
//                                 <label class="block font-bold mb-2">Model Name *</label>
//                                 <input type="text" pInputText [(ngModel)]="currentProduct.master.ModelName" required fluid />
//                             </div>
//                             <div class="col-12">
//                                 <label class="block font-bold mb-2">Description</label>
//                                 <textarea pTextarea [(ngModel)]="currentProduct.master.Description" rows="3" fluid></textarea>
//                             </div>
//                             <div class="col-12 md:col-6">
//                                 <label class="block font-bold mb-2">Country of Origin</label>
//                                 <input type="text" pInputText [(ngModel)]="currentProduct.master.CountryOfOrigin" fluid />
//                             </div>
//                             <div class="col-12 md:col-6">
//                                 <label class="block font-bold mb-2">Supplier</label>
//                                 <p-select [(ngModel)]="currentProduct.master.SupplierId" [options]="suppliers" optionLabel="Name" optionValue="Id" placeholder="Select Supplier" fluid />
//                             </div>
//                             <div class="col-12 md:col-6">
//                                 <label class="block font-bold mb-2">Product Price</label>
//                                 <p-inputnumber [(ngModel)]="currentProduct.master.ProductPrice" mode="currency" currency="USD" fluid />
//                             </div>
//                             <div class="col-12 md:col-6">
//                                 <label class="block font-bold mb-2">Quotation</label>
//                                 <input type="text" pInputText [(ngModel)]="currentProduct.master.Quotation" fluid />
//                             </div>
//                         </div>
//                     </div>

//                     <div class="border-2 border-green-200 rounded p-4 bg-green-50">
//                         <h4 class="font-bold text-lg mb-3">📋 Product Specifications</h4>
//                         <div *ngFor="let spec of currentProduct.specifications; let i = index" class="border border-green-300 rounded p-3 mb-3 bg-white">
//                             <h6 class="font-bold mb-2">Specification #{{ i + 1 }}</h6>
//                             <div class="grid">
//                                 <div class="col-12 md:col-6">
//                                     <label class="block font-bold mb-2">Name</label>
//                                     <input type="text" pInputText [(ngModel)]="spec.SpecificationName" fluid />
//                                 </div>
//                                 <div class="col-12 md:col-6">
//                                     <label class="block font-bold mb-2">Size</label>
//                                     <input type="text" pInputText [(ngModel)]="spec.Size" fluid />
//                                 </div>
//                                 <div class="col-12 md:col-6">
//                                     <label class="block font-bold mb-2">Price</label>
//                                     <p-inputnumber [(ngModel)]="spec.ProductSpecificationPrice" mode="currency" currency="USD" fluid />
//                                 </div>
//                                 <div class="col-12 md:col-6">
//                                     <label class="block font-bold mb-2">Other Terms</label>
//                                     <input type="text" pInputText [(ngModel)]="spec.OtherTerms" fluid />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </ng-template>
//             <ng-template #footer>
//                 <p-button label="Cancel" icon="pi pi-times" text (click)="editDialog = false" />
//                 <p-button label="💾 Save Changes" icon="pi pi-check" (click)="saveEdit()" />
//             </ng-template>
//         </p-dialog>
//     `
// })
// export class UploadComponent implements OnInit {
//     selectedFile: File | null = null;
//     keywords = '';
//     extractedProducts: ProductInsert[] = [];
//     isDuplicate = false;
//     fileHash = '';
//     fileName = '';
//     editDialog = false;
//     currentProduct: ProductInsert | null = null;
//     currentIndex = -1;
//     suppliers: Supplier[] = [];

//     constructor(
//         private uploadService: UploadService,
//         private supplierService: SupplierService,
//         private messageService: MessageService,
//         private confirmationService: ConfirmationService
//     ) {}

//     ngOnInit() {
//         this.loadSuppliers();
//     }

//     loadSuppliers() {
//         this.supplierService.getAll().subscribe({
//             next: (data) => {
//                 this.suppliers = data;
//             }
//         });
//     }

//     onFileSelect(event: any) {
//         this.selectedFile = event.target.files[0];
//     }

//     extractDocument() {
//         if (!this.selectedFile) return;

//         this.uploadService.extractPreview(this.selectedFile, this.keywords).subscribe({
//             next: (data) => {
//                 this.extractedProducts = data.product_data_list;
//                 this.isDuplicate = data.is_duplicate;
//                 this.fileHash = data.file_hash;
//                 this.fileName = data.file_name;
//                 this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Extraction completed' });
//             },
//             error: () => {
//                 this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Extraction failed' });
//             }
//         });
//     }

//     editProduct(index: number) {
//         this.currentProduct = JSON.parse(JSON.stringify(this.extractedProducts[index]));
//         this.currentIndex = index;
//         this.editDialog = true;
//     }

//     saveEdit() {
//         if (this.currentProduct && this.currentIndex >= 0) {
//             this.extractedProducts[this.currentIndex] = this.currentProduct;
//             this.editDialog = false;
//             this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Changes saved' });
//         }
//     }

//     saveAll() {
//         if (this.isDuplicate) {
//             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Cannot save duplicate file!' });
//             return;
//         }

//         this.confirmationService.confirm({
//             message: `Save ${this.extractedProducts.length} product(s)?`,
//             header: 'Confirm',
//             icon: 'pi pi-exclamation-triangle',
//             accept: () => {
//                 this.uploadService.saveExtracted({
//                     product_data_list: this.extractedProducts,
//                     file_hash: this.fileHash,
//                     file_name: this.fileName
//                 }).subscribe({
//                     next: (data) => {
//                         this.messageService.add({ severity: 'success', summary: 'Success', detail: data.message });
//                         this.extractedProducts = [];
//                         this.selectedFile = null;
//                         this.isDuplicate = false;
//                     },
//                     error: (err) => {
//                         this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.detail || 'Save failed' });
//                     }
//                 });
//             }
//         });
//     }

//     getSupplierName(id?: number): string {
//         if (!id) return 'N/A';
//         const supplier = this.suppliers.find(s => s.Id === id);
//         return supplier ? supplier.Name : 'N/A';
//     }
// }