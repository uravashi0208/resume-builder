// <app-status-badge [status]="app.status"> — Applied / Accepted / Rejected pill.
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [ngClass]="(status || '').toLowerCase()">{{ status }}</span>`,
  styles: [`
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--r-pill); font-size: var(--fs-sm); font-weight: 700; background: var(--bg-subtle); color: var(--text-secondary); }
    .badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .badge.applied  { background: var(--brand-soft-2); color: var(--brand-dark); }
    .badge.accepted { background: var(--success-bg);   color: var(--success); }
    .badge.rejected { background: var(--pink-soft);    color: var(--pink); }
  `],
})
export class StatusBadgeComponent {
  @Input() status: string | null | undefined = '';
}
