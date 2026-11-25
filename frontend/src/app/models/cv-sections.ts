// src/app/models/cv-sections.ts
// The sections of the CV form, in display order. Used by the editor sidebar AND the shared <app-cv-form>.

export type CvSectionKey =
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

export const CV_SECTIONS: { key: CvSectionKey; label: string }[] = [
  { key: 'basic',        label: 'Basic Info' },
  { key: 'education',    label: 'Education' },
  { key: 'competencies', label: 'Core Competencies' },
  { key: 'skills',       label: 'Technical Skills' },
  { key: 'interests',    label: 'Interests' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'languages',    label: 'Languages' },
  { key: 'experience',   label: 'Experience' },
  { key: 'social',       label: 'Social Links' },
  { key: 'gdpr',         label: 'GDPR Consent' },
];

export const LANGUAGE_LEVELS = [
  { value: 0, label: 'No level' },
  { value: 1, label: '1 – Basic' },
  { value: 2, label: '2' },
  { value: 3, label: '3 – Intermediate' },
  { value: 4, label: '4' },
  { value: 5, label: '5 – Native' },
];
