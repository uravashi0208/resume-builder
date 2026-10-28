// src/app/components/resume/resume.component.ts
// ONE component for ALL templates. profile.template decides which layout renders.
// Adding more templates in future = just add a new [ngSwitch] block below.

import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { getLanguage, formatStoredDate, buildFooterSlots } from '../../models/document-i18n';
import {
  Profile, SectionLabels, DEFAULT_SECTION_LABELS, DEFAULT_SECTION_ICONS,
  DEFAULT_FONT_SIZE, DEFAULT_SPACING, DEFAULT_ENTRY_LAYOUT, DEFAULT_HEADING_STYLE,
  DEFAULT_LINK_STYLING, DEFAULT_FOOTER, DEFAULT_ACCENT_APPLY,
  DEFAULT_COLOR_MODES, DEFAULT_BORDER_SIDES,
  mergeSections, mergeDocumentSettings, TEMPLATE_EXP_ORDER, TEMPLATE_EDU_ORDER, TEMPLATE_SKILL_COLS,
  mergeSectionOrder, isDefaultSectionOrder, PAGE_BREAK_KEY,
} from '../../models/profile.model';
import { htmlToPlainList, stripTags } from '../../shared/utils/text';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css'],
})
export class ResumeComponent {
  @Input() profile!: Profile;
  /** set by <app-resume-pages>: which physical page this copy sits on (footer numbering) */
  @Input() pageNo = 1;
  @Input() pageTotal = 1;
  /** the paginator draws its own footer on every page, so it turns this off */
  @Input() showFooter = true;

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Call this in the template for any field saved from app-rich-editor.
   * e.g. [innerHTML]="safe(profile.aboutMe)"
   * Bypasses Angular's sanitizer so bold/italic/ul tags render correctly.
   */
  safe(html: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html ?? '');
  }

  // ── Icon shapes for each iconStyle index (0-7) ──────────────────────────────
  // Each entry has a shape key used as CSS class + title
  readonly iconShapes = [
    { key: 'plain',     label: 'Plain' },
    { key: 'circle',    label: 'Filled circle' },
    { key: 'rounded',   label: 'Filled rounded' },
    { key: 'square',    label: 'Filled square' },
    { key: 'o-circle',  label: 'Outline circle' },
    { key: 'o-rounded', label: 'Outline rounded' },
    { key: 'o-square',  label: 'Outline square' },
  ];

  // ── FlowCV-style "Customize" controls: settings + CSS vars for the root ────
  get fontSize() { return this.profile?.fontSize ?? DEFAULT_FONT_SIZE; }
  get spacingCfg() { return this.profile?.spacing ?? DEFAULT_SPACING; }
  // merge with defaults so profiles saved before the advanced options existed still render
  get entryLayoutCfg() { return { ...DEFAULT_ENTRY_LAYOUT, ...(this.profile?.entryLayout ?? {}) }; }
  get headingCfg() { return this.profile?.headingStyle ?? DEFAULT_HEADING_STYLE; }
  get linkCfg() { return { ...DEFAULT_LINK_STYLING, ...(this.profile?.linkStyling ?? {}) }; }
  get footerCfg() { return { ...DEFAULT_FOOTER, ...(this.profile?.footer ?? {}) }; }
  /** merged with defaults so profiles saved before newer options existed still render */
  get accentApply() { return { ...DEFAULT_ACCENT_APPLY, ...(this.profile?.accentApply ?? {}) }; }

  // ── Colors panel (Full Page / Header / Border × Single / Multi / Image) ─────
  /** templates whose "header" is a real coloured band / sidebar out of the box */
  private static readonly BAND_TEMPLATES = ['template-one', 'template-three', 'template-five', 'template-seven', 'template-nine'];
  get modes() { return { ...DEFAULT_COLOR_MODES, ...(this.profile?.colorModes ?? {}) }; }

  private static rgb(c?: string | null): [number, number, number] | null {
    if (!c) return null;
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c.trim());
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  /** true when a colour is dark enough that light text is needed on top of it */
  private static isDark(c?: string | null): boolean | null {
    const v = ResumeComponent.rgb(c);
    if (!v) return null;
    return (0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]) / 255 < 0.55;
  }
  private static cssUrl(u?: string | null): string | null {
    return u ? `url("${u.replace(/"/g, '%22')}")` : null;
  }

  /** page background (Elegant keeps its soft off-white when the page colour is still the default) */
  get pageBg(): string {
    const bg = this.profile?.bgColor || '#ffffff';
    return this.profile?.template === 'template-three' && bg.toLowerCase() === '#ffffff' ? '#f8fafc' : bg;
  }
  get pageImageOn(): boolean { return this.modes.fullPage === 'image' && !!this.profile?.pageImage; }
  get pageImageCss(): string | null { return this.pageImageOn ? ResumeComponent.cssUrl(this.profile.pageImage) : null; }
  /** text colour forced on the page body (null = keep the template's own colours) */
  get pageFg(): string | null {
    if (this.pageImageOn) return '#ffffff';
    if (this.modes.fullPage === 'multi') return this.profile?.textColor || null;
    return ResumeComponent.isDark(this.profile?.bgColor) ? '#f8fafc' : null;
  }

  get isBand(): boolean { return ResumeComponent.BAND_TEMPLATES.includes(this.profile?.template); }
  get hdrImageOn(): boolean { return this.modes.header === 'image' && !!this.profile?.headerImage; }
  get hdrImageCss(): string | null { return this.hdrImageOn ? ResumeComponent.cssUrl(this.profile.headerImage) : null; }
  /** header colours only override the template when the template has a band, or the user picked something */
  get hdrCustom(): boolean {
    return ResumeComponent.BAND_TEMPLATES.includes(this.profile?.template) || !!this.profile?.headerColorSet || this.hdrImageOn;
  }
  /** true when the header sits on a dark colour/image → links get a lighter blue */
  get hdrOnDark(): boolean {
    if (this.hdrImageOn) return true;
    if (!this.hdrCustom) return false;
    return ResumeComponent.isDark(this.hdrBg === 'transparent' ? this.profile?.bgColor : this.hdrBg) === true;
  }
  get hdrBg(): string {
    const c = this.profile?.primaryColor;
    return !c || c === 'transparent' ? 'transparent' : c;
  }
  get hdrFg(): string {
    if (this.hdrImageOn) return '#ffffff';
    if (this.modes.header === 'multi' && this.profile?.headerTextColor) return this.profile.headerTextColor;
    const base = this.hdrBg === 'transparent' ? this.profile?.bgColor : this.hdrBg;
    return ResumeComponent.isDark(base) === false ? '#111827' : ResumeComponent.isDark(base) ? '#ffffff' : '#111827';
  }

  private static readonly BORDER_PX = { S: 2, M: 4, L: 7 } as const;
  get borderPx(): number { return ResumeComponent.BORDER_PX[this.profile?.borderSize ?? 'S'] ?? 2; }
  get borderSides() { return { ...DEFAULT_BORDER_SIDES, ...(this.profile?.borderSides ?? {}) }; }
  bw(side: 'top' | 'bottom' | 'left' | 'right'): string { return (this.borderSides[side] ? this.borderPx : 0) + 'px'; }
  get borderImageOn(): boolean { return this.modes.border === 'image' && !!this.profile?.borderImage; }
  get borderImageCss(): string | null { return this.borderImageOn ? ResumeComponent.cssUrl(this.profile.borderImage) : null; }
  get borderColorCss(): string {
    return this.borderImageOn ? 'transparent' : (this.profile?.borderColor || 'transparent');
  }

  get fsNamePt() { return this.fontSize.base + this.fontSize.fullName; }
  get fsTitlePt() { return this.fontSize.base + this.fontSize.title; }
  get fsHeadingPt() { return this.fontSize.base + this.fontSize.sectionHeadings; }
  get fsEntryPt() { return this.fontSize.base + this.fontSize.entryHeader; }
  /** scale of the native heading / entry-title size vs. the default offsets (1 = default look) */
  get headingK() { return (this.fontSize.base + this.fontSize.sectionHeadings) / (this.fontSize.base + DEFAULT_FONT_SIZE.sectionHeadings); }
  get entryK() { return 1 + (this.fontSize.entryHeader - DEFAULT_FONT_SIZE.entryHeader) / this.fontSize.base; }
  /** 0-4 slider -> a real rem gap between sections/blocks */
  get gapRem() { return [0.35, 0.55, 0.8, 1.1, 1.5][this.spacingCfg.elementSpacing] ?? 0.8; }
  // ── Customize → Layout → Change Section Layout ──────────────────────────────
  // Only when the user really changed the order do the templates switch to "flex + order";
  // otherwise every template keeps its own built-in order (nothing changes for existing resumes).
  get sectionOrder(): string[] { return mergeSectionOrder(this.profile?.sectionOrder); }
  get reordered(): boolean { return !isDefaultSectionOrder(this.profile?.sectionOrder); }
  /** flex `order` of a section (null = no inline style = template default) */
  ord(key: string): number | null { return this.reordered ? this.sectionOrder.indexOf(key) + 1 : null; }
  /** the page-break marker only exists while at least one section follows it */
  get pbActive(): boolean {
    const o = this.sectionOrder;
    return this.reordered && o.indexOf(PAGE_BREAK_KEY) < o.length - 1;
  }

  /** ratio of the section gap to the default one (0.8rem) -> used by templates with their own gaps */
  get gapK() { return this.gapRem / 0.8; }
  /** left/right and top/bottom margin as a ratio of the default value (see Spacing in resume.component.css) */
  get padKx() { return this.spacingCfg.sideMargin / DEFAULT_SPACING.sideMargin; }
  get padKy() { return this.spacingCfg.topBottomMargin / DEFAULT_SPACING.topBottomMargin; }

  /** footer columns (custom text with {{placeholders}} or Name / Email / Page numbers) */
  get footerSlots() { return buildFooterSlots(this.profile, this.pageNo, this.pageTotal); }

  // ── Document Settings: language / date format ──────────────────────────────
  get docSettings() { return mergeDocumentSettings(this.profile?.documentSettings); }
  get docLang() { return getLanguage(this.docSettings.language); }
  get isRtl(): boolean { return !!this.docLang.rtl; }
  get gdprLabel(): string { return this.docLang.pack.gdpr; }
  /** "2023-02" → "2023/02" (or "Feb 2023", "02.2023" … depending on the chosen format) */
  fmtDate(raw: string | null | undefined): string { return formatStoredDate(raw, this.docSettings); }
  /** education period: start – end (or the legacy free-text duration) */
  eduDates(ed: any): string {
    const a = this.fmtDate(ed?.startDate), b = this.fmtDate(ed?.endDate);
    if (a || b) return `${a}${a && b ? ' – ' : ''}${b}`;
    const d = (ed?.duration || '').trim();
    if (!d) return '';
    const parts = d.split(/\s+[-–]\s+/);
    return parts.map((x: string) => this.fmtDate(x)).join(' – ');
  }

  // ── Helpers used by the newer templates (four … eight) ─────────────────────
  get contacts(): { icon: string; text: string; kind: string; href: string | null }[] {
    const p = this.profile;
    if (!p) return [];
    const short = (u?: string) => (u || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const url = (u?: string) => (u ? (/^https?:\/\//i.test(u) ? u : 'https://' + u) : null);
    const portfolio = p.socialLinks?.portfolio || p.socialLinks?.github;
    const list = [
      { icon: 'map-pin',  text: p.location, kind: 'location', href: null as string | null },
      { icon: 'mail',     text: p.email,    kind: 'email',    href: p.email ? 'mailto:' + p.email : null },
      { icon: 'phone',    text: p.phone,    kind: 'phone',    href: p.phone ? 'tel:' + p.phone.replace(/[^+\d]/g, '') : null },
      { icon: 'linkedin', text: short(p.socialLinks?.linkedin), kind: 'linkedin', href: url(p.socialLinks?.linkedin) },
      { icon: 'link',     text: short(portfolio), kind: 'link', href: url(portfolio) },
    ];
    return list.filter((c) => c.text && c.text.trim());
  }

  // ── Customize → Sections ────────────────────────────────────────────────
  get secCfg() { return mergeSections(this.profile?.sections); }
  get sumInHeader(): boolean { return !!this.secCfg.summary.inHeader && !!this.profile?.aboutMe?.trim(); }
  get declCfg() { return this.secCfg.declaration; }
  get langStyle(): string { return this.secCfg.languages.style; }
  get sumShowHeading(): boolean { return this.secCfg.summary.showHeading; }
  get expOrderEff(): 'jobEmployer' | 'employerJob' {
    return (this.secCfg.experience.titleOrder || TEMPLATE_EXP_ORDER[this.profile?.template] || 'jobEmployer') as any;
  }
  get eduOrderEff(): 'degreeSchool' | 'schoolDegree' {
    return (this.secCfg.education.titleOrder || TEMPLATE_EDU_ORDER[this.profile?.template] || 'degreeSchool') as any;
  }
  get sk() {
    const k = this.secCfg.skills;
    return { ...k, cols: k.columns || TEMPLATE_SKILL_COLS[this.profile?.template] || 1 };
  }
  get skSepChar(): string { return ({ bullet: '•', pipe: '|', comma: ',' } as any)[this.sk.compactSep] ?? '•'; }

  /** "Group promotions": a role that follows another role at the same company drops the repeated company */
  private samePrev(e: any): boolean {
    if (!this.secCfg.experience.groupPromotions) return false;
    const list = this.profile?.experience ?? [];
    const i = list.indexOf(e);
    const norm = (x?: string) => (x || '').trim().toLowerCase();
    return i > 0 && !!norm(e.company) && norm(list[i - 1].company) === norm(e.company);
  }
  private slots(a: string | undefined, b: string | undefined, aFirst: boolean): [string, string] {
    const two = (aFirst ? [a, b] : [b, a]).map((x) => (x || '').trim()).filter(Boolean);
    return [two[0] ?? '', two[1] ?? ''];
  }
  /** headline / subline of a work entry, honouring Title/Subtitle Order + Group promotions */
  expFirst(e: any): string  { return this.slots(e.role, this.samePrev(e) ? '' : e.company, this.expOrderEff === 'jobEmployer')[0]; }
  expSecond(e: any): string { return this.slots(e.role, this.samePrev(e) ? '' : e.company, this.expOrderEff === 'jobEmployer')[1]; }
  eduFirst(ed: any): string  { return this.slots(ed.degree, ed.institute, this.eduOrderEff === 'degreeSchool')[0]; }
  eduSecond(ed: any): string { return this.slots(ed.degree, ed.institute, this.eduOrderEff === 'degreeSchool')[1]; }
  itemsText(g: any): string { return this.itemsOf(g?.items).join(', '); }
  itemsOf(csv: string | undefined): string[] { return htmlToPlainList(csv).split(', ').filter(Boolean); }

  /** technical skills flattened to a simple list of items */
  get skillList(): string[] {
    return (this.profile?.technicalSkills ?? [])
      .flatMap((g) => this.itemsOf(g.items));
  }
  get skillGroups() {
    // skills are plain text: strip any HTML that slipped in (rich editor / paste)
    return (this.profile?.technicalSkills ?? [])
      .map((g) => ({ ...g, category: stripTags(g.category), items: htmlToPlainList(g.items) }))
      .filter((g) => g.category || g.items);
  }
  get competencyList(): string[] {
    return (this.profile?.coreCompetencies ?? []).map((x) => stripTags(x)).filter(Boolean);
  }
  get interestList(): string[] {
    return (this.profile?.interests ?? []).map((x) => stripTags(x)).filter(Boolean);
  }
  get certList(): string[] {
    return (this.profile?.certificates ?? []).map((x) => stripTags(x)).filter(Boolean);
  }
  get langList() {
    return (this.profile?.languages ?? []).filter((l) => l?.name?.trim());
  }
  /** work entries that have at least a role, company or description */
  get expList() {
    return (this.profile?.experience ?? []).filter((e) => e?.role?.trim() || e?.company?.trim() || this.plain(e?.description));
  }
  /** "About me" has real text (rich-editor leaves tags like <p><br></p> when empty) */
  get hasAbout(): boolean { return !!this.plain(this.profile?.aboutMe); }
  private plain(html?: string): string { return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim(); }
  get educationList() {
    return (this.profile?.education ?? []).filter((e) => e.degree?.trim() || e.institute?.trim());
  }
  readonly dotScale = [1, 2, 3, 4, 5];

  /**
   * Heading text. A heading the user customised always wins; headings still on the English
   * default follow Document Settings → Language.
   */
  label(key: keyof SectionLabels): string {
    const custom = (this.profile?.sectionLabels?.[key] ?? '').trim();
    const en = DEFAULT_SECTION_LABELS[key];
    if (custom && custom !== en) return custom;
    return this.docLang.pack.labels[key] || en;
  }

  /** Icon name for a heading, or null when the icon is hidden */
  icon(key: keyof SectionLabels): string | null {
    const ic = this.profile?.sectionIcons?.[key] ?? DEFAULT_SECTION_ICONS[key];
    return ic?.visible && ic.name ? ic.name : null;
  }

  get iconShape(): string {
    const idx = Number(this.profile?.iconStyle ?? 0);
    return this.iconShapes[idx]?.key ?? 'plain';
  }

  get nameWeight(): string {
    return this.profile?.nameStyle === 'bold' ? '700' : '400';
  }

  get titleWeight(): string {
    return this.profile?.titleStyle === 'bold' ? '700' : '400';
  }

  get detKey(): string { return this.profile?.detailsArrangement ?? 'stacked'; }

  get sameLine(): boolean {
    return this.profile?.titlePosition === 'same-line';
  }

  get headerCenter(): boolean {
    return this.profile?.headerAlign === 'center';
  }

  get detailsInline(): boolean {
    return this.profile?.detailsArrangement === 'inline';
  }

  get detailsColumns(): boolean {
    return this.profile?.detailsArrangement === 'columns';
  }

  get sep(): string {
    return this.profile?.detailsSeparator ?? 'icon';
  }

  // ── template-nine (Creative): interests rendered as line icons, name split bold/regular ──
  private static readonly INTEREST_ICONS: [RegExp, string][] = [
    [/coffee|tea|cafe|food|cook/i, 'M17 8h1a4 4 0 1 1 0 8h-1 M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z M6 2v2 M10 2v2 M14 2v2'],
    [/music|guitar|piano|sing|song/i, 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0 M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
    [/read|book|writ|blog/i, 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'],
    [/game|gaming|chess|puzzle/i, 'M6 12h4 M8 10v4 M15 13h.01 M18 11h.01 M17.32 5H6.68a4 4 0 0 0-3.98 3.59C2.6 9.42 2 14.46 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.41-1.41A2 2 0 0 1 9.83 16h4.34a2 2 0 0 1 1.42.59L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.55-.6-6.58-.68-7.26A4 4 0 0 0 17.32 5z'],
  [/travel|trek|hik|explor|nature|mountain/i, 'M8 3l4 8 5-5 5 15H2L8 3z'],
    [/photo|camera|video|film|movie/i, 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],
    [/sport|gym|fit|run|cricket|football|cycl|swim|yoga/i, 'M6.5 6.5 17.5 17.5 M21 21l-1-1 M3 3l1 1 M18 22l4-4 M2 6l4-4 M3 10l7-7 M14 21l7-7'],
    [/code|program|tech|develop|open.?source/i, 'm16 18 6-6-6-6 M8 6l-6 6 6 6'],
  ];
  interestIcon(name: string): string {
    return ResumeComponent.INTEREST_ICONS.find(([re]) => re.test(name || ''))?.[1]
      ?? 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
  }
  /** "Parth Modi" -> ['Parth', 'Modi'] (first part bold, last part regular) */
  get nameParts(): [string, string] {
    const n = (this.profile?.fullName || '').trim();
    const i = n.lastIndexOf(' ');
    return i < 0 ? [n, ''] : [n.slice(0, i), n.slice(i + 1)];
  }

  formatDuration(exp: { startDate: string; endDate: string; present: boolean }): string {
    const start = this.fmtDate(exp.startDate);
    const end = exp.present || /^present$/i.test(exp.endDate || '') ? this.docLang.pack.present : this.fmtDate(exp.endDate);
    if (!start && !end) return '';
    return `${start}${start && end ? ' – ' : ''}${end}`;
  }
}
