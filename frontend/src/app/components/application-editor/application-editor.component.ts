// src/app/components/application-editor/application-editor.component.ts
// "New / Edit application": company details + the shared CV form, one section at a time,
// with a live plain view of the CV on the right.

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { ProfileService } from '../../services/profile.service';
import { CvFormService } from '../../services/cv-form.service';
import { APPLICATION_STATUSES } from '../../models/application.model';
import { CV_SECTIONS } from '../../models/cv-sections';
import { Profile } from '../../models/profile.model';
import { NavItem } from '../../shared/components/side-nav/side-nav.component';

@Component({
  selector: 'app-application-editor',
  templateUrl: './application-editor.component.html',
  styleUrls: ['./application-editor.component.css'],
})
export class ApplicationEditorComponent implements OnInit {
  readonly sections: NavItem[] = [{ key: 'company', label: 'Company Details' }, ...CV_SECTIONS];
  readonly statusOptions = APPLICATION_STATUSES.map((s) => ({ value: s, label: s }));

  activeSection = 'company';
  form!: FormGroup;
  editingId: string | null = null;
  saving = false;
  loading = true;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private cv: CvFormService,
    private applicationService: ApplicationService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editingId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      company: this.fb.group({
        companyName: ['', Validators.required],
        appliedTitle: ['', Validators.required],
        applyDate: ['', Validators.required],
        location: [''],
        status: ['Applied', Validators.required],
        jobDescription: [''],
      }),
      profile: this.cv.build(),
    });
    this.loadData();
  }

  // ── steps (the sidebar is also a wizard: Previous / Next) ──
  get stepIndex(): number { return this.sections.findIndex((s) => s.key === this.activeSection); }
  get stepLabel(): string { return this.sections[this.stepIndex]?.label ?? ''; }
  get progress(): number { return ((this.stepIndex + 1) / this.sections.length) * 100; }
  get isLast(): boolean { return this.stepIndex === this.sections.length - 1; }

  go(key: string) {
    this.activeSection = key;
    document.querySelector('.editor-main')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }
  prev() { this.go(this.sections[Math.max(0, this.stepIndex - 1)].key); }
  next() { this.go(this.sections[Math.min(this.sections.length - 1, this.stepIndex + 1)].key); }

  /** line under the page title: live company + role once typed */
  get subtitle(): string {
    const { companyName, appliedTitle } = this.form.get('company')?.value ?? {};
    return [companyName, appliedTitle].filter(Boolean).join(' — ') || 'Company details, job description and the CV you send for it.';
  }

  get profileForm(): FormGroup {
    return this.form.get('profile') as FormGroup;
  }

  /** live plain view of whatever is typed in the form */
  get previewProfile(): Profile {
    return this.profileForm.value as Profile;
  }

  private loadData() {
    if (!this.editingId) {
      // new application: prefill the CV content from the user's saved profile
      this.loadBaseProfile();
      return;
    }
    this.applicationService.getApplicationById(this.editingId).subscribe({
      next: (app) => {
        const { profile, ...company } = app;
        this.form.get('company')?.patchValue(company);
        if (profile) {
          // each application keeps its OWN cv content
          this.cv.patch(this.profileForm, profile);
          this.loading = false;
        } else {
          // old application saved before snapshots existed -> fall back to the shared profile
          this.loadBaseProfile();
        }
      },
      error: () => {
        this.errorMsg = 'Application not found.';
        this.loading = false;
      },
    });
  }

  private loadBaseProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (profile) => { this.cv.patch(this.profileForm, profile); this.loading = false; },
      error: () => { this.loading = false; },   // new user: the empty form stays
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Please fill all required fields (Company Details & Basic Info).';
      return;
    }

    this.saving = true;
    this.errorMsg = '';

    const profileData = this.profileForm.value;
    // the CV content is stored INSIDE the application, so applications don't overwrite each other
    const payload = { ...this.form.get('company')?.value, profile: profileData };

    this.profileService.saveProfile(profileData).subscribe({
      next: () => {
        const request$ = this.editingId
          ? this.applicationService.updateApplication(this.editingId, payload)
          : this.applicationService.createApplication(payload);

        request$.subscribe({
          next: () => { this.saving = false; this.router.navigate(['/applications']); },
          error: (err) => { this.saving = false; this.errorMsg = err?.error?.message || 'Failed to save application.'; },
        });
      },
      error: (err) => { this.saving = false; this.errorMsg = err?.error?.message || 'Failed to save profile.'; },
    });
  }

  cancel() {
    this.router.navigate(['/applications']);
  }
}
