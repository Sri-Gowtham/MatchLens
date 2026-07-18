import {
  Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectorRef
} from '@angular/core';
import {
  ReactiveFormsModule, FormBuilder, Validators, FormsModule,
  FormArray, FormGroup, AbstractControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SkillChipComponent } from '../../shared/skill-chip/skill-chip.component';
import {
  WORK_AUTH_LABELS, WorkAuthStatus, Student, ExperienceEntry, StudentLinks
} from '../../core/models/student.model';

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'Swift',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Spring Boot',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Git', 'Linux', 'REST APIs', 'GraphQL',
  'Data Analysis', 'Statistics', 'Tableau', 'Spark', 'Pandas'
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 4 + i);
const EXP_YEARS  = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - 28 + i).reverse();
const EXP_MONTHS = [
  { v: '01', l: 'Jan' }, { v: '02', l: 'Feb' }, { v: '03', l: 'Mar' },
  { v: '04', l: 'Apr' }, { v: '05', l: 'May' }, { v: '06', l: 'Jun' },
  { v: '07', l: 'Jul' }, { v: '08', l: 'Aug' }, { v: '09', l: 'Sep' },
  { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Dec' },
];

function wordCountValidator(max: number) {
  return (control: AbstractControl) => {
    const words = (control.value ?? '').trim().split(/\s+/).filter(Boolean).length;
    return words > max ? { wordCount: { actual: words, max } } : null;
  };
}

function urlPatternValidator(control: AbstractControl) {
  const val = control.value;
  if (!val) return null;
  return /^https?:\/\/.+/.test(val) ? null : { urlPattern: true };
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterLink, SkillChipComponent],
  styles: [`
    /* Sticky sidebar doesn't need JS — CSS handles it */
    .sidebar-sticky { position: sticky; top: 5rem; }

    /* SVG progress ring transition */
    .ring-progress { transition: stroke-dashoffset 0.5s ease; }

    /* Section anchor offset for sticky nav */
    .section-anchor { scroll-margin-top: 6rem; }

    /* File drop zone */
    .drop-zone.drag-over { @apply border-primary bg-primary/5; }
  `],
  template: `
<div class="max-w-7xl mx-auto px-4 py-8">

  <!-- ── Page header ── -->
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="page-title mb-1">Your Profile</h1>
      <p class="text-text-secondary font-sans text-sm">
        A complete profile improves every match score.
      </p>
    </div>
    @if (saved()) {
      <div class="flex items-center gap-2 bg-success/8 border border-success/25 rounded-xl px-4 py-2.5">
        <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span class="text-success text-sm font-sans font-medium">Saved!</span>
      </div>
    }
  </div>

  @if (loading()) {
    <!-- Skeleton loader -->
    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 animate-pulse">
      <div class="card h-72 bg-border/40"></div>
      <div class="space-y-4">
        <div class="card h-48 bg-border/40"></div>
        <div class="card h-64 bg-border/40"></div>
      </div>
    </div>
  } @else {
    <form [formGroup]="form" (ngSubmit)="save()" id="profile-form" novalidate>
      <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

        <!-- ══════════════════════════════════════════════════════════════
             LEFT SIDEBAR — sticky
        ══════════════════════════════════════════════════════════════ -->
        <aside class="sidebar-sticky space-y-4">

          <!-- Completion ring card -->
          <div class="card text-center">
            <p class="text-xs font-sans text-text-secondary uppercase tracking-wider mb-4">Profile Completion</p>

            <!-- SVG ring -->
            <div class="relative inline-flex items-center justify-center w-36 h-36 mx-auto mb-4">
              <svg class="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                <!-- Track -->
                <circle cx="60" cy="60" r="52"
                        fill="none" stroke="currentColor"
                        class="text-border"
                        stroke-width="10"/>
                <!-- Progress -->
                <circle cx="60" cy="60" r="52"
                        fill="none"
                        [attr.stroke]="ringColor"
                        stroke-width="10"
                        stroke-linecap="round"
                        class="ring-progress"
                        [attr.stroke-dasharray]="circumference"
                        [attr.stroke-dashoffset]="ringDashOffset"/>
              </svg>
              <!-- Center text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-serif font-bold"
                      [style.color]="ringColor">
                  {{ completionPct() }}%
                </span>
                <span class="text-xs font-sans text-text-secondary mt-0.5">complete</span>
              </div>
            </div>

            <!-- Completion breakdown chips -->
            <div class="space-y-1.5 text-left">
              @for (sec of completionSections(); track sec.label) {
                <div class="flex items-center gap-2 text-xs font-sans">
                  <div class="w-2 h-2 rounded-full flex-shrink-0"
                       [class.bg-success]="sec.done"
                       [class.bg-border]="!sec.done"></div>
                  <span [class.text-text-secondary]="!sec.done"
                        [class.text-text-primary]="sec.done"
                        [class.font-medium]="sec.done">
                    {{ sec.label }}
                  </span>
                  <span class="ml-auto text-text-secondary">{{ sec.filled }}/{{ sec.total }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Jump navigation -->
          <nav class="card !p-3">
            <p class="text-xs font-sans text-text-secondary uppercase tracking-wider px-2 mb-2">Jump to</p>
            @for (sec of jumpSections; track sec.id) {
              <a [href]="'#' + sec.id"
                 class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-sans
                        text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors">
                <span class="text-base">{{ sec.icon }}</span>
                {{ sec.label }}
              </a>
            }
          </nav>

          <!-- Save / View buttons -->
          <div class="flex flex-col gap-2">
            <button type="submit" id="save-profile"
                    class="btn-primary w-full justify-center"
                    [disabled]="saving()">
              @if (saving()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving&#8230;
              } @else {
                Save profile
              }
            </button>
            <a routerLink="/feed" class="btn-secondary w-full justify-center text-center">
              View listings
            </a>
          </div>
        </aside>

        <!-- ══════════════════════════════════════════════════════════════
             RIGHT — section cards
        ══════════════════════════════════════════════════════════════ -->
        <div class="space-y-5 min-w-0">

          <!-- ── 1. BASIC INFO ── -->
          <section id="basic-info" class="section-anchor card">
            <h2 class="section-title mb-5 flex items-center gap-2">
              <span>👤</span> Basic Information
            </h2>

            <!-- Name + About together at top -->
            <div class="mb-4">
              <div class="form-group mb-4">
                <label for="name" class="form-label">Full name <span class="text-danger">*</span></label>
                <input id="name" type="text" formControlName="name"
                       class="form-input" placeholder="Alex Chen">
                @if (f['name'].invalid && f['name'].touched) {
                  <p class="form-error">Name is required.</p>
                }
              </div>

              <!-- About / bio — full width -->
              <div class="form-group">
                <div class="flex items-center justify-between mb-1.5">
                  <label for="about" class="form-label mb-0">
                    About <span class="text-danger">*</span>
                  </label>
                  <span class="text-xs font-sans tabular-nums"
                        [class.text-danger]="aboutWordCount() > 150"
                        [class.text-text-secondary]="aboutWordCount() <= 150">
                    {{ aboutWordCount() }} / 150 words
                  </span>
                </div>
                <textarea id="about" formControlName="about" rows="3"
                          class="form-input resize-none leading-relaxed"
                          placeholder="Brief bio — your focus, goals, what you bring to a team&#8230;">
                </textarea>
                @if (f['about'].hasError('wordCount') && f['about'].touched) {
                  <p class="form-error">Bio must be 150 words or fewer (currently {{ aboutWordCount() }}).</p>
                }
              </div>
            </div>

            <!-- 2-col grid for the rest -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input id="email" formControlName="email" type="email"
                       class="form-input bg-surface-alt" readonly>
              </div>

              <div class="form-group">
                <label for="phone" class="form-label">Phone</label>
                <input id="phone" formControlName="phone" type="tel"
                       class="form-input" placeholder="+1 415-555-0192">
              </div>

              <div class="form-group">
                <label for="country" class="form-label">Country <span class="text-danger">*</span></label>
                <input id="country" formControlName="country" type="text"
                       class="form-input" placeholder="United States">
                @if (f['country'].invalid && f['country'].touched) {
                  <p class="form-error">Country is required.</p>
                }
              </div>

              <div class="form-group">
                <label for="city" class="form-label">City <span class="text-danger">*</span></label>
                <input id="city" formControlName="city" type="text"
                       class="form-input" placeholder="San Francisco">
                @if (f['city'].invalid && f['city'].touched) {
                  <p class="form-error">City is required.</p>
                }
              </div>

              <div class="form-group sm:col-span-2">
                <label for="address" class="form-label">Address</label>
                <input id="address" formControlName="address" type="text"
                       class="form-input" placeholder="123 Market Street, Apt 4B">
              </div>

              <div class="form-group sm:col-span-2">
                <label for="workAuth" class="form-label">Work Authorization <span class="text-danger">*</span></label>
                <select id="workAuth" formControlName="workAuthStatus" class="form-input">
                  @for (opt of workAuthOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            </div>
          </section>

          <!-- ── 2. SKILLS ── -->
          <section id="skills" class="section-anchor card">
            <h2 class="section-title mb-1 flex items-center gap-2">
              <span>🛠️</span> Skills
            </h2>
            <p class="text-text-secondary text-sm font-sans mb-4">
              Press <kbd class="bg-surface-alt border border-border rounded px-1.5 py-0.5 text-xs">Enter</kbd>
              or <kbd class="bg-surface-alt border border-border rounded px-1.5 py-0.5 text-xs">,</kbd> to add.
            </p>

            @if (skills().length > 0) {
              <div class="flex flex-wrap gap-2 mb-4">
                @for (skill of skills(); track skill) {
                  <app-skill-chip [label]="skill" [removable]="true" (removed)="removeSkill($event)" />
                }
              </div>
            }

            <div class="relative mb-4">
              <input type="text" id="skill-input"
                     [(ngModel)]="skillInputValue" [ngModelOptions]="{standalone: true}"
                     (keydown)="onSkillKeydown($event)"
                     class="form-input pr-16"
                     placeholder="e.g. Python, React, Machine Learning&#8230;">
              <button type="button" (click)="addSkillFromInput()"
                      class="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-primary/10 text-primary
                             px-2.5 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors font-sans">
                Add
              </button>
            </div>

            <div>
              <p class="text-xs text-text-secondary font-sans mb-2">Quick add:</p>
              <div class="flex flex-wrap gap-1.5">
                @for (s of suggestedSkills(); track s) {
                  <button type="button" (click)="addSkill(s)"
                          class="text-xs font-sans text-text-secondary border border-border rounded-full
                                 px-2.5 py-1 hover:border-primary hover:text-primary transition-colors bg-white">
                    + {{ s }}
                  </button>
                }
              </div>
            </div>
          </section>

          <!-- ── 3. ACADEMIC ── -->
          <section id="academic" class="section-anchor card" formGroupName="education">

            <h2 class="section-title mb-5 flex items-center gap-2">
              <span>🎓</span> Academic Details
            </h2>

            <!-- Degree sub-section -->
            <div class="mb-5 pb-5 border-b border-border" formGroupName="degree">
              <p class="text-sm font-semibold text-primary font-sans mb-3">Degree / Bachelor's</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div class="form-group sm:col-span-2">
                  <label for="deg-institution" class="form-label">Institution <span class="text-danger">*</span></label>
                  <input id="deg-institution" formControlName="institution" type="text"
                         class="form-input" placeholder="University of California, Berkeley">
                  @if (degGrp.get('institution')?.invalid && degGrp.get('institution')?.touched) {
                    <p class="form-error">Institution name is required.</p>
                  }
                </div>

                <div class="form-group">
                  <label for="deg-name" class="form-label">Degree <span class="text-danger">*</span></label>
                  <input id="deg-name" formControlName="degreeName" type="text"
                         class="form-input" placeholder="Bachelor of Science">
                  @if (degGrp.get('degreeName')?.invalid && degGrp.get('degreeName')?.touched) {
                    <p class="form-error">Degree name is required.</p>
                  }
                </div>

                <div class="form-group">
                  <label for="deg-branch" class="form-label">Branch / Major <span class="text-danger">*</span></label>
                  <input id="deg-branch" formControlName="branch" type="text"
                         class="form-input" placeholder="Computer Science">
                  @if (degGrp.get('branch')?.invalid && degGrp.get('branch')?.touched) {
                    <p class="form-error">Branch is required.</p>
                  }
                </div>

                <!-- Graduation month + year pair -->
                <div class="form-group">
                  <label class="form-label">Graduation Month/Year <span class="text-danger">*</span></label>
                  <div class="grid grid-cols-2 gap-2">
                    <select formControlName="graduationMonth" class="form-input text-sm">
                      <option value="">Month</option>
                      @for (m of months; track m) {
                        <option [value]="m">{{ m }}</option>
                      }
                    </select>
                    <select formControlName="graduationYear" class="form-input text-sm">
                      <option value="">Year</option>
                      @for (y of gradYears; track y) {
                        <option [value]="y">{{ y }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="deg-cgpa" class="form-label">CGPA <span class="text-danger">*</span></label>
                  <input id="deg-cgpa" formControlName="cgpa" type="number"
                         class="form-input" placeholder="3.7" min="0" max="10" step="0.01">
                  <p class="text-xs text-text-secondary font-sans mt-1">Use your institution's scale (0–4 or 0–10).</p>
                  @if (degGrp.get('cgpa')?.invalid && degGrp.get('cgpa')?.touched) {
                    <p class="form-error">CGPA must be between 0 and 10.</p>
                  }
                </div>

              </div>
            </div>

            <!-- HSC sub-section -->
            <div class="mb-5 pb-5 border-b border-border" formGroupName="hsc">
              <p class="text-sm font-semibold text-primary font-sans mb-3">12th / HSC</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="hsc-school" class="form-label">School Name</label>
                  <input id="hsc-school" formControlName="schoolName" type="text"
                         class="form-input" placeholder="Lowell High School">
                </div>
                <div class="form-group">
                  <label for="hsc-pct" class="form-label">Percentage</label>
                  <input id="hsc-pct" formControlName="percentage" type="number"
                         class="form-input" placeholder="94" min="0" max="100" step="0.1">
                  @if (hscGrp.get('percentage')?.invalid && hscGrp.get('percentage')?.touched) {
                    <p class="form-error">Percentage must be 0–100.</p>
                  }
                </div>
              </div>
            </div>

            <!-- SSC sub-section -->
            <div formGroupName="ssc">
              <p class="text-sm font-semibold text-primary font-sans mb-3">10th / SSC</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="ssc-school" class="form-label">School Name</label>
                  <input id="ssc-school" formControlName="schoolName" type="text"
                         class="form-input" placeholder="Presidio Middle School">
                </div>
                <div class="form-group">
                  <label for="ssc-pct" class="form-label">Percentage</label>
                  <input id="ssc-pct" formControlName="percentage" type="number"
                         class="form-input" placeholder="97" min="0" max="100" step="0.1">
                  @if (sscGrp.get('percentage')?.invalid && sscGrp.get('percentage')?.touched) {
                    <p class="form-error">Percentage must be 0–100.</p>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- ── 4. EXPERIENCE ── -->
          <section id="experience" class="section-anchor card">
            <div class="flex items-center justify-between mb-5">
              <h2 class="section-title flex items-center gap-2">
                <span>💼</span> Experience
              </h2>
              <button type="button" (click)="addExperience()"
                      class="flex items-center gap-1.5 text-xs font-sans font-medium text-primary
                             hover:bg-primary/8 border border-primary/30 px-3 py-1.5 rounded-lg transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add experience
              </button>
            </div>

            @if (experienceArray.length === 0) {
              <p class="text-sm text-text-secondary font-sans text-center py-6">
                No experience added yet. Click "+ Add experience" to start.
              </p>
            }

            <div class="space-y-5" formArrayName="experience">
              @for (exp of experienceArray.controls; track exp; let i = $index) {
                <div [formGroupName]="i"
                     class="p-4 border border-border rounded-xl bg-background/50 relative">
                  <!-- Remove button -->
                  <button type="button" (click)="removeExperience(i)"
                          class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center
                                 rounded-full hover:bg-danger/10 hover:text-danger text-text-secondary
                                 transition-colors" aria-label="Remove experience">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>

                  <p class="text-xs font-semibold font-sans text-text-secondary uppercase tracking-wider mb-3">
                    Experience {{ i + 1 }}
                  </p>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="form-group">
                      <label [for]="'exp-company-'+i" class="form-label">Company <span class="text-danger">*</span></label>
                      <input [id]="'exp-company-'+i" formControlName="company" type="text"
                             class="form-input" placeholder="Databricks">
                    </div>
                    <div class="form-group">
                      <label [for]="'exp-role-'+i" class="form-label">Role <span class="text-danger">*</span></label>
                      <input [id]="'exp-role-'+i" formControlName="role" type="text"
                             class="form-input" placeholder="Software Engineering Intern">
                    </div>

                    <!-- Start date -->
                    <div class="form-group">
                      <label class="form-label">Start Date</label>
                      <div class="grid grid-cols-2 gap-2">
                        <select formControlName="startMonth" class="form-input text-sm">
                          <option value="">Month</option>
                          @for (m of expMonths; track m.v) {
                            <option [value]="m.v">{{ m.l }}</option>
                          }
                        </select>
                        <select formControlName="startYear" class="form-input text-sm">
                          <option value="">Year</option>
                          @for (y of expYears; track y) {
                            <option [value]="y">{{ y }}</option>
                          }
                        </select>
                      </div>
                    </div>

                    <!-- End date -->
                    <div class="form-group">
                      <label class="form-label">End Date</label>
                      <div class="grid grid-cols-2 gap-2">
                        <select formControlName="endMonth" class="form-input text-sm"
                                [disabled]="exp.get('current')?.value">
                          <option value="">Month</option>
                          @for (m of expMonths; track m.v) {
                            <option [value]="m.v">{{ m.l }}</option>
                          }
                        </select>
                        <select formControlName="endYear" class="form-input text-sm"
                                [disabled]="exp.get('current')?.value">
                          <option value="">Year</option>
                          @for (y of expYears; track y) {
                            <option [value]="y">{{ y }}</option>
                          }
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Currently working -->
                  <div class="mt-3 flex items-center gap-2">
                    <input [id]="'exp-current-'+i" type="checkbox" formControlName="current"
                           (change)="onCurrentToggle(i)"
                           class="w-4 h-4 accent-primary rounded">
                    <label [for]="'exp-current-'+i"
                           class="text-sm font-sans text-text-primary cursor-pointer select-none">
                      I currently work here
                    </label>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- ── 5. LINKS & DOCUMENTS ── -->
          <section id="links" class="section-anchor card" formGroupName="links">
            <h2 class="section-title mb-5 flex items-center gap-2">
              <span>🔗</span> Links &amp; Documents
            </h2>

            <!-- Resume PDF upload -->
            <div class="mb-5 pb-5 border-b border-border">
              <p class="form-label mb-2">Resume (PDF, max 5 MB)</p>

              @if (!resumeFile() && !form.get('links.resumeUrl')?.value) {
                <div class="border-2 border-dashed border-border rounded-xl p-6 text-center
                            hover:border-primary/50 transition-colors cursor-pointer relative"
                     (click)="resumeInput.click()"
                     (dragover)="$event.preventDefault()"
                     (drop)="onResumeDrop($event)">
                  <svg class="w-8 h-8 text-text-secondary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <p class="text-sm font-sans text-text-secondary">
                    <span class="text-primary font-medium">Click to upload</span> or drag &amp; drop
                  </p>
                  <p class="text-xs text-text-secondary mt-1">PDF only, max 5 MB</p>
                </div>
              } @else {
                <div class="flex items-center gap-3 bg-success/5 border border-success/25 rounded-xl px-4 py-3">
                  <div class="w-9 h-9 bg-danger/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-sans font-medium text-primary truncate">
                      {{ resumeFile()?.name ?? 'resume.pdf' }}
                    </p>
                    @if (resumeFile()) {
                      <p class="text-xs text-text-secondary">{{ (resumeFile()!.size / 1024 / 1024).toFixed(2) }} MB</p>
                    }
                  </div>
                  <button type="button" (click)="clearResume()"
                          class="text-text-secondary hover:text-danger transition-colors flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }

              <!-- Hidden file input -->
              <input #resumeInput type="file" accept=".pdf,application/pdf"
                     class="hidden" (change)="onResumeSelected($event)">

              @if (resumeError()) {
                <p class="form-error mt-2 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ resumeError() }}
                </p>
              }
            </div>

            <!-- LinkedIn + GitHub -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div class="form-group">
                <label for="linkedin" class="form-label">LinkedIn URL</label>
                <input id="linkedin" formControlName="linkedin" type="url"
                       class="form-input" placeholder="https://linkedin.com/in/yourname">
                @if (linksGrp.get('linkedin')?.invalid && linksGrp.get('linkedin')?.touched) {
                  <p class="form-error">Please enter a valid URL.</p>
                }
              </div>
              <div class="form-group">
                <label for="github" class="form-label">GitHub URL</label>
                <input id="github" formControlName="github" type="url"
                       class="form-input" placeholder="https://github.com/yourhandle">
                @if (linksGrp.get('github')?.invalid && linksGrp.get('github')?.touched) {
                  <p class="form-error">Please enter a valid URL.</p>
                }
              </div>
            </div>

            <!-- Other links FormArray -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <p class="form-label mb-0">Other Links</p>
                <button type="button" (click)="addOtherLink()"
                        class="flex items-center gap-1 text-xs font-sans text-primary
                               hover:bg-primary/8 border border-primary/30 px-2.5 py-1 rounded-lg transition-colors">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add link
                </button>
              </div>

              <div class="space-y-2" formArrayName="others">
                @for (link of othersArray.controls; track link; let li = $index) {
                  <div [formGroupName]="li" class="flex items-start gap-2">
                    <input [id]="'link-label-'+li" formControlName="label" type="text"
                           class="form-input w-28 flex-shrink-0 text-sm" placeholder="Label">
                    <input [id]="'link-url-'+li" formControlName="url" type="url"
                           class="form-input flex-1 text-sm" placeholder="https://&#8230;">
                    <button type="button" (click)="removeOtherLink(li)"
                            class="mt-2 text-text-secondary hover:text-danger transition-colors flex-shrink-0">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
                @if (othersArray.length === 0) {
                  <p class="text-xs text-text-secondary font-sans">No additional links added.</p>
                }
              </div>
            </div>
          </section>

        </div> <!-- end right column -->
      </div>
    </form>
  }
</div>
  `
})
export class ProfileComponent implements OnInit, OnDestroy {
  private fb   = inject(FormBuilder);
  private api  = inject(ApiService);
  auth         = inject(AuthService);
  private cdr  = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // ── Constant data ──────────────────────────────────────────────────────────
  months    = MONTHS;
  gradYears = GRAD_YEARS;
  expYears  = EXP_YEARS;
  expMonths = EXP_MONTHS;

  workAuthOptions = (Object.entries(WORK_AUTH_LABELS) as [WorkAuthStatus, string][])
    .map(([value, label]) => ({ value, label }));

  jumpSections = [
    { id: 'basic-info', label: 'Basic Info',  icon: '👤' },
    { id: 'skills',     label: 'Skills',      icon: '🛠️' },
    { id: 'academic',   label: 'Academic',    icon: '🎓' },
    { id: 'experience', label: 'Experience',  icon: '💼' },
    { id: 'links',      label: 'Links',       icon: '🔗' },
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  loading = signal(true);
  saving  = signal(false);
  saved   = signal(false);

  skills         = signal<string[]>([]);
  skillInputValue = '';
  suggestedSkills = signal<string[]>(SUGGESTED_SKILLS.slice(0, 18));

  resumeFile  = signal<File | null>(null);
  resumeError = signal('');

  completionPct     = signal(0);
  completionSections = signal<{ label: string; filled: number; total: number; done: boolean }[]>([]);

  // SVG ring
  readonly circumference = 2 * Math.PI * 52; // r=52

  get ringColor(): string {
    const p = this.completionPct();
    if (p >= 80) return '#1F9D6B';
    if (p >= 50) return '#E8A33D';
    return '#C65D4A';
  }

  get ringDashOffset(): number {
    return this.circumference - (this.completionPct() / 100) * this.circumference;
  }

  // Word count for About field
  aboutWordCount = computed(() => {
    const val = this.form?.get('about')?.value ?? '';
    return val.trim().split(/\s+/).filter(Boolean).length;
  });

  // ── Form ───────────────────────────────────────────────────────────────────
  form = this.fb.group({
    name:           ['', Validators.required],
    email:          [{ value: '', disabled: true }],
    phone:          [''],
    country:        ['', Validators.required],
    city:           ['', Validators.required],
    address:        [''],
    about:          ['', [wordCountValidator(150)]],
    workAuthStatus: ['citizen' as WorkAuthStatus, Validators.required],

    education: this.fb.group({
      degree: this.fb.group({
        institution:     ['', Validators.required],
        degreeName:      ['', Validators.required],
        branch:          ['', Validators.required],
        graduationMonth: [''],
        graduationYear:  [null as number | null],
        cgpa:            [null as number | null, [Validators.min(0), Validators.max(10)]]
      }),
      hsc: this.fb.group({
        schoolName:  [''],
        percentage:  [null as number | null, [Validators.min(0), Validators.max(100)]]
      }),
      ssc: this.fb.group({
        schoolName:  [''],
        percentage:  [null as number | null, [Validators.min(0), Validators.max(100)]]
      })
    }),

    experience: this.fb.array([]),

    links: this.fb.group({
      resumeUrl: [null as string | null],
      linkedin:  ['', urlPatternValidator],
      github:    ['', urlPatternValidator],
      others:    this.fb.array([])
    })
  });

  // ── FormGroup shortcuts ────────────────────────────────────────────────────
  get f() { return this.form.controls; }
  get degGrp()  { return this.form.get('education.degree') as FormGroup; }
  get hscGrp()  { return this.form.get('education.hsc')    as FormGroup; }
  get sscGrp()  { return this.form.get('education.ssc')    as FormGroup; }
  get linksGrp(){ return this.form.get('links')             as FormGroup; }
  get experienceArray() { return this.form.get('experience') as FormArray; }
  get othersArray()     { return this.form.get('links.others') as FormArray; }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    const id = this.auth.getStudentId();
    if (!id) { this.loading.set(false); return; }

    this.api.getStudent(id).subscribe({
      next: (student) => { this.patchFormFromStudent(student); this.loading.set(false); },
      error: ()        => this.loading.set(false)
    });

    // Live completion tracking (debounced)
    this.form.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => this.updateCompletion());
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  // ── Patch helpers ──────────────────────────────────────────────────────────
  private patchFormFromStudent(s: Student) {
    this.form.patchValue({
      name:           s.name ?? '',
      email:          s.email ?? '',
      phone:          s.phone ?? '',
      country:        s.country ?? '',
      city:           s.city ?? '',
      address:        s.address ?? '',
      about:          s.about ?? '',
      workAuthStatus: s.workAuthStatus ?? 'citizen',
    });

    // Education
    if (s.education?.degree) {
      this.degGrp.patchValue({
        institution:     s.education.degree.institution ?? '',
        degreeName:      s.education.degree.degreeName ?? '',
        branch:          s.education.degree.branch ?? '',
        graduationMonth: s.education.degree.graduationMonth ?? '',
        graduationYear:  s.education.degree.graduationYear ?? null,
        cgpa:            s.education.degree.cgpa ?? null,
      });
    }
    if (s.education?.hsc) {
      this.hscGrp.patchValue({ schoolName: s.education.hsc.schoolName ?? '', percentage: s.education.hsc.percentage ?? null });
    }
    if (s.education?.ssc) {
      this.sscGrp.patchValue({ schoolName: s.education.ssc.schoolName ?? '', percentage: s.education.ssc.percentage ?? null });
    }

    // Experience FormArray
    this.experienceArray.clear();
    (s.experience ?? []).forEach(exp => this.experienceArray.push(this.makeExpGroup(exp)));

    // Links
    if (s.links) {
      this.linksGrp.patchValue({ resumeUrl: s.links.resumeUrl ?? null, linkedin: s.links.linkedin ?? '', github: s.links.github ?? '' });
      this.othersArray.clear();
      (s.links.others ?? []).forEach(o => this.othersArray.push(this.fb.group({ label: [o.label], url: [o.url, urlPatternValidator] })));
    }

    this.skills.set(s.skills ?? []);
    this.updateSuggestions();
    this.updateCompletion();
  }

  // ── Experience FormArray helpers ──────────────────────────────────────────
  private makeExpGroup(exp?: Partial<ExperienceEntry>): FormGroup {
    const startParts = (exp?.startDate ?? '').split('-');
    const endParts   = (exp?.endDate ?? '').split('-');
    return this.fb.group({
      company:    [exp?.company ?? '', Validators.required],
      role:       [exp?.role    ?? '', Validators.required],
      startMonth: [startParts[1] ?? ''],
      startYear:  [startParts[0] ? +startParts[0] : null],
      endMonth:   [endParts[1] ?? ''],
      endYear:    [endParts[0] && !exp?.current ? +endParts[0] : null],
      current:    [exp?.current ?? false]
    });
  }

  addExperience() { this.experienceArray.push(this.makeExpGroup()); }

  removeExperience(i: number) { this.experienceArray.removeAt(i); }

  onCurrentToggle(i: number) {
    const grp = this.experienceArray.at(i) as FormGroup;
    if (grp.get('current')?.value) {
      grp.patchValue({ endMonth: '', endYear: null });
    }
  }

  // ── Other links helpers ───────────────────────────────────────────────────
  addOtherLink() {
    this.othersArray.push(this.fb.group({ label: [''], url: ['', urlPatternValidator] }));
  }
  removeOtherLink(i: number) { this.othersArray.removeAt(i); }

  // ── Resume upload ─────────────────────────────────────────────────────────
  onResumeSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.validateAndSetResume(file);
  }
  onResumeDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    this.validateAndSetResume(file);
  }
  private validateAndSetResume(file: File | undefined) {
    this.resumeError.set('');
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.resumeError.set('Only PDF files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.resumeError.set(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB — max is 5 MB.`);
      return;
    }
    this.resumeFile.set(file);
  }
  clearResume() {
    this.resumeFile.set(null);
    this.form.get('links.resumeUrl')?.setValue(null);
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  onSkillKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addSkillFromInput();
    }
    if (event.key === 'Backspace' && !this.skillInputValue && this.skills().length > 0) {
      this.removeSkill(this.skills()[this.skills().length - 1]);
    }
  }
  addSkillFromInput() {
    const val = this.skillInputValue.trim().replace(/,$/, '');
    if (val) this.addSkill(val);
    this.skillInputValue = '';
  }
  addSkill(skill: string) {
    const n = skill.trim();
    if (n && !this.skills().includes(n)) {
      this.skills.update(s => [...s, n]);
      this.updateSuggestions();
    }
  }
  removeSkill(skill: string) {
    this.skills.update(s => s.filter(sk => sk !== skill));
    this.updateSuggestions();
  }
  private updateSuggestions() {
    const added = new Set(this.skills());
    this.suggestedSkills.set(SUGGESTED_SKILLS.filter(s => !added.has(s)).slice(0, 18));
  }

  // ── Profile completion ────────────────────────────────────────────────────
  private updateCompletion() {
    const v = this.form.getRawValue() as any;

    const basicFields = [v.name, v.phone, v.country, v.city, v.about, v.workAuthStatus];
    const basicFilled = basicFields.filter(f => !!f && String(f).trim()).length;

    const degFields = [
      v.education?.degree?.institution, v.education?.degree?.degreeName,
      v.education?.degree?.branch, v.education?.degree?.graduationMonth,
      v.education?.degree?.graduationYear, v.education?.degree?.cgpa
    ];
    const degFilled = degFields.filter(f => f !== null && f !== undefined && String(f).trim()).length;

    const hscFields = [v.education?.hsc?.schoolName, v.education?.hsc?.percentage];
    const hscFilled = hscFields.filter(f => f !== null && f !== undefined && String(f).trim()).length;

    const sscFields = [v.education?.ssc?.schoolName, v.education?.ssc?.percentage];
    const sscFilled = sscFields.filter(f => f !== null && f !== undefined && String(f).trim()).length;

    const skillsFilled = this.skills().length > 0 ? 1 : 0;

    const hasExp = this.experienceArray.length > 0 ? 1 : 0;

    const linkFields = [v.links?.linkedin, v.links?.github];
    const linkFilled = linkFields.filter(f => !!f && String(f).trim()).length;
    const hasResume  = (this.resumeFile() || v.links?.resumeUrl) ? 1 : 0;

    const sections = [
      { label: 'Basic Info',  filled: basicFilled,          total: 6, done: basicFilled === 6 },
      { label: 'Skills',      filled: skillsFilled,         total: 1, done: skillsFilled === 1 },
      { label: 'Academic',    filled: degFilled + hscFilled + sscFilled, total: 10, done: degFilled >= 5 },
      { label: 'Experience',  filled: hasExp,               total: 1, done: hasExp === 1 },
      { label: 'Links',       filled: linkFilled + hasResume,total: 3, done: (linkFilled + hasResume) >= 2 },
    ];

    const totalRequired = sections.reduce((s, x) => s + x.total, 0);
    const totalFilled   = sections.reduce((s, x) => s + Math.min(x.filled, x.total), 0);
    const pct = Math.round((totalFilled / totalRequired) * 100);

    this.completionSections.set(sections);
    this.completionPct.set(pct);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const id = this.auth.getStudentId();
    if (!id) return;

    this.saving.set(true);
    this.saved.set(false);

    const raw = this.form.getRawValue() as any;

    // Rebuild experience to the model's YYYY-MM startDate/endDate format
    const experience: ExperienceEntry[] = this.experienceArray.controls.map((ctrl, idx) => {
      const v = ctrl.value;
      return {
        id: `exp-${Date.now()}-${idx}`,
        company:   v.company,
        role:      v.role,
        startDate: v.startYear && v.startMonth ? `${v.startYear}-${v.startMonth}` : '',
        endDate:   (v.current || !v.endYear || !v.endMonth) ? null : `${v.endYear}-${v.endMonth}`,
        current:   v.current
      };
    });

    // Rebuild others links
    const others = this.othersArray.controls.map(c => ({ label: c.value.label, url: c.value.url }));

    const payload: Partial<Student> = {
      name:           raw.name,
      phone:          raw.phone,
      country:        raw.country,
      city:           raw.city,
      address:        raw.address,
      about:          raw.about,
      workAuthStatus: raw.workAuthStatus,
      skills:         this.skills(),
      education: {
        degree: {
          institution:     raw.education.degree.institution,
          degreeName:      raw.education.degree.degreeName,
          branch:          raw.education.degree.branch,
          graduationMonth: raw.education.degree.graduationMonth,
          graduationYear:  raw.education.degree.graduationYear,
          cgpa:            raw.education.degree.cgpa
        },
        hsc: { schoolName: raw.education.hsc.schoolName, percentage: raw.education.hsc.percentage },
        ssc: { schoolName: raw.education.ssc.schoolName, percentage: raw.education.ssc.percentage }
      },
      experience,
      links: {
        resumeUrl: raw.links.resumeUrl,
        linkedin:  raw.links.linkedin,
        github:    raw.links.github,
        others
      }
    };

    this.api.updateStudent(id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3500);
      },
      error: () => this.saving.set(false)
    });
  }
}
