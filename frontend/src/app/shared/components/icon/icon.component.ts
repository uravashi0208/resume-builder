// <app-icon name="back" [size]="18"> — every inline SVG of the app lives here (write an icon once, use it everywhere).
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type IconName =
  | 'logo' | 'back' | 'close' | 'arrow-right' | 'logout' | 'check'
  | 'calendar' | 'pin' | 'eye' | 'eye-off' | 'grip' | 'chevron-up' | 'chevron-down';

/** viewBox size + stroke width of each icon */
const META: Record<IconName, { box: number; sw: number }> = {
  logo:          { box: 24, sw: 1.6 },
  back:          { box: 20, sw: 1.8 },
  close:         { box: 14, sw: 1.8 },
  'arrow-right': { box: 20, sw: 1.8 },
  logout:        { box: 20, sw: 1.7 },
  check:         { box: 20, sw: 2.2 },
  calendar:      { box: 20, sw: 1.6 },
  pin:           { box: 20, sw: 1.6 },
  eye:           { box: 20, sw: 1.6 },
  'eye-off':     { box: 20, sw: 1.6 },
  grip:          { box: 20, sw: 1.6 },
  'chevron-up':  { box: 20, sw: 1.8 },
  'chevron-down':{ box: 20, sw: 1.8 },
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: inline-flex; flex: none; line-height: 0; }'],
  template: `
    <svg [attr.viewBox]="'0 0 ' + box + ' ' + box" [attr.width]="size" [attr.height]="size"
         fill="none" stroke="currentColor" [attr.stroke-width]="sw"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" [ngSwitch]="name">

      <ng-container *ngSwitchCase="'logo'">
        <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="#fff" fill-opacity=".95" stroke="none"/>
        <path d="M14 3v4h4"/><path d="M9 11h6M9 14h6M9 17h4"/>
      </ng-container>
      <path *ngSwitchCase="'back'" d="M12 5l-5 5 5 5"/>
      <path *ngSwitchCase="'close'" d="M2 2l10 10M12 2L2 12"/>
      <path *ngSwitchCase="'arrow-right'" d="M4 10h11m0 0l-4-4m4 4l-4 4"/>
      <path *ngSwitchCase="'logout'" d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M12 7l3 3-3 3M15 10H8"/>
      <path *ngSwitchCase="'check'" d="M4.5 10.5l3.5 3.5 7.5-8"/>
      <ng-container *ngSwitchCase="'calendar'">
        <rect x="3" y="4.5" width="14" height="12" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/>
      </ng-container>
      <ng-container *ngSwitchCase="'pin'">
        <path d="M10 17s5.5-4.6 5.5-9A5.5 5.5 0 0 0 4.5 8c0 4.4 5.5 9 5.5 9z"/><circle cx="10" cy="8" r="2"/>
      </ng-container>
      <ng-container *ngSwitchCase="'eye'">
        <path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10z"/><circle cx="10" cy="10" r="2.5"/>
      </ng-container>
      <ng-container *ngSwitchCase="'grip'">
        <circle cx="7.5" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12.5" cy="5" r="1.4" fill="currentColor" stroke="none"/>
        <circle cx="7.5" cy="10" r="1.4" fill="currentColor" stroke="none"/><circle cx="12.5" cy="10" r="1.4" fill="currentColor" stroke="none"/>
        <circle cx="7.5" cy="15" r="1.4" fill="currentColor" stroke="none"/><circle cx="12.5" cy="15" r="1.4" fill="currentColor" stroke="none"/>
      </ng-container>
      <path *ngSwitchCase="'chevron-up'" d="M5 12l5-5 5 5"/>
      <path *ngSwitchCase="'chevron-down'" d="M5 8l5 5 5-5"/>
      <path *ngSwitchCase="'eye-off'" d="M3 3l14 14M8.2 4.8A8 8 0 0 1 10 4.5c5.5 0 8.5 5.5 8.5 5.5a14 14 0 0 1-2.6 3.2M5.6 6.2A14 14 0 0 0 1.5 10S4.5 15.5 10 15.5c1.2 0 2.3-.3 3.3-.7M8.6 8.6a2.5 2.5 0 0 0 2.8 2.8"/>
    </svg>`,
})
export class IconComponent {
  @Input() name: IconName = 'check';
  @Input() size = 16;
  get box() { return META[this.name]?.box ?? 20; }
  get sw()  { return META[this.name]?.sw ?? 1.7; }
}
