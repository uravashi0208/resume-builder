// src/app/shared/components/sortable-list/sortable-list.component.ts
// Re-orderable list (drag handle + up/down buttons for touch / keyboard).
// Used by Customize → Layout → "Change Section Layout"; it is generic, so any list can reuse it.
//
// <app-sortable-list [items]="items" [(order)]="order"></app-sortable-list>
//   items: { key, label, dashed? }[]   (dashed = drawn with a dashed border, e.g. the page-break marker)
//   order: the current key order (two-way)

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface SortableItem { key: string; label: string; dashed?: boolean; }

@Component({
  selector: 'app-sortable-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="sortable-list">
      <li *ngFor="let it of ordered; let i = index; trackBy: track"
          class="sortable-item" [class.dashed]="it.dashed"
          [class.dragging]="dragKey === it.key" [class.over]="overKey === it.key && dragKey !== it.key"
          draggable="true"
          (dragstart)="onDragStart($event, it.key)" (dragend)="onDragEnd()"
          (dragover)="onDragOver($event, it.key)" (drop)="onDrop($event, it.key)">
        <span class="sortable-handle" aria-hidden="true">⋮⋮</span>
        <span class="sortable-label">{{ it.label }}</span>
        <span class="sortable-btns">
          <button type="button" class="sortable-btn" [disabled]="i === 0" (click)="move(i, -1)" [attr.aria-label]="'Move ' + it.label + ' up'">▲</button>
          <button type="button" class="sortable-btn" [disabled]="i === ordered.length - 1" (click)="move(i, 1)" [attr.aria-label]="'Move ' + it.label + ' down'">▼</button>
        </span>
      </li>
    </ul>`,
  styles: [`
    .sortable-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .4rem; }
    .sortable-item {
      display: flex; align-items: center; gap: .6rem; padding: .5rem .7rem; border-radius: var(--r-md, 12px);
      background: var(--bg-subtle, #f3f4f8); border: 1px solid transparent; cursor: grab; user-select: none;
      font-size: var(--fs-sm, .85rem); font-weight: 600; color: var(--text-primary, #111827);
    }
    .sortable-item.dashed { background: transparent; border: 1px dashed var(--border-strong, #cbd0dc); }
    .sortable-item.dragging { opacity: .45; }
    .sortable-item.over { border-color: var(--brand, #5b2fe0); }
    .sortable-handle { color: var(--text-muted, #9ca3af); letter-spacing: -2px; font-size: .9rem; }
    .sortable-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sortable-btns { display: flex; gap: .15rem; }
    .sortable-btn {
      border: 0; background: transparent; color: var(--text-muted, #6b7280); cursor: pointer;
      font-size: .65rem; padding: .2rem .35rem; border-radius: 6px;
    }
    .sortable-btn:hover:not(:disabled) { background: rgba(0,0,0,.06); color: var(--text-primary, #111827); }
    .sortable-btn:disabled { opacity: .25; cursor: default; }
  `],
})
export class SortableListComponent {
  @Input() items: SortableItem[] = [];
  @Input() order: string[] = [];
  @Output() orderChange = new EventEmitter<string[]>();

  dragKey: string | null = null;
  overKey: string | null = null;

  track = (_: number, it: SortableItem) => it.key;

  /** items arranged by `order` (unknown keys keep their original position at the end) */
  get ordered(): SortableItem[] {
    const byKey = new Map(this.items.map((i) => [i.key, i]));
    const out: SortableItem[] = [];
    for (const k of this.order) { const it = byKey.get(k); if (it) { out.push(it); byKey.delete(k); } }
    byKey.forEach((it) => out.push(it));
    return out;
  }

  move(index: number, delta: -1 | 1): void {
    const keys = this.ordered.map((i) => i.key);
    const to = index + delta;
    if (to < 0 || to >= keys.length) return;
    [keys[index], keys[to]] = [keys[to], keys[index]];
    this.orderChange.emit(keys);
  }

  onDragStart(e: DragEvent, key: string): void {
    this.dragKey = key;
    e.dataTransfer?.setData('text/plain', key);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }
  onDragOver(e: DragEvent, key: string): void {
    if (!this.dragKey) return;
    e.preventDefault();                       // allow drop
    this.overKey = key;
  }
  onDrop(e: DragEvent, targetKey: string): void {
    e.preventDefault();
    const from = this.dragKey;
    this.onDragEnd();
    if (!from || from === targetKey) return;
    const keys = this.ordered.map((i) => i.key);
    const fi = keys.indexOf(from), ti = keys.indexOf(targetKey);
    if (fi < 0 || ti < 0) return;
    keys.splice(fi, 1);
    keys.splice(ti, 0, from);
    this.orderChange.emit(keys);
  }
  onDragEnd(): void { this.dragKey = null; this.overKey = null; }
}
