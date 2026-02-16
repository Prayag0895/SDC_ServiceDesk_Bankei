import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, TicketTypeItem, RequestTypeItem } from '../admin.service';
import { catchError, finalize, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-admin-ticket-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-ticket-categories.component.html',
  styleUrls: ['./admin-ticket-categories.component.css']
})
export class AdminTicketCategoriesComponent implements OnInit {
  ticketTypes: TicketTypeItem[] = [];
  requestTypes: RequestTypeItem[] = [];

  isLoading = false;
  isSaving = false;
  errorMessage = '';

  isTypeModalOpen = false;
  isRequestModalOpen = false;

  isEditingType = false;
  isEditingRequest = false;

  selectedTypeId: number | null = null;
  selectedRequestId: number | null = null;

  typeForm: FormGroup;
  requestForm: FormGroup;

  typeSortBy: 'id-asc' | 'id-desc' = 'id-asc';
  requestSortBy: 'id-asc' | 'id-desc' = 'id-asc';

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.typeForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.requestForm = this.fb.group({
      name: ['', Validators.required],
      ticket_type: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadMetadata();
  }

  loadMetadata() {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      types: this.adminService.getTicketTypesAdmin().pipe(catchError(() => of([] as TicketTypeItem[]))),
      requests: this.adminService.getRequestTypesAdmin().pipe(catchError(() => of([] as RequestTypeItem[])))
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe(({ types, requests }) => {
        this.ticketTypes = types;
        this.requestTypes = requests;
        this.sortTicketTypes();
        this.sortRequestTypes();
        this.cd.detectChanges();
      });
  }

  getTypeName(typeId: number): string {
    const match = this.ticketTypes.find((t) => t.id === typeId);
    return match ? match.name : 'Unknown';
  }

  toggleTypeSort() {
    this.typeSortBy = this.typeSortBy === 'id-asc' ? 'id-desc' : 'id-asc';
    this.sortTicketTypes();
  }

  sortTicketTypes() {
    if (this.typeSortBy === 'id-asc') {
      this.ticketTypes.sort((a, b) => a.id - b.id);
    } else {
      this.ticketTypes.sort((a, b) => b.id - a.id);
    }
  }

  toggleRequestSort() {
    this.requestSortBy = this.requestSortBy === 'id-asc' ? 'id-desc' : 'id-asc';
    this.sortRequestTypes();
  }

  sortRequestTypes() {
    if (this.requestSortBy === 'id-asc') {
      this.requestTypes.sort((a, b) => a.id - b.id);
    } else {
      this.requestTypes.sort((a, b) => b.id - a.id);
    }
  }

  openTypeCreate() {
    this.isEditingType = false;
    this.selectedTypeId = null;
    this.typeForm.reset({ name: '' });
    this.isTypeModalOpen = true;
  }

  openTypeEdit(type: TicketTypeItem) {
    this.isEditingType = true;
    this.selectedTypeId = type.id;
    this.typeForm.reset({ name: type.name });
    this.isTypeModalOpen = true;
  }

  closeTypeModal() {
    this.isTypeModalOpen = false;
  }

  saveType() {
    if (this.typeForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const payload = { name: this.typeForm.value.name };

    const request$ = this.isEditingType && this.selectedTypeId
      ? this.adminService.updateTicketType(this.selectedTypeId, payload)
      : this.adminService.createTicketType(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: (type) => {
          if (this.isEditingType) {
            this.ticketTypes = this.ticketTypes.map((t) => (t.id === type.id ? type : t));
          } else {
            this.ticketTypes = [...this.ticketTypes, type];
            this.sortTicketTypes();
          }
          this.closeTypeModal();
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to save ticket type.';
        }
      });
  }

  deleteType(type: TicketTypeItem) {
    if (!confirm(`Delete ${type.name}? This will remove related request types.`)) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.adminService
      .deleteTicketType(type.id)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.ticketTypes = this.ticketTypes.filter((t) => t.id !== type.id);
          this.requestTypes = this.requestTypes.filter((r) => r.ticket_type !== type.id);
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to delete ticket type.';
        }
      });
  }

  openRequestCreate() {
    this.isEditingRequest = false;
    this.selectedRequestId = null;
    this.requestForm.reset({ name: '', ticket_type: null });
    this.isRequestModalOpen = true;
  }

  openRequestEdit(request: RequestTypeItem) {
    this.isEditingRequest = true;
    this.selectedRequestId = request.id;
    this.requestForm.reset({
      name: request.name,
      ticket_type: request.ticket_type
    });
    this.isRequestModalOpen = true;
  }

  closeRequestModal() {
    this.isRequestModalOpen = false;
  }

  saveRequest() {
    if (this.requestForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const payload = {
      name: this.requestForm.value.name,
      ticket_type: this.requestForm.value.ticket_type
    };

    const request$ = this.isEditingRequest && this.selectedRequestId
      ? this.adminService.updateRequestType(this.selectedRequestId, payload)
      : this.adminService.createRequestType(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: (req) => {
          if (this.isEditingRequest) {
            this.requestTypes = this.requestTypes.map((r) => (r.id === req.id ? req : r));
          } else {
            this.requestTypes = [...this.requestTypes, req];
            this.sortRequestTypes();
          }
          this.closeRequestModal();
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to save request type.';
        }
      });
  }

  deleteRequest(request: RequestTypeItem) {
    if (!confirm(`Delete ${request.name}? This cannot be undone.`)) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.adminService
      .deleteRequestType(request.id)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.requestTypes = this.requestTypes.filter((r) => r.id !== request.id);
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to delete request type.';
        }
      });
  }
}
