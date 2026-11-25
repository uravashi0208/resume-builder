import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface NavItem { key: string; label: string; }

/**
 * Section list of the application editor.
 * Key-based: parent passes `items` + the `active` key and reacts to `(select)`.
 * Look comes from global `.side-nav` / `.nav-item` in styles.css.
 */
@Component({
  selector: 'app-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="side-nav glass d-flex flex-column">
      <button type="button" class="nav-item" *ngFor="let i of items; let n = index; trackBy: track"
              [class.active]="i.key === active" (click)="select.emit(i.key)">
        <span class="num" *ngIf="numbered">{{ n + 1 }}</span>{{ i.label }}
      </button>
    </aside>`,
  styles: [`
    .nav-item { display: flex; align-items: center; gap: .65rem; }
    .num { flex: none; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; font-size: var(--fs-2xs); font-weight: 700; background: var(--bg-subtle); color: var(--text-muted); transition: background var(--t-fast), color var(--t-fast); }
    .nav-item.active .num { background: var(--grad-brand); color: var(--on-brand); }
  `],
})
export class SideNavComponent {
  @Input() items: NavItem[] = [];
  @Input() active = '';
  @Input() numbered = false;
  @Output() select = new EventEmitter<string>();
  track = (_: number, i: NavItem) => i.key;
}
