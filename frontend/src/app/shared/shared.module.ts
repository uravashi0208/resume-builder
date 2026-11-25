// src/app/shared/shared.module.ts
// Import this module in AppModule (or any feature module) to get all common UI pieces:
// form controls, icons, brand, page header, status badge, loading/empty state, tabs, form sections, array fields, auth card.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputFieldComponent }    from './components/input-field/input-field.component';
import { TextareaFieldComponent } from './components/textarea-field/textarea-field.component';
import { CheckboxFieldComponent } from './components/checkbox-field/checkbox-field.component';
import { RadioGroupComponent }    from './components/radio-group/radio-group.component';
import { SelectFieldComponent }   from './components/select-field/select-field.component';
import { DatePickerComponent }    from './components/date-picker/date-picker.component';
import { RichEditorComponent } from './components/rich-editor/rich-editor.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { AuthCardComponent } from './components/auth-card/auth-card.component';
import { IconComponent } from './components/icon/icon.component';
import { BrandComponent } from './components/brand/brand.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { StateComponent } from './components/state/state.component';
import { SegmentedTabsComponent } from './components/segmented-tabs/segmented-tabs.component';
import { FormSectionComponent } from './components/form-section/form-section.component';
import { ArrayFieldComponent } from './components/array-field/array-field.component';

const SHARED_COMPONENTS = [
  InputFieldComponent,
  TextareaFieldComponent,
  CheckboxFieldComponent,
  RadioGroupComponent,
  SelectFieldComponent,
  DatePickerComponent,
  RichEditorComponent,
  SideNavComponent,
  AuthLayoutComponent,
  AuthCardComponent,
  IconComponent,
  BrandComponent,
  PageHeaderComponent,
  StatusBadgeComponent,
  StateComponent,
  SegmentedTabsComponent,
  FormSectionComponent,
  ArrayFieldComponent,
];

@NgModule({
  declarations: SHARED_COMPONENTS,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  exports: [
    ...SHARED_COMPONENTS,
    // Re-export so feature modules don't need to import separately
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class SharedModule {}