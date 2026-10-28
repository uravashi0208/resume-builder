// src/app/shared/components/radio-group/radio-group.component.ts
import { Component, Input, Optional, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';

export interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrls: ['./radio-group.component.css'],
})
export class RadioGroupComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() options: RadioOption[] = [];
  /** 'vertical' (default) | 'horizontal' */
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() required = false;
  @Input() disabled = false;
  @Input() control: AbstractControl | null = null;

  selectedValue: string | number | null = null;
  onChange: (v: string | number | null) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (ngControl) ngControl.valueAccessor = this;
  }

  writeValue(val: string | number | null): void { this.selectedValue = val; }
  registerOnChange(fn: (v: string | number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  select(option: RadioOption): void {
    if (this.disabled || option.disabled) return;
    this.selectedValue = option.value;
    this.onChange(option.value);
    this.onTouched();
  }

  isSelected(option: RadioOption): boolean {
    return this.selectedValue === option.value;
  }

  get isInvalid(): boolean {
    const ctrl = this.control ?? this.ngControl?.control;
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }
}
