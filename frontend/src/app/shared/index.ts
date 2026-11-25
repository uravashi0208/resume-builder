// src/app/shared/index.ts
// Barrel export — import from 'src/app/shared' instead of deep paths.

export { SharedModule }                           from './shared.module';
export { InputFieldComponent }                    from './components/input-field/input-field.component';
export { TextareaFieldComponent }                 from './components/textarea-field/textarea-field.component';
export { CheckboxFieldComponent }                 from './components/checkbox-field/checkbox-field.component';
export { RadioGroupComponent, RadioOption }       from './components/radio-group/radio-group.component';
export { SelectFieldComponent, SelectOption }     from './components/select-field/select-field.component';
export { DatePickerComponent }                    from './components/date-picker/date-picker.component';
export { SideNavComponent, NavItem }              from './components/side-nav/side-nav.component';
export { AuthLayoutComponent }                 from './components/auth-layout/auth-layout.component';
export { AuthCardComponent }                   from './components/auth-card/auth-card.component';
export { IconComponent, IconName }             from './components/icon/icon.component';
export { BrandComponent }                      from './components/brand/brand.component';
export { PageHeaderComponent }                 from './components/page-header/page-header.component';
export { StatusBadgeComponent }                from './components/status-badge/status-badge.component';
export { StateComponent }                      from './components/state/state.component';
export { SegmentedTabsComponent, TabOption }   from './components/segmented-tabs/segmented-tabs.component';
export { FormSectionComponent }                from './components/form-section/form-section.component';
export { ArrayFieldComponent }                 from './components/array-field/array-field.component';
