import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MatchedListing } from '../../core/models/listing.model';
import { Application, ApplicationStatus } from '../../core/models/application.model';
import { ScoreBadgeComponent } from '../../shared/score-badge/score-badge.component';
import { forkJoin } from 'rxjs';

interface AppCardData {
  application: Application;
  listing: MatchedListing;
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, ScoreBadgeComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-10">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="page-title mb-2">My Applications</h1>
        <p class="text-text-secondary font-sans text-sm max-w-xl">
          Track your saved roles and application statuses.
        </p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          @for (i of [1,2,3]; track i) {
            <div class="h-96 bg-surface border border-border rounded-2xl"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          <!-- SAVED COLUMN -->
          <div class="bg-surface/50 rounded-2xl p-4 border border-border/50">
            <div class="flex items-center justify-between mb-4 px-1">
              <h3 class="font-serif font-semibold text-primary">Saved</h3>
              <span class="w-6 h-6 rounded-full bg-border text-xs font-sans font-medium flex items-center justify-center">{{ savedList().length }}</span>
            </div>
            <div class="space-y-3">
              @for (item of savedList(); track item.application.id) {
                <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
              }
              @if (savedList().length === 0) {
                <p class="text-xs text-text-secondary font-sans text-center py-4">No saved listings.</p>
              }
            </div>
          </div>

          <!-- APPLIED COLUMN -->
          <div class="bg-surface/50 rounded-2xl p-4 border border-border/50">
            <div class="flex items-center justify-between mb-4 px-1">
              <h3 class="font-serif font-semibold text-primary">Applied</h3>
              <span class="w-6 h-6 rounded-full bg-border text-xs font-sans font-medium flex items-center justify-center">{{ appliedList().length }}</span>
            </div>
            <div class="space-y-3">
              @for (item of appliedList(); track item.application.id) {
                <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
              }
              @if (appliedList().length === 0) {
                <p class="text-xs text-text-secondary font-sans text-center py-4">No applied listings.</p>
              }
            </div>
          </div>

          <!-- IN REVIEW COLUMN -->
          <div class="bg-surface/50 rounded-2xl p-4 border border-border/50">
            <div class="flex items-center justify-between mb-4 px-1">
              <h3 class="font-serif font-semibold text-primary">In Review</h3>
              <span class="w-6 h-6 rounded-full bg-border text-xs font-sans font-medium flex items-center justify-center">{{ inReviewList().length }}</span>
            </div>
            <div class="space-y-3">
              @for (item of inReviewList(); track item.application.id) {
                <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
              }
              @if (inReviewList().length === 0) {
                <p class="text-xs text-text-secondary font-sans text-center py-4">No listings in review.</p>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Reusable Card Template -->
    <ng-template #cardTemplate let-item>
      <div class="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-card transition-shadow">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 font-serif font-bold text-[10px] text-white"
                   [style.background]="getCompanyColor(item.listing.company)">
                {{ item.listing.company[0] }}
              </div>
              <p class="text-xs text-text-secondary font-sans truncate">{{ item.listing.company }}</p>
            </div>
            <h4 class="font-serif font-semibold text-primary text-sm leading-tight line-clamp-2">
              {{ item.listing.title }}
            </h4>
          </div>
          <div class="flex-shrink-0">
            <app-score-badge [score]="item.listing.score" size="sm" />
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span class="text-[10px] text-text-secondary font-sans">
            {{ item.application.updatedAt | date:'MMM d, y' }}
          </span>
          <select [ngModel]="item.application.status" 
                  (ngModelChange)="updateStatus(item, $event)"
                  class="text-xs font-sans bg-surface border-border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer">
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="in_review">In Review</option>
          </select>
        </div>
      </div>
    </ng-template>
  `
})
export class ApplicationsComponent implements OnInit {
  private api = inject(ApiService);
  private authSvc = inject(AuthService);

  loading = signal(true);
  joinedData = signal<AppCardData[]>([]);

  savedList = computed(() => this.joinedData().filter(d => d.application.status === 'saved'));
  appliedList = computed(() => this.joinedData().filter(d => d.application.status === 'applied'));
  inReviewList = computed(() => this.joinedData().filter(d => d.application.status === 'in_review'));

  ngOnInit() {
    const studentId = this.authSvc.getStudentId();
    if (!studentId) {
      this.loading.set(false);
      return;
    }

    forkJoin({
      apps: this.api.getApplications(studentId),
      listings: this.api.getAllListings()
    }).subscribe({
      next: ({ apps, listings }) => {
        const joined: AppCardData[] = apps.map(app => {
          // If using the mock json-server, getAllListings() might just return raw.
          // Since getMatchedListings actually does the score matching we should ideally use that,
          // but if we just want raw we can use getMatchedListings to get scores.
          // Actually let's use getMatchedListings so we have the computed score.
          return {
            application: app,
            listing: listings.find(l => l.listingId === app.listingId)!
          };
        }).filter(d => d.listing != null); // filter out if listing not found

        this.joinedData.set(joined);
      }
    });

    // Actually, to get the correct scores, we should use getMatchedListings instead of getAllListings
    // Let's swap that out cleanly
    this.api.getMatchedListings(studentId, {}).subscribe(matched => {
      this.api.getApplications(studentId).subscribe(apps => {
        const joined: AppCardData[] = apps.map(app => ({
          application: app,
          listing: matched.find(l => l.listingId === app.listingId)!
        })).filter(d => d.listing != null);

        this.joinedData.set(joined);
        this.loading.set(false);
      });
    });
  }

  updateStatus(item: AppCardData, newStatus: ApplicationStatus) {
    if (item.application.status === newStatus || !item.application.id) return;
    
    // Optimistic UI update
    const previousStatus = item.application.status;
    item.application.status = newStatus;
    item.application.updatedAt = new Date().toISOString();
    this.joinedData.set([...this.joinedData()]);

    this.api.updateApplication(item.application.id, { 
      status: newStatus,
      updatedAt: item.application.updatedAt
    }).subscribe({
      error: () => {
        // Revert on error
        item.application.status = previousStatus;
        this.joinedData.set([...this.joinedData()]);
      }
    });
  }

  getCompanyColor(companyName: string): string {
    const colors = ['#1B2A4A', '#2D4270', '#1F9D6B', '#C65D4A', '#4A6FA5', '#2E7D6B', '#7B4A6A'];
    const idx = (companyName || 'A').charCodeAt(0) % colors.length;
    return colors[idx];
  }
}
