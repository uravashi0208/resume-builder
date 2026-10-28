// src/app/components/templates/template-three/template-three.component.ts
import { Component, Input } from '@angular/core';
import { Profile, DEFAULT_SECTION_LABELS, SectionLabels } from '../../../models/profile.model';

@Component({
  selector: 'app-template-three',
  templateUrl: './template-three.component.html',
  styleUrls: ['./template-three.component.css'],
})
export class TemplateThreeComponent {
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
