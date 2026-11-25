// src/app/components/cv-form/cv-form.component.ts
// THE CV content form. Used by the Profile page (all sections stacked) and the Application editor
// (one section at a time). Build / fill the FormGroup with CvFormService.
//
//   <app-cv-form [form]="profileGroup"></app-cv-form>                       → every section
//   <app-cv-form [form]="profileGroup" section="education"></app-cv-form>   → one section

import { Component, Input, OnChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { CV_SECTIONS, CvSectionKey, LANGUAGE_LEVELS } from '../../models/cv-sections';
import { CvArrayName, CvFormService } from '../../services/cv-form.service';
import { DEFAULT_GDPR_CONSENT } from '../../models/profile.model';
import { squareJpegDataUrl } from '../../shared/utils/image';

@Component({
  selector: 'app-cv-form',
  templateUrl: './cv-form.component.html',
  styleUrls: ['./cv-form.component.css'],
})
export class CvFormComponent implements OnChanges {
  @Input() form!: FormGroup;
  @Input() section: CvSectionKey | 'all' = 'all';

  readonly levelOptions = LANGUAGE_LEVELS;

  /** sections that are just a list of strings share ONE template */
  readonly lists: Partial<Record<CvSectionKey, { name: CvArrayName; placeholder: string; addLabel: string }>> = {
    competencies: { name: 'coreCompetencies', placeholder: 'e.g. Team Leadership', addLabel: 'Competency' },
    interests:    { name: 'interests',        placeholder: 'e.g. Photography',      addLabel: 'Interest' },
    certificates: { name: 'certificates',     placeholder: 'e.g. Project Management Professional (PMP)', addLabel: 'Certificate' },
  };

  visible = CV_SECTIONS;

  constructor(public cv: CvFormService) {}

  ngOnChanges(): void {
    this.visible = this.section === 'all' ? CV_SECTIONS : CV_SECTIONS.filter((s) => s.key === this.section);
  }

  get photo(): string {
    return this.form.get('photo')?.value || '';
  }

  arr(name: CvArrayName): FormArray {
    return this.form.get(name) as FormArray;
  }

  async onPhotoSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    try {
      this.form.get('photo')?.setValue(await squareJpegDataUrl(file));
    } catch {
      /* unreadable image -> ignore */
    }
  }

  removePhoto() {
    this.form.get('photo')?.setValue('');
  }

  resetGdpr() {
    this.form.get('gdprConsent')?.setValue(DEFAULT_GDPR_CONSENT);
  }
}
