import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService, Ticket } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-tickets.component.html',
  styleUrls: ['./admin-tickets.component.css']
})
export class AdminTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private ticketService: TicketService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.isLoading = true;
    this.errorMessage = '';
    this.ticketService.getAllTicketsForOfficer().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
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
}
