import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, DepartmentItem } from '../admin.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-departments.component.html',
  styleUrls: ['./admin-departments.component.css']
})
export class AdminDepartmentsComponent implements OnInit {
  departments: DepartmentItem[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  isModalOpen = false;
  isEditMode = false;
  selectedDepartmentId: number | null = null;
  departmentForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService
      .getDepartmentsAdmin()
      .pipe(
        catchError(() => {
          this.errorMessage = 'Failed to load departments.';
          return of([] as DepartmentItem[]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe((items) => {
        this.departments = items;
        this.cd.detectChanges();
      });
  }

  openCreate() {
    this.isEditMode = false;
    this.selectedDepartmentId = null;
    this.departmentForm.reset({ name: '' });
    this.errorMessage = '';
    this.isModalOpen = true;
  }

  openEdit(dept: DepartmentItem) {
    this.isEditMode = true;
    this.selectedDepartmentId = dept.id;
    this.departmentForm.reset({ name: dept.name });
    this.errorMessage = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveDepartment() {
    if (this.departmentForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const payload = { name: this.departmentForm.value.name };

    const request$ = this.isEditMode && this.selectedDepartmentId
      ? this.adminService.updateDepartment(this.selectedDepartmentId, payload)
      : this.adminService.createDepartment(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: (dept) => {
          if (this.isEditMode) {
            this.departments = this.departments.map((d) => (d.id === dept.id ? dept : d));
          } else {
            this.departments = [...this.departments, dept].sort((a, b) => a.name.localeCompare(b.name));
          }
          this.closeModal();
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to save department.';
        }
      });
  }

  deleteDepartment(dept: DepartmentItem) {
    if (!confirm(`Delete ${dept.name}? This cannot be undone.`)) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.adminService
      .deleteDepartment(dept.id)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: () => {
          this.departments = this.departments.filter((d) => d.id !== dept.id);
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to delete department.';
        }
      });
  }
}
