// src/app/services/cv-form.service.ts
// ONE place that knows the shape of the CV form (used by the Profile page AND the Application editor).

import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_GDPR_CONSENT, Profile } from '../models/profile.model';
import { htmlToPlainList } from '../shared/utils/text';

/** every dynamic list of the form */
export type CvArrayName =
  | 'education'
  | 'coreCompetencies'
  | 'technicalSkills'
  | 'interests'
  | 'certificates'
  | 'languages'
  | 'experience';

@Injectable({ providedIn: 'root' })
export class CvFormService {
  constructor(private fb: FormBuilder) {}

  /** How to create ONE new row of each list — handed to <app-array-field [create]>. */
  readonly rows: Record<CvArrayName, () => AbstractControl> = {
    education:        () => this.educationGroup(),
    coreCompetencies: () => this.fb.control(''),
    technicalSkills:  () => this.fb.group({ category: [''], items: [''] }),
    interests:        () => this.fb.control(''),
    certificates:     () => this.fb.control(''),
    languages:        () => this.fb.group({ name: [''], level: [0] }),
    experience:       () => this.experienceGroup(),
  };

  /** Empty CV form (the `profile` part of a profile / application). */
  build(): FormGroup {
    const list = (name: CvArrayName) => this.fb.array([this.rows[name]()]);
    return this.fb.group({
      fullName: ['', Validators.required],
      professionalTitle: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: [''],
      aboutMe: [''],
      photo: [''],
      gdprConsent: [DEFAULT_GDPR_CONSENT],
      education: list('education'),
      coreCompetencies: list('coreCompetencies'),
      technicalSkills: list('technicalSkills'),
      interests: list('interests'),
      certificates: list('certificates'),
      languages: list('languages'),
      experience: list('experience'),
      socialLinks: this.fb.group({ linkedin: [''], github: [''], portfolio: [''], twitter: [''] }),
    });
  }

  /** Fills the form from a saved profile (also copes with older saved shapes). */
  patch(form: FormGroup, profile: Profile): void {
    form.patchValue({
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

    this.fill(form, 'education', profile.education);
    // older data only has a "duration" string (e.g. "2014 - 2016") -> split it into start / end
    profile.education?.forEach((edu, i) => {
      if (!edu.startDate && !edu.endDate && edu.duration) {
        const [start, end] = edu.duration.split(/\s*[-–]\s*/);
        if (end) {
          form.get(`education.${i}.startDate`)?.setValue(start.trim());
          form.get(`education.${i}.endDate`)?.setValue(end.trim());
        }
      }
    });

    // skills are plain text: clean any HTML saved by the old rich-text skills field
    this.fill(form, 'technicalSkills',
      profile.technicalSkills?.map((g) => ({ ...g, items: htmlToPlainList(g.items) })));

    this.fill(form, 'experience', profile.experience);
    // older data: present = true -> show "Present" in End Date
    profile.experience?.forEach((exp, i) => {
      if (exp.present) form.get(`experience.${i}.endDate`)?.setValue('Present');
    });

    this.fill(form, 'coreCompetencies', profile.coreCompetencies);
    this.fill(form, 'interests', profile.interests);
    this.fill(form, 'certificates', profile.certificates);
    this.fill(form, 'languages', profile.languages);
  }

  /** replaces the rows of one list (always keeps at least one empty row) */
  private fill(form: FormGroup, name: CvArrayName, items?: any[] | null): void {
    const arr = form.get(name) as FormArray;
    arr.clear();
    (items?.length ? items : [undefined]).forEach((item) => {
      const row = this.rows[name]();
      if (item !== undefined) row.patchValue(item);
      arr.push(row);
    });
  }

  private educationGroup(): FormGroup {
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
      const { startDate, endDate } = group.value;
      group.get('duration')?.setValue(startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate || '', { emitEvent: false });
    };
    group.get('startDate')?.valueChanges.subscribe(setDuration);
    group.get('endDate')?.valueChanges.subscribe(setDuration);
    return group;
  }

  private experienceGroup(): FormGroup {
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
}
