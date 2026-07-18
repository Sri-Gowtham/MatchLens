import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';
import { MatchedListing, ListingFilters } from '../models/listing.model';
import { Application } from '../models/application.model';

export interface AuthResponse {
  token: string;
  studentId: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── Auth ────────────────────────────────────────────────────────────────

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, { name, email, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, { email, password });
  }

  // ─── Student ─────────────────────────────────────────────────────────────

  getStudent(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.base}/students/${id}`);
  }

  updateStudent(id: string, data: Partial<Student>): Observable<Student> {
    return this.http.patch<Student>(`${this.base}/students/${id}`, data);
  }

  // ─── Listings ─────────────────────────────────────────────────────────────

  getMatchedListings(studentId: string, filters: ListingFilters = {}): Observable<MatchedListing[]> {
    let params = new HttpParams().set('studentId', studentId);
    if (filters.role)      params = params.set('role', filters.role);
    if (filters.location)  params = params.set('location', filters.location);
    if (filters.workMode)  params = params.set('workMode', filters.workMode);
    if (filters.sponsorship != null) params = params.set('sponsorship', String(filters.sponsorship));

    // json-server stores listings flat; we compute scores client-side from the
    // student data. The backend returns raw listings; the interceptor & service
    // handle score injection in a real backend. For mock: use /matchedListings.
    return this.http.get<MatchedListing[]>(`${this.base}/matchedListings`, { params }).pipe(
      map(listings => [...listings].sort((a, b) => b.score - a.score))
    );
  }

  // Raw listings (used by simulator for requiredSkills / minGpa data)
  getAllListings(): Observable<MatchedListing[]> {
    return this.http.get<MatchedListing[]>(`${this.base}/matchedListings`);
  }
  // ─── Applications ─────────────────────────────────────────────────────────

  getApplications(studentId: string): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.base}/applications`, {
      params: { studentId }
    });
  }

  createApplication(data: Partial<Application>): Observable<Application> {
    return this.http.post<Application>(`${this.base}/applications`, data);
  }

  updateApplication(id: string, data: Partial<Application>): Observable<Application> {
    return this.http.patch<Application>(`${this.base}/applications/${id}`, data);
  }
}
