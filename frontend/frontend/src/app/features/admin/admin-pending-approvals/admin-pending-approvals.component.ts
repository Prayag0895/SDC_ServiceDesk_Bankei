import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminUser } from '../admin.service';
import { catchError, finalize, of, timeout } from 'rxjs';

@Component({
  selector: 'app-admin-pending-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-pending-approvals.component.html',
  styleUrls: ['./admin-pending-approvals.component.css']
})
export class AdminPendingApprovalsComponent implements OnInit {
  pendingUsers: AdminUser[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPendingUsers();
  }

  loadPendingUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService
      .getPendingUsers()
      .pipe(
        timeout(10000),
        catchError(() => {
          this.errorMessage = 'Failed to load pending users.';
          return of([] as AdminUser[]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe((users) => {
        this.pendingUsers = users;
        this.cd.detectChanges();
      });
  }

  approveUser(user: AdminUser) {
    this.adminService.approveUser(user.id).subscribe({
      next: () => {
        this.pendingUsers = this.pendingUsers.filter(item => item.id !== user.id);
      },
      error: () => {
        this.errorMessage = 'Failed to approve user.';
      }
    });
  }

  rejectUser(user: AdminUser) {
    this.adminService.rejectUser(user.id).subscribe({
      next: () => {
        this.pendingUsers = this.pendingUsers.filter(item => item.id !== user.id);
      },
      error: () => {
        this.errorMessage = 'Failed to reject user.';
      }
    });
  }
}
