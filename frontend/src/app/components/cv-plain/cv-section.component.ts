// <app-cv-section title="Experience"> …content… </app-cv-section> — one headed block of the read-only CV.
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cv-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="cv-sec"><h2>{{ title }}</h2><ng-content></ng-content></section>`,
  styles: [`
    :host { display: block; margin-top: 1.4rem; }
    h2 { margin: 0 0 .5rem; font-size: .95rem; text-transform: uppercase; letter-spacing: .06em; color: var(--text-secondary); }
  `],
})
export class CvSectionComponent {
  @Input() title = '';
}
