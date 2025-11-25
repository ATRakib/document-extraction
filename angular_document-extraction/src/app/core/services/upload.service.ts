import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExtractedData } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/upload';

  uploadDocument(file: File, keywords: string): Observable<ExtractedData> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('keywords', keywords);
    return this.http.post<ExtractedData>(`${this.apiUrl}/document`, formData);
  }

  extractAndInsert(file: File, keywords: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('keywords', keywords);
    return this.http.post(`${this.apiUrl}/extract/products`, formData);
  }
}