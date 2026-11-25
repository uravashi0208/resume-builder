// src/app/models/application.model.ts
import { Profile } from './profile.model';

/** single source of truth for the status values (table filter, editor dropdown, stats, badge) */
export const APPLICATION_STATUSES = ['Applied', 'Accepted', 'Rejected'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  id?: string;
  companyName: string;
  appliedTitle: string;
  applyDate: string; // yyyy-mm-dd
  location: string;
  status: ApplicationStatus;
  notes?: string;
  /** the job posting text, kept so you can read it later (HTML from the rich editor) */
  jobDescription?: string;
  /** Snapshot of the CV content used for THIS application only */
  profile?: Profile;
}

export function emptyApplication(): Application {
  return {
    companyName: '',
    appliedTitle: '',
    applyDate: '',
    location: '',
    status: 'Applied',
    notes: '',
    jobDescription: '',
  };
}
