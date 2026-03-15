import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TicketService, Ticket } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-tickets.component.html',
  styleUrls: ['./admin-tickets.component.css']
})
export class AdminTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  currentView: 'all' | 'open' | 'closed' = 'all';
  isLoading = false;
  errorMessage = '';

  constructor(
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const view = params.get('view');
      this.currentView = view === 'open' || view === 'closed' ? view : 'all';
      this.applyFilter();
    });

    this.loadTickets();
  }

  loadTickets() {
    this.isLoading = true;
    this.errorMessage = '';
    this.ticketService.getAllTicketsForOfficer().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.applyFilter();
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load tickets.';
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  private applyFilter() {
    const closedStatuses = new Set(['COMPLETED', 'CLOSED', 'REJECTED']);

    if (this.currentView === 'open') {
      this.filteredTickets = this.tickets.filter(ticket => !closedStatuses.has(ticket.status));
      return;
    }

    if (this.currentView === 'closed') {
      this.filteredTickets = this.tickets.filter(ticket => closedStatuses.has(ticket.status));
      return;
    }

    this.filteredTickets = [...this.tickets];
  }
}
