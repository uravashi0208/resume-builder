// src/app/components/cv-plain/cv-plain.component.ts
// ONE plain, read-only view of a CV. No templates, no themes, no download.

import { Component, Input, OnChanges } from '@angular/core';
import { EducationItem, ExperienceItem, Profile, TechnicalSkillGroup } from '../../models/profile.model';
import { htmlToPlainList, stripTags } from '../../shared/utils/text';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-cv-plain',
  templateUrl: './cv-plain.component.html',
  styleUrls: ['./cv-plain.component.css'],
})
export class CvPlainComponent implements OnChanges {
  @Input() profile!: Profile;

  // what the template shows (rebuilt only when `profile` changes)
  contact: string[] = [];
  links: { label: string; url: string }[] = [];
  experience: ExperienceItem[] = [];
  education: EducationItem[] = [];
  skills: TechnicalSkillGroup[] = [];
  /** the simple "title + bullet list" blocks: competencies, certificates, languages, interests */
  listBlocks: { title: string; items: string[] }[] = [];

  ngOnChanges(): void {
    const p = this.profile;
    if (!p) return;

    this.contact = [p.email, p.phone, p.location].map((x) => (x ?? '').trim()).filter(Boolean);
    this.links = (['linkedin', 'github', 'portfolio', 'twitter'] as const)
      .map((k) => ({ label: LINK_LABELS[k], url: this.link(p.socialLinks?.[k]) }))
      .filter((l) => l.url);

    this.experience = (p.experience ?? []).filter((e) => e?.role?.trim() || e?.company?.trim());
    this.education = (p.education ?? []).filter((e) => e?.degree?.trim() || e?.institute?.trim());
    // older data stored skills as HTML -> show plain text
    this.skills = (p.technicalSkills ?? [])
      .map((g) => ({ ...g, items: htmlToPlainList(g?.items) }))
      .filter((g) => g.category?.trim() || g.items.trim());

    const languages = (p.languages ?? [])
      .filter((l) => l?.name?.trim())
      .map((l) => (+l.level > 0 ? `${l.name} (${l.level}/5)` : l.name));
    this.listBlocks = [
      { title: 'Core Competencies', items: this.clean(p.coreCompetencies) },
      { title: 'Certificates',      items: this.clean(p.certificates) },
      { title: 'Languages',         items: languages },
      { title: 'Interests',         items: this.clean(p.interests) },
    ].filter((b) => b.items.length);
  }

  /** "2023-02-01" -> "Feb 2023", "2014" -> "2014", "Present" -> "Present", free text stays as is */
  fmtDate(raw?: string | null): string {
    const v = (raw ?? '').trim();
    if (!v) return '';
    const m = /^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?$/.exec(v);
    if (!m) return v;
    const month = +m[2];
    return month >= 1 && month <= 12 ? `${MONTHS[month - 1]} ${m[1]}` : v;
  }

  range(start?: string, end?: string, present?: boolean): string {
    const s = this.fmtDate(start);
    const e = present ? 'Present' : this.fmtDate(end);
    return s && e ? `${s} – ${e}` : s || e;
  }

  eduRange(e: EducationItem): string {
    return e.startDate || e.endDate ? this.range(e.startDate, e.endDate) : (e.duration ?? '');
  }

  /** Rich-editor fields hold HTML; "<p></p>" or whitespace counts as empty */
  hasText(html?: string | null): boolean {
    return !!stripTags(html);
  }

  private clean(list?: string[] | null): string[] {
    return (list ?? []).map((x) => (x ?? '').trim()).filter(Boolean);
  }

  private link(url?: string | null): string {
    const v = (url ?? '').trim();
    if (!v) return '';
    return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  }
}

const LINK_LABELS = { linkedin: 'LinkedIn', github: 'GitHub', portfolio: 'Portfolio', twitter: 'Twitter' } as const;
