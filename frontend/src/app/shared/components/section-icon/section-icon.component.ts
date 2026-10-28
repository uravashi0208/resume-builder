import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SECTION_ICONS } from '../../section-icons';

/** Renders one of the heading icons by name. Colour = currentColor. */
@Component({
  selector: 'app-section-icon',
  template: `<span class="si" [innerHTML]="html"></span>`,
  styles: [`
    :host { display: inline-flex; align-items: center; vertical-align: middle; line-height: 0; }
    .si { display: inline-flex; line-height: 0; }
  `],
})
export class SectionIconComponent implements OnChanges {
  @Input() name: string | null | undefined = '';
  @Input() size = 16;
  html: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    const inner = (this.name && SECTION_ICONS[this.name]) || '';
    // Static, trusted markup from section-icons.ts only.
    this.html = this.sanitizer.bypassSecurityTrustHtml(
      inner
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${this.size}" height="${this.size}" style="fill:var(--ic-fill,none);stroke:var(--ic-stroke,currentColor)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
        : ''
    );
  }
}
