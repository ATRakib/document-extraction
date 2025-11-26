import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule], 
    template: `
        <div class="p-6 bg-white min-h-screen">
            <p-card styleClass="mb-6 shadow-none border-b border-gray-100 rounded-none bg-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-3xl font-light text-gray-800 mb-1">
                            Document Management Dashboard
                        </h2>
                        <p class="text-lg text-gray-500">
                            Hello, <span class="font-normal text-blue-600">{{ username }}</span>! Your quick access modules.
                        </p>
                    </div>
                </div>
            </p-card>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                
                <div>
                    <p-card styleClass="p-0 h-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out border-l-2 border-gray-100">
                        <div class="flex flex-col items-center justify-center p-6 text-center">
                            <div class="p-3 rounded-full bg-white mb-4 border border-gray-100">
                                <i class="pi pi-box text-4xl text-gray-600"></i>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-700 mb-1">Products</h3>
                            <p class="text-sm text-gray-400 mb-4">View and manage all product listings.</p>
                            <p-button label="Manage Products" icon="pi pi-angle-right" iconPos="right" 
                                styleClass="p-button-sm p-button-text w-full text-gray-600" 
                                (onClick)="navigate('/products')"></p-button>
                        </div>
                    </p-card>
                </div>

                <div>
                    <p-card styleClass="p-0 h-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out border-l-2 border-gray-100">
                        <div class="flex flex-col items-center justify-center p-6 text-center">
                            <div class="p-3 rounded-full bg-white mb-4 border border-gray-100">
                                <i class="pi pi-building text-4xl text-gray-600"></i>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-700 mb-1">Suppliers</h3>
                            <p class="text-sm text-gray-400 mb-4">Handle all vendor and supplier details.</p>
                            <p-button label="Manage Suppliers" icon="pi pi-angle-right" iconPos="right" 
                                styleClass="p-button-sm p-button-text w-full text-gray-600" 
                                (onClick)="navigate('/suppliers')"></p-button>
                        </div>
                    </p-card>
                </div>

                <div>
                    <p-card styleClass="p-0 h-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out border-l-2 border-blue-300">
                        <div class="flex flex-col items-center justify-center p-6 text-center">
                            <div class="p-3 rounded-full bg-blue-50 mb-4 border border-blue-200">
                                <i class="pi pi-cloud-upload text-4xl text-blue-600"></i> 
                            </div>
                            <h3 class="text-xl font-semibold text-gray-700 mb-1">Data Extraction</h3>
                            <p class="text-sm text-gray-400 mb-4">Upload documents for automated data parsing.</p>
                            <p-button label="Start Extraction" icon="pi pi-file-excel" iconPos="right" 
                                styleClass="p-button-sm p-button-primary w-full" 
                                (onClick)="navigate('/upload')"></p-button>
                        </div>
                    </p-card>
                </div>

                <div>
                    <p-card styleClass="p-0 h-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out border-l-2 border-gray-100">
                        <div class="flex flex-col items-center justify-center p-6 text-center">
                            <div class="p-3 rounded-full bg-white mb-4 border border-gray-100">
                                <i class="pi pi-user text-4xl text-gray-600"></i>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-700 mb-1">My Account</h3>
                            <p class="text-sm text-gray-400 mb-4">Update your user profile and settings.</p>
                            <p-button label="View Profile" icon="pi pi-angle-right" iconPos="right" 
                                styleClass="p-button-sm p-button-text w-full text-gray-600" 
                                (onClick)="navigate('/profile')"></p-button>
                        </div>
                    </p-card>
                </div>
            </div>
            
            <div class="mt-8 text-center">
                <p-button label="Logout" icon="pi pi-sign-out" 
                    styleClass="p-button-danger p-button-outlined" 
                    (onClick)="logout()"></p-button>
            </div>
        </div>
    `
})
export class Dashboard implements OnInit {
    username = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.username = user.Username;
            }
        });
    }

    navigate(path: string) {
        this.router.navigate([path]);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}

// import { Component } from '@angular/core';
// import { NotificationsWidget } from './components/notificationswidget';
// import { StatsWidget } from './components/statswidget';
// import { RecentSalesWidget } from './components/recentsaleswidget';
// import { BestSellingWidget } from './components/bestsellingwidget';
// import { RevenueStreamWidget } from './components/revenuestreamwidget';

// @Component({
//     selector: 'app-dashboard',
//     imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
//     template: `
//         <div class="grid grid-cols-12 gap-8">
//             <app-stats-widget class="contents" />
//             <div class="col-span-12 xl:col-span-6">
//                 <app-recent-sales-widget />
//                 <app-best-selling-widget />
//             </div>
//             <div class="col-span-12 xl:col-span-6">
//                 <app-revenue-stream-widget />
//                 <app-notifications-widget />
//             </div>
//         </div>
//     `
// })
// export class Dashboard {}
