import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MatchedListing } from '../../core/models/listing.model';
import { Student, normalisedGpa } from '../../core/models/student.model';
import { ScoreBadgeComponent } from '../../shared/score-badge/score-badge.component';

// Exact same weight formula as described in requirements
const WEIGHTS = { skills: 0.6, gpa: 0.2, auth: 0.2 };

function computeScore(
  activeSkills: string[],
  gpa: number,
  authCompatible: boolean,
  listing: MatchedListing
): number {
  const required = listing.requiredSkills ?? [];
  const skillMatch = required.length > 0
    ? Math.round(
        (activeSkills.filter(s => required.some(r => r.toLowerCase() === s.toLowerCase())).length
        / required.length) * 100
      )
    : 100;

  const minRequired = listing.minGpa ?? 0;
  const gpaMet = gpa >= minRequired;
  const gpaScore = gpaMet ? 100 : Math.round((gpa / (minRequired || 1)) * 100);
  const authScore = authCompatible ? 100 : 0;

  return Math.min(100, Math.round(
    skillMatch * WEIGHTS.skills +
    gpaScore   * WEIGHTS.gpa   +
    authScore  * WEIGHTS.auth
  ));
}

interface SkillImpact {
  skill: string;
  improvesCount: number;
  avgIncrease: number;
  impactScore: number;
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, FormsModule, ScoreBadgeComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-10">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="page-title mb-2">Profile Insights</h1>
        <p class="text-text-secondary font-sans text-sm max-w-xl">
          Understand where you stand across all listings, discover which skills would improve your match scores the most, and simulate "what-if" scenarios for specific jobs.
        </p>
      </div>

      @if (loading()) {
        <div class="space-y-4 animate-pulse">
          <div class="h-24 bg-border rounded-xl"></div>
          <div class="h-64 bg-border rounded-xl"></div>
        </div>
      } @else {
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- GPA Summary -->
          <div class="card flex items-center justify-between p-6">
            <div>
              <p class="text-sm font-sans font-medium text-text-secondary mb-1">GPA Requirement</p>
              <h3 class="text-xl font-serif font-semibold text-primary">Clears threshold on {{ gpaClearsCount() }} / {{ allListings().length }}</h3>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                 [class.bg-success]="(gpaClearsCount() / allListings().length) >= 0.8"
                 [class.text-white]="(gpaClearsCount() / allListings().length) >= 0.8"
                 [class.bg-warning]="(gpaClearsCount() / allListings().length) < 0.8 && (gpaClearsCount() / allListings().length) >= 0.5"
                 [class.bg-danger]="(gpaClearsCount() / allListings().length) < 0.5"
                 [style.color]="(gpaClearsCount() / allListings().length) < 0.8 ? '#fff' : ''">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Auth Summary -->
          <div class="card flex items-center justify-between p-6">
            <div>
              <p class="text-sm font-sans font-medium text-text-secondary mb-1">Work Authorization</p>
              <h3 class="text-xl font-serif font-semibold text-primary">Compatible with {{ authClearsCount() }} / {{ allListings().length }}</h3>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                 [class.bg-success]="(authClearsCount() / allListings().length) >= 0.8"
                 [class.text-white]="(authClearsCount() / allListings().length) >= 0.8"
                 [class.bg-warning]="(authClearsCount() / allListings().length) < 0.8 && (authClearsCount() / allListings().length) >= 0.5"
                 [class.bg-danger]="(authClearsCount() / allListings().length) < 0.5"
                 [style.color]="(authClearsCount() / allListings().length) < 0.8 ? '#fff' : ''">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

          <!-- Left panel: Top Skills -->
          <div class="lg:col-span-3">
            <div class="card h-full">
              <div class="mb-5">
                <h3 class="section-title text-lg">Skills worth adding</h3>
                <p class="text-xs text-text-secondary font-sans mt-1">
                  These missing skills would improve your match score the most across all listings.
                </p>
              </div>

              @if (topSkills().length === 0) {
                <div class="py-8 text-center text-sm font-sans text-text-secondary">
                  No additional impactful skills found for the current listings.
                </div>
              } @else {
                <div class="space-y-3">
                  @for (impact of topSkills(); track impact.skill; let idx = $index) {
                    <div class="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:border-primary/30 transition-colors">
                      <span class="w-6 h-6 rounded-full bg-primary/8 text-primary text-xs font-semibold font-sans flex items-center justify-center flex-shrink-0">
                        {{ idx + 1 }}
                      </span>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-sans font-semibold text-primary truncate">{{ impact.skill }}</p>
                        <p class="text-xs text-text-secondary font-sans mt-0.5">
                          Improves {{ impact.improvesCount }} of {{ allListings().length }} listings
                        </p>
                      </div>
                      <div class="flex-shrink-0 text-right">
                        <span class="inline-flex items-center gap-1 text-sm font-semibold font-sans"
                              [class.text-success]="impact.avgIncrease >= 15"
                              [class.text-warning]="impact.avgIncrease < 15 && impact.avgIncrease >= 5"
                              [class.text-primary]="impact.avgIncrease < 5">
                          +{{ impact.avgIncrease | number:'1.0-1' }}%
                        </span>
                        <p class="text-[10px] text-text-secondary font-sans">avg match</p>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Right panel: Single-listing Simulator -->
          <div class="lg:col-span-2">
            <div class="card h-full bg-accent/5 border-accent/20">
              <div class="mb-4">
                <h3 class="section-title text-base text-accent">Single-Listing Simulator</h3>
                <p class="text-xs text-text-secondary font-sans mt-1">
                  Pick a listing and see how adjusting your profile affects its specific score.
                </p>
              </div>

              <div class="mb-5">
                <label for="listing-select" class="form-label text-xs">Target Listing</label>
                <select id="listing-select" [(ngModel)]="selectedListingId" class="form-input text-sm w-full truncate bg-white">
                  @for (l of allListings(); track l.listingId) {
                    <option [value]="l.listingId">{{ l.company }} - {{ l.title }}</option>
                  }
                </select>
              </div>

              @if (selectedListing()) {
                <div class="p-4 bg-white rounded-xl border border-border shadow-sm mb-5">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex-1 min-w-0 pr-4">
                      <p class="text-xs text-text-secondary font-sans truncate">{{ selectedListing()?.company }}</p>
                      <p class="text-sm font-sans font-semibold text-primary truncate">{{ selectedListing()?.title }}</p>
                    </div>
                    <div class="flex flex-col items-end">
                       <span class="text-[10px] text-text-secondary font-sans uppercase mb-1">Simulated Score</span>
                       <app-score-badge [score]="simScoreForSelected()" size="lg" />
                       <p class="text-xs text-text-secondary font-sans mt-1 line-through">
                         Original: {{ selectedListing()?.score }}%
                       </p>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <!-- GPA slider -->
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="form-label text-xs m-0">Simulated GPA</label>
                      <span class="text-sm font-serif font-bold text-primary tabular-nums">{{ simGpa().toFixed(2) }}</span>
                    </div>
                    <input type="range" [(ngModel)]="simGpaRaw" min="0" max="400" step="1"
                           class="w-full h-1.5 rounded-full cursor-pointer accent-primary">
                    <p class="text-[10px] text-text-secondary font-sans mt-1">
                      Listing requires min {{ selectedListing()?.minGpa ?? 0 }}
                    </p>
                  </div>

                  <!-- Work Auth -->
                  <div>
                     <label class="form-label text-xs">Simulated Work Auth</label>
                     <select [(ngModel)]="simAuthRaw" class="form-input text-sm w-full bg-white">
                       @for (opt of authOptions; track opt.value) {
                         <option [value]="opt.value">{{ opt.label }}</option>
                       }
                     </select>
                     <p class="text-[10px] text-text-secondary font-sans mt-1">
                       Listing sponsors visa: {{ selectedListing()?.sponsorshipAvailable ? 'Yes' : 'No' }}
                     </p>
                  </div>

                  <!-- Skills -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="form-label text-xs m-0">Simulated Skills</label>
                      <span class="text-xs text-text-secondary font-sans">{{ activeSkillsSet().size }} selected</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                      @for (skill of allUniqueSkills; track skill) {
                        <button type="button"
                                (click)="toggleSkill(skill)"
                                class="text-[10px] font-sans px-2 py-0.5 rounded-full border transition-all duration-150"
                                [class.bg-primary]="isActive(skill)"
                                [class.text-white]="isActive(skill)"
                                [class.border-primary]="isActive(skill)"
                                [class.bg-white]="!isActive(skill)"
                                [class.text-text-secondary]="!isActive(skill)"
                                [class.border-border]="!isActive(skill)">
                          {{ skill }}
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class InsightsComponent implements OnInit {
  private api = inject(ApiService);
  private authSvc = inject(AuthService);

  allListings = signal<MatchedListing[]>([]);
  student = signal<Student | null>(null);
  loading = signal(true);

  // Single-listing simulator state
  selectedListingId = signal<string>('');
  simGpaRaw = signal(370);
  simAuthRaw = signal<string>('no_sponsorship_needed');
  activeSkillsSet = signal<Set<string>>(new Set());

  allUniqueSkills: string[] = [];

  authOptions = [
    { value: 'citizen',              label: 'Citizen / Permanent Resident' },
    { value: 'no_sponsorship_needed',label: 'OPT / CPT (No sponsorship needed)' },
    { value: 'needs_sponsorship',    label: 'H1B Sponsorship Required' },
  ];

  ngOnInit() {
    this.api.getAllListings().subscribe({
      next: (listings) => {
        this.allListings.set(listings);
        
        // Populate all unique required skills across all listings
        const skillsSet = new Set<string>();
        for (const l of listings) {
          for (const s of l.requiredSkills ?? []) {
            skillsSet.add(s);
          }
        }
        this.allUniqueSkills = [...skillsSet].sort();

        // Default selected listing
        if (listings.length > 0) {
          this.selectedListingId.set(listings[0].listingId);
        }

        this.loadStudent();
      },
      error: () => this.loading.set(false)
    });
  }

  loadStudent() {
    const studentId = this.authSvc.getStudentId();
    if (studentId) {
      this.api.getStudent(studentId).subscribe({
        next: (student: Student) => {
          this.student.set(student);
          this.simGpaRaw.set(Math.round(normalisedGpa(student) * 100));
          this.simAuthRaw.set(student.workAuthStatus ?? 'no_sponsorship_needed');
          this.activeSkillsSet.set(new Set(student.skills ?? []));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  // Aggregates
  gpaClearsCount = computed(() => {
    const s = this.student();
    if (!s) return 0;
    const gpa = normalisedGpa(s);
    return this.allListings().filter(l => gpa >= (l.minGpa ?? 0)).length;
  });

  authClearsCount = computed(() => {
    const s = this.student();
    if (!s) return 0;
    const needsSponsorship = s.workAuthStatus === 'needs_sponsorship';
    return this.allListings().filter(l => {
      const needsSponsor = needsSponsorship && !l.sponsorshipAvailable;
      return !needsSponsor;
    }).length;
  });

  topSkills = computed(() => {
    const s = this.student();
    const listings = this.allListings();
    if (!s || listings.length === 0) return [];

    const baseGpa = normalisedGpa(s);
    const baseNeedsSponsorship = s.workAuthStatus === 'needs_sponsorship';
    const studentSkillsLower = new Set((s.skills ?? []).map(sk => sk.toLowerCase()));

    const impacts: SkillImpact[] = [];
    
    // Evaluate only skills the student doesn't already have
    const missingSkills = this.allUniqueSkills.filter(sk => !studentSkillsLower.has(sk.toLowerCase()));

    for (const skill of missingSkills) {
      let improvesCount = 0;
      let totalIncrease = 0;

      for (const l of listings) {
        if (!l.requiredSkills || l.requiredSkills.length === 0) continue;
        
        // If the listing doesn't even require this skill, skip to save compute
        if (!l.requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())) continue;

        const authCompatible = !(baseNeedsSponsorship && !l.sponsorshipAvailable);
        
        const oldScore = computeScore(s.skills ?? [], baseGpa, authCompatible, l);
        const newScore = computeScore([...(s.skills ?? []), skill], baseGpa, authCompatible, l);

        if (newScore > oldScore) {
          improvesCount++;
          totalIncrease += (newScore - oldScore);
        }
      }

      if (improvesCount > 0) {
        const avgIncrease = totalIncrease / improvesCount;
        impacts.push({
          skill,
          improvesCount,
          avgIncrease,
          impactScore: improvesCount * avgIncrease
        });
      }
    }

    // Rank by impact score descending, take top 5
    return impacts.sort((a, b) => b.impactScore - a.impactScore).slice(0, 5);
  });

  // Single-listing simulator computed values
  simGpa = computed(() => this.simGpaRaw() / 100);
  
  selectedListing = computed(() => {
    const id = this.selectedListingId();
    return this.allListings().find(l => l.listingId === id) || null;
  });

  simScoreForSelected = computed(() => {
    const listing = this.selectedListing();
    if (!listing) return 0;

    const skills = [...this.activeSkillsSet()];
    const gpa = this.simGpa();
    const needsSponsorship = this.simAuthRaw() === 'needs_sponsorship';
    const authCompatible = !(needsSponsorship && !listing.sponsorshipAvailable);

    return computeScore(skills, gpa, authCompatible, listing);
  });

  toggleSkill(skill: string) {
    const s = new Set(this.activeSkillsSet());
    if (s.has(skill)) s.delete(skill);
    else s.add(skill);
    this.activeSkillsSet.set(s);
  }

  isActive(skill: string): boolean {
    return this.activeSkillsSet().has(skill);
  }
}
