// <app-brand link="/dashboard" [size]="32"> — logo mark + "ResumeBuilder" (navbar and auth hero share it).
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="brand" [routerLink]="link">
      <span class="logo-mark" [style.--size.px]="size"><app-icon name="logo" [size]="size * .53"></app-icon></span>
      <span class="brand-text">Resume<b>Builder</b></span>
    </a>`,
  styles: [`
    :host { display: inline-flex; }
    .brand { display: inline-flex; align-items: center; gap: .5rem; color: inherit; }
    .logo-mark {
      --size: 32px; color: var(--brand); width: var(--size); height: var(--size);
      border-radius: calc(var(--size) / 3.2); display: grid; place-items: center;
      background: var(--grad-brand); box-shadow: 0 8px 20px -6px var(--brand-glow);
      transition: transform var(--t-med);
    }
    .brand:hover .logo-mark { transform: rotate(-8deg) scale(1.06); }
    .brand-text { font-weight: 500; letter-spacing: -.01em; }
    .brand-text b { margin-left: 1px; font-weight: 800; background: var(--grad-brand); -webkit-background-clip: text; background-clip: text; color: transparent; }
    @media (max-width: 560px) { :host(.collapse) .brand-text { display: none; } }
  `],
})
export class BrandComponent {
  @Input() link = '/dashboard';
  @Input() size = 32;
}
