import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListingFilters, WorkMode } from '../../../../core/models/listing.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="bg-surface border border-border rounded-2xl shadow-card p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-primary font-sans flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
          </svg>
          Filter listings
        </h3>
        <button type="button" (click)="reset()"
                class="text-xs text-text-secondary hover:text-danger font-sans transition-colors">
          Clear all
        </button>
      </div>

      <form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        <!-- Role search -->
        <div>
          <label for="filter-role" class="form-label text-xs">Role / keyword</label>
          <div class="relative">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input id="filter-role" type="text" formControlName="role"
                   class="form-input pl-9 text-sm" placeholder="e.g. Machine Learning">
          </div>
        </div>

        <!-- Location -->
        <div>
          <label for="filter-location" class="form-label text-xs">Location</label>
          <div class="relative">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <input id="filter-location" type="text" formControlName="location"
                   class="form-input pl-9 text-sm" placeholder="e.g. San Francisco">
          </div>
        </div>

        <!-- Work Mode -->
        <div>
          <label for="filter-work-mode" class="form-label text-xs">Work mode</label>
          <select id="filter-work-mode" formControlName="workMode" class="form-input text-sm">
            <option value="">All modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>

        <!-- Sponsorship -->
        <div>
          <p class="form-label text-xs">Sponsorship</p>
          <div class="flex gap-2 mt-1">
            <button type="button"
                    (click)="form.patchValue({sponsorship: null})"
                    class="flex-1 text-xs font-sans py-2 px-2 rounded-xl border transition-all"
                    [class.border-primary]="form.value.sponsorship === null"
                    [class.bg-primary]="form.value.sponsorship === null"
                    [class.text-white]="form.value.sponsorship === null"
                    [class.border-border]="form.value.sponsorship !== null"
                    [class.text-text-secondary]="form.value.sponsorship !== null">
              Any
            </button>
            <button type="button"
                    (click)="form.patchValue({sponsorship: true})"
                    class="flex-1 text-xs font-sans py-2 px-2 rounded-xl border transition-all"
                    [class.border-primary]="form.value.sponsorship === true"
                    [class.bg-primary]="form.value.sponsorship === true"
                    [class.text-white]="form.value.sponsorship === true"
                    [class.border-border]="form.value.sponsorship !== true"
                    [class.text-text-secondary]="form.value.sponsorship !== true">
              Sponsors
            </button>
            <button type="button"
                    (click)="form.patchValue({sponsorship: false})"
                    class="flex-1 text-xs font-sans py-2 px-1 rounded-xl border transition-all"
                    [class.border-primary]="form.value.sponsorship === false"
                    [class.bg-primary]="form.value.sponsorship === false"
                    [class.text-white]="form.value.sponsorship === false"
                    [class.border-border]="form.value.sponsorship !== false"
                    [class.text-text-secondary]="form.value.sponsorship !== false">
              No visa
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class FilterBarComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<ListingFilters>();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    role: [''],
    location: [''],
    workMode: ['' as WorkMode | ''],
    sponsorship: [null as boolean | null]
  });

  ngOnInit() {
    // Restore filters from query params
    const qp = this.route.snapshot.queryParams;
    if (qp['role']) this.form.patchValue({ role: qp['role'] });
    if (qp['location']) this.form.patchValue({ location: qp['location'] });
    if (qp['workMode']) this.form.patchValue({ workMode: qp['workMode'] });

    this.form.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(v => {
      this.emitAndUpdateUrl(v);
    });

    // Initial emit
    this.emitAndUpdateUrl(this.form.value);
  }

  private emitAndUpdateUrl(v: any) {
    const filters: ListingFilters = {
      role: v.role || undefined,
      location: v.location || undefined,
      workMode: v.workMode || undefined,
      sponsorship: v.sponsorship
    };

    // Update query params
    const queryParams: any = {};
    if (filters.role) queryParams['role'] = filters.role;
    if (filters.location) queryParams['location'] = filters.location;
    if (filters.workMode) queryParams['workMode'] = filters.workMode;
    this.router.navigate([], { queryParams, replaceUrl: true });

    this.filtersChanged.emit(filters);
  }

  reset() {
    this.form.reset({ role: '', location: '', workMode: '', sponsorship: null });
  }
}
