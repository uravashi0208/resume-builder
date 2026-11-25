// <app-form-section title="Education"> …fields… </app-form-section> — a titled card that holds form fields.
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="fs card">
      <h3 *ngIf="title" class="card-title">{{ title }}</h3>
      <div class="fs-body"><ng-content></ng-content></div>
    </section>`,
  styles: [`
    :host { display: block; }
    .fs { padding: 1.4rem 1.5rem; margin-bottom: 1.25rem; animation: fadeUp .3s ease both; }
    .card-title { margin-bottom: 1rem; font-size: var(--fs-lg); }
    .fs-body { display: flex; flex-direction: column; gap: .9rem; }
  `],
})
export class FormSectionComponent {
  @Input() title = '';
}
