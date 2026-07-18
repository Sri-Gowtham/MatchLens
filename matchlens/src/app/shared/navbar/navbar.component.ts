import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="bg-primary shadow-nav sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/feed" class="flex items-center gap-2 group">
            <div class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="white" stroke-width="1.5"/>
                <circle cx="9" cy="9" r="3.5" fill="white" fill-opacity="0.9"/>
                <line x1="9" y1="2" x2="9" y2="4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="9" y1="14" x2="9" y2="16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="2" y1="9" x2="4" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="14" y1="9" x2="16" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="font-serif font-semibold text-xl text-white tracking-tight group-hover:text-accent transition-colors">
              MatchLens
            </span>
          </a>

          <!-- Nav Links (authenticated) -->
          @if (auth.isLoggedIn()) {
            <div class="hidden sm:flex items-center gap-1">
              <a routerLink="/feed" routerLinkActive="nav-active"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Listings
              </a>
              <a routerLink="/profile" routerLinkActive="nav-active"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Profile
              </a>
              <a routerLink="/insights" routerLinkActive="nav-active"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Insights
              </a>
              <a routerLink="/applications" routerLinkActive="nav-active"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Applications
              </a>
            </div>

            <!-- User menu -->
            <div class="flex items-center gap-3">
              <div class="hidden sm:flex items-center gap-2 text-white/70 text-sm font-sans">
                <div class="w-7 h-7 bg-accent/20 border border-accent/40 rounded-full flex items-center justify-center">
                  <span class="text-accent text-xs font-semibold">{{ initials() }}</span>
                </div>
                <span>{{ auth.getStudentName() }}</span>
              </div>
              <button (click)="auth.logout()" id="logout-btn"
                      class="text-white/60 hover:text-white text-sm font-sans px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                Sign out
              </button>
            </div>
          }

          <!-- Guest links -->
          @if (!auth.isLoggedIn()) {
            <div class="flex items-center gap-2">
              <a routerLink="/login"
                 class="text-white/80 hover:text-white text-sm font-sans px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                Sign in
              </a>
              <a routerLink="/signup"
                 class="bg-accent text-white text-sm font-sans font-medium px-4 py-1.5 rounded-lg hover:bg-accent-dark transition-colors">
                Get started
              </a>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      @apply flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-sans
             px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors;
    }
    .nav-active {
      @apply text-white bg-white/15;
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  initials = computed(() => {
    const name = this.auth.getStudentName() ?? '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  });
}
