import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, MessageModule],
    template: `
        <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">Document Extraction</h1>
                    <p class="text-gray-600">Sign in to your account</p>
                </div>

                <p-message *ngIf="errorMessage" severity="error" [text]="errorMessage" styleClass="mb-4 w-full"></p-message>
                <p-message *ngIf="successMessage" severity="success" [text]="successMessage" styleClass="mb-4 w-full"></p-message>

                <div class="mb-6">
                    <div class="flex border-b border-gray-200">
                        <button 
                            class="flex-1 py-3 px-4 text-center font-medium"
                            [ngClass]="isLoginTab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
                            (click)="showLogin()">
                            Login
                        </button>
                        <button 
                            class="flex-1 py-3 px-4 text-center font-medium"
                            [ngClass]="!isLoginTab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
                            (click)="showRegister()">
                            Register
                        </button>
                    </div>
                </div>

                <form *ngIf="isLoginTab" (ngSubmit)="onLogin()" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input 
                            type="text" 
                            [(ngModel)]="loginData.Username" 
                            name="username"
                            required
                            pInputText
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            [(ngModel)]="loginData.Password" 
                            name="password"
                            required
                            pInputText
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <button 
                        type="submit"
                        pButton
                        label="Sign In"
                        class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                    </button>
                </form>

                <form *ngIf="!isLoginTab" (ngSubmit)="onRegister()" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input 
                            type="text" 
                            [(ngModel)]="registerData.Username" 
                            name="username"
                            required
                            pInputText
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                            type="email" 
                            [(ngModel)]="registerData.Email" 
                            name="email"
                            required
                            pInputText
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            [(ngModel)]="registerData.Password" 
                            name="password"
                            required
                            pInputText
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <button 
                        type="submit"
                        pButton
                        label="Create Account"
                        class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                    </button>
                </form>
            </div>
        </div>
    `
})
export class LoginComponent {
    isLoginTab = true;
    errorMessage = '';
    successMessage = '';
    
    loginData = {
        Username: '',
        Password: ''
    };

    registerData = {
        Username: '',
        Email: '',
        Password: ''
    };

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    showLogin() {
        this.isLoginTab = true;
        this.errorMessage = '';
        this.successMessage = '';
    }

    showRegister() {
        this.isLoginTab = false;
        this.errorMessage = '';
        this.successMessage = '';
    }

    onLogin() {
        this.errorMessage = '';
        this.authService.login(this.loginData).subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.errorMessage = err.error?.detail || 'Login failed';
            }
        });
    }

    onRegister() {
        this.errorMessage = '';
        this.successMessage = '';
        this.authService.register(this.registerData).subscribe({
            next: () => {
                this.successMessage = 'Account created! Please login.';
                setTimeout(() => this.showLogin(), 2000);
            },
            error: (err) => {
                this.errorMessage = err.error?.detail || 'Registration failed';
            }
        });
    }
}