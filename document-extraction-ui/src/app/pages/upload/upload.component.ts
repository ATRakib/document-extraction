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
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UploadService } from '../../services/upload.service';
import { ProductInsert } from '../../services/product.service';
import { Supplier, SupplierService } from '../../services/supplier.service';

interface ExtractedProduct extends ProductInsert {
    extractedSupplierName?: string;
    extractedSupplierData?: any;  // ✅ Store supplier data for each product
    isNewSupplier?: boolean;
}

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
        AutoCompleteModule,
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
    extractedProducts: ExtractedProduct[] = [];
    isDuplicate = false;
    fileHash = '';
    fileName = '';
    suppliers: Supplier[] = [];
    filteredSuppliers: Supplier[] = [];
    
    // Add supplier dialog
    addSupplierDialog = false;
    newSupplierName = '';
    newSupplierEmail = '';
    newSupplierPhone = '';
    newSupplierFax = '';
    newSupplierCountry = '';
    newSupplierAddress1 = '';
    newSupplierAddress2 = '';
    currentProductIndex = -1;

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
                this.extractedProducts = data.product_data_list.map((product: any) => {
                    const extractedSupplierName = product.master.Supplier?.Name || '';
                    // ✅ Store supplier data IN the product itself
                    const supplierData = product.master.Supplier || {};
                    
                    const existingSupplier = this.suppliers.find(s => 
                        s.Name.toLowerCase().trim() === extractedSupplierName?.toLowerCase().trim()
                    );

                    return {
                        ...product,
                        extractedSupplierName: extractedSupplierName,
                        extractedSupplierData: supplierData,  // ✅ Each product has its own supplier data
                        isNewSupplier: !existingSupplier,
                        master: {
                            ...product.master,
                            SupplierId: existingSupplier?.Id
                        }
                    };
                });
                
                this.isDuplicate = data.is_duplicate;
                this.fileHash = data.file_hash;
                this.fileName = data.file_name;
                
                console.log('Extracted Products:', this.extractedProducts);
                console.log('Raw Data:', data.product_data_list);
                
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

    searchSupplier(event: any, productIndex: number) {
        const query = event.query.toLowerCase().trim();
        if (!query) {
            // Show all suppliers when dropdown is opened or query is empty
            this.filteredSuppliers = [...this.suppliers];
        } else {
            // Filter suppliers based on query
            this.filteredSuppliers = this.suppliers.filter(s => 
                s.Name.toLowerCase().includes(query)
            );
        }
    }

    onSupplierSelect(event: any, productIndex: number) {
        // When a supplier is selected from dropdown
        this.extractedProducts[productIndex].master.SupplierId = event.Id;
        this.extractedProducts[productIndex].extractedSupplierName = event.Name;
        this.extractedProducts[productIndex].isNewSupplier = false;
    }

    onSupplierChange(productIndex: number) {
        // When supplier name is manually typed/changed
        const product = this.extractedProducts[productIndex];
        const supplierName = product.extractedSupplierName?.trim();
        
        if (!supplierName) {
            product.master.SupplierId = undefined;
            product.isNewSupplier = false;
            return;
        }

        const existingSupplier = this.suppliers.find(s => 
            s.Name.toLowerCase() === supplierName.toLowerCase()
        );

        if (existingSupplier) {
            product.master.SupplierId = existingSupplier.Id;
            product.extractedSupplierName = existingSupplier.Name;
            product.isNewSupplier = false;
        } else {
            product.master.SupplierId = undefined;
            product.isNewSupplier = true;
        }
    }

    openAddSupplierDialog(productIndex: number, supplierName: any) {
        this.currentProductIndex = productIndex;
        
        // ✅ Get supplier data from the SPECIFIC product
        const supplierData = this.extractedProducts[productIndex].extractedSupplierData || {};
        
        // ✅ Set all fields from that product's supplier data
        this.newSupplierName = supplierName || supplierData.Name || '';
        this.newSupplierEmail = supplierData.Email || '';
        this.newSupplierPhone = supplierData.Phone || '';
        this.newSupplierAddress1 = supplierData.Address1 || '';
        this.newSupplierAddress2 = supplierData.Address2 || '';
        this.newSupplierCountry = supplierData.Country || '';
        this.newSupplierFax = supplierData.Fax || '';
        
        this.addSupplierDialog = true;
    }

    saveNewSupplier() {
        if (!this.newSupplierName.trim()) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Supplier name is required' 
            });
            return;
        }

        const newSupplier = {
            Name: this.newSupplierName.trim(),
            Email: this.newSupplierEmail.trim(),
            Phone: this.newSupplierPhone.trim(),
            Address1: this.newSupplierAddress1.trim(),
            Address2: this.newSupplierAddress2.trim(),
            Country: this.newSupplierCountry.trim(),
            Fax: this.newSupplierFax.trim()
        };

        this.supplierService.create(newSupplier).subscribe({
            next: (data) => {
                // Add to suppliers list
                this.suppliers.push(data.supplier);
                
                // Update current product
                this.extractedProducts[this.currentProductIndex].master.SupplierId = data.supplier.Id;
                this.extractedProducts[this.currentProductIndex].isNewSupplier = false;
                this.extractedProducts[this.currentProductIndex].extractedSupplierName = data.supplier.Name;
                
                // Auto-update other products with same supplier name
                const newSupplierNameLower = data.supplier.Name.toLowerCase().trim();
                
                this.extractedProducts.forEach((product, index) => {
                    if (index !== this.currentProductIndex && 
                        product.isNewSupplier && 
                        product.extractedSupplierName?.toLowerCase().trim() === newSupplierNameLower) {
                        product.master.SupplierId = data.supplier.Id;
                        product.isNewSupplier = false;
                        product.extractedSupplierName = data.supplier.Name;
                    }
                });
                
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Success', 
                    detail: 'Supplier added successfully and auto-assigned to matching products' 
                });
                
                this.addSupplierDialog = false;
            },
            error: (err) => {
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: err.error?.detail || 'Failed to add supplier' 
                });
            }
        });
    }

    applySuggestion(productIndex: number, field: string, value: any) {
        const product = this.extractedProducts[productIndex];
        if (field === 'ModelName') product.master.ModelName = value;
        else if (field === 'ProductPrice') product.master.ProductPrice = value;
        else if (field === 'CountryOfOrigin') product.master.CountryOfOrigin = value;
        else if (field === 'Description') product.master.Description = value;
    }

    addSpecification(productIndex: number) {
        this.extractedProducts[productIndex].specifications.push({
            SpecificationName: '',
            Size: '',
            ProductSpecificationPrice: 0,
            OtherTerms: ''
        });
    }

    deleteSpecification(productIndex: number, specIndex: number) {
        this.extractedProducts[productIndex].specifications.splice(specIndex, 1);
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

        // Check if all products have supplier
        const productsWithoutSupplier = this.extractedProducts.filter(p => !p.master.SupplierId);
        if (productsWithoutSupplier.length > 0) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Please assign supplier to all products' 
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
                        this.fileHash = '';
                        this.fileName = '';
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
}