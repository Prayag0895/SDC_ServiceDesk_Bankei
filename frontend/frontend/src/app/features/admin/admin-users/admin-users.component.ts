import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, AdminUser, DepartmentItem, DomainItem } from '../admin.service';
import { catchError, finalize, forkJoin, of, timeout } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  departments: DepartmentItem[] = [];
  domains: DomainItem[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  isEditOpen = false;
  selectedUserId: number | null = null;
  editForm: FormGroup;

  roles = [
    { value: 'DEPARTMENT', label: 'Department User' },
    { value: 'DIT', label: 'Project Manager' },
    { value: 'SDC', label: 'SDC Staff' },
    { value: 'OFFICER', label: 'Officer' }
  ];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      phone_number: [''],
      department_name: [null],
      domain: [null],
      is_approved: [false]
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadMeta();
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService
      .getUsers()
      .pipe(
        timeout(10000),
        catchError(() => {
          this.errorMessage = 'Failed to load users.';
          return of([] as AdminUser[]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe((users) => {
        this.users = users;
        this.cd.detectChanges();
      });
  }

  loadMeta() {
    forkJoin({
      departments: this.adminService.getDepartments().pipe(catchError(() => of([] as DepartmentItem[]))),
      domains: this.adminService.getDomains().pipe(catchError(() => of([] as DomainItem[])))
    }).subscribe(({ departments, domains }) => {
      this.departments = departments;
      this.domains = domains;
    });
  }

  openEdit(user: AdminUser) {
    this.selectedUserId = user.id;
    this.errorMessage = '';
    this.editForm.reset({
      username: user.username || '',
      email: user.email || '',
      role: user.role || '',
      phone_number: user.phone_number || '',
      department_name: (user as any).department_name ?? null,
      domain: (user as any).domain ?? null,
      is_approved: user.is_approved
    });
    this.isEditOpen = true;
  }

  closeEdit() {
    this.isEditOpen = false;
    this.selectedUserId = null;
  }

  saveUser() {
    if (!this.selectedUserId || this.editForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const payload = {
      username: this.editForm.value.username,
      email: this.editForm.value.email,
      role: this.editForm.value.role,
      phone_number: this.editForm.value.phone_number || null,
      department_name: this.editForm.value.department_name || null,
      domain: this.editForm.value.domain || null,
      is_approved: !!this.editForm.value.is_approved
    };

    this.adminService
      .updateUser(this.selectedUserId, payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: (updated) => {
          this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
          this.closeEdit();
        },
        error: () => {
          this.errorMessage = 'Failed to update user.';
        }
      });
  }

  deleteUser(user: AdminUser) {
    if (!confirm(`Delete ${user.username}? This cannot be undone.`)) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.adminService
      .deleteUser(user.id)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.id !== user.id);
        },
        error: () => {
          this.errorMessage = 'Failed to delete user.';
        }
      });
  }
}
