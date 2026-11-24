// src/app/models/application.model.ts
import { Profile } from './profile.model';

export type ApplicationStatus = 'Applied' | 'Accepted' | 'Rejected';

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
