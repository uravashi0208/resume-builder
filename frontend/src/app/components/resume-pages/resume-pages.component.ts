// src/app/components/resume-pages/resume-pages.component.ts
//
// Splits ONE resume into real A4 / Letter pages (Document Settings → Page Format).
//
// How it works
//  1. A hidden, natural-size copy of <app-resume> is measured.
//  2. Every "line-like" block (li, p, heading, entry row, skill cell …) is collected as a leaf.
//  3. Page breaks are placed only BETWEEN leaves — never through a line of text — and a heading /
//     entry title is never left alone at the bottom of a page ("keep with next").
//     A very tall paragraph may still be split, but only on a line boundary.
//  4. Each page shows its own slice of the resume (clipped + translated), draws the footer with the
//     real page number, and repeats the page margins / sidebar colour.
//  5. Print CSS makes the browser's "Save as PDF" output exactly the same pages.

import {
  AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, ViewChild,
} from '@angular/core';
import {
  Profile, DEFAULT_SPACING, mergeDocumentSettings,
} from '../../models/profile.model';
import {
  buildFooterSlots, getPageFormat, MM_TO_PX, FooterSlots,
} from '../../models/document-i18n';

interface Leaf { top: number; bottom: number; keep: boolean; lh: number; split: boolean; }
export interface PageSlice { offset: number; top: number; height: number; }
interface Underlay { left: number; width: number; bg: string; img: string | null; }

const KEEP_TOL = 30;   // px — a heading this close above a break is pulled onto the next page

@Component({
  selector: 'app-resume-pages',
  templateUrl: './resume-pages.component.html',
  styleUrls: ['./resume-pages.component.css'],
})
export class ResumePagesComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() profile!: Profile;

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;
  @ViewChild('measure', { static: true }) measureRef!: ElementRef<HTMLElement>;

  pages: PageSlice[] = [{ offset: 0, top: 0, height: 0 }];
  underlays: Underlay[] = [];
  pageBg = '#ffffff';
  pageBgImg: string | null = null;
  footerColor = '#6b7280';
  scale = 1;

  private raf = 0;
  private ro?: ResizeObserver;
  private lastWidth = -1;
  private pageStyleEl?: HTMLStyleElement;
  private sig = '';

  constructor(private zone: NgZone) {}

  // ── page geometry (always derived from the profile, so it is never stale) ──
  get fmt() { return getPageFormat(mergeDocumentSettings(this.profile?.documentSettings).pageFormat); }
  get pageW(): number { return Math.floor(this.fmt.wMm * MM_TO_PX); }
  get pageH(): number { return Math.floor(this.fmt.hMm * MM_TO_PX); }
  private get marginYmm(): number { return this.profile?.spacing?.topBottomMargin ?? DEFAULT_SPACING.topBottomMargin; }
  private get marginXmm(): number { return this.profile?.spacing?.sideMargin ?? DEFAULT_SPACING.sideMargin; }
  /** blank strip at the top of pages 2+ */
  get topPx(): number { return Math.round(Math.max(this.marginYmm, 8) * MM_TO_PX); }
  /** blank strip at the bottom of every page (the footer lives in it) */
  get bottomPx(): number { return Math.round(Math.max(this.marginYmm, 10) * MM_TO_PX); }
  get footerPadX(): number { return Math.round(this.marginXmm * MM_TO_PX); }
  get totalHeight(): number { return this.pages.length * this.pageH + (this.pages.length - 1) * 18; }

  round(n: number): number { return Math.round(n); }

  footerFor(i: number): FooterSlots | null {
    return buildFooterSlots(this.profile, i + 1, this.pages.length);
  }

  // ── lifecycle ───────────────────────────────────────────────────────────────
  ngOnChanges(): void { this.applyPageRule(); this.schedule(); }

  ngAfterViewInit(): void {
    this.applyPageRule();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => {
        const w = this.hostRef.nativeElement.clientWidth;
        // react to width changes of the host and to any size change of the measuring copy
        this.zone.run(() => { this.lastWidth = w; this.schedule(); });
      });
      this.ro.observe(this.measureRef.nativeElement);
      this.ro.observe(this.hostRef.nativeElement);
    }
    (document as any).fonts?.ready?.then(() => this.schedule());
    this.schedule();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.pageStyleEl?.remove();
  }

  private schedule(): void {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => this.compute());
  }

  /** @page size for "Save as PDF" — follows A4 / Letter */
  private applyPageRule(): void {
    if (!this.pageStyleEl) {
      this.pageStyleEl = document.createElement('style');
      this.pageStyleEl.setAttribute('data-resume-pages', '');
      document.head.appendChild(this.pageStyleEl);
    }
    const f = this.fmt;
    this.pageStyleEl.textContent = `@page { size: ${f.wMm}mm ${f.hMm}mm; margin: 0; }`;
  }

  // ── measuring + splitting ───────────────────────────────────────────────────
  private compute(): void {
    const root = this.measureRef.nativeElement.querySelector('.resume-root') as HTMLElement | null;
    if (!root || !this.profile) return;

    const hostW = this.hostRef.nativeElement.clientWidth;
    const scale = hostW > 0 ? Math.min(1, Math.floor((hostW / this.pageW) * 1000) / 1000) : 1;

    const rr = root.getBoundingClientRect();
    const total = Math.ceil(rr.height);
    const leaves = this.collectLeaves(root, rr.top);
    // Layout -> Change Section Layout -> "Page break": y positions where a new page must start
    const forced = Array.from(root.querySelectorAll('[data-page-break]'))
      .map((el) => el.getBoundingClientRect().top - rr.top).sort((a, b) => a - b);
    const lastBottom = leaves.reduce((m, l) => Math.max(m, l.bottom), 0) || total;

    // ---- page breaks
    const breaks: number[] = [0];
    let start = 0;
    for (let guard = 0; guard < 40; guard++) {
      const avail = this.availFor(breaks.length - 1);
      const mark = forced.find((f) => f > start + 8 && f < start + avail && f < lastBottom - 1);
      if (mark === undefined && lastBottom - start <= avail + 1) break;
      // a page-break marker inside this page forces the break: the next page starts at the next content
      const y = mark !== undefined
        ? Math.min(leaves.filter((l) => l.top >= mark - 0.5).reduce((m, l) => Math.min(m, l.top), Infinity), start + avail)
        : this.findBreak(leaves, start, avail);
      if (y <= start + 1) break;            // safety net
      breaks.push(y);
      start = y;
    }
    const pages: PageSlice[] = breaks.map((offset, i) => {
      const avail = this.availFor(i);
      const end = i + 1 < breaks.length ? breaks[i + 1] : Math.min(total, offset + avail);
      return { offset, top: i === 0 ? 0 : this.topPx, height: Math.max(0, end - offset) };
    });

    // ---- page colour + full-height columns (sidebar) so the margin strips look right
    const resumeEl = root.querySelector('.resume') as HTMLElement | null;
    let bg = '#ffffff', img: string | null = null;
    if (resumeEl) {
      const cs = getComputedStyle(resumeEl);
      if (!this.isTransparent(cs.backgroundColor)) bg = cs.backgroundColor;
      if (cs.backgroundImage && cs.backgroundImage !== 'none') img = cs.backgroundImage;
    }
    const underlays = resumeEl ? this.findUnderlays(resumeEl, rr, total) : [];
    const footerColor = this.isDark(bg) ? '#d1d5db' : '#6b7280';

    // ---- publish (only when something changed → no render loops)
    const sig = JSON.stringify([pages, underlays, bg, img, footerColor, scale, this.pageW, this.pageH]);
    if (sig === this.sig) return;
    this.sig = sig;
    this.pages = pages;
    this.underlays = underlays;
    this.pageBg = bg;
    this.pageBgImg = img;
    this.footerColor = footerColor;
    this.scale = scale;
  }

  /** content height available on page i (page 1 has no top strip) */
  private availFor(i: number): number {
    return this.pageH - this.bottomPx - (i === 0 ? 0 : this.topPx);
  }

  private collectLeaves(root: HTMLElement, rootTop: number): Leaf[] {
    const leaves: Leaf[] = [];

    // rows that must stay glued to what follows (entry title row + its subtitle row)
    const keepRows = new Set<Element>();
    root.querySelectorAll('.res-entry-head').forEach((h) => {
      const row = h.parentElement;
      if (!row) return;
      keepRows.add(row);
      const nx = row.nextElementSibling;
      if (nx && !nx.querySelector('ul,ol,p,li') && (nx.textContent || '').length < 140) keepRows.add(nx);
    });
    const isKeep = (el: Element): boolean => {
      for (let n: Element | null = el; n && n !== root; n = n.parentElement) {
        if (/^H[1-6]$/.test(n.tagName) || keepRows.has(n)) return true;
      }
      return false;
    };

    const walk = (el: Element): boolean => {
      const cs = getComputedStyle(el);
      const d = cs.display;
      if (d === 'none') return false;
      if (cs.position === 'absolute' || cs.position === 'fixed') return false;   // decorations
      const isBlock = d !== 'inline' && d !== 'contents' && !d.startsWith('inline');
      const bi = (cs as any).breakInside || (cs as any).pageBreakInside || '';

      let childBlock = false;
      if (!(isBlock && String(bi).startsWith('avoid'))) {
        for (const c of Array.from(el.children)) if (walk(c)) childBlock = true;
      }
      if (isBlock && !childBlock) {
        const r = el.getBoundingClientRect();
        if (r.height >= 1) {
          const fs = parseFloat(cs.fontSize) || 14;
          const lh = parseFloat(cs.lineHeight) || fs * 1.3;
          leaves.push({
            top: r.top - rootTop, bottom: r.bottom - rootTop, keep: isKeep(el),
            lh, split: r.height > lh * 6 && !el.querySelector('img,svg,table'),
          });
        }
      }
      return isBlock || childBlock;
    };
    walk(root);
    return leaves;
  }

  /** the y (in resume px) where the next page starts */
  private findBreak(leaves: Leaf[], start: number, avail: number): number {
    const limit = start + avail;

    const settle = (y0: number, useKeep: boolean): number => {
      let y = y0;
      for (let i = 0; i < 60; i++) {
        // 1. never cut through a leaf
        const st = leaves.filter((l) => l.top < y - 0.5 && l.bottom > y + 0.5);
        if (st.length) {
          let ny = y;
          for (const l of st) {
            let cand = l.top;
            if (l.split) {                                   // tall paragraph: cut on a line boundary
              const k = Math.floor((y - l.top) / l.lh);
              let c = l.top + k * l.lh;
              if (l.bottom - c < l.lh * 1.5) c -= l.lh;      // no single widow line
              if (c >= l.top + l.lh * 2) cand = c;           // no single orphan line
            }
            ny = Math.min(ny, cand);
          }
          if (ny < y) { y = ny; continue; }
        }
        // 2. keep headings / entry titles with the content after them
        if (useKeep) {
          const kp = leaves.filter((l) => l.keep && l.bottom <= y + 0.5 && l.bottom > y - KEEP_TOL);
          if (kp.length) { y = Math.min(...kp.map((l) => l.top)); continue; }
        }
        break;
      }
      return y;
    };

    let y = settle(limit, true);
    if (y - start < avail * 0.3) y = settle(limit, false);   // keep-rule would waste too much space
    if (y - start < avail * 0.15) y = limit;                 // nothing breakable → hard cut

    // start the next page exactly on the next line (no leftover gap at its top)
    const tops = leaves.filter((l) => l.top >= y - 0.5).map((l) => l.top);
    const snap = tops.length ? Math.min(...tops) : y;
    return Math.min(snap, limit);
  }

  /** columns that run the full height of the resume (sidebar templates) */
  private findUnderlays(resume: HTMLElement, rr: DOMRect, total: number): Underlay[] {
    const out: Underlay[] = [];
    const scan = (el: Element, depth: number) => {
      if (depth > 4) return;
      for (const c of Array.from(el.children)) {
        const r = c.getBoundingClientRect();
        const cs = getComputedStyle(c);
        const hasBg = !this.isTransparent(cs.backgroundColor) || (cs.backgroundImage && cs.backgroundImage !== 'none');
        if (hasBg && r.height >= total * 0.9 && r.width > 20 && r.width < rr.width * 0.9) {
          out.push({
            left: r.left - rr.left, width: r.width,
            bg: this.isTransparent(cs.backgroundColor) ? 'transparent' : cs.backgroundColor,
            img: cs.backgroundImage && cs.backgroundImage !== 'none' ? cs.backgroundImage : null,
          });
        } else {
          scan(c, depth + 1);
        }
      }
    };
    scan(resume, 0);
    return out;
  }

  private isTransparent(c: string): boolean {
    return !c || c === 'transparent' || /^rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/.test(c);
  }
  private isDark(c: string): boolean {
    const m = /rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/.exec(c);
    if (!m) return false;
    return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255 < 0.5;
  }
}
