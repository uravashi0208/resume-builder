// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ── Feature components ──────────────────────────────────────────────────────
import { LoginComponent }              from './components/login/login.component';
import { RegisterComponent }           from './components/register/register.component';
import { TemplateSelectComponent }     from './components/template-select/template-select.component';
import { ProfileFormComponent }        from './components/profile-form/profile-form.component';
import { DashboardComponent }          from './components/dashboard/dashboard.component';
import { NavbarComponent }             from './components/navbar/navbar.component';
import { ApplicationsTableComponent }  from './components/applications-table/applications-table.component';
import { ApplicationEditorComponent }  from './components/application-editor/application-editor.component';
import { CvViewComponent }             from './components/cv-view/cv-view.component';
import { ResumeComponent }             from './components/resume/resume.component';
import { ResumeViewerComponent }       from './components/resume-viewer/resume-viewer.component';
import { ResumePagesComponent }        from './components/resume-pages/resume-pages.component';

// ── Shared UI module (InputField, Textarea, Checkbox, Radio, Select, DatePicker)
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    TemplateSelectComponent,
    ProfileFormComponent,
    DashboardComponent,
    NavbarComponent,
    ApplicationsTableComponent,
    ApplicationEditorComponent,
    CvViewComponent,
    ResumeComponent,
    ResumePagesComponent,
    ResumeViewerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,   // ← provides CommonModule, ReactiveFormsModule, FormsModule + all shared components
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}