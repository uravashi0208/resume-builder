// <app-segmented-tabs [options]="[{value:'cv',label:'CV'}]" [(value)]="view">
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface TabOption {
  value: string;
  label: string;
  hidden?: boolean;
  /** only shown on wide screens */
  wideOnly?: boolean;
}

@Component({
  selector: 'app-segmented-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="seg glass glass-pill">
      <div class="tabs">
        <ng-container *ngFor="let o of options">
          <button type="button" *ngIf="!o.hidden" [class.active]="o.value === value" [class.only-wide]="o.wideOnly"
                  (click)="valueChange.emit(o.value)">{{ o.label }}</button>
        </ng-container>
      </div>
    </div>`,
  styles: [`
    :host { display: inline-flex; }
    .seg { padding: 2px; }
    @media (max-width: 1000px) { .only-wide { display: none; } }
  `],
})
export class SegmentedTabsComponent {
  @Input() options: TabOption[] = [];
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
}
