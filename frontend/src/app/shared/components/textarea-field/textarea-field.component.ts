// src/app/shared/components/textarea-field/textarea-field.component.ts
import { Component, Input, Optional, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-textarea-field',
  templateUrl: './textarea-field.component.html',
  styleUrls: ['./textarea-field.component.css'],
})
export class TextareaFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() rows = 4;
  @Input() maxLength: number | null = null;
  /** Show mini rich-text toolbar (Bold / Italic / Underline / Bullet) */
  @Input() showToolbar = false;
  @Input() control: AbstractControl | null = null;

  value = '';
  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (ngControl) ngControl.valueAccessor = this;
  }

  writeValue(val: string): void { this.value = val ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.onChange(val);
  }

  onBlur(): void { this.onTouched(); }

  get charCount(): number { return this.value?.length ?? 0; }

  insertFormatting(tag: 'bold' | 'italic' | 'underline' | 'list'): void {
    const markers: Record<string, string> = {
      bold: '**selected**',
      italic: '_selected_',
      underline: '__selected__',
      list: '\n• ',
    };
    this.value = (this.value || '') + markers[tag];
    this.onChange(this.value);
  }

  get firstError(): string {
    if (this.errorMessage) return this.errorMessage;
    const ctrl = this.control ?? this.ngControl?.control;
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return `${this.label || 'This field'} is required.`;
    if (ctrl.errors['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters allowed.`;
    return Object.keys(ctrl.errors)[0];
  }

  get isInvalid(): boolean {
    const ctrl = this.control ?? this.ngControl?.control;
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }
}
