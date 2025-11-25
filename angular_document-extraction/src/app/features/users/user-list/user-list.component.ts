import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  users: User[] = [];
  roles: Role[] = [];
  displayedColumns: string[] = ['Id', 'Username', 'Email', 'IsActive', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => this.users = data);
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe(data => this.roles = data);
  }

  openAssignRoleDialog(user: User): void {
    const dialogRef = this.dialog.open(AssignRoleDialog, {
      data: { user, roles: this.roles }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.assignRole({ UserId: user.Id, RoleId: result }).subscribe(() => {
          alert('Role assigned successfully');
        });
      }
    });
  }
}

@Component({
  selector: 'assign-role-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Assign Role</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="w-full">
          <mat-label>Select Role</mat-label>
          <mat-select formControlName="roleId">
            @for (role of data.roles; track role.Id) {
              <mat-option [value]="role.Id">{{ role.RoleName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button (click)="onSubmit()" [disabled]="!form.valid">Assign</button>
    </mat-dialog-actions>
  `
})
export class AssignRoleDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialog);
  data: any = inject(MatDialog);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      roleId: ['', Validators.required]
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