import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { Permission } from '../../../core/models/user.model';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatDialogModule],
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.css']
})
export class PermissionListComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  permissions: Permission[] = [];
  displayedColumns: string[] = ['Id', 'PermissionName', 'Description'];

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.userService.getPermissions().subscribe(data => this.permissions = data);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreatePermissionDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createPermission(result).subscribe(() => {
          this.loadPermissions();
        });
      }
    });
  }
}

@Component({
  selector: 'create-permission-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Create Permission</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="w-full mb-4">
          <mat-label>Permission Name</mat-label>
          <input matInput formControlName="PermissionName">
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Description</mat-label>
          <input matInput formControlName="Description">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button (click)="onSubmit()" [disabled]="!form.valid">Create</button>
    </mat-dialog-actions>
  `
})
export class CreatePermissionDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialog);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      PermissionName: ['', Validators.required],
      Description: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.closeAll();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.closeAll();
    }
  }
}