import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductInsert } from './product.service';

export interface ExtractPreview {
    message: string;
    product_data_list: ProductInsert[];
    is_duplicate: boolean;
    file_hash: string;
    file_name: string;
}

export interface SaveExtracted {
    product_data_list: ProductInsert[];
    file_hash: string;
    file_name: string;
}

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private apiUrl = 'http://127.0.0.1:8000/api/upload';

    constructor(private http: HttpClient) {}

    extractPreview(file: File, keywords: string): Observable<ExtractPreview> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('keywords', keywords);

        return this.http.post<ExtractPreview>(`${this.apiUrl}/extract/preview`, formData, { withCredentials: true });
    }

    saveExtracted(data: SaveExtracted): Observable<any> {
        return this.http.post(`${this.apiUrl}/save/extracted`, data, { withCredentials: true });
    }
}