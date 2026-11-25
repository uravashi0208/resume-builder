// <app-state [loading]="true">                                    → spinner + "Loading…"
// <app-state message="Nothing here yet"> <button/> </app-state>   → empty state with optional action
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="state" [class.glass]="card" [class.card-round]="card">
      <span class="spinner" *ngIf="loading"></span>
      <p *ngIf="loading || message">{{ message || 'Loading…' }}</p>
      <div class="actions"><ng-content></ng-content></div>
    </div>`,
  styles: [`
    :host { display: block; }
    .state { display: flex; flex-direction: column; align-items: center; gap: .9rem; padding: 3rem 1rem; text-align: center; color: var(--text-muted); }
    .actions:empty { display: none; }
    .spinner { width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid var(--border-brand); border-top-color: var(--brand); animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class StateComponent {
  @Input() loading = false;
  @Input() message = '';
  /** frosted card around it */
  @Input() card = false;
}
