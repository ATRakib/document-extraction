import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatDialogModule],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  roles: Role[] = [];
  displayedColumns: string[] = ['Id', 'RoleName', 'Description'];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe(data => this.roles = data);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateRoleDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createRole(result).subscribe(() => {
          this.loadRoles();
        });
      }
    });
  }
}

@Component({
  selector: 'create-role-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Create Role</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="w-full mb-4">
          <mat-label>Role Name</mat-label>
          <input matInput formControlName="RoleName">
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
export class CreateRoleDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialog);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      RoleName: ['', Validators.required],
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