// src/app/shared/shared.module.ts
// Import this module in AppModule (or any feature module) to get all common form controls.

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
import { SectionIconComponent } from './components/section-icon/section-icon.component';
import { StepSliderComponent } from './components/step-slider/step-slider.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { SortableListComponent } from './components/sortable-list/sortable-list.component';

const SHARED_COMPONENTS = [
  InputFieldComponent,
  TextareaFieldComponent,
  CheckboxFieldComponent,
  RadioGroupComponent,
  SelectFieldComponent,
  DatePickerComponent,
  RichEditorComponent,
  SectionIconComponent,
  StepSliderComponent,
  DropdownComponent,
  SideNavComponent,
  SortableListComponent,
  AuthLayoutComponent,
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