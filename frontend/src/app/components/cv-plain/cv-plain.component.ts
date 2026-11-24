// src/app/components/cv-plain/cv-plain.component.ts
// ONE plain, read-only view of a CV. No templates, no themes, no download.

import { Component, Input } from '@angular/core';
import { Profile } from '../../models/profile.model';
import { stripTags } from '../../shared/utils/text';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-cv-plain',
  templateUrl: './cv-plain.component.html',
  styleUrls: ['./cv-plain.component.css'],
})
export class CvPlainComponent {
  @Input() profile!: Profile;

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

  /** Rich-editor fields hold HTML; "<p></p>" or whitespace counts as empty */
  hasText(html?: string | null): boolean {
    return !!stripTags(html);
  }

  /** drop empty strings from simple lists */
  clean(list?: string[] | null): string[] {
    return (list ?? []).map((x) => (x ?? '').trim()).filter(Boolean);
  }

  link(url?: string | null): string {
    const v = (url ?? '').trim();
    if (!v) return '';
    return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  }

  get links(): { label: string; url: string }[] {
    const s = this.profile?.socialLinks;
    if (!s) return [];
    return [
      { label: 'LinkedIn', url: this.link(s.linkedin) },
      { label: 'GitHub', url: this.link(s.github) },
      { label: 'Portfolio', url: this.link(s.portfolio) },
      { label: 'Twitter', url: this.link(s.twitter) },
    ].filter((l) => l.url);
  }

  get contact(): string[] {
    const p = this.profile;
    return [p?.email, p?.phone, p?.location].map((x) => (x ?? '').trim()).filter(Boolean);
  }

  get skills() {
    return (this.profile?.technicalSkills ?? []).filter((g) => g?.category?.trim() || g?.items?.trim());
  }
  get experience() {
    return (this.profile?.experience ?? []).filter((e) => e?.role?.trim() || e?.company?.trim());
  }
  get education() {
    return (this.profile?.education ?? []).filter((e) => e?.degree?.trim() || e?.institute?.trim());
  }
  get languages() {
    return (this.profile?.languages ?? []).filter((l) => l?.name?.trim());
  }

  eduRange(e: { startDate?: string; endDate?: string; duration?: string }): string {
    return e.startDate || e.endDate ? this.range(e.startDate, e.endDate) : (e.duration ?? '');
  }
}
