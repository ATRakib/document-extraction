import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { UploadService } from '../../../core/services/upload.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent {
  private uploadService = inject(UploadService);
  private router = inject(Router);

  selectedFile: File | null = null;
  keywords: string = '';
  uploading: boolean = false;
  error: string = '';

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file';
      return;
    }

    this.uploading = true;
    this.error = '';

    this.uploadService.uploadDocument(this.selectedFile, this.keywords).subscribe({
      next: (result) => {
        this.uploading = false;
        this.router.navigate(['/upload/json-editor'], { state: { data: result.product_data } });
      },
      error: (err) => {
        this.uploading = false;
        this.error = err.error.detail || 'Upload failed';
      }
    });
  }
}