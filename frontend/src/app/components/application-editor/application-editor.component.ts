// src/app/components/application-editor/application-editor.component.ts
// "Add Application" / "Edit Application" click kare etle aa full-page editor khule
// Top: Content | Customize tabs. Content tab: left sidebar section list + right live preview.

import { SECTION_ICON_NAMES } from '../../shared/section-icons';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { ProfileService } from '../../services/profile.service';
import { emptyApplication } from '../../models/application.model';
import {
  Profile, DEFAULT_GDPR_CONSENT, DEFAULT_SECTION_LABELS, SectionLabels, DEFAULT_SECTION_ICONS, TemplateId,
  DEFAULT_FONT_SIZE, DEFAULT_SPACING, DEFAULT_ENTRY_LAYOUT, DEFAULT_HEADING_STYLE, DEFAULT_LINK_STYLING, DEFAULT_FOOTER, DEFAULT_SECTIONS, mergeSections, TEMPLATE_EXP_ORDER, TEMPLATE_EDU_ORDER, TEMPLATE_SKILL_COLS,
  ENTRY_COL_MIN, ENTRY_COL_MAX, ColorTarget, ColorMode, DEFAULT_COLOR_MODES, DEFAULT_BORDER_SIDES,
  DEFAULT_DOCUMENT_SETTINGS, mergeDocumentSettings,
  DEFAULT_SECTION_ORDER, mergeSectionOrder, PAGE_BREAK_KEY,
} from '../../models/profile.model';
import { htmlToPlainList } from '../../shared/utils/text';
import { SortableItem } from '../../shared/components/sortable-list/sortable-list.component';
import { DOC_LANGUAGES, DOC_DATE_FORMATS, PAGE_FORMATS, getLanguage, formatFullDate } from '../../models/document-i18n';
import { DropdownOption } from '../../shared/components/dropdown/dropdown.component';
import { NavItem } from '../../shared/components/side-nav/side-nav.component';
import { getSampleProfile, TEMPLATE_OPTIONS, TEMPLATE_PRESETS, TEMPLATE_HEADER_DEFAULTS } from '../../models/sample-profile';

type SectionKey =
  | 'company'
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

@Component({
  selector: 'app-application-editor',
  templateUrl: './application-editor.component.html',
  styleUrls: ['./application-editor.component.css'],
})
export class ApplicationEditorComponent implements OnInit {
  activeTab: 'content' | 'customize' = 'content';
  activeSection: SectionKey = 'company';

  sections: { key: SectionKey; label: string }[] = [
    { key: 'company', label: 'Company Details' },
    { key: 'basic', label: 'Basic Info' },
    { key: 'education', label: 'Education' },
    { key: 'competencies', label: 'Core Competencies' },
    { key: 'skills', label: 'Technical Skills' },
    { key: 'interests', label: 'Interests' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'languages', label: 'Languages' },
    { key: 'experience', label: 'Experience' },
    { key: 'social', label: 'Social Links' },
    { key: 'gdpr', label: 'GDPR Consent' },
  ];

  fontOptions = [
    { label: 'Segoe UI (Sans)', value: 'Segoe UI, sans-serif' },
    { label: 'DM Sans (Sans)', value: "'DM Sans', sans-serif" },
    { label: 'Inter (Sans)', value: "'Inter', sans-serif" },
    { label: 'Poppins (Sans)', value: "'Poppins', sans-serif" },
    { label: 'Montserrat (Sans)', value: "'Montserrat', sans-serif" },
    { label: 'Fira Sans (Sans)', value: "'Fira Sans', sans-serif" },
    { label: 'Verdana (Sans)', value: 'Verdana, sans-serif' },
    { label: 'Zilla Slab (Slab)', value: "'Zilla Slab', serif" },
    { label: 'Roboto Slab (Slab)', value: "'Roboto Slab', serif" },
    { label: 'Georgia (Serif)', value: 'Georgia, serif' },
    { label: 'Lora (Serif)', value: "'Lora', serif" },
    { label: 'Merriweather (Serif)', value: "'Merriweather', serif" },
    { label: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
    { label: 'Courier New (Mono)', value: 'Courier New, monospace' },
  ];

  advOpen = false;
  /** Links / Footer → Advanced Settings (open by default, like the reference) */
  linkAdvOpen = true;
  footerAdvOpen = true;
  footerField: 'left' | 'center' | 'right' = 'left';
  readonly footerPlaceholders = [
    { label: 'Name', token: '{{name}}' },
    { label: 'Phone', token: '{{phone}}' },
    { label: 'Email', token: '{{email}}' },
    { label: 'Pagenumbers', token: '{{page}} / {{pages}}' },
  ];
  /** insert a placeholder at the caret of the column that was edited last */
  insertPlaceholder(token: string) {
    const field = this.footerField;
    const el = document.getElementById('ft-' + field) as HTMLTextAreaElement | null;
    const cur: string = this.form.get('profile.footer.' + field)?.value || '';
    const start = el?.selectionStart ?? cur.length;
    const end = el?.selectionEnd ?? cur.length;
    this.pick('footer.' + field, cur.slice(0, start) + token + cur.slice(end));
    setTimeout(() => { if (el) { el.focus(); const pos = start + token.length; el.setSelectionRange(pos, pos); } });
  }

  nameFontOptions = [{ label: 'Same as body font', value: '' }, ...this.fontOptions];

  viewerOpen = false;

  /** Customize-tab sidebar — same shape ({key,label}) and same behaviour as `sections` in the Content tab */
  customizeSections: NavItem[] = [
    { key: 'document', label: 'Document' },
    { key: 'template', label: 'Templates' },
    { key: 'layout',   label: 'Layout' },
    { key: 'fontsize', label: 'Font Size' },
    { key: 'spacing',  label: 'Spacing' },
    { key: 'entries',  label: 'Entries' },
    { key: 'headings', label: 'Headings' },
    { key: 'font',     label: 'Font' },
    { key: 'colors',   label: 'Colors' },
    { key: 'header',   label: 'Header' },
    { key: 'links',    label: 'Links' },
    { key: 'footer',   label: 'Footer' },
    { key: 'sections', label: 'Sections' },
  ];
  activeCustomize = 'document';
  setCustomize(key: string) { this.activeCustomize = key; }

  // ── Customize → Sections ───────────────────────────────────────────────
  sectionsOpen = true;
  readonly skillStyles: { id: 'grid' | 'rows' | 'compact' | 'bubble' | 'level'; label: string }[] = [
    { id: 'grid', label: 'Grid' }, { id: 'rows', label: 'Rows' }, { id: 'compact', label: 'Compact' },
    { id: 'bubble', label: 'Bubble' }, { id: 'level', label: 'Level' },
  ];
  readonly skillColumnChoices = [1, 2, 3, 4];
  readonly compactSeps = [{ id: 'bullet', label: 'Bullet' }, { id: 'pipe', label: 'Pipe' }, { id: 'comma', label: 'Comma' }];
  readonly subinfoStyles = [{ id: 'colon', label: ': Colon' }, { id: 'dash', label: '– Dash' }, { id: 'bracket', label: '() Bracket' }];
  readonly levelStyles = [{ id: 'text', label: 'Text' }, { id: 'dots', label: 'Dots' }, { id: 'bar', label: 'Bar' }];

  private get tpl(): string { return this.form?.get('profile.template')?.value || 'template-one'; }
  /** effective values (own setting, else the template's built-in default) */
  get expOrder(): string { return this.form?.get('profile.sections.experience.titleOrder')?.value || TEMPLATE_EXP_ORDER[this.tpl] || 'jobEmployer'; }
  get eduOrder(): string { return this.form?.get('profile.sections.education.titleOrder')?.value || TEMPLATE_EDU_ORDER[this.tpl] || 'degreeSchool'; }
  get skillCols(): number { return this.form?.get('profile.sections.skills.columns')?.value || TEMPLATE_SKILL_COLS[this.tpl] || 1; }
  sec(path: string): any { return this.form?.get('profile.sections.' + path)?.value; }
  /** the Level style needs a level on at least one skill — skills have none yet, so show the hint */
  get noSkillLevels(): boolean { return true; }
  /** Languages card: options only appear once at least one language has a name */
  get hasLanguages(): boolean {
    return ((this.form?.get('profile.languages')?.value as any[]) ?? []).some((l) => l?.name?.trim());
  }

  // ── Customize → Document Settings ──────────────────────────────────────
  readonly languageOptions: DropdownOption[] = DOC_LANGUAGES.map((l) => ({ value: l.code, label: l.label }));
  readonly pageFormatOptions: DropdownOption[] = PAGE_FORMATS.map((p) => ({ value: p.code, label: p.label, sub: p.sub }));
  private dateOptsCache: { lang: string; opts: DropdownOption[] } | null = null;
  /** each date format with a live example (today's date, month names in the chosen language) */
  get dateFormatOptions(): DropdownOption[] {
    const lang = this.docLanguageCode;
    if (this.dateOptsCache?.lang !== lang) {
      const locale = getLanguage(lang).locale, now = new Date();
      this.dateOptsCache = {
        lang,
        opts: DOC_DATE_FORMATS.map((f) => ({ value: f.code, label: f.label, hint: formatFullDate(now, f.code, locale) })),
      };
    }
    return this.dateOptsCache.opts;
  }
  get docLanguageCode(): string {
    return this.form?.get('profile.documentSettings.language')?.value ?? DEFAULT_DOCUMENT_SETTINGS.language;
  }
  /** default heading text in the document language (what the resume shows until the user renames it) */
  private defaultLabel(key: keyof SectionLabels): string {
    return getLanguage(this.docLanguageCode).pack.labels[key] || DEFAULT_SECTION_LABELS[key];
  }

  // Quick-apply palette: sets whichever target (Full Page / Header / Border) is selected
  paletteColors = [
    '#455a64', '#546e7a', '#5b8a94', '#8fb3bb', '#2f8fae',
    '#2c5a7d', '#3b6fb0', '#5a8fc7', '#4aa3df', '#7fd0f5',
    '#3d1a78', '#6b2d5c', '#c0648b', '#c7407a', '#f0566b',
  ];

  /** Section Heading "Style" tiles (0-7) */
  headingStyles = [0, 1, 2, 3, 4, 5, 6, 7];

  /** Colors → which part of the page the palette paints */
  colorTargets: { id: 'fullPage' | 'header' | 'border'; label: string }[] = [
    { id: 'fullPage', label: 'Full Page' },
    { id: 'header', label: 'Header' },
    { id: 'border', label: 'Border' },
  ];

  // ── Customize → Layout → Change Section Layout ───────────────────────────
  /** rows of the reorder list; headings follow what the user typed in Content (sectionLabels) */
  get layoutItems(): SortableItem[] {
    const lbl = (k: keyof SectionLabels, fallback: string) =>
      (this.form.get('profile.sectionLabels.' + k)?.value as string)?.trim() || fallback;
    return [
      { key: 'aboutMe',          label: lbl('aboutMe', 'About Me') },
      { key: 'experience',       label: lbl('experience', 'Experience') },
      { key: 'education',        label: lbl('education', 'Education') },
      { key: 'technicalSkills',  label: lbl('technicalSkills', 'Technical Skills') },
      { key: 'coreCompetencies', label: lbl('coreCompetencies', 'Core Competencies') },
      { key: 'certificates',     label: lbl('certificates', 'Certificates') },
      { key: 'languages',        label: lbl('languages', 'Languages') },
      { key: 'interests',        label: lbl('interests', 'Interests') },
      { key: 'declaration',      label: 'Declaration' },
      { key: PAGE_BREAK_KEY,     label: 'Page break', dashed: true },
    ];
  }
  get sectionOrder(): string[] { return mergeSectionOrder(this.form.get('profile.sectionOrder')?.value); }
  setSectionOrder(order: string[]) { this.pick('sectionOrder', mergeSectionOrder(order)); }
  resetSectionOrder() { this.pick('sectionOrder', [...DEFAULT_SECTION_ORDER]); }
  get isDefaultOrder(): boolean { return this.sectionOrder.every((k, i) => k === DEFAULT_SECTION_ORDER[i]); }

  /** Shortcuts used by the Customize panel templates */
  is(path: string, value: unknown): boolean {
    return this.form.get('profile.' + path)?.value === value;
  }
  /** Entry Layout → Advanced Settings */
  entryAdvOpen = false;
  readonly entryTextStyles: { id: 'normal' | 'bold' | 'italic'; cls: string }[] = [
    { id: 'normal', cls: '' }, { id: 'bold', cls: 'b' }, { id: 'italic', cls: 'i' },
  ];
  get entryLeftWidth(): number {
    return this.form.get('profile.entryLayout.leftColumnWidth')?.value ?? DEFAULT_ENTRY_LAYOUT.leftColumnWidth;
  }
  readonly entryColMin = ENTRY_COL_MIN;
  readonly entryColMax = ENTRY_COL_MAX;
  readonly entryWidthStep = 5;
  /** delta is applied to the LEFT column; the right column is always 100 - left */
  nudgeEntryWidth(delta: number) {
    const next = Math.min(ENTRY_COL_MAX, Math.max(ENTRY_COL_MIN, Math.round(this.entryLeftWidth + delta)));
    this.pick('entryLayout.leftColumnWidth', next);
  }
  pick(path: string, value: unknown) {
    const c = this.form.get('profile.' + path);
    c?.setValue(value);
    c?.markAsDirty();
  }

  get targetField(): string {
    const target = this.form.get('profile.colorTarget')?.value;
    return target === 'fullPage' ? 'bgColor' : target === 'border' ? 'borderColor' : 'primaryColor';
  }
  get colorTarget(): ColorTarget { return this.form?.get('profile.colorTarget')?.value || 'header'; }
  /** Single / Multi / Image choice of the selected target (remembered per target) */
  get currentMode(): ColorMode { return this.form?.get('profile.colorModes.' + this.colorTarget)?.value || 'single'; }
  /** the Border target has no "Multi" tile (same as the reference) */
  get modeOptions(): { id: ColorMode; label: string }[] {
    const all: { id: ColorMode; label: string }[] = [
      { id: 'single', label: 'Single' }, { id: 'multi', label: 'Multi' }, { id: 'image', label: 'Image' },
    ];
    return this.colorTarget === 'border' ? all.filter((m) => m.id !== 'multi') : all;
  }
  setMode(m: ColorMode) {
    this.pick('colorModes.' + this.colorTarget, m);
    this.pick('colorMode', m);
    if (this.colorTarget === 'header') this.pick('headerColorSet', true);
  }
  setTarget(t: ColorTarget) {
    this.pick('colorTarget', t);
    this.customOpen = false;
  }
  /** colour currently applied to the selected target (drives the tick mark) */
  get activeColor(): string {
    return this.form?.get('profile.' + this.targetField)?.value ?? '';
  }
  get customPickerValue(): string {
    const v = this.activeColor;
    return /^#[0-9a-f]{6}$/i.test(v) ? v : '#6366f1';
  }

  applyPaletteColor(color: string) {
    this.pick(this.targetField, color);
    if (this.colorTarget === 'header') this.pick('headerColorSet', true);
    if (this.currentMode !== 'single') this.setMode('single');
  }
  /** the small "Header Color" circle in the footer row */
  markHeaderSet() { this.pick('headerColorSet', true); }

  // ── Multi: text + background (+ accent) combos, like the reference tiles ──
  customOpen = false;
  multiPresets = [
    { text: '#1a1a2e', bg: '#f0566b', accent: '#c7407a' },
    { text: '#111827', bg: '#7fd0f5', accent: '#2c5a7d' },
    { text: '#0b2a33', bg: '#2f8fae', accent: '#ffffff' },
    { text: '#2b0a1f', bg: '#c7407a', accent: '#ffe4ef' },
    { text: '#ffffff', bg: '#1b3448', accent: '#fbbf24' },
    { text: '#f8fafc', bg: '#111827', accent: '#38bdf8' },
  ];
  /** left half of a combo tile: white, or grey when the preset text is light (so the "T" stays visible) */
  tileBg(text: string): string {
    const m = /^#([0-9a-f]{6})$/i.exec(text);
    if (!m) return '#fff';
    const n = parseInt(m[1], 16);
    const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.7 ? '#9ca3af' : '#fff';
  }
  isMultiActive(p: { text: string; bg: string }): boolean {
    const bg = this.form?.get('profile.' + this.targetField)?.value;
    const tx = this.form?.get('profile.' + this.textField)?.value;
    return bg === p.bg && tx === p.text;
  }
  get textField(): string { return this.colorTarget === 'header' ? 'headerTextColor' : 'textColor'; }
  applyMulti(p: { text: string; bg: string; accent: string }) {
    this.pick(this.targetField, p.bg);
    this.pick(this.textField, p.text);
    this.pick('accentColor', p.accent);
    if (this.colorTarget === 'header') this.pick('headerColorSet', true);
  }
  /** Text colour circle in the Custom row (Full Page → textColor, Header → headerTextColor) */
  get textControl(): string { return 'profile.' + this.textField; }
  get bgControl(): string { return 'profile.' + this.targetField; }

  // ── Image: built-in pictures + upload from device ─────────────────────────
  private static svgUri(body: string): string {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'>${body}</svg>`);
  }
  private static grad(a: string, b: string, extra = ''): string {
    return ApplicationEditorComponent.svgUri(
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='600' height='800' fill='url(#g)'/>${extra}`);
  }
  readonly imageChoices: { label: string; url: string }[] = [
    { label: 'Ocean',   url: ApplicationEditorComponent.grad('#0f2c5c', '#2bb3c0') },
    { label: 'Sunset',  url: ApplicationEditorComponent.grad('#f0566b', '#fbbf24') },
    { label: 'Forest',  url: ApplicationEditorComponent.grad('#0b3d2e', '#5fae7a') },
    { label: 'Violet',  url: ApplicationEditorComponent.grad('#3d1a78', '#c0648b') },
    { label: 'Night',   url: ApplicationEditorComponent.grad('#0b1020', '#334155') },
    { label: 'Blush',   url: ApplicationEditorComponent.grad('#fde2e4', '#fad2e1') },
    { label: 'Triangles', url: ApplicationEditorComponent.grad('#1e3a5f', '#0f172a',
      "<g opacity='.35'><polygon points='0,0 300,0 0,400' fill='#38bdf8'/><polygon points='600,800 600,400 200,800' fill='#fbbf24'/><polygon points='600,0 600,300 350,0' fill='#f0566b'/></g>") },
    { label: 'Circles', url: ApplicationEditorComponent.grad('#fff7ed', '#ffe4d6',
      "<g fill='#f97316' opacity='.22'><circle cx='90' cy='120' r='80'/><circle cx='520' cy='260' r='120'/><circle cx='200' cy='640' r='140'/><circle cx='540' cy='720' r='60'/></g>") },
    { label: 'Stripes', url: ApplicationEditorComponent.svgUri(
      "<rect width='600' height='800' fill='#0f172a'/><g stroke='#38bdf8' stroke-width='18' opacity='.35'><path d='M-100 100 L700 900 M-100 300 L500 900 M-100 500 L300 900 M100 -100 L700 500 M300 -100 L700 300'/></g>") },
  ];
  get currentImage(): string { return this.form?.get('profile.' + this.imageField)?.value || ''; }
  private get imageField(): string {
    return this.colorTarget === 'fullPage' ? 'pageImage' : this.colorTarget === 'header' ? 'headerImage' : 'borderImage';
  }
  pickImage(url: string) {
    this.pick(this.imageField, url);
    if (this.colorTarget === 'header') this.pick('headerColorSet', true);
  }
  clearImage() { this.pick(this.imageField, ''); }
  onImageUpload(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1100;
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        this.pickImage(c.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ── Border: size S / M / L ─────────────────────────────────────────────────
  readonly borderSizes = ['S', 'M', 'L'];
  readonly borderSideList: { id: 'top' | 'bottom' | 'right' | 'left'; label: string }[] = [
    { id: 'top', label: 'Top' }, { id: 'bottom', label: 'Bottom' }, { id: 'right', label: 'Right' }, { id: 'left', label: 'Left' },
  ];


  // Each entry: label shown as tooltip, shape key for CSS class, preview SVG path
  iconStyles = [
    { key: 'plain',     label: 'Plain' },
    { key: 'circle',    label: 'Filled circle' },
    { key: 'rounded',   label: 'Filled rounded square' },
    { key: 'square',    label: 'Filled square' },
    { key: 'o-circle',  label: 'Outline circle' },
    { key: 'o-rounded', label: 'Outline rounded square' },
    { key: 'o-square',  label: 'Outline square' },
  ];

  // ── Header panel ──────────────────────────────────────────────────────────
  /** Details Arrangement: 1 per line / items in a row / two columns */
  setArrangement(a: 'stacked' | 'inline' | 'columns') {
    this.pick('detailsArrangement', a);
    const sep = this.form.get('profile.detailsSeparator')?.value;
    if (a !== 'inline' && (sep === 'bullet' || sep === 'bar')) this.pick('detailsSeparator', 'icon');
  }
  /** Icon / Bullet / Bar make sense only when the details run in a row; otherwise Icon / None */
  get separatorOptions(): { id: string; label: string }[] {
    return this.is('detailsArrangement', 'inline')
      ? [{ id: 'icon', label: 'Icon' }, { id: 'bullet', label: 'Bullet' }, { id: 'bar', label: 'Bar' }]
      : [{ id: 'icon', label: 'Icon' }, { id: 'none', label: 'None' }];
  }
  get iconStyleIdx(): number {
    const v = Number(this.form?.get('profile.iconStyle')?.value ?? 0);
    return v >= 0 && v < this.iconStyles.length ? v : 0;
  }


  // Single-accent templates (Classic, Modern) - sidebar/base stays fixed, only accent changes
  singleColorPresets = [
    { accent: '#4f46e5', label: 'Indigo' },
    { accent: '#16a34a', label: 'Green' },
    { accent: '#dc2626', label: 'Red' },
    { accent: '#0ea5e9', label: 'Sky' },
    { accent: '#db2777', label: 'Pink' },
    { accent: '#ea580c', label: 'Orange' },
  ];

  // Two-color template (Elegant) - sidebar/primary + accent both change together as a combo
  twoColorPresets = [
    { primary: '#0f172a', accent: '#fbbf24', label: 'Navy & Gold' },
    { primary: '#1e293b', accent: '#2dd4bf', label: 'Charcoal & Teal' },
    { primary: '#3f0d12', accent: '#fca5a5', label: 'Maroon & Blush' },
    { primary: '#111827', accent: '#38bdf8', label: 'Slate & Sky' },
    { primary: '#312e81', accent: '#f9a8d4', label: 'Indigo & Rose' },
  ];

  // Fake sample data mate template gallery thumbnails - user na real data nathi vaprata
  // Gallery: the 6 designs, each rendered with its own sample data
  templateOptions = TEMPLATE_OPTIONS.map((t) => ({ ...t, sample: getSampleProfile(t.id) }));
  readonly levelOptions = [
    { value: 0, label: 'No dots' },
    { value: 1, label: '1 – Basic' },
    { value: 2, label: '2' },
    { value: 3, label: '3 – Intermediate' },
    { value: 4, label: '4' },
    { value: 5, label: '5 – Native' },
  ];

  form!: FormGroup;
  editingId: string | null = null;
  saving = false;
  loading = true;
  errorMsg = '';

  // Edit Heading popup state
  editingHeadingKey: keyof SectionLabels | null = null;
  editingHeadingIconVisible = false;
  tempHeadingText = '';
  tempIconName = '';

  // Default icon list shown in the popup (as Lucide-like SVG symbol names we inline)
  headingIcons = SECTION_ICON_NAMES;

  // Section key -> default label mapping (for display)
  readonly DEFAULT_SECTION_LABELS = DEFAULT_SECTION_LABELS;

  // Which sections can have their heading edited (maps to sectionLabels keys)
  sectionLabelKeys: Partial<Record<SectionKey, keyof SectionLabels>> = {
    basic: 'aboutMe',
    education: 'education',
    competencies: 'coreCompetencies',
    skills: 'technicalSkills',
    interests: 'interests',
    certificates: 'certificates',
    languages: 'languages',
    experience: 'experience',
    social: 'links',
  };

  constructor(
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editingId = this.route.snapshot.paramMap.get('id');
    this.buildForm();
    this.loadData();
  }

  private buildForm() {
    this.form = this.fb.group({
      company: this.fb.group({
        companyName: ['', Validators.required],
        appliedTitle: ['', Validators.required],
        applyDate: ['', Validators.required],
        location: [''],
        status: ['Applied', Validators.required],
      }),
      profile: this.fb.group({
        fullName: ['', Validators.required],
        professionalTitle: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        location: [''],
        aboutMe: [''],
        photo: [''],
        gdprConsent: [DEFAULT_GDPR_CONSENT],
        template: ['template-one'],
        font: ['Segoe UI, sans-serif'],
        headerAlign: ['left'],
        detailsArrangement: ['stacked'],
        detailsSeparator: ['icon'],
        iconStyle: [0],
        nameStyle: ['bold'],
        titleStyle: ['normal'],
        titlePosition: ['below'],
        primaryColor: ['#111827'],
        accentColor: ['#4f46e5'],
        bgColor: ['#ffffff'],
        borderColor: ['transparent'],
        colorTarget: ['header'],
        colorMode: ['single'],
        colorModes: this.fb.group({
          fullPage: [DEFAULT_COLOR_MODES.fullPage], header: [DEFAULT_COLOR_MODES.header], border: [DEFAULT_COLOR_MODES.border],
        }),
        textColor: ['#111827'],
        headerTextColor: ['#ffffff'],
        headerColorSet: [false],
        pageImage: [''],
        headerImage: [''],
        borderImage: [''],
        borderSize: ['S'],
        borderSides: this.fb.group({
          top: [true], bottom: [true], left: [true], right: [true],
        }),
        nameFont: [''],
        sectionOrder: [[...DEFAULT_SECTION_ORDER]],
        fontSize: this.fb.group({
          base: [DEFAULT_FONT_SIZE.base], fullName: [DEFAULT_FONT_SIZE.fullName],
          title: [DEFAULT_FONT_SIZE.title], sectionHeadings: [DEFAULT_FONT_SIZE.sectionHeadings],
          entryHeader: [DEFAULT_FONT_SIZE.entryHeader],
        }),
        spacing: this.fb.group({
          lineHeight: [DEFAULT_SPACING.lineHeight], elementSpacing: [DEFAULT_SPACING.elementSpacing],
          sideMargin: [DEFAULT_SPACING.sideMargin], topBottomMargin: [DEFAULT_SPACING.topBottomMargin],
        }),
        entryLayout: this.fb.group({
          structure: [DEFAULT_ENTRY_LAYOUT.structure], dateLocationPosition: [DEFAULT_ENTRY_LAYOUT.dateLocationPosition],
          subtitlePlacement: [DEFAULT_ENTRY_LAYOUT.subtitlePlacement],
          columnWidthMode: [DEFAULT_ENTRY_LAYOUT.columnWidthMode], leftColumnWidth: [DEFAULT_ENTRY_LAYOUT.leftColumnWidth],
          subtitleStyle: [DEFAULT_ENTRY_LAYOUT.subtitleStyle], dateStyle: [DEFAULT_ENTRY_LAYOUT.dateStyle],
          locationStyle: [DEFAULT_ENTRY_LAYOUT.locationStyle], indentBody: [DEFAULT_ENTRY_LAYOUT.indentBody],
          listStyle: [DEFAULT_ENTRY_LAYOUT.listStyle], dateLocationOrder: [DEFAULT_ENTRY_LAYOUT.dateLocationOrder],
        }),
        headingStyle: this.fb.group({
          style: [DEFAULT_HEADING_STYLE.style], capitalization: [DEFAULT_HEADING_STYLE.capitalization],
          icons: [DEFAULT_HEADING_STYLE.icons],
        }),
        accentApply: this.fb.group({
          name: [false], jobTitle: [false], headings: [false], headingsLine: [true], headerIcons: [false],
          dots: [false], dates: [false], entryTitle: [false], entrySubtitle: [false], linkIcons: [false],
        }),
        linkStyling: this.fb.group({
          underline: [DEFAULT_LINK_STYLING.underline], blueColor: [DEFAULT_LINK_STYLING.blueColor],
          icon: [DEFAULT_LINK_STYLING.icon],
          headerEmail: [DEFAULT_LINK_STYLING.headerEmail], headerPhone: [DEFAULT_LINK_STYLING.headerPhone],
          headerLinkedin: [DEFAULT_LINK_STYLING.headerLinkedin],
        }),
        footer: this.fb.group({
          pageNumbers: [false], email: [false], name: [false],
          custom: [false], left: [''], center: [''], right: [''],
        }),
        documentSettings: this.fb.group({
          language: [DEFAULT_DOCUMENT_SETTINGS.language],
          dateFormat: [DEFAULT_DOCUMENT_SETTINGS.dateFormat],
          pageFormat: [DEFAULT_DOCUMENT_SETTINGS.pageFormat],
        }),
        sections: this.fb.group({
          summary: this.fb.group({ inHeader: [DEFAULT_SECTIONS.summary.inHeader], showHeading: [DEFAULT_SECTIONS.summary.showHeading] }),
          experience: this.fb.group({ titleOrder: [DEFAULT_SECTIONS.experience.titleOrder], groupPromotions: [DEFAULT_SECTIONS.experience.groupPromotions] }),
          education: this.fb.group({ titleOrder: [DEFAULT_SECTIONS.education.titleOrder] }),
          languages: this.fb.group({ style: [DEFAULT_SECTIONS.languages.style] }),
          declaration: this.fb.group({ showHeading: [DEFAULT_SECTIONS.declaration.showHeading], position: [DEFAULT_SECTIONS.declaration.position] }),
          skills: this.fb.group({
            style: [DEFAULT_SECTIONS.skills.style], columns: [DEFAULT_SECTIONS.skills.columns],
            rowSpacing: [DEFAULT_SECTIONS.skills.rowSpacing], rowBullets: [DEFAULT_SECTIONS.skills.rowBullets],
            compactSep: [DEFAULT_SECTIONS.skills.compactSep], subinfo: [DEFAULT_SECTIONS.skills.subinfo],
            levelStyle: [DEFAULT_SECTIONS.skills.levelStyle],
          }),
        }),
        education: this.fb.array([this.createEducationGroup()]),
        coreCompetencies: this.fb.array([this.fb.control('')]),
        technicalSkills: this.fb.array([this.createSkillGroup()]),
        interests: this.fb.array([this.fb.control('')]),
        certificates: this.fb.array([this.fb.control('')]),
        languages: this.fb.array([this.createLanguageGroup()]),
        experience: this.fb.array([this.createExperienceGroup()]),
        socialLinks: this.fb.group({
          linkedin: [''],
          github: [''],
          portfolio: [''],
          twitter: [''],
        }),
        sectionLabels: this.fb.group({
          education: [DEFAULT_SECTION_LABELS.education],
          coreCompetencies: [DEFAULT_SECTION_LABELS.coreCompetencies],
          technicalSkills: [DEFAULT_SECTION_LABELS.technicalSkills],
          interests: [DEFAULT_SECTION_LABELS.interests],
          experience: [DEFAULT_SECTION_LABELS.experience],
          aboutMe: [DEFAULT_SECTION_LABELS.aboutMe],
          links: [DEFAULT_SECTION_LABELS.links],
          certificates: [DEFAULT_SECTION_LABELS.certificates],
          languages: [DEFAULT_SECTION_LABELS.languages],
        }),
        sectionIcons: this.fb.group(
          Object.fromEntries(
            (Object.keys(DEFAULT_SECTION_ICONS) as (keyof SectionLabels)[]).map((k) => [
              k,
              this.fb.group({
                name: [DEFAULT_SECTION_ICONS[k].name],
                visible: [DEFAULT_SECTION_ICONS[k].visible],
              }),
            ])
          )
        ),
      }),
    });
  }

  private loadData() {
    if (this.editingId) {
      this.applicationService.getApplicationById(this.editingId).subscribe({
        next: (app) => {
          const { profile, ...company } = app;
          this.form.get('company')?.patchValue(company);
          if (profile) {
            // each application keeps its OWN cv (template, colours, fonts...)
            this.patchProfile(profile);
            this.loading = false;
          } else {
            // old application saved before snapshots existed -> fall back to the shared profile
            this.loadBaseProfile(() => (this.loading = false));
          }
        },
        error: () => {
          this.errorMsg = 'Application not found.';
          this.loading = false;
        },
      });
    } else {
      // new application: template must be chosen first (template-select page)
      const tpl = this.route.snapshot.queryParamMap.get('template') as TemplateId | null;
      if (!tpl) {
        this.router.navigate(['/applications/select-template']);
        return;
      }
      // prefill content from the user's last profile, then apply the chosen template look
      this.loadBaseProfile(() => {
        this.onTemplatePick(tpl);
        this.loading = false;
      });
    }
  }

  private loadBaseProfile(done?: () => void) {
    this.profileService.getMyProfile().subscribe({
      next: (profile) => { this.patchProfile(profile); done?.(); },
      error: () => { /* naya user - fresh profile form rehse */ done?.(); },
    });
  }

  private patchProfile(profile: Profile) {
    const profileGroup = this.form.get('profile') as FormGroup;
    profileGroup.patchValue({
      fullName: profile.fullName,
      professionalTitle: profile.professionalTitle,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      aboutMe: profile.aboutMe,
      photo: profile.photo || '',
      gdprConsent: profile.gdprConsent ?? DEFAULT_GDPR_CONSENT,
      template: profile.template || 'template-one',
      font: profile.font || 'Segoe UI, sans-serif',
      headerAlign: profile.headerAlign || 'left',
      detailsArrangement: profile.detailsArrangement || 'stacked',
      detailsSeparator: profile.detailsSeparator || 'icon',
      iconStyle: profile.iconStyle != null && profile.iconStyle >= 0 && profile.iconStyle <= 6 ? profile.iconStyle : 0,
      nameStyle: profile.nameStyle || 'bold',
      titleStyle: profile.titleStyle || 'normal',
      titlePosition: profile.titlePosition || 'below',
      primaryColor: profile.primaryColor || '#111827',
      accentColor: profile.accentColor || '#4f46e5',
      bgColor: profile.bgColor || '#ffffff',
      borderColor: profile.borderColor || 'transparent',
      colorTarget: profile.colorTarget || 'header',
      colorMode: profile.colorMode || 'single',
      textColor: profile.textColor || '#111827',
      headerTextColor: profile.headerTextColor || '#ffffff',
      headerColorSet: !!profile.headerColorSet,
      pageImage: profile.pageImage || '',
      headerImage: profile.headerImage || '',
      borderImage: profile.borderImage || '',
      borderSize: profile.borderSize || 'S',
      nameFont: profile.nameFont || '',
      sectionOrder: mergeSectionOrder(profile.sectionOrder),
      socialLinks: profile.socialLinks,
    });
    if (profile.fontSize) (this.form.get('profile.fontSize') as FormGroup).patchValue(profile.fontSize);
    if (profile.spacing) (this.form.get('profile.spacing') as FormGroup).patchValue(profile.spacing);
    if (profile.entryLayout) (this.form.get('profile.entryLayout') as FormGroup).patchValue(profile.entryLayout);
    if (profile.headingStyle) (this.form.get('profile.headingStyle') as FormGroup).patchValue(profile.headingStyle);
    (this.form.get('profile.colorModes') as FormGroup).patchValue({ ...DEFAULT_COLOR_MODES, ...(profile.colorModes ?? {}) });
    (this.form.get('profile.borderSides') as FormGroup).patchValue({ ...DEFAULT_BORDER_SIDES, ...(profile.borderSides ?? {}) });
    if (profile.accentApply) (this.form.get('profile.accentApply') as FormGroup).patchValue(profile.accentApply);
    (this.form.get('profile.linkStyling') as FormGroup).patchValue({ ...DEFAULT_LINK_STYLING, ...(profile.linkStyling ?? {}) });
    (this.form.get('profile.footer') as FormGroup).patchValue({ ...DEFAULT_FOOTER, ...(profile.footer ?? {}) });
    (this.form.get('profile.sections') as FormGroup).patchValue(mergeSections(profile.sections));
    (this.form.get('profile.documentSettings') as FormGroup).patchValue(mergeDocumentSettings(profile.documentSettings));

    this.setArray('education', profile.education, () => this.createEducationGroup());
    // Back-fill startDate/endDate from legacy "duration" string (e.g. "2014 - 2016")
    profile.education?.forEach((edu, i) => {
      if (!edu.startDate && !edu.endDate && edu.duration) {
        const parts = edu.duration.split(/\s*[-–]\s*/);
        if (parts.length >= 2) {
          this.form.get(`profile.education.${i}.startDate`)?.setValue(parts[0].trim());
          this.form.get(`profile.education.${i}.endDate`)?.setValue(parts[1].trim());
        }
      }
    });
    // skills are plain text: clean any HTML saved by the old rich-text skills field
    this.setArray('technicalSkills',
      (profile.technicalSkills ?? []).map((g) => ({ ...g, items: htmlToPlainList(g.items) })),
      () => this.createSkillGroup());
    this.setArray('experience', profile.experience, () => this.createExperienceGroup());
    // old saved data: present = true -> show "Present" in End Date
    profile.experience?.forEach((exp, i) => {
      if (exp.present) this.form.get(`profile.experience.${i}.endDate`)?.setValue('Present');
    });
    this.setSimpleArray('coreCompetencies', profile.coreCompetencies);
    this.setSimpleArray('interests', profile.interests);
    this.setSimpleArray('certificates', profile.certificates || []);
    this.setArray('languages', profile.languages || [], () => this.createLanguageGroup());

    // Patch section labels if saved
    if (profile.sectionLabels) {
      const labelsGroup = this.form.get('profile.sectionLabels') as FormGroup;
      labelsGroup.patchValue(profile.sectionLabels);
    }
    if (profile.sectionIcons) {
      (this.form.get('profile.sectionIcons') as FormGroup).patchValue(profile.sectionIcons);
    }
  }

  private setArray(name: string, items: any[], factory: () => FormGroup) {
    const arr = this.form.get(`profile.${name}`) as FormArray;
    arr.clear();
    (items && items.length ? items : [{}]).forEach((item) => {
      const group = factory();
      group.patchValue(item);
      arr.push(group);
    });
  }

  private setSimpleArray(name: string, items: string[]) {
    const arr = this.form.get(`profile.${name}`) as FormArray;
    arr.clear();
    (items && items.length ? items : ['']).forEach((val) => arr.push(this.fb.control(val)));
  }

  // ---------- FormArray getters ----------
  get education() {
    return this.form.get('profile.education') as FormArray;
  }
  get coreCompetencies() {
    return this.form.get('profile.coreCompetencies') as FormArray;
  }
  get technicalSkills() {
    return this.form.get('profile.technicalSkills') as FormArray;
  }
  get interests() {
    return this.form.get('profile.interests') as FormArray;
  }
  get certificates() {
    return this.form.get('profile.certificates') as FormArray;
  }
  get languages() {
    return this.form.get('profile.languages') as FormArray;
  }
  get experience() {
    return this.form.get('profile.experience') as FormArray;
  }

  // ---------- Group factories ----------
  private createEducationGroup(): FormGroup {
    const group = this.fb.group({
      degree: [''],
      institute: [''],
      instituteUrl: [''],
      startDate: [''],
      endDate: [''],
      location: [''],
      score: [''],
      // computed duration kept for template display
      duration: [''],
      description: [''],
    });
    // keep "duration" (e.g. "2014 - 2016") in sync for the resume
    const setDuration = () => {
      const start = group.value.startDate || '';
      const end = group.value.endDate || '';
      group.get('duration')?.setValue(start && end ? `${start} - ${end}` : start || end, { emitEvent: false });
    };
    group.get('startDate')?.valueChanges.subscribe(setDuration);
    group.get('endDate')?.valueChanges.subscribe(setDuration);
    return group;
  }
  private createLanguageGroup(): FormGroup {
    return this.fb.group({ name: [''], level: [0] });
  }
  private createSkillGroup(): FormGroup {
    return this.fb.group({ category: [''], items: [''] });
  }
  private createExperienceGroup(): FormGroup {
    const group = this.fb.group({
      role: [''],
      company: [''],
      location: [''],
      startDate: [''],
      endDate: [''],
      present: [false],
      description: [''],
    });
    // "Present" now lives inside the End Date picker -> keep the old `present` flag in sync
    group.get('endDate')?.valueChanges.subscribe((v) =>
      group.get('present')?.setValue(v === 'Present', { emitEvent: false }));
    return group;
  }

  // ---------- Add / Remove dynamic rows ----------
  addEducation() { this.education.push(this.createEducationGroup()); }

  // Formatting handled by app-rich-editor component
  removeEducation(i: number) { this.education.removeAt(i); }

  // Alignment + About Me formatting handled by app-rich-editor component

  addCompetency() { this.coreCompetencies.push(this.fb.control('')); }
  removeCompetency(i: number) { this.coreCompetencies.removeAt(i); }

  addSkillGroup() { this.technicalSkills.push(this.createSkillGroup()); }
  removeSkillGroup(i: number) { this.technicalSkills.removeAt(i); }

  addInterest() { this.interests.push(this.fb.control('')); }
  removeInterest(i: number) { this.interests.removeAt(i); }

  addCertificate() { this.certificates.push(this.fb.control('')); }
  removeCertificate(i: number) { this.certificates.removeAt(i); }

  addLanguage() { this.languages.push(this.createLanguageGroup()); }
  removeLanguage(i: number) { this.languages.removeAt(i); }

  addExperience() { this.experience.push(this.createExperienceGroup()); }
  removeExperience(i: number) { this.experience.removeAt(i); }

  resetGdprConsent() {
    this.form.get('profile.gdprConsent')?.setValue(DEFAULT_GDPR_CONSENT);
  }

  // ---- Edit Heading popup ----
  openEditHeading(labelKey: keyof SectionLabels) {
    this.editingHeadingKey = labelKey;
    this.tempHeadingText = this.getCurrentHeadingValue(labelKey);
    const ic = this.form.get(`profile.sectionIcons.${labelKey}`)?.value;
    this.tempIconName = ic?.name || DEFAULT_SECTION_ICONS[labelKey].name;
    this.editingHeadingIconVisible = !!ic?.visible;
  }

  // Click on an icon in the popup -> select it and make it visible
  selectHeadingIcon(name: string) {
    this.tempIconName = name;
    this.editingHeadingIconVisible = true;
  }

  toggleHeadingIcon() {
    this.editingHeadingIconVisible = !this.editingHeadingIconVisible;
  }

  /** Icon to show in the small heading row of the editor (eye-off when hidden) */
  getCurrentIcon(labelKey: keyof SectionLabels): string {
    const ic = this.form.get(`profile.sectionIcons.${labelKey}`)?.value;
    return ic?.visible && ic.name ? ic.name : 'eye-off';
  }

  closeEditHeading() {
    this.editingHeadingKey = null;
  }

  confirmEditHeading() {
    if (this.editingHeadingKey) {
      // text equal to the language default is stored as the English default → keeps following Language
      const typed = this.tempHeadingText.trim();
      const val = !typed || typed === this.defaultLabel(this.editingHeadingKey)
        ? DEFAULT_SECTION_LABELS[this.editingHeadingKey] : typed;
      this.form.get(`profile.sectionLabels.${this.editingHeadingKey}`)?.setValue(val);
      this.form.get(`profile.sectionIcons.${this.editingHeadingKey}`)?.setValue({
        name: this.tempIconName || DEFAULT_SECTION_ICONS[this.editingHeadingKey].name,
        visible: this.editingHeadingIconVisible,
      });
    }
    this.closeEditHeading();
  }

  resetHeadingToDefault() {
    if (this.editingHeadingKey) {
      this.tempHeadingText = this.defaultLabel(this.editingHeadingKey);
    }
  }

  getSectionLabelKey(): keyof SectionLabels | null {
    return this.sectionLabelKeys[this.activeSection] ?? null;
  }

  getCurrentHeadingValue(labelKey: keyof SectionLabels): string {
    const v = (this.form.get(`profile.sectionLabels.${labelKey}`)?.value || '').trim();
    return !v || v === DEFAULT_SECTION_LABELS[labelKey] ? this.defaultLabel(labelKey) : v;
  }

  // ---------- Tabs / Sections ----------
  setTab(tab: 'content' | 'customize') {
    this.activeTab = tab;
  }

  setSection(key: SectionKey) {
    this.activeSection = key;
  }

  // ---------- Live preview data ----------
  get previewProfile(): Profile {
    return this.form.get('profile')?.value as Profile;
  }

  get isTwoColorTemplate(): boolean {
    return ['template-three', 'template-five', 'template-seven', 'template-nine'].includes(this.form?.get('profile.template')?.value);
  }

  get mainColorLabel(): string {
    return this.form?.get('profile.template')?.value === 'template-three' ? 'Sidebar Color' : 'Header Color';
  }

  /** Pick a design: apply its font / colours so the preview looks exactly like the gallery card. */
  onTemplatePick(id: TemplateId) {
    const group = this.form.get('profile') as FormGroup;
    const prev = (group.get('template')?.value || 'template-one') as TemplateId;
    const preset = TEMPLATE_PRESETS[id];
    group.patchValue({
      template: id,
      font: preset.font,
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      headerColorSet: false,
      ...TEMPLATE_HEADER_DEFAULTS[id],
    });
    (group.get('colorModes.header') as any)?.setValue('single');
    if (!['stacked','inline'].includes(TEMPLATE_HEADER_DEFAULTS[id].detailsArrangement) || TEMPLATE_HEADER_DEFAULTS[id].detailsArrangement !== 'inline') {
      const sep = group.get('detailsSeparator')?.value;
      if (sep === 'bullet' || sep === 'bar') group.get('detailsSeparator')?.setValue('icon');
    }
    // heading icons are part of the Executive look – only touch them when crossing that boundary
    if (preset.icons !== TEMPLATE_PRESETS[prev]?.icons) {
      const icons = group.get('sectionIcons') as FormGroup;
      Object.keys(icons.controls).forEach((k) => icons.get(`${k}.visible`)?.setValue(preset.icons));
    }
  }

  // ---------- Photo (resized in the browser so the saved profile stays small) ----------
  onPhotoSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 320;
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        this.form.get('profile.photo')?.setValue(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.form.get('profile.photo')?.setValue('');
  }

  get colorPresets() {
    return this.isTwoColorTemplate ? this.twoColorPresets : this.singleColorPresets;
  }

  applyPreset(preset: { primary?: string; accent: string }) {
    const profileGroup = this.form.get('profile') as FormGroup;
    if (preset.primary) {
      profileGroup.get('primaryColor')?.setValue(preset.primary);
    }
    profileGroup.get('accentColor')?.setValue(preset.accent);
  }

  // ---------- Save ----------
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Please fill all required fields (Company Details & Basic Info).';
      return;
    }

    this.saving = true;
    this.errorMsg = '';

    const companyData = this.form.get('company')?.value;
    const profileData = this.form.get('profile')?.value;
    // store the CV (with its template) INSIDE the application, so applications don't overwrite each other
    const applicationPayload = { ...companyData, profile: profileData };

    this.profileService.saveProfile(profileData).subscribe({
      next: () => {
        const request$ = this.editingId
          ? this.applicationService.updateApplication(this.editingId, applicationPayload)
          : this.applicationService.createApplication(applicationPayload);

        request$.subscribe({
          next: () => {
            this.saving = false;
            this.router.navigate(['/applications']);
          },
          error: (err) => {
            this.saving = false;
            this.errorMsg = err?.error?.message || 'Failed to save application.';
          },
        });
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.error?.message || 'Failed to save profile.';
      },
    });
  }

  cancel() {
    this.router.navigate(['/applications']);
  }
}