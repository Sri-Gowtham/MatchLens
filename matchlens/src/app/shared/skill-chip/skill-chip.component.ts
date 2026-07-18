import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-skill-chip',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-1.5 bg-primary/8 text-primary
                 border border-primary/15 px-3 py-1 rounded-full text-xs font-medium font-sans
                 transition-all duration-150"
          [class.pr-1.5]="removable">
      {{ label }}
      @if (removable) {
        <button type="button"
                (click)="removed.emit(label)"
                class="w-4 h-4 rounded-full bg-primary/15 hover:bg-danger/20 hover:text-danger
                       flex items-center justify-center text-primary/60 transition-colors"
                [attr.aria-label]="'Remove ' + label">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      }
    </span>
  `
})
export class SkillChipComponent {
  @Input() label: string = '';
  @Input() removable: boolean = false;
  @Output() removed = new EventEmitter<string>();
}
