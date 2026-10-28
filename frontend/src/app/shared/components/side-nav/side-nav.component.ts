import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface NavItem { key: string; label: string; }

/**
 * Left sidebar used by BOTH editor tabs (Content + Customize).
 * Key-based: parent passes `items` + the `active` key and reacts to `(select)`.
 * Look comes from global `.side-nav` / `.nav-item` in styles.css.
 */
@Component({
  selector: 'app-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="side-nav glass d-flex flex-column">
      <button type="button" class="nav-item" *ngFor="let i of items; trackBy: track"
              [class.active]="i.key === active" (click)="select.emit(i.key)">{{ i.label }}</button>
    </aside>`,
})
export class SideNavComponent {
  @Input() items: NavItem[] = [];
  @Input() active = '';
  @Output() select = new EventEmitter<string>();
  track = (_: number, i: NavItem) => i.key;
}
