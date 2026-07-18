import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">

        <!-- Header -->
        <div class="text-center mb-10">
          <div class="w-14 h-14 bg-primary rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-card">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke="#E8A33D" stroke-width="2"/>
              <circle cx="14" cy="14" r="5" fill="#E8A33D" fill-opacity="0.9"/>
              <line x1="14" y1="3" x2="14" y2="7" stroke="#E8A33D" stroke-width="2" stroke-linecap="round"/>
              <line x1="14" y1="21" x2="14" y2="25" stroke="#E8A33D" stroke-width="2" stroke-linecap="round"/>
              <line x1="3" y1="14" x2="7" y2="14" stroke="#E8A33D" stroke-width="2" stroke-linecap="round"/>
              <line x1="21" y1="14" x2="25" y2="14" stroke="#E8A33D" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="text-3xl font-serif font-bold text-primary mb-2">Welcome back</h1>
          <p class="text-text-secondary text-sm font-sans">Sign in to see your matched opportunities</p>
        </div>

        <!-- Card -->
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" id="login-form" novalidate>

            <!-- Error alert -->
            @if (errorMsg()) {
              <div class="mb-5 flex items-start gap-3 bg-danger/8 border border-danger/20 rounded-xl p-4">
                <svg class="w-4 h-4 text-danger mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-danger text-sm font-sans">{{ errorMsg() }}</p>
              </div>
            }

            <!-- Email -->
            <div class="form-group mb-4">
              <label for="email" class="form-label">Email address</label>
              <input id="email" type="email" formControlName="email"
                     class="form-input"
                     placeholder="you@university.edu"
                     autocomplete="email">
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="form-error">Please enter a valid email address.</p>
              }
            </div>

            <!-- Password -->
            <div class="form-group mb-6">
              <label for="password" class="form-label">Password</label>
              <div class="relative">
                <input [type]="showPassword() ? 'text' : 'password'"
                       id="password" formControlName="password"
                       class="form-input pr-10"
                       placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                       autocomplete="current-password">
                <button type="button" (click)="showPassword.set(!showPassword())"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors">
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="form-error">Password is required.</p>
              }
            </div>

            <!-- Submit -->
            <button type="submit" id="login-submit"
                    class="btn-primary w-full justify-center"
                    [disabled]="loading()">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Signing in&#8230;
              } @else {
                Sign in
              }
            </button>
          </form>

          <p class="mt-5 text-center text-sm text-text-secondary font-sans">
            Don't have an account?
            <a routerLink="/signup" class="text-primary font-medium hover:underline">Create one</a>
          </p>

          <!-- Demo hint -->
          <div class="mt-5 pt-5 border-t border-border">
            <p class="text-xs text-text-secondary font-sans text-center mb-2">Demo credentials</p>
            <div class="bg-surface-alt rounded-lg px-4 py-2.5 text-xs font-mono text-text-secondary text-center">
              alex&#64;example.com / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');
    const { email, password } = this.form.value;

    this.api.login(email!, password!).subscribe({
      next: (res) => {
        this.auth.setAuth(res.token, res.studentId, res.name);
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.error ?? 'Sign in failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
