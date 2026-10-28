// src/app/shared/components/checkbox-field/checkbox-field.component.ts
import { Component, Input, Optional, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-checkbox-field',
  templateUrl: './checkbox-field.component.html',
  styleUrls: ['./checkbox-field.component.css'],
})
export class CheckboxFieldComponent implements ControlValueAccessor {
  /** Text shown next to checkbox */
  @Input() label = '';
  /** Small description text below label */
  @Input() description = '';
  @Input() disabled = false;
  @Input() control: AbstractControl | null = null;

  checked = false;
  onChange: (v: boolean) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (ngControl) ngControl.valueAccessor = this;
  }

  writeValue(val: boolean): void { this.checked = !!val; }
  registerOnChange(fn: (v: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
  }
}
