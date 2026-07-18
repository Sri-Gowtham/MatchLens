import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchedListing, ListingFilters } from '../../core/models/listing.model';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { ListingCardComponent } from './components/listing-card/listing-card.component';
import { RouterLink } from '@angular/router';
import { MOCK_LISTINGS } from '../../core/mock/mock-data';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FilterBarComponent, ListingCardComponent, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-10">
      
      <!-- Header -->
      <div class="mb-8 flex items-start justify-between">
        <div>
          <h1 class="page-title mb-1">Your Matches</h1>
          <p class="text-text-secondary font-sans text-sm">
            Sorted by match score — highest fit first.
          </p>
        </div>
        @if (!loading() && filteredListings().length > 0) {
          <div class="text-right flex-shrink-0">
            <p class="text-2xl font-serif font-bold text-primary">{{ filteredListings().length }}</p>
            <p class="text-xs text-text-secondary font-sans">listings</p>
          </div>
        }
      </div>

      <div class="flex flex-col lg:flex-row gap-8 items-start">
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-[260px] flex-shrink-0 lg:sticky lg:top-24">
          <app-filter-bar (filtersChanged)="onFiltersChanged($event)" />
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0 w-full">
          <!-- Score legend -->
          <div class="flex items-center gap-4 mb-6 text-xs font-sans text-text-secondary">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-success"></span> Strong (80%+)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-warning"></span> Moderate (50–79%)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-danger"></span> Weak (&lt;50%)
            </span>
          </div>

          <!-- Loading -->
          @if (loading()) {
            <div class="space-y-4">
              @for (i of [1,2,3,4]; track i) {
                <div class="card animate-pulse">
                  <div class="flex items-start gap-3 mb-4">
                    <div class="w-10 h-10 bg-border rounded-xl"></div>
                    <div class="flex-1">
                      <div class="h-4 bg-border rounded w-1/2 mb-2"></div>
                      <div class="h-3 bg-border rounded w-1/3"></div>
                    </div>
                    <div class="w-14 h-7 bg-border rounded-full"></div>
                  </div>
                  <div class="flex gap-2">
                    <div class="h-3 bg-border rounded w-24"></div>
                    <div class="h-3 bg-border rounded w-16"></div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Error state -->
          @if (!loading() && error()) {
            <div class="card text-center py-12 w-full">
              <svg class="w-12 h-12 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-text-secondary font-sans text-sm">
                Couldn't load listings right now. Please try again.
              </p>
              <button (click)="reload()" class="btn-secondary mt-5 mx-auto">Try again</button>
            </div>
          }

          <!-- Empty state -->
          @if (!loading() && !error() && filteredListings().length === 0) {
            <div class="card text-center py-12 w-full">
              <svg class="w-12 h-12 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="font-serif font-semibold text-primary mb-2">No listings match your filters</h3>
              <p class="text-text-secondary font-sans text-sm">Try adjusting your filters or
                <a routerLink="/profile" class="text-primary hover:underline">update your profile</a>.
              </p>
            </div>
          }

          <!-- Listing cards -->
          @if (!loading() && !error()) {
            <div class="space-y-4">
              @for (listing of filteredListings(); track listing.listingId) {
                <app-listing-card 
                  [listing]="listing"
                  [application]="getApplication(listing.listingId)"
                  (save)="handleSave(listing.listingId)"
                  (apply)="handleApply(listing.listingId)" />
              }
            </div>
          }

          <!-- No profile prompt -->
          @if (!loading() && !error() && allListings().length > 0) {
            <div class="mt-8 bg-accent/8 border border-accent/25 rounded-2xl p-5 flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-sans font-medium text-primary mb-1">Improve your scores</p>
                <p class="text-xs text-text-secondary font-sans">
                  Add more skills to your profile to increase match scores, or
                  <a routerLink="/insights" class="text-primary hover:underline font-medium">view your Insights</a>
                  to see how adding skills would affect your rankings.
                </p>
              </div>
            </div>
          }
        </main>
      </div>

    </div>
  `
})
export class FeedComponent implements OnInit {
  allListings = signal<MatchedListing[]>([]);
  filteredListings = signal<MatchedListing[]>([]);
  loading = signal(false);
  error = signal(false);
  private activeFilters: ListingFilters = {};
  // Local saved/applied state for demo (no API)
  private savedIds = signal<Set<string>>(new Set());
  private appliedIds = signal<Set<string>>(new Set());

  ngOnInit() {
    const sorted = [...MOCK_LISTINGS].sort((a, b) => b.score - a.score);
    this.allListings.set(sorted);
    this.applyFilters();
  }

  reload() {
    this.ngOnInit();
  }

  getApplication(listingId: string) {
    if (this.appliedIds().has(listingId)) {
      return { listingId, status: 'APPLIED' as const, id: listingId, studentId: 'demo', updatedAt: new Date().toISOString() };
    }
    if (this.savedIds().has(listingId)) {
      return { listingId, status: 'SAVED' as const, id: listingId, studentId: 'demo', updatedAt: new Date().toISOString() };
    }
    return undefined;
  }

  handleSave(listingId: string) {
    if (this.appliedIds().has(listingId)) return;
    const s = new Set(this.savedIds());
    s.add(listingId);
    this.savedIds.set(s);
  }

  handleApply(listingId: string) {
    const saved = new Set(this.savedIds());
    saved.delete(listingId);
    this.savedIds.set(saved);
    const applied = new Set(this.appliedIds());
    applied.add(listingId);
    this.appliedIds.set(applied);
  }

  onFiltersChanged(filters: ListingFilters) {
    this.activeFilters = filters;
    this.applyFilters();
  }

  private applyFilters() {
    const f = this.activeFilters;
    let result = [...this.allListings()];

    if (f.role) {
      const q = f.role.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        (l.role ?? '').toLowerCase().includes(q)
      );
    }
    if (f.location) {
      const q = f.location.toLowerCase();
      result = result.filter(l => l.location.toLowerCase().includes(q));
    }
    if (f.workMode) {
      result = result.filter(l => l.workMode === f.workMode);
    }
    if (f.sponsorship === true) {
      result = result.filter(l => l.sponsorshipAvailable === true);
    } else if (f.sponsorship === false) {
      result = result.filter(l => l.sponsorshipAvailable === false);
    }
    if (f.employmentType) {
      result = result.filter(l => l.employmentType === f.employmentType);
    }

    // Sort by score descending
    result.sort((a, b) => b.score - a.score);
    this.filteredListings.set(result);
  }
}
