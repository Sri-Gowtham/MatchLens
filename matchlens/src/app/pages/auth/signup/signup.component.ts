import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">

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
          <h1 class="text-3xl font-serif font-bold text-primary mb-2">Create your account</h1>
          <p class="text-text-secondary text-sm font-sans">Start discovering matches tailored to you</p>
        </div>

        <div class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" id="signup-form" novalidate>

            @if (errorMsg()) {
              <div class="mb-5 flex items-start gap-3 bg-danger/8 border border-danger/20 rounded-xl p-4">
                <svg class="w-4 h-4 text-danger mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-danger text-sm font-sans">{{ errorMsg() }}</p>
              </div>
            }

            <!-- Name -->
            <div class="form-group mb-4">
              <label for="name" class="form-label">Full name</label>
              <input id="name" type="text" formControlName="name"
                     class="form-input" placeholder="Alex Chen">
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <p class="form-error">Name is required.</p>
              }
            </div>

            <!-- Email -->
            <div class="form-group mb-4">
              <label for="email" class="form-label">Email address</label>
              <input id="email" type="email" formControlName="email"
                     class="form-input" placeholder="you@university.edu"
                     autocomplete="email">
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="form-error">Please enter a valid email address.</p>
              }
            </div>

            <!-- Password -->
            <div class="form-group mb-4">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" formControlName="password"
                     class="form-input" placeholder="Min. 8 characters"
                     autocomplete="new-password">
              @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <p class="form-error">Password must be at least 8 characters.</p>
              }
            </div>

            <!-- Confirm password -->
            <div class="form-group mb-6">
              <label for="confirmPassword" class="form-label">Confirm password</label>
              <input type="password" id="confirmPassword" formControlName="confirmPassword"
                     class="form-input" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                     autocomplete="new-password">
              @if (form.get('confirmPassword')?.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
                <p class="form-error">Passwords do not match.</p>
              }
            </div>

            <button type="submit" id="signup-submit"
                    class="btn-primary w-full justify-center"
                    [disabled]="loading()">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating account&#8230;
              } @else {
                Create account
              }
            </button>
          </form>

          <p class="mt-5 text-center text-sm text-text-secondary font-sans">
            Already have an account?
            <a routerLink="/login" class="text-primary font-medium hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  loading = signal(false);
  errorMsg = signal('');

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');
    const { name, email, password } = this.form.value;

    this.api.register(name!, email!, password!).subscribe({
      next: (res) => {
        this.auth.setAuth(res.token, res.studentId, res.name);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.error ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
