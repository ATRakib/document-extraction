import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Supplier {
    Id?: number;
    Name: string;
    Address1?: string;
    Address2?: string;
    Country?: string;
    Phone?: string;
    Email?: string;
    Fax?: string;
    CreatedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private apiUrl = 'http://127.0.0.1:8000/api/products/suppliers';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(this.apiUrl, { withCredentials: true });
    }

    getById(id: number): Observable<Supplier> {
        return this.http.get<Supplier>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }

    create(supplier: Supplier): Observable<any> {
        return this.http.post(this.apiUrl, supplier, { withCredentials: true });
    }

    update(id: number, supplier: Supplier): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, supplier, { withCredentials: true });
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
    }
}