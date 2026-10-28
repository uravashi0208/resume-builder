// src/app/shared/components/step-slider/step-slider.component.ts
// Slider with ticks, a purple block thumb and −/+ buttons (FlowCV-style).
// Usage: <app-step-slider label="Base Font Size" formControlName="base"
//          [min]="8" [max]="14" [step]="0.5" unit="pt"></app-step-slider>

import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-step-slider',
  templateUrl: './step-slider.component.html',
  styleUrls: ['./step-slider.component.css'],
})
export class StepSliderComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() min = 0;
  @Input() max = 10;
  @Input() step = 1;
  /** Text appended to the value, e.g. 'pt' or 'mm' */
  @Input() unit = '';
  /** Text put before the value, e.g. '+' for offsets */
  @Input() prefix = '';
  /** 'value' (default) shows prefix+value+unit, 'bracket' shows a [-----] indicator */
  @Input() display: 'value' | 'bracket' = 'value';
  /** Number of tick marks drawn on the track */
  @Input() ticks = 7;
  @Input() disabled = false;

  value = 0;
  onChange: (v: number) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (ngControl) ngControl.valueAccessor = this;
  }

  writeValue(v: number): void { this.value = Number(v ?? this.min); }
  registerOnChange(fn: (v: number) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }

  get tickList(): number[] { return Array.from({ length: this.ticks }, (_, i) => i); }

  get text(): string {
    if (this.display === 'bracket') {
      const n = Math.round((this.value - this.min) / this.step) + 1;
      return '[' + '-'.repeat(n) + ']';
    }
    return `${this.prefix}${this.value}${this.unit}`;
  }

  get atMin(): boolean { return this.value <= this.min; }
  get atMax(): boolean { return this.value >= this.max; }

  onInput(e: Event): void {
    this.set(Number((e.target as HTMLInputElement).value));
  }

  nudge(dir: 1 | -1): void {
    if (this.disabled) return;
    // round to avoid 0.1+0.2 style float noise
    this.set(Math.round((this.value + dir * this.step) * 1000) / 1000);
  }

  private set(v: number): void {
    this.value = Math.min(this.max, Math.max(this.min, v));
    this.onChange(this.value);
    this.onTouched();
  }
}
