// src/app/shared/components/select-field/select-field.component.ts
import { Component, Input, Optional, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.css'],
})
export class SelectFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '-- Select --';
  @Input() options: SelectOption[] = [];
  @Input() required = false;
  @Input() disabled = false;
  @Input() hint = '';
  /** render the closed select (and each option) in the font it represents */
  @Input() fontPreview = false;
  @Input() errorMessage = '';
  @Input() control: AbstractControl | null = null;

  value: string | number = '';
  onChange: (v: string | number) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (ngControl) ngControl.valueAccessor = this;
  }

  writeValue(val: string | number): void { this.value = val ?? ''; }
  registerOnChange(fn: (v: string | number) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onChangeEvent(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }

  onBlur(): void { this.onTouched(); }

  get firstError(): string {
    if (this.errorMessage) return this.errorMessage;
    const ctrl = this.control ?? this.ngControl?.control;
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return `${this.label || 'This field'} is required.`;
    return Object.keys(ctrl.errors)[0];
  }

  get isInvalid(): boolean {
    const ctrl = this.control ?? this.ngControl?.control;
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }
}
