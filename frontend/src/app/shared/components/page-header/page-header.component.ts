// <app-page-header eyebrow="Job tracker" title="My" accent="applications"> <button>action</button> </app-page-header>
//   • default slot     → action buttons (right side)
//   • [meta] slot      → anything shown under the title (chips, text…)
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-head">
      <div class="titles">
        <p class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
        <h2 class="display page-title">{{ title }} <em *ngIf="accent" class="grad-text">{{ accent }}</em></h2>
        <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        <ng-content select="[meta]"></ng-content>
      </div>
      <div class="actions"><ng-content></ng-content></div>
    </header>`,
  styles: [`
    :host { display: block; }
    .page-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
    .subtitle { margin-top: .35rem; font-size: var(--fs-lg); color: var(--text-secondary); }
    .actions { display: flex; align-items: center; gap: .6rem; }
    .actions:empty { display: none; }
  `],
})
export class PageHeaderComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  /** the gradient / italic word after the title */
  @Input() accent = '';
  @Input() subtitle = '';
}
