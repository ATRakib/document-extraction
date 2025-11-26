import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button'; // ButtonModule যোগ করা হলো (যদি পরে এডিট বাটন লাগে)

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule], // ButtonModule যোগ করা হয়েছে
    template: `
        <div class="p-6 bg-gray-50 min-h-screen">
            <div class="max-w-4xl mx-auto">
                
                <p-card header="👤 User Profile Information" styleClass="shadow-xl rounded-lg border-t-4 border-blue-500">
                    
                    <ng-container *ngIf="user; else loadingState">
                        <div class="p-4">
                            <div class="flex flex-col items-center mb-6 border-b pb-4">
                                <i class="pi pi-user text-8xl text-blue-600 mb-3 p-4 border-2 border-blue-100 rounded-full bg-blue-50"></i>
                                <h3 class="text-3xl font-semibold text-gray-800">{{ user.Username }}</h3>
                                <p class="text-md text-gray-500">{{ user.Email }}</p>
                            </div>

                            <div class="grid gap-y-6 md:grid-cols-2 gap-x-8">
                                
                                <div class="flex items-start">
                                    <i class="pi pi-at text-xl text-blue-500 mr-4 mt-1"></i>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-500">Username</label>
                                        <p class="text-lg font-medium text-gray-800">{{ user.Username }}</p>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <i class="pi pi-envelope text-xl text-blue-500 mr-4 mt-1"></i>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-500">Email Address</label>
                                        <p class="text-lg font-medium text-gray-800">{{ user.Email }}</p>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <i class="pi pi-key text-xl text-blue-500 mr-4 mt-1"></i>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-500">User ID</label>
                                        <p class="text-lg font-mono text-gray-800">{{ user.Id }}</p>
                                    </div>
                                </div>

                                <div class="flex items-start">
                                    <i class="pi pi-check-circle text-xl text-blue-500 mr-4 mt-1"></i>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-500">Account Status</label>
                                        <p class="text-lg font-medium">
                                            <span 
                                                class="px-3 py-1 rounded-full text-sm font-semibold"
                                                [ngClass]="user.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                                {{ user.IsActive ? 'Active' : 'Inactive' }}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <p-button label="Edit Profile" icon="pi pi-pencil" styleClass="p-button-secondary p-button-outlined mr-3"></p-button>
                                <p-button label="Change Password" icon="pi pi-lock" styleClass="p-button-secondary"></p-button>
                            </div>
                        </div>
                    </ng-container>

                    <ng-template #loadingState>
                        <div class="text-center p-5">
                            <i class="pi pi-spin pi-spinner text-3xl text-blue-500 block mb-3"></i>
                            <p class="text-gray-500">Loading user profile...</p>
                        </div>
                    </ng-template>

                </p-card>
            </div>
        </div>
    `
})
export class ProfileComponent implements OnInit {
    user: any = null;

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            this.user = user;
        });
    }
}