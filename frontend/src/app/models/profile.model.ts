// src/app/models/profile.model.ts
// PDF resume ma je fields hata e badha ahiya model ma che

// Default GDPR consent text — auto-filled for every CV; user can edit it in the editor.
export const DEFAULT_GDPR_CONSENT =
  'I hereby consent to the processing of my personal data for recruitment purposes in accordance with Regulation (EU) 2016/679 (GDPR).';

export interface EducationItem {
  degree: string;
  institute: string;
  instituteUrl?: string;   // optional school website link
  duration: string;        // kept for resume display e.g. "2014 - 2016"
  startDate?: string;      // "2014"
  endDate?: string;        // "2016" or "Present"
  location?: string;
  score: string;
  description?: string;    // rich-ish text description
}

export interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  startDate: string;  // yyyy-mm-dd
  endDate: string;    // yyyy-mm-dd, ignored when present = true
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

// Section heading labels — user edit kari shake che; default values hardcoded nathi templates ma
export interface SectionLabels {
  education: string;
  coreCompetencies: string;
  technicalSkills: string;
  interests: string;
  experience: string;
  aboutMe: string;
  links: string;
  certificates: string;
  languages: string;
}

export const DEFAULT_SECTION_LABELS: SectionLabels = {
  education: 'Education',
  coreCompetencies: 'Core Competencies',
  technicalSkills: 'Technical Skills',
  interests: 'Interests',
  experience: 'Experience',
  aboutMe: 'About Me',
  links: 'Links',
  certificates: 'Certificates',
  languages: 'Languages',
};

// Icon shown next to a section heading (name = key of SECTION_ICONS)
export interface SectionIcon {
  name: string;
  visible: boolean;
}
export type SectionIcons = Record<keyof SectionLabels, SectionIcon>;

export const DEFAULT_SECTION_ICONS: SectionIcons = {
  education:        { name: 'graduation-cap', visible: false },
  coreCompetencies: { name: 'award',          visible: false },
  technicalSkills:  { name: 'brain',          visible: false },
  interests:        { name: 'guitar',         visible: false },
  experience:       { name: 'briefcase',      visible: false },
  aboutMe:          { name: 'contact',        visible: false },
  links:            { name: 'share-2',        visible: false },
  certificates:     { name: 'award',          visible: false },
  languages:        { name: 'globe',          visible: false },
};

export interface LanguageItem {
  name: string;
  level: number;   // 0 = no dots, 1-5 = proficiency dots
}

export type TemplateId =
  | 'template-one' | 'template-two' | 'template-three'
  | 'template-four' | 'template-five' | 'template-six'
  | 'template-seven' | 'template-eight' | 'template-nine';

// ── FlowCV-style fine-grained customize controls ────────────────────────────
export interface FontSizeSettings {
  base: number;             // pt — overall body text size
  fullName: number;         // pt offset ABOVE base, e.g. +8
  title: number;            // pt offset above base
  sectionHeadings: number;  // pt offset above base
  entryHeader: number;      // pt offset above base (job title / degree line)
}
export const DEFAULT_FONT_SIZE: FontSizeSettings = {
  base: 10.5, fullName: 8, title: 2, sectionHeadings: 1, entryHeader: 0,
};

export interface SpacingSettings {
  lineHeight: number;      // e.g. 1.2 – 1.6
  elementSpacing: number;  // 0-4 scale, gap between blocks/sections
  sideMargin: number;      // mm, left & right page margin
  topBottomMargin: number; // mm, top & bottom page margin
}
export const DEFAULT_SPACING: SpacingSettings = {
  lineHeight: 1.2, elementSpacing: 2, sideMargin: 18, topBottomMargin: 14,
};

export interface EntryLayoutSettings {
  structure: 'full-width' | 'columns';
  dateLocationPosition: 'left' | 'right' | 'split';
  subtitlePlacement: 'same-line' | 'below';
  // ── Advanced settings ──
  columnWidthMode: 'auto' | 'manual';   // auto = template default column split
  leftColumnWidth: number;              // % of the date/location column (right = 100 - left)
  subtitleStyle: EntryTextStyle;
  dateStyle: EntryTextStyle;
  locationStyle: EntryTextStyle;
  indentBody: boolean;                  // indent the description under the entry title
  listStyle: 'bullet' | 'hyphen';
  dateLocationOrder: 'date-location' | 'location-date';
}
export type EntryTextStyle = 'normal' | 'bold' | 'italic';
export const ENTRY_COL_MIN = 15;
export const ENTRY_COL_MAX = 50;
export const DEFAULT_ENTRY_LAYOUT: EntryLayoutSettings = {
  structure: 'columns', dateLocationPosition: 'left', subtitlePlacement: 'below',
  columnWidthMode: 'auto', leftColumnWidth: 28,
  subtitleStyle: 'normal', dateStyle: 'normal', locationStyle: 'normal',
  indentBody: false, listStyle: 'bullet', dateLocationOrder: 'date-location',
};

export interface HeadingStyleSettings {
  style: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;   // 0=line 1=bar 2=thick-line 3=bold-text 4=centered-line 5=short-underline 6=hairline 7=dotted
  capitalization: 'capitalize' | 'uppercase';
  icons: 'none' | 'outline' | 'filled';
}
export const DEFAULT_HEADING_STYLE: HeadingStyleSettings = {
  style: 1, capitalization: 'capitalize', icons: 'filled',
};

export interface AccentApply {
  name: boolean;
  jobTitle: boolean;
  headings: boolean;
  headingsLine: boolean;
  headerIcons: boolean;
  dots: boolean;
  dates: boolean;
  entryTitle: boolean;
  entrySubtitle: boolean;
  linkIcons: boolean;
}
export const DEFAULT_ACCENT_APPLY: AccentApply = {
  name: false, jobTitle: false, headings: false, headingsLine: true, headerIcons: false,
  dots: false, dates: false, entryTitle: false, entrySubtitle: false, linkIcons: false,
};

export interface LinkStylingSettings {
  underline: boolean;
  blueColor: boolean;
  icon: boolean;
  // Advanced: which header details get the underline / blue colour
  headerEmail: boolean;
  headerPhone: boolean;
  headerLinkedin: boolean;
}
export const DEFAULT_LINK_STYLING: LinkStylingSettings = {
  underline: false, blueColor: false, icon: true,
  headerEmail: true, headerPhone: true, headerLinkedin: true,
};

export interface FooterSettings {
  pageNumbers: boolean;
  email: boolean;
  name: boolean;
  // Advanced → Custom footer: 3 columns that may contain {{name}} {{phone}} {{email}} {{page}} {{pages}}
  custom: boolean;
  left: string;
  center: string;
  right: string;
}
export const DEFAULT_FOOTER: FooterSettings = {
  pageNumbers: false, email: false, name: false,
  custom: false, left: '', center: '', right: '',
};

// ── Customize → Document Settings (Language / Date Format / Page Format) ──────
export type PageFormat = 'a4' | 'letter';
export interface DocumentSettings {
  language: string;      // key of DOC_LANGUAGES (document-i18n.ts), e.g. 'en-GB'
  dateFormat: string;    // key of DOC_DATE_FORMATS, e.g. 'YYYY/MM/DD'
  pageFormat: PageFormat;
}
export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  language: 'en-GB', dateFormat: 'YYYY/MM/DD', pageFormat: 'a4',
};
export function mergeDocumentSettings(v?: Partial<DocumentSettings> | null): DocumentSettings {
  return { ...DEFAULT_DOCUMENT_SETTINGS, ...(v ?? {}) };
}

// ── Customize → Section Customizations (Summary / Work Experience / Education / Skills) ──
export type SkillStyle = 'grid' | 'rows' | 'compact' | 'bubble' | 'level';
export interface SectionSettings {
  summary:    { inHeader: boolean; showHeading: boolean };
  /** titleOrder '' = keep the template's own order */
  experience: { titleOrder: '' | 'jobEmployer' | 'employerJob'; groupPromotions: boolean };
  education:  { titleOrder: '' | 'degreeSchool' | 'schoolDegree' };
  languages:   { style: 'dots' | 'text' };
  declaration: { showHeading: boolean; position: 'left' | 'right' };
  skills: {
    style: SkillStyle;
    columns: number;                       // Grid: 1-4 (0 = template default)
    rowSpacing: 'tight' | 'spacious';      // Rows
    rowBullets: boolean;                   // Rows
    compactSep: 'bullet' | 'pipe' | 'comma'; // Compact
    subinfo: 'colon' | 'dash' | 'bracket'; // Rows + Compact: how the category is joined to its items
    levelStyle: 'text' | 'dots' | 'bar';   // Level
  };
}
export const DEFAULT_SECTIONS: SectionSettings = {
  summary:    { inHeader: false, showHeading: true },
  experience: { titleOrder: '', groupPromotions: false },
  education:  { titleOrder: '' },
  languages:   { style: 'dots' },
  declaration: { showHeading: true, position: 'left' },
  skills: { style: 'grid', columns: 0, rowSpacing: 'tight', rowBullets: false, compactSep: 'bullet', subinfo: 'colon', levelStyle: 'dots' },
};
/** each template's built-in order, so untouched resumes look exactly as before */
export const TEMPLATE_EXP_ORDER: Record<string, 'jobEmployer' | 'employerJob'> = {
  'template-one': 'jobEmployer', 'template-two': 'jobEmployer', 'template-three': 'jobEmployer', 'template-four': 'jobEmployer',
  'template-five': 'employerJob', 'template-six': 'employerJob', 'template-seven': 'employerJob', 'template-eight': 'employerJob',
  'template-nine': 'jobEmployer',
};
export const TEMPLATE_EDU_ORDER: Record<string, 'degreeSchool' | 'schoolDegree'> = {
  'template-six': 'schoolDegree',
};
export const TEMPLATE_SKILL_COLS: Record<string, number> = {
  'template-four': 2, 'template-five': 3, 'template-seven': 3, 'template-eight': 3,
};
export function mergeSections(v?: Partial<SectionSettings> | null): SectionSettings {
  const d = DEFAULT_SECTIONS;
  return {
    summary:    { ...d.summary,    ...(v?.summary ?? {}) },
    experience: { ...d.experience, ...(v?.experience ?? {}) },
    education:  { ...d.education,  ...(v?.education ?? {}) },
    languages:   { ...d.languages,   ...(v?.languages ?? {}) },
    declaration: { ...d.declaration, ...(v?.declaration ?? {}) },
    skills:     { ...d.skills,     ...(v?.skills ?? {}) },
  };
}

// ── Customize → Layout → "Change Section Layout" ─────────────────────────────
// profile.sectionOrder = the user's order of the main sections (+ one "page break" marker).
// Not set / equal to the default  ->  every template renders its own built-in order (nothing changes).
export const SECTION_ORDER_KEYS = [
  'aboutMe', 'experience', 'education', 'technicalSkills', 'coreCompetencies',
  'certificates', 'languages', 'interests', 'declaration',
] as const;
export const PAGE_BREAK_KEY = 'pageBreak';
export const DEFAULT_SECTION_ORDER: string[] = [...SECTION_ORDER_KEYS, PAGE_BREAK_KEY];

/** keeps known keys once, drops unknown ones, appends anything missing (page break last) */
export function mergeSectionOrder(v?: string[] | null): string[] {
  const known = new Set<string>(DEFAULT_SECTION_ORDER);
  const out: string[] = [];
  for (const k of v ?? []) if (known.has(k) && !out.includes(k)) out.push(k);
  for (const k of DEFAULT_SECTION_ORDER) if (!out.includes(k)) out.push(k);
  return out;
}
export function isDefaultSectionOrder(v?: string[] | null): boolean {
  const m = mergeSectionOrder(v);
  return m.every((k, i) => k === DEFAULT_SECTION_ORDER[i]);
}

export type ColorTarget = 'fullPage' | 'header' | 'border';
export type ColorMode = 'single' | 'multi' | 'image';
export type ColorModes = Record<ColorTarget, ColorMode>;
export type BorderSize = 'S' | 'M' | 'L';
export interface BorderSides { top: boolean; bottom: boolean; left: boolean; right: boolean; }
export const DEFAULT_COLOR_MODES: ColorModes = { fullPage: 'single', header: 'single', border: 'single' };
export const DEFAULT_BORDER_SIDES: BorderSides = { top: true, bottom: true, left: true, right: true };

export interface Profile {
  id?: string;
  uid?: string;
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  aboutMe: string;
  photo?: string;         // small JPEG data-URL (used by templates with a photo)
  certificates?: string[];
  languages?: LanguageItem[];
  gdprConsent?: string;   // shown at the bottom of the CV; empty = hidden
  template: TemplateId;
  font?: string;
  headerAlign?: 'left' | 'center';
  detailsArrangement?: 'stacked' | 'inline' | 'columns';
  detailsSeparator?: 'icon' | 'bullet' | 'bar' | 'none';
  iconStyle?: number; // 0-6: plain, filled circle / rounded / square, outline circle / rounded / square
  nameStyle?: 'normal' | 'bold';
  titleStyle?: 'normal' | 'bold';
  titlePosition?: 'same-line' | 'below';
  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  borderColor?: string;
  colorTarget?: ColorTarget;
  colorMode?: ColorMode;            // legacy (kept so old saved profiles still load)
  colorModes?: ColorModes;          // Single / Multi / Image – remembered separately per target
  textColor?: string;               // page text colour (Full Page → Multi)
  headerTextColor?: string;         // header text colour (Header → Multi)
  headerColorSet?: boolean;         // user explicitly styled the header (templates without a band then get one)
  pageImage?: string;               // Full Page → Image  (data-URL / url)
  headerImage?: string;             // Header → Image
  borderImage?: string;             // Border → Image
  borderSize?: BorderSize;          // S / M / L
  borderSides?: BorderSides;        // which edges draw the border
  accentApply?: AccentApply;
  nameFont?: string;         // '' = same as body font
  fontSize?: FontSizeSettings;
  spacing?: SpacingSettings;
  entryLayout?: EntryLayoutSettings;
  headingStyle?: HeadingStyleSettings;
  linkStyling?: LinkStylingSettings;
  footer?: FooterSettings;
  sections?: SectionSettings;
  sectionOrder?: string[];          // Layout → Change Section Layout (see SECTION_ORDER_KEYS)
  documentSettings?: DocumentSettings;
  education: EducationItem[];
  coreCompetencies: string[];
  technicalSkills: TechnicalSkillGroup[];
  interests: string[];
  experience: ExperienceItem[];
  socialLinks: SocialLinks;
  sectionLabels?: SectionLabels;   // user-editable section headings
  sectionIcons?: SectionIcons;     // user-selectable heading icons
}

export function emptyProfile(): Profile {
  return {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    aboutMe: '',
    gdprConsent: DEFAULT_GDPR_CONSENT,
    template: 'template-one',
    font: 'Segoe UI, sans-serif',
    headerAlign: 'left',
    detailsArrangement: 'stacked',
    detailsSeparator: 'icon',
    iconStyle: 0,
    nameStyle: 'bold',
    titleStyle: 'normal',
    titlePosition: 'below',
    primaryColor: '#111827',
    accentColor: '#4f46e5',
    bgColor: '#ffffff',
    borderColor: 'transparent',
    colorTarget: 'header',
    colorMode: 'single',
    colorModes: { ...DEFAULT_COLOR_MODES },
    textColor: '#111827',
    headerTextColor: '#ffffff',
    headerColorSet: false,
    pageImage: '',
    headerImage: '',
    borderImage: '',
    borderSize: 'S',
    borderSides: { ...DEFAULT_BORDER_SIDES },
    accentApply: { ...DEFAULT_ACCENT_APPLY },
    nameFont: '',
    fontSize: { ...DEFAULT_FONT_SIZE },
    spacing: { ...DEFAULT_SPACING },
    entryLayout: { ...DEFAULT_ENTRY_LAYOUT },
    headingStyle: { ...DEFAULT_HEADING_STYLE },
    linkStyling: { ...DEFAULT_LINK_STYLING },
    footer: { ...DEFAULT_FOOTER },
    sections: mergeSections(),
    documentSettings: { ...DEFAULT_DOCUMENT_SETTINGS },
    education: [{ degree: '', institute: '', duration: '', score: '' }],
    coreCompetencies: [''],
    technicalSkills: [{ category: '', items: '' }],
    interests: [''],
    experience: [{ role: '', company: '', location: '', startDate: '', endDate: '', present: false, description: '' }],
    socialLinks: { linkedin: '', github: '', portfolio: '', twitter: '' },
    certificates: [],
    languages: [],
    sectionLabels: { ...DEFAULT_SECTION_LABELS },
    sectionIcons: JSON.parse(JSON.stringify(DEFAULT_SECTION_ICONS)),
  };
}
