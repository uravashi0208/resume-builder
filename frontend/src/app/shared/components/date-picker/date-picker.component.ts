// src/app/shared/components/date-picker/date-picker.component.ts
// ONE reusable date component. Choose the look with [mode]:
//   mode="date"        -> normal calendar            value: "2023-02-15"   (default)
//   mode="month-year"  -> month + year picker         value: "2023-02-01"
//   mode="year"        -> year only picker            value: "2023"
// [allowPresent]="true" adds a "Present" option (value becomes the text "Present").

import { Component, HostListener, ElementRef, Input, Optional, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() min = '';   // mode="date" only, e.g. '2000-01-01'
  @Input() max = '';   // mode="date" only, e.g. '2030-12-31'
  @Input() allowPresent = false;
  @Input() mode: 'date' | 'month-year' | 'year' = 'date';
  @Input() control: AbstractControl | null = null;

  value = '';
  isPresent = false;

  // month-year / year mode
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  years: number[] = [];
  isOpen = false;
  dropdownStyle: { [k: string]: string } = {};   // width + left offset so the dropdown fits inside its card
  narrow = false;                                // small card -> months on top, years below
  month = 0;   // 1-12, 0 = not chosen
  year = 0;    // 0 = not chosen

  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private elRef: ElementRef, @Optional() @Self() public ngControl: NgControl) {
    if (ngControl) ngControl.valueAccessor = this;
    for (let y = new Date().getFullYear() + 3; y >= 1970; y--) this.years.push(y);
  }

  // ---------- ControlValueAccessor ----------
  writeValue(val: string): void {
    this.isPresent = val === 'Present';
    this.value = this.isPresent ? '' : (val ?? '');
    // "2023" -> year 2023 | "2023-02-01" -> year 2023, month 2
    const m = /^(\d{4})(?:-(\d{2}))?/.exec(this.value);
    this.year = m ? +m[1] : 0;
    this.month = m && m[2] ? +m[2] : 0;
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  // ---------- mode="date" ----------
  onDateChange(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }
  onBlur(): void { this.onTouched(); }

  // ---------- Present (used by every mode) ----------
  togglePresent(): void {
    this.isPresent = !this.isPresent;
    this.value = '';
    this.month = 0;
    this.year = 0;
    this.onChange(this.isPresent ? 'Present' : '');
    this.onTouched();
  }

  // ---------- mode="month-year" / "year" ----------
  get display(): string {
    if (this.isPresent) return 'Present';
    if (this.mode === 'year') return this.year ? String(this.year) : '';
    return this.month && this.year ? `${String(this.month).padStart(2, '0')}/${this.year}` : '';
  }

  get placeholder(): string {
    return this.mode === 'year' ? 'YYYY' : 'MM/YYYY';
  }

  toggleOpen(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      // fit the dropdown INSIDE its card (card can be very narrow when the preview panel is open)
      const host = this.elRef.nativeElement as HTMLElement;
      const card = host.closest('.block-card, .panel, .card') as HTMLElement | null;
      const cardRect = card ? card.getBoundingClientRect() : { left: 0, right: window.innerWidth, width: window.innerWidth };
      const hostLeft = host.getBoundingClientRect().left;
      const width = Math.min(this.mode === 'year' ? 300 : 440, cardRect.width - 24);
      const left = Math.max(cardRect.left + 12 - hostLeft, Math.min(0, cardRect.right - 12 - width - hostLeft));
      this.narrow = width < 380;
      this.dropdownStyle = { width: `${width}px`, left: `${left}px` };
      // scroll ONLY the years list to the selected year (scrollIntoView moved the whole page)
      setTimeout(() => {
        const list = host.querySelector('.my-years') as HTMLElement | null;
        const sel = host.querySelector('.my-years .selected') as HTMLElement | null;
        if (list && sel) list.scrollTop = sel.offsetTop - list.clientHeight / 2 + sel.clientHeight / 2;
      });
    }
  }

  pickMonth(m: number): void {
    this.month = m;
    if (!this.year) this.year = new Date().getFullYear();
    this.save();
  }

  pickYear(y: number): void {
    this.year = y;
    if (this.mode === 'month-year' && !this.month) this.month = 1;
    this.save();
    this.isOpen = false;   // year is the last step -> close
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.isPresent = false;
    this.month = 0;
    this.year = 0;
    this.value = '';
    this.onChange('');
  }

  private save(): void {
    this.value = this.mode === 'year' ? `${this.year}` : `${this.year}-${String(this.month).padStart(2, '0')}-01`;
    this.onChange(this.value);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(e: Event): void {
    if (!this.elRef.nativeElement.contains(e.target)) this.isOpen = false;
  }

  // ---------- errors ----------
  get firstError(): string {
    if (this.errorMessage) return this.errorMessage;
    const ctrl = this.control ?? this.ngControl?.control;
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return `${this.label || 'Date'} is required.`;
    return Object.keys(ctrl.errors)[0];
  }

  get isInvalid(): boolean {
    const ctrl = this.control ?? this.ngControl?.control;
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }
}