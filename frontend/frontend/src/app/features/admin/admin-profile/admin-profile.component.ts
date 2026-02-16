import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, AdminUser } from '../admin.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {
  secondaryAdmins: AdminUser[] = [];

  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  isCreateModalOpen = false;
  isResetPasswordModalOpen = false;

  selectedAdminId: number | null = null;
  selectedAdminName: string = '';

  createAdminForm: FormGroup;
  resetPasswordForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.createAdminForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.loadSecondaryAdmins();
  }

  loadSecondaryAdmins() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService
      .getSecondaryAdmins()
      .pipe(
        catchError(() => of([] as AdminUser[])),
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe((admins) => {
        this.secondaryAdmins = admins;
        this.cd.detectChanges();
      });
  }

  openCreateModal() {
    this.createAdminForm.reset();
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
  }

  createSecondaryAdmin() {
    if (this.createAdminForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      username: this.createAdminForm.value.username,
      email: this.createAdminForm.value.email,
      password: this.createAdminForm.value.password
    };

    this.adminService
      .createSecondaryAdmin(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (response) => {
          this.secondaryAdmins = [...this.secondaryAdmins, response.user];
          this.successMessage = `Secondary admin "${response.user.username}" created successfully.`;
          this.closeCreateModal();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to create secondary admin.';
        }
      });
  }

  openResetPasswordModal(admin: AdminUser) {
    this.selectedAdminId = admin.id;
    this.selectedAdminName = admin.username;
    this.resetPasswordForm.reset();
    this.isResetPasswordModalOpen = true;
  }

  closeResetPasswordModal() {
    this.isResetPasswordModalOpen = false;
  }

  resetAdminPassword() {
    if (this.resetPasswordForm.invalid || !this.selectedAdminId) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPassword = this.resetPasswordForm.value.password;

    this.adminService
      .resetSecondaryAdminPassword(this.selectedAdminId, newPassword)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (response) => {
          this.successMessage = `Password reset successfully for ${this.selectedAdminName}.`;
          this.closeResetPasswordModal();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to reset password.';
        }
      });
  }

  deleteSecondaryAdmin(admin: AdminUser) {
    if (!confirm(`Are you sure you want to delete admin "${admin.username}"? This action cannot be undone.`)) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService
      .deleteSecondaryAdmin(admin.id)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (response) => {
          this.secondaryAdmins = this.secondaryAdmins.filter((a) => a.id !== admin.id);
          this.successMessage = `Secondary admin "${admin.username}" deleted successfully.`;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to delete secondary admin.';
        }
      });
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
