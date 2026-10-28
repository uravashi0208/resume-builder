// src/app/components/templates/template-two/template-two.component.ts
import { Component, Input } from '@angular/core';
import { Profile, DEFAULT_SECTION_LABELS, SectionLabels } from '../../../models/profile.model';

@Component({
  selector: 'app-template-two',
  templateUrl: './template-two.component.html',
  styleUrls: ['./template-two.component.css'],
})
export class TemplateTwoComponent {
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
