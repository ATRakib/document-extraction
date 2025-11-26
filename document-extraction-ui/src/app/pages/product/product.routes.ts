import { Routes } from '@angular/router';
import { ProductFormComponent } from './addoredit/product-form.component';
import { ProductComponent } from './product.component';


export default [
    { path: '', component: ProductComponent },
    { path: 'add', component: ProductFormComponent },
    { path: 'edit/:id', component: ProductFormComponent },
    { path: 'view/:id', component: ProductFormComponent }
] as Routes;
