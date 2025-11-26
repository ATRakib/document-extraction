import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, FilterMatchMode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Supplier, SupplierService } from '../../services/supplier.service';

@Component({
    selector: 'app-supplier',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        ToolbarModule,
        ConfirmDialogModule,
        ToastModule
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
        `
    ],
    template: `
        <div class="p-0 bg-gray-50 min-h-screen">
            <p-toast position="top-right" />
            <p-confirmDialog [style]="{width: '50vw'}" key="deleteConfirm" />
            
            <div class="card p-4 shadow-lg rounded-lg bg-white">
                <h2 class="text-2xl font-semibold mb-4 text-gray-800">Supplier Management</h2>

                <p-toolbar styleClass="mb-4 p-3 border-b border-gray-200">
                    <ng-template #start>
                        <p-button label="New Supplier" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                    </ng-template>
                    <ng-template #end>
                        <span class="p-input-icon-right mr-2">
                            
                            <input pInputText type="text" (input)="dt.filterGlobal($any($event.target)?.value, 'contains')" placeholder="Global Search" 
                                class="w-full sm:w-48" /> 
                        </span>
                        <p-button icon="pi pi-refresh" severity="secondary" (onClick)="loadSuppliers()" />
                    </ng-template>
                </p-toolbar>

                <p-table #dt [value]="suppliers" [paginator]="true" [rows]="10" [showCurrentPageReport]="true" dataKey="Id"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} suppliers" 
                    [rowsPerPageOptions]="[10, 25, 50]" [globalFilterFields]="['Name', 'Country', 'Email', 'Phone']"
                    styleClass="p-datatable-gridlines p-datatable-responsive-demo" [tableStyle]="{'min-width': '60rem'}">
                    
                    <ng-template pTemplate="caption">
                        <div class="text-lg font-medium text-gray-700">List of Registered Suppliers</div>
                    </ng-template>

                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="Id" class="w-16">ID <p-sortIcon field="Id"></p-sortIcon></th>
                            <th pSortableColumn="Name">Name <p-sortIcon field="Name"></p-sortIcon></th>
                            <th pSortableColumn="Country">Country <p-sortIcon field="Country"></p-sortIcon></th>
                            <th pSortableColumn="Phone">Phone <p-sortIcon field="Phone"></p-sortIcon></th>
                            <th pSortableColumn="Email">Email <p-sortIcon field="Email"></p-sortIcon></th>
                            <th class="w-24">Actions</th>
                        </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="body" let-supplier>
                        <tr>
                            <td>{{ supplier.Id }}</td>
                            <td class="font-medium">{{ supplier.Name }}</td>
                            <td>{{ supplier.Country || 'N/A' }}</td>
                            <td>{{ supplier.Phone || 'N/A' }}</td>
                            <td>{{ supplier.Email || 'N/A' }}</td>
                            <td>
                                <p-button icon="pi pi-pencil" severity="info" [rounded]="true" [text]="true" class="mr-1" (click)="editSupplier(supplier)" pTooltip="Edit" tooltipPosition="top" />
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true" (click)="deleteSupplier(supplier)" pTooltip="Delete" tooltipPosition="top" />
                            </td>
                        </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-4 text-gray-500">No suppliers found.</td>
                        </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="paginatorleft">
                        <p-button type="button" icon="pi pi-list" [text]="true" severity="secondary" pTooltip="Display Options"></p-button>
                    </ng-template>

                </p-table>
            </div>


            <p-dialog [(visible)]="supplierDialog" [style]="{width: '600px'}" [header]="isEdit ? 'Edit Supplier' : 'Add New Supplier'" 
                [modal]="true" styleClass="p-fluid">
                
                <ng-template pTemplate="content">
                    <form (ngSubmit)="saveSupplier()">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            <div class="col-span-full">
                                <label for="name" class="block font-medium mb-2">Name <span class="text-red-500">*</span></label>
                                <input id="name" type="text" pInputText [(ngModel)]="supplier.Name" name="Name" required 
                                    class="w-full" [ngClass]="{'ng-invalid ng-dirty': !supplier.Name && submitted}" />
                                <small *ngIf="!supplier.Name && submitted" class="p-error">Name is required.</small>
                            </div>

                            <div class="md:col-span-2">
                                <label for="address1" class="block font-medium mb-2">Address Line 1</label>
                                <input id="address1" type="text" pInputText [(ngModel)]="supplier.Address1" name="Address1" class="w-full" />
                            </div>
                            <div class="md:col-span-2">
                                <label for="address2" class="block font-medium mb-2">Address Line 2</label>
                                <input id="address2" type="text" pInputText [(ngModel)]="supplier.Address2" name="Address2" class="w-full" />
                            </div>

                            <div>
                                <label for="country" class="block font-medium mb-2">Country</label>
                                <input id="country" type="text" pInputText [(ngModel)]="supplier.Country" name="Country" class="w-full" />
                            </div>
                            <div>
                                <label for="phone" class="block font-medium mb-2">Phone</label>
                                <input id="phone" type="text" pInputText [(ngModel)]="supplier.Phone" name="Phone" class="w-full" />
                            </div>

                            <div>
                                <label for="email" class="block font-medium mb-2">Email</label>
                                <input id="email" type="email" pInputText [(ngModel)]="supplier.Email" name="Email" class="w-full" />
                            </div>
                            <div>
                                <label for="fax" class="block font-medium mb-2">Fax</label>
                                <input id="fax" type="text" pInputText [(ngModel)]="supplier.Fax" name="Fax" class="w-full" />
                            </div>
                        </div>
                    </form>
                </ng-template>

                <ng-template pTemplate="footer">
                    <p-button label="Cancel" icon="pi pi-times" severity="secondary" (click)="hideDialog()" />
                    <p-button [label]="isEdit ? 'Update' : 'Save'" icon="pi pi-check" (click)="saveSupplier()" />
                </ng-template>

            </p-dialog>
        </div>
    `
})
export class SupplierComponent implements OnInit {
    @ViewChild('dt') dt!: Table;

    suppliers: Supplier[] = [];
    supplier: Supplier = this.emptySupplier();
    supplierDialog = false;
    isEdit = false;
    submitted = false;

    constructor(
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
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load suppliers' });
            }
        });
    }

    openNew() {
        this.supplier = this.emptySupplier();
        this.isEdit = false;
        this.submitted = false;
        this.supplierDialog = true;
    }

    editSupplier(supplier: Supplier) {
        this.supplier = { ...supplier };
        this.isEdit = true;
        this.submitted = false;
        this.supplierDialog = true;
    }

    hideDialog() {
        this.supplierDialog = false;
        this.submitted = false;
    }

    saveSupplier() {
        this.submitted = true;

        if (!this.supplier.Name?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Supplier Name is required' });
            return;
        }

        const successMessage = this.isEdit ? 'Supplier updated successfully' : 'Supplier created successfully';
        const failureMessage = this.isEdit ? 'Update failed' : 'Creation failed';

        const operation = this.isEdit && this.supplier.Id 
            ? this.supplierService.update(this.supplier.Id, this.supplier)
            : this.supplierService.create(this.supplier);

        operation.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: successMessage });
                this.loadSuppliers();
                this.hideDialog();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: failureMessage });
            }
        });
    }

    deleteSupplier(supplier: Supplier) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete supplier: ${supplier.Name}? This action cannot be undone.`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (supplier.Id) {
                    this.supplierService.delete(supplier.Id).subscribe({
                        next: () => {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Supplier deleted successfully' });
                            this.loadSuppliers();
                        },
                        error: () => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
                        }
                    });
                }
            },
            key: 'deleteConfirm'
        });
    }

    emptySupplier(): Supplier {
        return {
            Name: '',
            Address1: '',
            Address2: '',
            Country: '',
            Phone: '',
            Email: '',
            Fax: ''
        };
    }
}