import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.css']
})
export class JsonEditorComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  jsonData: string = '';
  error: string = '';

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any };
    if (state?.data) {
      this.jsonData = JSON.stringify(state.data, null, 2);
    }
  }

  onSave(): void {
    try {
      const data = JSON.parse(this.jsonData);
      this.productService.create(data).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error = err.error.detail || 'Save failed';
        }
      });
    } catch (e) {
      this.error = 'Invalid JSON format';
    }
  }

  cancel(): void {
    this.router.navigate(['/upload']);
  }
}