import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchedListing } from '../../../../core/models/listing.model';
import { ScoreBadgeComponent } from '../../../../shared/score-badge/score-badge.component';
import { Application } from '../../../../core/models/application.model';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, ScoreBadgeComponent],
  template: `
    <article class="bg-surface border border-border rounded-2xl shadow-card hover:shadow-card-hover
                    transition-all duration-300 overflow-hidden w-full"
             [class.expanded]="expanded()">

      <!-- Card body -->
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">

          <!-- Left content container -->
          <div class="flex-1 min-w-0">
            <!-- Company icon + title + company name -->
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-bold text-sm text-white"
                   [style.background]="companyColor">
                {{ listing.company[0] }}
              </div>
              <div class="min-w-0">
                <h3 class="font-serif font-semibold text-primary text-base leading-tight truncate">
                  {{ listing.title }}
                </h3>
                <p class="text-text-secondary text-sm font-sans mt-0.5">{{ listing.company }}</p>
              </div>
            </div>

            <!-- Meta tags -->
            <div class="flex flex-wrap items-center gap-2 mt-3">
              <!-- Location -->
              <span class="inline-flex items-center gap-1 text-xs text-text-secondary font-sans">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                </svg>
                {{ listing.location }}
              </span>
              <span class="text-border">•</span>

              <!-- Work Mode -->
              <span class="inline-flex items-center gap-1 text-xs font-sans"
                    [class]="workModeClass">
                {{ workModeLabel }}
              </span>

              <!-- Employment Type -->
              @if (listing.employmentType) {
                <span class="text-border">•</span>
                <span class="inline-flex items-center gap-1 text-xs font-sans text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {{ employmentTypeLabel }}
                </span>
              }

              <!-- Sponsorship -->
              @if (listing.sponsorshipAvailable) {
                <span class="text-border">•</span>
                <span class="inline-flex items-center gap-1 text-xs text-success font-sans">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Sponsors visa
                </span>
              }
            </div>

            <!-- Summary snippet -->
            @if (listing.summary) {
              <p class="mt-3 text-sm text-text-secondary font-sans line-clamp-1 truncate">
                {{ listing.summary }}
              </p>
            }

            <!-- Matched skills preview -->
            @if (matchedSkills.length > 0) {
              <div class="flex flex-wrap gap-1.5 mt-3">
                @for (skill of matchedSkills.slice(0, 4); track skill) {
                  <span class="text-xs bg-primary/6 text-primary border border-primary/12 px-2 py-0.5 rounded-full font-sans">
                    {{ skill }}
                  </span>
                }
                @if (matchedSkills.length > 4) {
                  <span class="text-xs text-text-secondary font-sans">+{{ matchedSkills.length - 4 }} more</span>
                }
              </div>
            }

            <!-- Expand toggle -->
            <button (click)="expanded.set(!expanded())"
                    class="mt-4 flex items-center gap-1.5 text-xs font-sans text-primary/70 hover:text-primary transition-colors group">
              <svg class="w-3.5 h-3.5 transition-transform duration-200"
                   [class.rotate-180]="expanded()"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
              <span class="font-medium text-accent">
                {{ expanded() ? 'Hide breakdown' : 'Why this matched' }}
              </span>
            </button>
            
            <!-- Actions -->
            <div class="mt-4 flex items-center gap-2">
              @if (!application || application.status === 'SAVED') {
                <button (click)="save.emit()" 
                        [disabled]="application?.status === 'SAVED'"
                        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                        [ngClass]="(application?.status === 'SAVED') ? 'bg-border text-text-secondary' : 'bg-primary text-white hover:bg-primary/90'">
                  {{ application?.status === 'SAVED' ? 'Saved' : 'Save' }}
                </button>
                <button (click)="apply.emit()"
                        class="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-sans font-medium hover:bg-accent/90 transition-colors">
                  Apply
                </button>
              } @else {
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold font-sans px-2.5 py-1 rounded-full"
                      [ngClass]="(application.status === 'APPLIED') ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (application.status === 'APPLIED') {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    } @else if (application.status === 'IN_REVIEW') {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    }
                  </svg>
                  {{ application.status === 'APPLIED' ? 'Applied' : application.status === 'IN_REVIEW' ? 'In Review' : 'Apply Now' }}
                </span>
              }
            </div>
          </div>

          <!-- Score badge pinned top-right -->
          <div class="flex-shrink-0 mt-1">
            <app-score-badge [score]="listing.score" size="md" />
          </div>

        </div>
      </div>

      <!-- Expandable breakdown -->
      @if (expanded()) {
        <div class="border-t border-border bg-background/60 px-5 py-4 animate-fade-in">
          <h4 class="text-xs font-semibold font-sans text-text-secondary uppercase tracking-wider mb-4">
            Match Breakdown
          </h4>

          <div class="space-y-3">

            <!-- Skill match bar -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-sans text-text-secondary">Skill match</span>
                <span class="text-xs font-semibold font-sans" [class]="barColor(listing.breakdown.skillMatch)">
                  {{ listing.breakdown.skillMatch }}%
                </span>
              </div>
              <div class="h-2 bg-border rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700 ease-out"
                     [class]="barBg(listing.breakdown.skillMatch)"
                     [style.width.%]="listing.breakdown.skillMatch">
                </div>
              </div>
              @if (matchedSkills.length > 0) {
                <p class="text-xs text-text-secondary font-sans mt-1.5">
                  Matched: {{ matchedSkills.join(', ') }}
                </p>
              }
            </div>

            <!-- GPA -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-sans text-text-secondary">GPA requirement</span>
              <div class="flex items-center gap-1.5">
                @if (listing.minGpa) {
                  <span class="text-xs text-text-secondary font-sans">Min {{ listing.minGpa }}</span>
                }
                <span class="inline-flex items-center gap-1 text-xs font-semibold font-sans px-2 py-0.5 rounded-full"
                      [class]="listing.breakdown.gpaMet
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (listing.breakdown.gpaMet) {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    }
                  </svg>
                  {{ listing.breakdown.gpaMet ? 'Met' : 'Not met' }}
                </span>
              </div>
            </div>

            <!-- Auth compatibility -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-sans text-text-secondary">Work authorization</span>
              <span class="inline-flex items-center gap-1 text-xs font-semibold font-sans px-2 py-0.5 rounded-full"
                    [class]="listing.breakdown.authCompatible
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  @if (listing.breakdown.authCompatible) {
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  } @else {
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  }
                </svg>
                {{ listing.breakdown.authCompatible ? 'Compatible' : 'Incompatible' }}
              </span>
            </div>
          </div>

          <!-- Score summary -->
          <div class="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span class="text-xs font-sans text-text-secondary">Overall score</span>
            <app-score-badge [score]="listing.score" size="lg" />
          </div>
        </div>
      }
    </article>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
  `]
})
export class ListingCardComponent {
  @Input({ required: true }) listing!: MatchedListing;
  @Input() application?: Application;

  @Output() save = new EventEmitter<void>();
  @Output() apply = new EventEmitter<void>();

  expanded = signal(false);

  get matchedSkills(): string[] {
    return this.listing.breakdown.matchedSkills ?? [];
  }

  // Deterministic color from company name for the avatar
  get companyColor(): string {
    const colors = ['#1B2A4A', '#2D4270', '#1F9D6B', '#C65D4A', '#4A6FA5', '#2E7D6B', '#7B4A6A'];
    const idx = this.listing.company.charCodeAt(0) % colors.length;
    return colors[idx];
  }

  get workModeLabel(): string {
    const labels: Record<string, string> = { REMOTE: 'Remote', HYBRID: 'Hybrid', ONSITE: 'On-site' };
    return labels[this.listing.workMode] || this.listing.workMode;
  }

  get workModeClass(): string {
    const classes: Record<string, string> = {
      REMOTE: 'text-success',
      HYBRID: 'text-info',
      ONSITE: 'text-warning'
    };
    return classes[this.listing.workMode] ?? 'text-text-secondary';
  }

  get employmentTypeLabel(): string {
    const labels: Record<string, string> = {
      internship_stipend: 'Internship (stipend)',
      internship_unpaid: 'Internship (unpaid)',
      full_time: 'Full-Time'
    };
    if (this.listing.employmentType) {
      return labels[this.listing.employmentType] ?? this.listing.employmentType;
    }
    return '';
  }

  barColor(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  }

  barBg(score: number): string {
    if (score >= 80) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-danger';
  }
}
