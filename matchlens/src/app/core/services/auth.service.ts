import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ml_token';
  private readonly STUDENT_ID_KEY = 'ml_student_id';
  private readonly STUDENT_NAME_KEY = 'ml_student_name';

  isLoggedIn = signal<boolean>(this.hasToken());

  constructor(private router: Router) {}

  setAuth(token: string, studentId: string, name: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.STUDENT_ID_KEY, studentId);
    localStorage.setItem(this.STUDENT_NAME_KEY, name);
    this.isLoggedIn.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getStudentId(): string | null {
    return localStorage.getItem(this.STUDENT_ID_KEY);
  }

  getStudentName(): string | null {
    return localStorage.getItem(this.STUDENT_NAME_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.STUDENT_ID_KEY);
    localStorage.removeItem(this.STUDENT_NAME_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
