import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductMaster {
    ModelName: string;
    Description?: string;
    CountryOfOrigin?: string;
    SupplierId?: number;
    ProductPrice?: number;
    Quotation?: string;
    FileName?: string;
    FileLocation?: string;
}

export interface ProductSpecification {
    SpecificationName?: string;
    Size?: string;
    OtherTerms?: string;
    ProductSpecificationPrice?: number;
}

export interface Product {
    Id?: number;
    ModelName: string;
    Description?: string;
    CountryOfOrigin?: string;
    SupplierId?: number;
    ProductPrice?: number;
    Quotation?: string;
    FileName?: string;
    FileLocation?: string;
    CreatedAt?: string;
}

export interface ProductDetail {
    product: Product;
    specifications: (ProductSpecification & { Id?: number; ProductId?: number })[];
}

export interface ProductInsert {
    master: ProductMaster;
    specifications: ProductSpecification[];
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = 'http://127.0.0.1:8000/api/products';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/`, { withCredentials: true });
    }

    getById(id: number): Observable<ProductDetail> {
        return this.http.get<ProductDetail>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }

    create(data: ProductInsert): Observable<any> {
        return this.http.post(`${this.apiUrl}/insert`, data, { withCredentials: true });
    }

    update(id: number, data: ProductInsert): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data, { withCredentials: true });
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
    }
}