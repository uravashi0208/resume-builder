// src/app/models/profile.model.ts
// Only the CV *content*. (No templates, themes, colours, fonts or layout settings.)

// Default GDPR consent text — auto-filled for every CV; user can edit it in the editor.
export const DEFAULT_GDPR_CONSENT =
  'I hereby consent to the processing of my personal data for recruitment purposes in accordance with Regulation (EU) 2016/679 (GDPR).';

export interface EducationItem {
  degree: string;
  institute: string;
  instituteUrl?: string;   // optional school website link
  duration: string;        // e.g. "2014 - 2016"
  startDate?: string;      // "2014"
  endDate?: string;        // "2016" or "Present"
  location?: string;
  score: string;
  description?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  startDate: string;  // yyyy-mm-dd
  endDate: string;    // yyyy-mm-dd or "Present"
  present: boolean;   // true = currently working here
  description: string;
}

export interface TechnicalSkillGroup {
  category: string;      // e.g. "Web Technologies"
  items: string;         // comma separated e.g. "HTML5, CSS3, JavaScript"
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  portfolio: string;
  twitter: string;
}

export interface LanguageItem {
  name: string;
  level: number;   // 0 = not set, 1-5 = proficiency
}

export interface Profile {
  id?: string;
  uid?: string;
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  aboutMe: string;
  photo?: string;         // small JPEG data-URL
  certificates?: string[];
  languages?: LanguageItem[];
  gdprConsent?: string;   // shown at the bottom of the CV; empty = hidden
  education: EducationItem[];
  coreCompetencies: string[];
  technicalSkills: TechnicalSkillGroup[];
  interests: string[];
  experience: ExperienceItem[];
  socialLinks: SocialLinks;
}

export function emptyProfile(): Profile {
  return {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    aboutMe: '',
    photo: '',
    gdprConsent: DEFAULT_GDPR_CONSENT,
    education: [],
    coreCompetencies: [],
    technicalSkills: [],
    interests: [],
    certificates: [],
    languages: [],
    experience: [],
    socialLinks: { linkedin: '', github: '', portfolio: '', twitter: '' },
  };
}
