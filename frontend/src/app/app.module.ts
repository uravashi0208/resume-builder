// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ── Feature components ──────────────────────────────────────────────────────
import { LoginComponent }              from './components/login/login.component';
import { RegisterComponent }           from './components/register/register.component';
import { ProfileFormComponent }        from './components/profile-form/profile-form.component';
import { DashboardComponent }          from './components/dashboard/dashboard.component';
import { NavbarComponent }             from './components/navbar/navbar.component';
import { ApplicationsTableComponent }  from './components/applications-table/applications-table.component';
import { ApplicationEditorComponent }  from './components/application-editor/application-editor.component';
import { CvViewComponent }             from './components/cv-view/cv-view.component';
import { CvPlainComponent }            from './components/cv-plain/cv-plain.component';
import { CvSectionComponent }          from './components/cv-plain/cv-section.component';
import { CvFormComponent }             from './components/cv-form/cv-form.component';

// ── Shared UI module (form controls, icon, brand, page header, status badge, state, tabs, form section, array field, auth card)
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProfileFormComponent,
    DashboardComponent,
    NavbarComponent,
    ApplicationsTableComponent,
    ApplicationEditorComponent,
    CvViewComponent,
    CvPlainComponent,
    CvSectionComponent,
    CvFormComponent,
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