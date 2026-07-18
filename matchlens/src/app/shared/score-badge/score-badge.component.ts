import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass" class="inline-flex items-center gap-1 font-semibold tabular-nums">
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass"></span>
      {{ score }}%
    </span>
  `
})
export class ScoreBadgeComponent {
  @Input() score: number = 0;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get tier(): 'success' | 'warning' | 'danger' {
    if (this.score >= 80) return 'success';
    if (this.score >= 50) return 'warning';
    return 'danger';
  }

  get badgeClass(): string {
    const sizeMap = {
      sm: 'text-xs px-2 py-0.5 rounded-full',
      md: 'text-sm px-2.5 py-1 rounded-full',
      lg: 'text-base px-3 py-1.5 rounded-full'
    };
    const colorMap = {
      success: 'bg-success/10 text-success border border-success/25',
      warning: 'bg-warning/10 text-warning border border-warning/25',
      danger: 'bg-danger/10 text-danger border border-danger/25'
    };
    return `${sizeMap[this.size]} ${colorMap[this.tier]}`;
  }

  get dotClass(): string {
    return {
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger'
    }[this.tier];
  }
}
