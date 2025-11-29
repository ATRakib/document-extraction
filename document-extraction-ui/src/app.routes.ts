import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { ProfileComponent } from './app/pages/profile/profile.component';
import { SupplierComponent } from './app/pages/supplier/supplier.component';
import { ProductComponent } from './app/pages/product/product.component';
import { UploadComponent } from './app/pages/upload/upload.component';
import { LoginComponent } from './app/pages/auth/login.component';
import { AuthGuard } from './app/guards/auth.guard';
import { ProductFormComponent } from '@/pages/product/addoredit/product-form.component';

export const appRoutes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'profile', component: ProfileComponent },
            { path: 'suppliers', component: SupplierComponent },
            { path: 'view/1', component: ProductFormComponent },
            { path: 'products', loadChildren: () => import('./app/pages/product/product.routes') },
            { path: 'upload', component: UploadComponent }
        ]
    },
    //{ path: '**', redirectTo: '/auth/login' }
];
// import { Routes } from '@angular/router';
// import { AppLayout } from './app/layout/component/app.layout';
// import { Dashboard } from './app/pages/dashboard/dashboard';
// import { Documentation } from './app/pages/documentation/documentation';
// import { Landing } from './app/pages/landing/landing';
// import { Notfound } from './app/pages/notfound/notfound';

// export const appRoutes: Routes = [
//     {
//         path: '',
//         component: AppLayout,
//         children: [
//             { path: '', component: Dashboard },
//             { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
//             { path: 'documentation', component: Documentation },
//             { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
//         ]
//     },
//     { path: 'landing', component: Landing },
//     { path: 'notfound', component: Notfound },
//     { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
//     { path: '**', redirectTo: '/notfound' }
// ];
