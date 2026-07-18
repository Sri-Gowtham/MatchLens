import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MatchedListing } from '../../core/models/listing.model';
import { Student } from '../../core/models/student.model';
import { ScoreBadgeComponent } from '../../shared/score-badge/score-badge.component';
import { RouterLink } from '@angular/router';

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

const ALL_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'Swift',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Spring Boot',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'PyTorch', 'HuggingFace',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Spark', 'dbt',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Linux',
  'Git', 'REST APIs', 'GraphQL', 'Statistics', 'Tableau', 'Pandas',
  'Linear Algebra', 'A/B Testing', 'Product Sense',
  'Network Security', 'Cryptography', 'iOS SDK'
];

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, ScoreBadgeComponent, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-10">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="page-title mb-2">What-If Simulator</h1>
        <p class="text-text-secondary font-sans text-sm max-w-xl">
          Adjust your profile below and see instantly how your match scores would change —
          no API calls, pure real-time calculation using
          <span class="font-medium text-primary">Skills&#215;60% + GPA&#215;20% + Auth&#215;20%</span>.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <!-- Left panel: controls -->
        <div class="lg:col-span-2 space-y-5">

          <!-- GPA slider -->
          <div class="card">
            <div class="flex items-center justify-between mb-3">
              <h3 class="section-title text-base">GPA</h3>
              <div class="flex items-center gap-1">
                <span class="text-2xl font-serif font-bold text-primary tabular-nums">{{ simGpa().toFixed(2) }}</span>
                <span class="text-text-secondary text-sm font-sans">/ 4.0</span>
              </div>
            </div>
            <input type="range" id="gpa-slider"
                   [(ngModel)]="simGpaRaw"
                   min="0" max="400" step="1"
                   class="w-full h-2 rounded-full cursor-pointer accent-primary">
            <div class="flex justify-between text-xs text-text-secondary font-sans mt-1.5">
              <span>0.0</span><span>2.0</span><span>4.0</span>
            </div>
          </div>

          <!-- Work Auth -->
          <div class="card">
            <h3 class="section-title text-base mb-3">Work Authorization</h3>
            <div class="space-y-2">
              @for (opt of authOptions; track opt.value) {
                <div class="p-3 border rounded-xl cursor-pointer transition-all"
                     [class.border-primary]="simAuth() === opt.value"
                     [class.bg-primary]="simAuth() === opt.value"
                     [class.border-border]="simAuth() !== opt.value"
                     (click)="simAuth.set(opt.value)">
                  <p class="text-sm font-sans font-medium"
                     [class.text-white]="simAuth() === opt.value"
                     [class.text-primary]="simAuth() !== opt.value">
                    {{ opt.label }}
                  </p>
                  <p class="text-xs"
                     [class.text-white]="simAuth() === opt.value"
                     [class.text-text-secondary]="simAuth() !== opt.value">
                    {{ opt.sublabel }}
                  </p>
                </div>
              }
            </div>
          </div>

          <!-- Skills -->
          <div class="card">
            <div class="flex items-center justify-between mb-3">
              <h3 class="section-title text-base">Skills</h3>
              <span class="text-xs text-text-secondary font-sans">{{ activeSkills().length }} selected</span>
            </div>
            <div class="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1">
              @for (skill of allSkillsList; track skill) {
                <button type="button"
                        (click)="toggleSkill(skill)"
                        class="text-xs font-sans px-2.5 py-1 rounded-full border transition-all duration-150"
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

        <!-- Right panel: live results -->
        <div class="lg:col-span-3">
          <div class="card mb-4">
            <div class="flex items-center justify-between mb-1">
              <h3 class="section-title text-base">Live Ranking Preview</h3>
              <span class="text-xs text-text-secondary font-sans">Updates instantly</span>
            </div>
            <p class="text-xs text-text-secondary font-sans mb-5">
              Scores shown are <em>simulated</em> based on your adjusted inputs.
              Strikethrough scores are original values.
            </p>

            @if (loading()) {
              <div class="space-y-3 animate-pulse">
                @for (i of [1,2,3,4,5]; track i) {
                  <div class="h-14 bg-border rounded-xl"></div>
                }
              </div>
            } @else {
              <div class="space-y-2">
                @for (item of rankedResults(); track item.listing.listingId; let idx = $index) {
                  <div class="flex items-center gap-3 p-3 rounded-xl border transition-colors duration-150"
                       [class.border-success]="item.simScore >= 80"
                       [class.bg-success]="item.simScore >= 80"
                       [class.border-warning]="item.simScore >= 50 && item.simScore < 80"
                       [class.border-border]="item.simScore < 50"
                       [style.background-color]="item.simScore >= 80 ? 'rgba(31,157,107,0.04)' : (item.simScore >= 50 ? 'rgba(232,163,61,0.04)' : '')"
                       [style.border-color]="item.simScore >= 80 ? 'rgba(31,157,107,0.3)' : (item.simScore >= 50 ? 'rgba(232,163,61,0.3)' : '')"
                       [style.opacity]="item.simScore < 30 ? '0.55' : '1'">

                    <!-- Rank number -->
                    <span class="w-6 h-6 rounded-full bg-primary/8 text-primary text-xs font-semibold font-sans
                                 flex items-center justify-center flex-shrink-0">
                      {{ idx + 1 }}
                    </span>

                    <!-- Job info -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-sans font-medium text-primary truncate">{{ item.listing.title }}</p>
                      <p class="text-xs text-text-secondary font-sans">
                        {{ item.listing.company }} &middot; {{ item.listing.location }}
                      </p>
                    </div>

                    <!-- Score comparison -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="text-xs text-text-secondary font-sans tabular-nums line-through">
                        {{ item.listing.score }}%
                      </span>
                      <svg class="w-3 h-3 flex-shrink-0"
                           [style.color]="item.simScore > item.listing.score ? '#1F9D6B' : (item.simScore < item.listing.score ? '#C65D4A' : '#9CA3AF')"
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        @if (item.simScore > item.listing.score) {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        } @else if (item.simScore < item.listing.score) {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        } @else {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
                        }
                      </svg>
                      <app-score-badge [score]="item.simScore" size="sm" />
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Weight explanation -->
          <div class="bg-surface border border-border rounded-2xl p-5">
            <h4 class="text-sm font-semibold font-sans text-primary mb-3">Score formula</h4>
            <div class="space-y-2.5">
              @for (w of weightBreakdown; track w.label) {
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-xs font-sans text-text-secondary">{{ w.label }}</span>
                    <span class="text-xs font-semibold font-sans text-primary">{{ w.pct }}</span>
                  </div>
                  <div class="h-1.5 bg-border rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-primary/50" [style.width]="w.pct"></div>
                  </div>
                </div>
              }
            </div>
            <p class="text-xs text-text-secondary font-sans mt-4">
              Skill match = fraction of required skills you have.
              GPA score is proportional if below the minimum threshold.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SimulatorComponent implements OnInit {
  private api = inject(ApiService);
  private authSvc = inject(AuthService);

  allListings = signal<MatchedListing[]>([]);
  loading = signal(true);

  simGpaRaw = 370; // 3.7 * 100
  simAuth = signal<string>('opt_cpt');
  activeSkillsSet = signal<Set<string>>(new Set());

  allSkillsList = [...new Set(ALL_SKILLS)];

  authOptions = [
    { value: 'us_citizen',   label: 'US Citizen / PR',           sublabel: 'No sponsorship needed' },
    { value: 'opt_cpt',      label: 'OPT / CPT',                 sublabel: 'No sponsorship needed' },
    { value: 'h1b_required', label: 'H1B Sponsorship Required',  sublabel: 'Needs employer sponsorship' },
  ];

  weightBreakdown = [
    { label: 'Skill Match', pct: '60%' },
    { label: 'GPA',         pct: '20%' },
    { label: 'Work Auth',   pct: '20%' },
  ];

  simGpa = computed(() => this.simGpaRaw / 100);
  activeSkills = computed(() => [...this.activeSkillsSet()]);

  rankedResults = computed(() => {
    const skills = this.activeSkills();
    const gpa = this.simGpa();
    const h1bRequired = this.simAuth() === 'h1b_required';

    return this.allListings()
      .map(listing => {
        const needsSponsor = h1bRequired && !listing.sponsorshipAvailable;
        const authCompatible = !needsSponsor;
        const simScore = computeScore(skills, gpa, authCompatible, listing);
        return { listing, simScore };
      })
      .sort((a, b) => b.simScore - a.simScore);
  });

  ngOnInit() {
    this.api.getAllListings().subscribe({
      next: (listings) => {
        this.allListings.set(listings);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    const studentId = this.authSvc.getStudentId();
    if (studentId) {
      this.api.getStudent(studentId).subscribe({
        next: (student: Student) => {
          this.simGpaRaw = Math.round((student.gpa ?? 0) * 100);
          this.simAuth.set(student.workAuthStatus);
          this.activeSkillsSet.set(new Set(student.skills ?? []));
        }
      });
    }
  }

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
