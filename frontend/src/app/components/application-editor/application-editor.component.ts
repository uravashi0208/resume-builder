// src/app/components/application-editor/application-editor.component.ts
// "Add Application" / "Edit Application" full-page editor.
// Left: section list · Right: the form for the active section. Content only — no templates / themes.

import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { ProfileService } from '../../services/profile.service';
import { Profile, DEFAULT_GDPR_CONSENT } from '../../models/profile.model';
import { htmlToPlainList } from '../../shared/utils/text';

type SectionKey =
  | 'company'
  | 'basic'
  | 'education'
  | 'competencies'
  | 'skills'
  | 'interests'
  | 'certificates'
  | 'languages'
  | 'experience'
  | 'social'
  | 'gdpr';

@Component({
  selector: 'app-application-editor',
  templateUrl: './application-editor.component.html',
  styleUrls: ['./application-editor.component.css'],
})
export class ApplicationEditorComponent implements OnInit {
  activeSection: SectionKey = 'company';

  sections: { key: SectionKey; label: string }[] = [
    { key: 'company', label: 'Company Details' },
    { key: 'basic', label: 'Basic Info' },
    { key: 'education', label: 'Education' },
    { key: 'competencies', label: 'Core Competencies' },
    { key: 'skills', label: 'Technical Skills' },
    { key: 'interests', label: 'Interests' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'languages', label: 'Languages' },
    { key: 'experience', label: 'Experience' },
    { key: 'social', label: 'Social Links' },
    { key: 'gdpr', label: 'GDPR Consent' },
  ];

  readonly levelOptions = [
    { value: 0, label: 'No level' },
    { value: 1, label: '1 – Basic' },
    { value: 2, label: '2' },
    { value: 3, label: '3 – Intermediate' },
    { value: 4, label: '4' },
    { value: 5, label: '5 – Native' },
  ];

  form!: FormGroup;
  editingId: string | null = null;
  saving = false;
  loading = true;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editingId = this.route.snapshot.paramMap.get('id');
    this.buildForm();
    this.loadData();
  }

  private buildForm() {
    this.form = this.fb.group({
      company: this.fb.group({
        companyName: ['', Validators.required],
        appliedTitle: ['', Validators.required],
        applyDate: ['', Validators.required],
        location: [''],
        status: ['Applied', Validators.required],
        jobDescription: [''],
      }),
      profile: this.fb.group({
        fullName: ['', Validators.required],
        professionalTitle: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        location: [''],
        aboutMe: [''],
        photo: [''],
        gdprConsent: [DEFAULT_GDPR_CONSENT],
        education: this.fb.array([this.createEducationGroup()]),
        coreCompetencies: this.fb.array([this.fb.control('')]),
        technicalSkills: this.fb.array([this.createSkillGroup()]),
        interests: this.fb.array([this.fb.control('')]),
        certificates: this.fb.array([this.fb.control('')]),
        languages: this.fb.array([this.createLanguageGroup()]),
        experience: this.fb.array([this.createExperienceGroup()]),
        socialLinks: this.fb.group({
          linkedin: [''],
          github: [''],
          portfolio: [''],
          twitter: [''],
        }),
      }),
    });
  }

  private loadData() {
    if (this.editingId) {
      this.applicationService.getApplicationById(this.editingId).subscribe({
        next: (app) => {
          const { profile, ...company } = app;
          this.form.get('company')?.patchValue(company);
          if (profile) {
            // each application keeps its OWN cv content
            this.patchProfile(profile);
            this.loading = false;
          } else {
            // old application saved before snapshots existed -> fall back to the shared profile
            this.loadBaseProfile(() => (this.loading = false));
          }
        },
        error: () => {
          this.errorMsg = 'Application not found.';
          this.loading = false;
        },
      });
    } else {
      // new application: prefill the CV content from the user's saved profile
      this.loadBaseProfile(() => (this.loading = false));
    }
  }

  private loadBaseProfile(done?: () => void) {
    this.profileService.getMyProfile().subscribe({
      next: (profile) => { this.patchProfile(profile); done?.(); },
      error: () => { /* new user - empty form stays */ done?.(); },
    });
  }

  private patchProfile(profile: Profile) {
    const profileGroup = this.form.get('profile') as FormGroup;
    profileGroup.patchValue({
      fullName: profile.fullName,
      professionalTitle: profile.professionalTitle,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      aboutMe: profile.aboutMe,
      photo: profile.photo || '',
      gdprConsent: profile.gdprConsent ?? DEFAULT_GDPR_CONSENT,
      socialLinks: profile.socialLinks ?? {},
    });

    this.setArray('education', profile.education, () => this.createEducationGroup());
    // Back-fill startDate/endDate from legacy "duration" string (e.g. "2014 - 2016")
    profile.education?.forEach((edu, i) => {
      if (!edu.startDate && !edu.endDate && edu.duration) {
        const parts = edu.duration.split(/\s*[-–]\s*/);
        if (parts.length >= 2) {
          this.form.get(`profile.education.${i}.startDate`)?.setValue(parts[0].trim());
          this.form.get(`profile.education.${i}.endDate`)?.setValue(parts[1].trim());
        }
      }
    });
    // skills are plain text: clean any HTML saved by the old rich-text skills field
    this.setArray('technicalSkills',
      (profile.technicalSkills ?? []).map((g) => ({ ...g, items: htmlToPlainList(g.items) })),
      () => this.createSkillGroup());
    this.setArray('experience', profile.experience, () => this.createExperienceGroup());
    // old saved data: present = true -> show "Present" in End Date
    profile.experience?.forEach((exp, i) => {
      if (exp.present) this.form.get(`profile.experience.${i}.endDate`)?.setValue('Present');
    });
    this.setSimpleArray('coreCompetencies', profile.coreCompetencies);
    this.setSimpleArray('interests', profile.interests);
    this.setSimpleArray('certificates', profile.certificates || []);
    this.setArray('languages', profile.languages || [], () => this.createLanguageGroup());
  }

  private setArray(name: string, items: any[], factory: () => FormGroup) {
    const arr = this.form.get(`profile.${name}`) as FormArray;
    arr.clear();
    (items && items.length ? items : [{}]).forEach((item) => {
      const group = factory();
      group.patchValue(item);
      arr.push(group);
    });
  }

  private setSimpleArray(name: string, items: string[]) {
    const arr = this.form.get(`profile.${name}`) as FormArray;
    arr.clear();
    (items && items.length ? items : ['']).forEach((val) => arr.push(this.fb.control(val)));
  }

  // ---------- FormArray getters ----------
  get education() { return this.form.get('profile.education') as FormArray; }
  get coreCompetencies() { return this.form.get('profile.coreCompetencies') as FormArray; }
  get technicalSkills() { return this.form.get('profile.technicalSkills') as FormArray; }
  get interests() { return this.form.get('profile.interests') as FormArray; }
  get certificates() { return this.form.get('profile.certificates') as FormArray; }
  get languages() { return this.form.get('profile.languages') as FormArray; }
  get experience() { return this.form.get('profile.experience') as FormArray; }

  // ---------- Group factories ----------
  private createEducationGroup(): FormGroup {
    const group = this.fb.group({
      degree: [''],
      institute: [''],
      instituteUrl: [''],
      startDate: [''],
      endDate: [''],
      location: [''],
      score: [''],
      duration: [''],   // computed from start/end, kept for display / old data
      description: [''],
    });
    const setDuration = () => {
      const start = group.value.startDate || '';
      const end = group.value.endDate || '';
      group.get('duration')?.setValue(start && end ? `${start} - ${end}` : start || end, { emitEvent: false });
    };
    group.get('startDate')?.valueChanges.subscribe(setDuration);
    group.get('endDate')?.valueChanges.subscribe(setDuration);
    return group;
  }
  private createLanguageGroup(): FormGroup {
    return this.fb.group({ name: [''], level: [0] });
  }
  private createSkillGroup(): FormGroup {
    return this.fb.group({ category: [''], items: [''] });
  }
  private createExperienceGroup(): FormGroup {
    const group = this.fb.group({
      role: [''],
      company: [''],
      location: [''],
      startDate: [''],
      endDate: [''],
      present: [false],
      description: [''],
    });
    // "Present" lives inside the End Date picker -> keep the `present` flag in sync
    group.get('endDate')?.valueChanges.subscribe((v) =>
      group.get('present')?.setValue(v === 'Present', { emitEvent: false }));
    return group;
  }

  // ---------- Add / Remove dynamic rows ----------
  addEducation() { this.education.push(this.createEducationGroup()); }
  removeEducation(i: number) { this.education.removeAt(i); }

  addCompetency() { this.coreCompetencies.push(this.fb.control('')); }
  removeCompetency(i: number) { this.coreCompetencies.removeAt(i); }

  addSkillGroup() { this.technicalSkills.push(this.createSkillGroup()); }
  removeSkillGroup(i: number) { this.technicalSkills.removeAt(i); }

  addInterest() { this.interests.push(this.fb.control('')); }
  removeInterest(i: number) { this.interests.removeAt(i); }

  addCertificate() { this.certificates.push(this.fb.control('')); }
  removeCertificate(i: number) { this.certificates.removeAt(i); }

  addLanguage() { this.languages.push(this.createLanguageGroup()); }
  removeLanguage(i: number) { this.languages.removeAt(i); }

  addExperience() { this.experience.push(this.createExperienceGroup()); }
  removeExperience(i: number) { this.experience.removeAt(i); }

  resetGdprConsent() {
    this.form.get('profile.gdprConsent')?.setValue(DEFAULT_GDPR_CONSENT);
  }

  setSection(key: SectionKey) {
    this.activeSection = key;
  }

  /** live plain view of whatever is typed in the form */
  get previewProfile(): Profile {
    return this.form.get('profile')?.value as Profile;
  }

  // ---------- Photo (resized in the browser so the saved profile stays small) ----------
  onPhotoSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 320;
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        this.form.get('profile.photo')?.setValue(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.form.get('profile.photo')?.setValue('');
  }

  // ---------- Save ----------
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Please fill all required fields (Company Details & Basic Info).';
      return;
    }

    this.saving = true;
    this.errorMsg = '';

    const companyData = this.form.get('company')?.value;
    const profileData = this.form.get('profile')?.value;
    // the CV content is stored INSIDE the application, so applications don't overwrite each other
    const applicationPayload = { ...companyData, profile: profileData };

    this.profileService.saveProfile(profileData).subscribe({
      next: () => {
        const request$ = this.editingId
          ? this.applicationService.updateApplication(this.editingId, applicationPayload)
          : this.applicationService.createApplication(applicationPayload);

        request$.subscribe({
          next: () => {
            this.saving = false;
            this.router.navigate(['/applications']);
          },
          error: (err) => {
            this.saving = false;
            this.errorMsg = err?.error?.message || 'Failed to save application.';
          },
        });
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.error?.message || 'Failed to save profile.';
      },
    });
  }

  cancel() {
    this.router.navigate(['/applications']);
  }
}
