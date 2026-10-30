// src/app/shared/index.ts
// Barrel export — import from 'src/app/shared' instead of deep paths.

export { SharedModule }                           from './shared.module';
export { InputFieldComponent }                    from './components/input-field/input-field.component';
export { TextareaFieldComponent }                 from './components/textarea-field/textarea-field.component';
export { CheckboxFieldComponent }                 from './components/checkbox-field/checkbox-field.component';
export { RadioGroupComponent, RadioOption }       from './components/radio-group/radio-group.component';
export { SelectFieldComponent, SelectOption }     from './components/select-field/select-field.component';
export { DatePickerComponent }                    from './components/date-picker/date-picker.component';
export { StepSliderComponent }                   from './components/step-slider/step-slider.component';
export { DropdownComponent, DropdownOption }     from './components/dropdown/dropdown.component';
export { SideNavComponent, NavItem }              from './components/side-nav/side-nav.component';
export { AuthLayoutComponent }                 from './components/auth-layout/auth-layout.component';
