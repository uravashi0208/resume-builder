// src/app/shared/components/input-field/input-field.component.ts
import {
  Component,
  Input,
  Optional,
  Self,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NgControl,
} from '@angular/forms';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.css'],
})
export class InputFieldComponent implements ControlValueAccessor {
  @Input() label        = '';
  @Input() type         = 'text';
  @Input() placeholder  = '';
  @Input() hint         = '';
  @Input() errorMessage = '';
  @Input() required     = false;
  @Input() disabled     = false;
  @Input() autocomplete = 'off';
  @Input() control: AbstractControl | null = null;

  /**
   * For non-formControlName usage (e.g. search box).
   * Use [externalValue]="searchTerm" when no formControlName is present.
   */
  @Input() externalValue: string | null = null;

  showPassword = false;

  get inputType(): string {
    return this.type === 'password' && this.showPassword ? 'text' : this.type;
  }

  // CVA internal value
  cvaValue = '';
  onChange:  (v: string) => void = () => {};
  onTouched: () => void          = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (ngControl) ngControl.valueAccessor = this;
  }

  // ── ControlValueAccessor ────────────────────────────────────────────────
  writeValue(val: string): void       { this.cvaValue = val ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange  = fn; }
  registerOnTouched(fn: () => void):         void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void     { this.disabled  = isDisabled; }

  // ── Template helpers ─────────────────────────────────────────────────────
  /** Displayed value — externalValue wins when set (non-CVA usage) */
  get displayValue(): string {
    return this.externalValue !== null ? this.externalValue : this.cvaValue;
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.cvaValue = val;
    this.onChange(val);
  }

  onBlur(): void { this.onTouched(); }

  // ── Errors ───────────────────────────────────────────────────────────────
  get firstError(): string {
    if (this.errorMessage) return this.errorMessage;
    const ctrl = this.control ?? this.ngControl?.control;
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required'])  return `${this.label || 'This field'} is required.`;
    if (ctrl.errors['email'])     return 'Enter a valid email address.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters required.`;
    if (ctrl.errors['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters allowed.`;
    if (ctrl.errors['mismatch'])  return 'Passwords do not match.';
    if (ctrl.errors['pattern'])   return 'Invalid format.';
    return Object.keys(ctrl.errors)[0];
  }

  get isInvalid(): boolean {
    const ctrl = this.control ?? this.ngControl?.control;
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }
}