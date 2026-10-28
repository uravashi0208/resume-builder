// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent }             from './components/login/login.component';
import { RegisterComponent }          from './components/register/register.component';
import { TemplateSelectComponent }    from './components/template-select/template-select.component';
import { ProfileFormComponent }       from './components/profile-form/profile-form.component';
import { DashboardComponent }         from './components/dashboard/dashboard.component';
import { ApplicationsTableComponent } from './components/applications-table/applications-table.component';
import { ApplicationEditorComponent } from './components/application-editor/application-editor.component';
import { CvViewComponent }            from './components/cv-view/cv-view.component';
import { AuthGuard }                  from './guards/auth.guard';

const routes: Routes = [
  { path: '',                         redirectTo: 'dashboard', pathMatch: 'full' },  // AuthGuard handles redirect to /login if not logged in
  { path: 'login',                    component: LoginComponent },
  { path: 'register',                 component: RegisterComponent },
  { path: 'dashboard',                component: DashboardComponent,          canActivate: [AuthGuard] },
  { path: 'template-select',          component: TemplateSelectComponent,     canActivate: [AuthGuard] },
  { path: 'profile-form',             component: ProfileFormComponent,        canActivate: [AuthGuard] },
  { path: 'applications',             component: ApplicationsTableComponent,  canActivate: [AuthGuard] },
  { path: 'applications/select-template', component: TemplateSelectComponent, data: { target: 'application' }, canActivate: [AuthGuard] },
  { path: 'applications/new',         component: ApplicationEditorComponent,  canActivate: [AuthGuard] },
  { path: 'applications/edit/:id',    component: ApplicationEditorComponent,  canActivate: [AuthGuard] },
  { path: 'cv-view',                  component: CvViewComponent,             canActivate: [AuthGuard] },
  { path: 'cv-view/:id',              component: CvViewComponent,             canActivate: [AuthGuard] },
  { path: '**',                       redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}