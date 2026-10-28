// src/app/shared/components/dropdown/dropdown.component.ts
// Custom dropdown (Document Settings style): optional right-aligned hint per option,
// keyboard support, closes on outside click.  Works with formControlName / ngModel.

import {
  Component, ElementRef, HostListener, Input, forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  value: string | number;
  label: string;
  /** small grey text right after the label, e.g. "(US & Canada)" */
  sub?: string;
  /** right-aligned example, e.g. "October 2nd, 2026" */
  hint?: string;
}

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DropdownComponent), multi: true }],
})
export class DropdownComponent implements ControlValueAccessor {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select';
  @Input() ariaLabel = '';

  value: string | number | null = null;
  open = false;
  disabled = false;
  activeIdx = -1;

  private onChange: (v: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private host: ElementRef<HTMLElement>) {}

  get selected(): DropdownOption | undefined {
    return this.options.find((o) => o.value === this.value);
  }

  writeValue(v: string | number | null): void { this.value = v; }
  registerOnChange(fn: (v: string | number) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }

  @HostListener('document:mousedown', ['$event'])
  onDocClick(e: MouseEvent) {
    if (this.open && !this.host.nativeElement.contains(e.target as Node)) this.close();
  }

  toggle() {
    if (this.disabled) return;
    this.open ? this.close() : this.openList();
  }

  private openList() {
    this.open = true;
    this.activeIdx = Math.max(0, this.options.findIndex((o) => o.value === this.value));
    setTimeout(() => this.scrollToActive());
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.onTouched();
  }

  choose(o: DropdownOption) {
    this.value = o.value;
    this.onChange(o.value);
    this.close();
  }

  onKey(e: KeyboardEvent) {
    if (this.disabled) return;
    const n = this.options.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.open) { this.openList(); return; }
      this.activeIdx = (this.activeIdx + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
      this.scrollToActive();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!this.open) this.openList();
      else if (this.options[this.activeIdx]) this.choose(this.options[this.activeIdx]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      this.close();
    }
  }

  private scrollToActive() {
    const li = this.host.nativeElement.querySelector('li.act') as HTMLElement | null;
    li?.scrollIntoView({ block: 'nearest' });
  }
}
