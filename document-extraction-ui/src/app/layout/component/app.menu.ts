import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'User',
                items: [
                    { label: 'Profile', icon: 'pi pi-fw pi-user', routerLink: ['/profile'] }
                ]
            },
            {
                label: 'Management',
                items: [
                    { label: 'Products', icon: 'pi pi-fw pi-box', routerLink: ['/products'] },
                    { label: 'Suppliers', icon: 'pi pi-fw pi-building', routerLink: ['/suppliers'] }
                ]
            },
            {
                label: 'Documents',
                items: [
                    { label: 'Upload & Extract', icon: 'pi pi-fw pi-upload', routerLink: ['/upload'] }
                ]
            }
        ];
    }
}