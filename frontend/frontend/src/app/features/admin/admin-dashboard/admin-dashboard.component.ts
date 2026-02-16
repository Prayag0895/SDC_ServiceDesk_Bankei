import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../admin.service';
import { TicketService } from '../../../core/services/ticket.service';

interface AdminStats {
  totalUsers: number;
  pendingApprovals: number;
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats = {
    totalUsers: 0,
    pendingApprovals: 0,
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private ticketService: TicketService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  private loadDashboardStats() {
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      users: this.adminService.getUsers(),
      pending: this.adminService.getPendingUsers(),
      tickets: this.ticketService.getAllTicketsForOfficer()
    }).subscribe({
      next: ({ users, pending, tickets }) => {
        const closedStatuses = new Set(['COMPLETED', 'CLOSED', 'REJECTED']);
        const closedTickets = tickets.filter(ticket => closedStatuses.has(ticket.status)).length;
        const openTickets = tickets.length - closedTickets;

        this.stats = {
          totalUsers: users.length,
          pendingApprovals: pending.length,
          totalTickets: tickets.length,
          openTickets: openTickets,
          closedTickets: closedTickets
        };
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load dashboard data.';
        this.isLoading = false;
      }
    });
  }
}
