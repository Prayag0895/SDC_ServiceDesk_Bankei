import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  role_display?: string;
  phone_number?: string;
  department_name?: number | null;
  domain?: number | null;
  department_display?: string;
  domain_display?: string;
  is_approved: boolean;
  date_joined?: string;
}

export interface DepartmentItem {
  id: number;
  name: string;
}

export interface DomainItem {
  id: number;
  value: string;
  display: string;
}

export interface TicketTypeItem {
  id: number;
  name: string;
}

export interface RequestTypeItem {
  id: number;
  name: string;
  ticket_type: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private authApiUrl = 'http://127.0.0.1:8000/api/auth/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders | undefined {
    const token = this.authService.getToken();
    if (!token) {
      return undefined;
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.authApiUrl}users/`, {
      headers: this.getAuthHeaders()
    });
  }

  getPendingUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.authApiUrl}pending-users/`, {
      headers: this.getAuthHeaders()
    });
  }

  approveUser(userId: number): Observable<any> {
    return this.http.post(`${this.authApiUrl}users/${userId}/approve/`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  rejectUser(userId: number): Observable<any> {
    return this.http.post(`${this.authApiUrl}users/${userId}/reject/`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getDepartments(): Observable<DepartmentItem[]> {
    return this.http.get<DepartmentItem[]>(`${this.authApiUrl}departments/`, {
      headers: this.getAuthHeaders()
    });
  }

  getDepartmentsAdmin(): Observable<DepartmentItem[]> {
    return this.http.get<DepartmentItem[]>(`${this.authApiUrl}departments/manage/`, {
      headers: this.getAuthHeaders()
    });
  }

  createDepartment(payload: { name: string }): Observable<DepartmentItem> {
    return this.http.post<DepartmentItem>(`${this.authApiUrl}departments/manage/`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  updateDepartment(id: number, payload: { name: string }): Observable<DepartmentItem> {
    return this.http.patch<DepartmentItem>(`${this.authApiUrl}departments/manage/${id}/`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.authApiUrl}departments/manage/${id}/`, {
      headers: this.getAuthHeaders()
    });
  }

  getTicketTypesAdmin(): Observable<TicketTypeItem[]> {
    return this.http.get<TicketTypeItem[]>('http://127.0.0.1:8000/api/tickets/admin/ticket-types/', {
      headers: this.getAuthHeaders()
    });
  }

  createTicketType(payload: { name: string }): Observable<TicketTypeItem> {
    return this.http.post<TicketTypeItem>('http://127.0.0.1:8000/api/tickets/admin/ticket-types/', payload, {
      headers: this.getAuthHeaders()
    });
  }

  updateTicketType(id: number, payload: { name: string }): Observable<TicketTypeItem> {
    return this.http.patch<TicketTypeItem>(`http://127.0.0.1:8000/api/tickets/admin/ticket-types/${id}/`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  deleteTicketType(id: number): Observable<void> {
    return this.http.delete<void>(`http://127.0.0.1:8000/api/tickets/admin/ticket-types/${id}/`, {
      headers: this.getAuthHeaders()
    });
  }

  getRequestTypesAdmin(): Observable<RequestTypeItem[]> {
    return this.http.get<RequestTypeItem[]>('http://127.0.0.1:8000/api/tickets/admin/request-types/', {
      headers: this.getAuthHeaders()
    });
  }

  createRequestType(payload: { name: string; ticket_type: number }): Observable<RequestTypeItem> {
    return this.http.post<RequestTypeItem>('http://127.0.0.1:8000/api/tickets/admin/request-types/', payload, {
      headers: this.getAuthHeaders()
    });
  }

  updateRequestType(id: number, payload: { name: string; ticket_type: number }): Observable<RequestTypeItem> {
    return this.http.patch<RequestTypeItem>(`http://127.0.0.1:8000/api/tickets/admin/request-types/${id}/`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  deleteRequestType(id: number): Observable<void> {
    return this.http.delete<void>(`http://127.0.0.1:8000/api/tickets/admin/request-types/${id}/`, {
      headers: this.getAuthHeaders()
    });
  }

  getDomains(): Observable<DomainItem[]> {
    return this.http.get<DomainItem[]>(`${this.authApiUrl}domains/`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(userId: number, payload: Partial<AdminUser>): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.authApiUrl}users/${userId}/`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.authApiUrl}users/${userId}/`, {
      headers: this.getAuthHeaders()
    });
  }

  // Secondary Admin Management
  getSecondaryAdmins(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.authApiUrl}admins/`, {
      headers: this.getAuthHeaders()
    });
  }

  createSecondaryAdmin(payload: { username: string; email: string; password: string }): Observable<{ message: string; user: AdminUser }> {
    return this.http.post<{ message: string; user: AdminUser }>(`${this.authApiUrl}admins/create/`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  resetSecondaryAdminPassword(adminId: number, newPassword: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.authApiUrl}admins/${adminId}/reset-password/`, { password: newPassword }, {
      headers: this.getAuthHeaders()
    });
  }

  deleteSecondaryAdmin(adminId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.authApiUrl}admins/${adminId}/delete/`, {
      headers: this.getAuthHeaders()
    });
  }
}
