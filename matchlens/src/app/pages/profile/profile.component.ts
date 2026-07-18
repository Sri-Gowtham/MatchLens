import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SkillChipComponent } from '../../shared/skill-chip/skill-chip.component';
import { WORK_AUTH_LABELS, WorkAuthStatus } from '../../core/models/student.model';

const SUGGESTED_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'Swift',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Spring Boot',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Git', 'Linux', 'REST APIs', 'GraphQL',
  'Data Analysis', 'Statistics', 'Tableau', 'Spark', 'Pandas'
];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterLink, SkillChipComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-10">

      <!-- Page header -->
      <div class="mb-8">
        <h1 class="page-title mb-2">Your Profile</h1>
        <p class="text-text-secondary font-sans text-sm">
          Keep your profile current — every field improves match accuracy.
        </p>
      </div>

      @if (saved()) {
        <div class="mb-6 flex items-center gap-3 bg-success/8 border border-success/25 rounded-xl px-5 py-3.5">
          <svg class="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <p class="text-success text-sm font-sans font-medium">Profile saved successfully!</p>
        </div>
      }

      @if (loading()) {
        <div class="card animate-pulse">
          <div class="h-4 bg-border rounded w-1/4 mb-6"></div>
          <div class="space-y-4">
            <div class="h-10 bg-border rounded-xl"></div>
            <div class="h-10 bg-border rounded-xl"></div>
            <div class="h-24 bg-border rounded-xl"></div>
          </div>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" id="profile-form" novalidate>

          <!-- Basic Info -->
          <div class="card mb-5">
            <h2 class="section-title mb-5">Basic Information</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label for="name" class="form-label">Full name</label>
                <input id="name" type="text" formControlName="name" class="form-input" placeholder="Alex Chen">
              </div>
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input id="email" type="email" formControlName="email" class="form-input bg-surface-alt" readonly>
              </div>
            </div>
          </div>

          <!-- Academic -->
          <div class="card mb-5">
            <h2 class="section-title mb-5">Academic &amp; Work Authorization</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label for="gpa" class="form-label">
                  GPA
                  <span class="text-text-secondary font-normal ml-1">(0.0 – 4.0 scale)</span>
                </label>
                <input id="gpa" type="number" formControlName="gpa" class="form-input"
                       placeholder="3.7" min="0" max="4" step="0.01">
                @if (form.get('gpa')?.invalid && form.get('gpa')?.touched) {
                  <p class="form-error">GPA must be between 0.0 and 4.0.</p>
                }
              </div>

              <div class="form-group">
                <label for="workAuth" class="form-label">Work Authorization</label>
                <select id="workAuth" formControlName="workAuthStatus" class="form-input">
                  @for (entry of workAuthOptions; track entry.value) {
                    <option [value]="entry.value">{{ entry.label }}</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <!-- Skills -->
          <div class="card mb-5">
            <h2 class="section-title mb-1">Skills</h2>
            <p class="text-text-secondary text-sm font-sans mb-4">
              Type a skill and press
              <kbd class="bg-surface-alt border border-border rounded px-1.5 py-0.5 text-xs">Enter</kbd>
              or
              <kbd class="bg-surface-alt border border-border rounded px-1.5 py-0.5 text-xs">,</kbd>
              to add it.
            </p>

            <!-- Current chips -->
            @if (skills().length > 0) {
              <div class="flex flex-wrap gap-2 mb-4">
                @for (skill of skills(); track skill) {
                  <app-skill-chip [label]="skill" [removable]="true" (removed)="removeSkill($event)" />
                }
              </div>
            }

            <!-- Chip input -->
            <div class="relative">
              <input type="text"
                     id="skill-input"
                     [(ngModel)]="skillInputValue"
                     [ngModelOptions]="{standalone: true}"
                     (keydown)="onSkillKeydown($event)"
                     class="form-input pr-16"
                     placeholder="e.g. Python, React, Machine Learning&#8230;">
              <button type="button" (click)="addSkillFromInput()"
                      class="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-primary/10 text-primary
                             px-2.5 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors font-sans">
                Add
              </button>
            </div>

            <!-- Suggestions -->
            <div class="mt-4">
              <p class="text-xs text-text-secondary font-sans mb-2">Quick add:</p>
              <div class="flex flex-wrap gap-2">
                @for (s of suggestedSkills(); track s) {
                  <button type="button" (click)="addSkill(s)"
                          class="text-xs font-sans text-text-secondary border border-border rounded-full
                                 px-2.5 py-1 hover:border-primary hover:text-primary transition-colors bg-white">
                    + {{ s }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Resume Link -->
          <div class="card mb-6">
            <h2 class="section-title mb-5">Resume / Portfolio</h2>
            <div class="form-group">
              <label for="resumeLink" class="form-label">LinkedIn profile or resume URL</label>
              <input id="resumeLink" type="url" formControlName="resumeLink" class="form-input"
                     placeholder="https://linkedin.com/in/yourname">
              @if (form.get('resumeLink')?.invalid && form.get('resumeLink')?.touched) {
                <p class="form-error">Please enter a valid URL.</p>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button type="submit" id="save-profile"
                    class="btn-primary"
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
            <a routerLink="/feed" class="btn-secondary">View listings</a>
          </div>
        </form>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  auth = inject(AuthService);

  form = this.fb.group({
    name: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    gpa: [null as number | null, [Validators.min(0), Validators.max(4)]],
    workAuthStatus: ['us_citizen'],
    resumeLink: ['', Validators.pattern('https?://.+')]
  });

  skills = signal<string[]>([]);
  skillInputValue = '';
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);

  workAuthOptions = (Object.entries(WORK_AUTH_LABELS) as [WorkAuthStatus, string][]).map(
    ([value, label]) => ({ value, label })
  );

  suggestedSkills = signal<string[]>(SUGGESTED_SKILLS.slice(0, 18));

  ngOnInit() {
    const id = this.auth.getStudentId();
    if (!id) return;
    this.api.getStudent(id).subscribe({
      next: (student) => {
        this.form.patchValue({
          name: student.name,
          email: student.email,
          gpa: student.gpa || null,
          workAuthStatus: student.workAuthStatus,
          resumeLink: student.resumeLink
        });
        this.skills.set(student.skills ?? []);
        this.updateSuggestions();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

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
    const normalized = skill.trim();
    if (normalized && !this.skills().includes(normalized)) {
      this.skills.update(s => [...s, normalized]);
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

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const id = this.auth.getStudentId();
    if (!id) return;
    this.saving.set(true);
    this.saved.set(false);

    const payload = {
      ...this.form.getRawValue(),
      skills: this.skills()
    };

    this.api.updateStudent(id, payload as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3500);
      },
      error: () => this.saving.set(false)
    });
  }
}
