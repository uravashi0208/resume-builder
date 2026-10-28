// src/app/components/templates/template-one/template-one.component.ts
import { Component, Input } from '@angular/core';
import { Profile, DEFAULT_SECTION_LABELS, SectionLabels } from '../../../models/profile.model';

@Component({
  selector: 'app-template-one',
  templateUrl: './template-one.component.html',
  styleUrls: ['./template-one.component.css'],
})
export class TemplateOneComponent {
  @Input() profile!: Profile;

  label(key: keyof SectionLabels): string {
    return this.profile?.sectionLabels?.[key] || DEFAULT_SECTION_LABELS[key];
  }

  formatDuration(exp: { startDate: string; endDate: string; present: boolean }): string {
    const start = exp.startDate || '';
    const end = exp.present ? 'Present' : exp.endDate || '';
    if (!start && !end) return '';
    return `${start} - ${end}`;
  }
}
