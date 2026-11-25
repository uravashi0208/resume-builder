// <app-array-field [array]="form.get('education')" [create]="makeRow" addLabel="Education" [sortable]="true">
//   <ng-template #row let-group let-i="index"> …fields of ONE row, bound to `group`… </ng-template>
// </app-array-field>
// Handles the list loop, the remove (✕) buttons and the "+ Add" button for every dynamic list.
//   variant="block" → each row is a card (groups of fields)   variant="row" → one slim line (single input)
//   sortable        → drag a row by its ⋮⋮ handle to re-order it (▲ ▼ buttons do the same for touch / keyboard)
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';

@Component({
  selector: 'app-array-field',
  templateUrl: './array-field.component.html',
  styleUrls: ['./array-field.component.css'],
})
export class ArrayFieldComponent {
  @Input() array!: FormArray;
  /** creates one new empty row */
  @Input() create!: () => AbstractControl;
  @Input() addLabel = 'Item';
  @Input() variant: 'block' | 'row' = 'block';
  /** the remove button is hidden when only this many rows are left */
  @Input() min = 1;
  /** rows can be re-ordered (drag handle + ▲ ▼) */
  @Input() sortable = false;

  @ContentChild('row', { read: TemplateRef }) rowTpl!: TemplateRef<unknown>;

  /** row being dragged / row it is currently over / row whose handle is pressed (only that row is draggable,
   *  so selecting text inside its inputs keeps working) */
  dragIndex: number | null = null;
  overIndex: number | null = null;
  armed: number | null = null;

  add()                 { this.array.push(this.create()); }
  remove(index: number) { this.array.removeAt(index); }

  /** moves a row (the same control object moves, so typed values / focus state are kept) */
  move(from: number, to: number): void {
    if (from === to || to < 0 || to >= this.array.length) return;
    const ctrl = this.array.at(from);
    this.array.removeAt(from, { emitEvent: false });
    this.array.insert(to, ctrl);
    this.array.markAsDirty();
  }

  // ── drag & drop ──
  onDragStart(e: DragEvent, index: number): void {
    this.dragIndex = index;
    e.dataTransfer?.setData('text/plain', String(index));   // Firefox needs data to start a drag
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }
  onDragOver(e: DragEvent, index: number): void {
    if (this.dragIndex === null) return;
    e.preventDefault();                                      // allow drop
    this.overIndex = index;
  }
  onDrop(e: DragEvent, index: number): void {
    e.preventDefault();
    const from = this.dragIndex;
    this.onDragEnd();
    if (from !== null) this.move(from, index);
  }
  onDragEnd(): void {
    this.dragIndex = this.overIndex = this.armed = null;
  }

  /** where the drop line is drawn: after the row when dragging down, before it when dragging up */
  isDropAfter(i: number)  { return this.dragIndex !== null && this.overIndex === i && this.dragIndex < i; }
  isDropBefore(i: number) { return this.dragIndex !== null && this.overIndex === i && this.dragIndex > i; }
}
