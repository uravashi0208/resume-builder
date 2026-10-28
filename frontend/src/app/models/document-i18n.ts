// src/app/models/document-i18n.ts
// Everything behind "Customize → Document Settings":
//   • Language     → translated default section headings, "Present", month names, RTL
//   • Date format  → how experience / education dates are written
//   • Page format  → A4 / Letter sizes (used by the paginator + print CSS)
//   • Footer       → {{name}} {{phone}} {{email}} {{page}} {{pages}} filling

import {
  Profile, SectionLabels, DEFAULT_FOOTER, PageFormat, mergeDocumentSettings,
} from './profile.model';

// ───────────────────────────── Languages ─────────────────────────────────────
export interface LangPack {
  labels: SectionLabels;
  present: string;
  gdpr: string;
}
export interface DocLanguage {
  code: string;       // stored in profile.documentSettings.language
  label: string;      // shown in the dropdown
  locale: string;     // BCP-47 tag for Intl month names
  rtl?: boolean;
  pack: LangPack;
}

/** compact builder so the table below stays readable */
function L(
  education: string, coreCompetencies: string, technicalSkills: string, interests: string,
  experience: string, aboutMe: string, links: string, certificates: string, languages: string,
  present: string, gdpr: string,
): LangPack {
  return {
    labels: { education, coreCompetencies, technicalSkills, interests, experience, aboutMe, links, certificates, languages },
    present, gdpr,
  };
}

// Same order as the reference (FlowCV) dropdown.
export const DOC_LANGUAGES: DocLanguage[] = [
  { code: 'en-US', label: 'English (US)', locale: 'en-US',
    pack: L('Education', 'Core Competencies', 'Technical Skills', 'Interests', 'Experience', 'About Me', 'Links', 'Certificates', 'Languages', 'Present', 'GDPR Consent') },
  { code: 'en-GB', label: 'English (UK)', locale: 'en-GB',
    pack: L('Education', 'Core Competencies', 'Technical Skills', 'Interests', 'Experience', 'About Me', 'Links', 'Certificates', 'Languages', 'Present', 'GDPR Consent') },
  { code: 'de', label: 'German', locale: 'de',
    pack: L('Ausbildung', 'Kernkompetenzen', 'Technische Fähigkeiten', 'Interessen', 'Berufserfahrung', 'Über mich', 'Links', 'Zertifikate', 'Sprachen', 'Heute', 'DSGVO-Einwilligung') },
  { code: 'es', label: 'Spanish', locale: 'es',
    pack: L('Educación', 'Competencias clave', 'Habilidades técnicas', 'Intereses', 'Experiencia', 'Sobre mí', 'Enlaces', 'Certificados', 'Idiomas', 'Actualidad', 'Consentimiento RGPD') },
  { code: 'ar', label: 'Arabic', locale: 'ar-u-nu-latn', rtl: true,
    pack: L('التعليم', 'الكفاءات الأساسية', 'المهارات التقنية', 'الاهتمامات', 'الخبرة', 'نبذة عني', 'الروابط', 'الشهادات', 'اللغات', 'حتى الآن', 'الموافقة على اللائحة العامة لحماية البيانات') },
  { code: 'fr', label: 'French', locale: 'fr',
    pack: L('Formation', 'Compétences clés', 'Compétences techniques', 'Centres d’intérêt', 'Expérience', 'À propos de moi', 'Liens', 'Certifications', 'Langues', 'Présent', 'Consentement RGPD') },
  { code: 'pt', label: 'Portuguese', locale: 'pt',
    pack: L('Educação', 'Competências principais', 'Competências técnicas', 'Interesses', 'Experiência', 'Sobre mim', 'Links', 'Certificados', 'Idiomas', 'Presente', 'Consentimento RGPD') },
  { code: 'it', label: 'Italian', locale: 'it',
    pack: L('Istruzione', 'Competenze chiave', 'Competenze tecniche', 'Interessi', 'Esperienza', 'Chi sono', 'Link', 'Certificazioni', 'Lingue', 'Presente', 'Consenso GDPR') },
  { code: 'tr', label: 'Turkish', locale: 'tr',
    pack: L('Eğitim', 'Temel Yetkinlikler', 'Teknik Beceriler', 'İlgi Alanları', 'Deneyim', 'Hakkımda', 'Bağlantılar', 'Sertifikalar', 'Diller', 'Halen', 'GDPR Onayı') },
  { code: 'ja', label: 'Japanese', locale: 'ja',
    pack: L('学歴', 'コアスキル', '技術スキル', '趣味・関心', '職歴', '自己紹介', 'リンク', '資格・認定', '言語', '現在', 'GDPR同意') },
  { code: 'nl', label: 'Dutch', locale: 'nl',
    pack: L('Opleiding', 'Kerncompetenties', 'Technische vaardigheden', 'Interesses', 'Werkervaring', 'Over mij', 'Links', 'Certificaten', 'Talen', 'Heden', 'AVG-toestemming') },
  { code: 'pl', label: 'Polish', locale: 'pl',
    pack: L('Wykształcenie', 'Kluczowe kompetencje', 'Umiejętności techniczne', 'Zainteresowania', 'Doświadczenie', 'O mnie', 'Linki', 'Certyfikaty', 'Języki', 'Obecnie', 'Zgoda RODO') },
  { code: 'sv', label: 'Swedish', locale: 'sv',
    pack: L('Utbildning', 'Kärnkompetenser', 'Tekniska färdigheter', 'Intressen', 'Erfarenhet', 'Om mig', 'Länkar', 'Certifikat', 'Språk', 'Nuvarande', 'GDPR-samtycke') },
  { code: 'da', label: 'Danish', locale: 'da',
    pack: L('Uddannelse', 'Kernekompetencer', 'Tekniske færdigheder', 'Interesser', 'Erfaring', 'Om mig', 'Links', 'Certifikater', 'Sprog', 'Nu', 'GDPR-samtykke') },
  { code: 'no', label: 'Norwegian', locale: 'nb',
    pack: L('Utdanning', 'Kjernekompetanse', 'Tekniske ferdigheter', 'Interesser', 'Erfaring', 'Om meg', 'Lenker', 'Sertifikater', 'Språk', 'Nåværende', 'GDPR-samtykke') },
  { code: 'fi', label: 'Finnish', locale: 'fi',
    pack: L('Koulutus', 'Ydinosaaminen', 'Tekniset taidot', 'Kiinnostuksen kohteet', 'Työkokemus', 'Minusta', 'Linkit', 'Sertifikaatit', 'Kielet', 'Nykyinen', 'GDPR-suostumus') },
  { code: 'el', label: 'Greek', locale: 'el',
    pack: L('Εκπαίδευση', 'Βασικές ικανότητες', 'Τεχνικές δεξιότητες', 'Ενδιαφέροντα', 'Εμπειρία', 'Σχετικά με εμένα', 'Σύνδεσμοι', 'Πιστοποιήσεις', 'Γλώσσες', 'Σήμερα', 'Συγκατάθεση GDPR') },
  { code: 'hu', label: 'Hungarian', locale: 'hu',
    pack: L('Tanulmányok', 'Alapkompetenciák', 'Technikai készségek', 'Érdeklődési körök', 'Tapasztalat', 'Rólam', 'Hivatkozások', 'Tanúsítványok', 'Nyelvek', 'Jelenleg', 'GDPR-hozzájárulás') },
  { code: 'cs', label: 'Czech', locale: 'cs',
    pack: L('Vzdělání', 'Klíčové kompetence', 'Technické dovednosti', 'Zájmy', 'Praxe', 'O mně', 'Odkazy', 'Certifikáty', 'Jazyky', 'Současnost', 'Souhlas s GDPR') },
  { code: 'he', label: 'Hebrew', locale: 'he', rtl: true,
    pack: L('השכלה', 'יכולות מרכזיות', 'כישורים טכניים', 'תחומי עניין', 'ניסיון', 'עליי', 'קישורים', 'הסמכות', 'שפות', 'כיום', 'הסכמה ל-GDPR') },
  { code: 'sr', label: 'Serbian', locale: 'sr-Latn',
    pack: L('Obrazovanje', 'Ključne kompetencije', 'Tehničke veštine', 'Interesovanja', 'Iskustvo', 'O meni', 'Linkovi', 'Sertifikati', 'Jezici', 'Sadašnjost', 'GDPR saglasnost') },
  { code: 'bg', label: 'Bulgarian', locale: 'bg',
    pack: L('Образование', 'Ключови компетенции', 'Технически умения', 'Интереси', 'Опит', 'За мен', 'Връзки', 'Сертификати', 'Езици', 'Настояще', 'Съгласие по GDPR') },
  { code: 'hr', label: 'Croatian', locale: 'hr',
    pack: L('Obrazovanje', 'Ključne kompetencije', 'Tehničke vještine', 'Interesi', 'Iskustvo', 'O meni', 'Poveznice', 'Certifikati', 'Jezici', 'Sadašnjost', 'GDPR suglasnost') },
  { code: 'ru', label: 'Russian', locale: 'ru',
    pack: L('Образование', 'Ключевые компетенции', 'Технические навыки', 'Интересы', 'Опыт работы', 'Обо мне', 'Ссылки', 'Сертификаты', 'Языки', 'По настоящее время', 'Согласие GDPR') },
  { code: 'uz', label: 'Uzbek', locale: 'uz',
    pack: L('Ta’lim', 'Asosiy kompetensiyalar', 'Texnik ko‘nikmalar', 'Qiziqishlar', 'Tajriba', 'Men haqimda', 'Havolalar', 'Sertifikatlar', 'Tillar', 'Hozir', 'GDPR roziligi') },
];

export function getLanguage(code?: string | null): DocLanguage {
  return DOC_LANGUAGES.find((l) => l.code === code) ?? DOC_LANGUAGES[1];   // English (UK) default
}

// ───────────────────────────── Date formats ──────────────────────────────────
// Tokens: YYYY  MMMM (long month)  MMM (short month)  MM  Do (2nd)  DD
export interface DocDateFormat { code: string; label: string; }
export const DOC_DATE_FORMATS: DocDateFormat[] = [
  { code: 'MMMM Do, YYYY', label: 'MMMM Do, YYYY' },
  { code: 'MM/DD/YYYY',    label: 'MM/DD/YYYY' },
  { code: 'DD/MM/YYYY',    label: 'DD/MM/YYYY' },
  { code: 'DD.MM.YYYY',    label: 'DD.MM.YYYY' },
  { code: 'DD MMM YYYY',   label: 'DD MMM YYYY' },
  { code: 'Do MMMM YYYY',  label: 'Do MMMM YYYY' },
  { code: 'YYYY-MM-DD',    label: 'YYYY-MM-DD' },
  { code: 'YYYY.MM.DD',    label: 'YYYY.MM.DD' },
  { code: 'YYYY/MM/DD',    label: 'YYYY/MM/DD' },
  { code: 'YYYY MMM DD',   label: 'YYYY MMM DD' },
];

const TOKEN_RE = /(YYYY|MMMM|MMM|MM|Do|DD)/;
const isToken = (p: string) => TOKEN_RE.test(p) && p.length <= 4 && /^(YYYY|MMMM|MMM|MM|Do|DD)$/.test(p);
const pad2 = (n: number) => String(n).padStart(2, '0');

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + 'th';
  return n + (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
}

function monthName(month: number, locale: string, style: 'long' | 'short'): string {
  try {
    const name = new Intl.DateTimeFormat(locale, { month: style, timeZone: 'UTC' })
      .format(new Date(Date.UTC(2000, month - 1, 1)));
    return name;
  } catch {
    return pad2(month);
  }
}

function renderToken(tok: string, y: number, m: number, d: number, locale: string): string {
  switch (tok) {
    case 'YYYY': return String(y);
    case 'MMMM': return monthName(m, locale, 'long');
    case 'MMM':  return monthName(m, locale, 'short');
    case 'MM':   return pad2(m);
    case 'Do':   return ordinal(d);
    case 'DD':   return pad2(d);
    default:     return tok;
  }
}

/** full date, used for the dropdown examples (e.g. "October 2nd, 2026") */
export function formatFullDate(date: Date, fmt: string, locale: string): string {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  return fmt.split(TOKEN_RE).filter((p) => p !== '')
    .map((p) => (isToken(p) ? renderToken(p, y, m, d, locale) : p)).join('');
}

/**
 * month + year only (resume entries have no day): the day token and the separator next to it
 * are dropped.  "DD/MM/YYYY" → "02/2023", "YYYY-MM-DD" → "2023-02", "MMMM Do, YYYY" → "February 2023".
 */
export function formatMonthYear(year: number, month: number, fmt: string, locale: string): string {
  const parts = fmt.split(TOKEN_RE).filter((p) => p !== '');
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === 'DD' || p === 'Do') {
      if (i + 1 < parts.length) i++;                                   // drop the separator after the day
      else if (out.length && !isToken(out[out.length - 1])) out.pop(); // …or the one before it (day was last)
      continue;
    }
    out.push(isToken(p) ? renderToken(p, year, month, 1, locale) : p);
  }
  return out.join('').trim();
}

/**
 * Format a stored date string ("2023-02", "2023-02-14", "2014", "Present") for the resume.
 * Anything that isn't a date (free text) is returned untouched.
 */
export function formatStoredDate(raw: string | null | undefined, settings?: Partial<{ language: string; dateFormat: string }> | null): string {
  const v = (raw ?? '').trim();
  if (!v) return '';
  const ds = mergeDocumentSettings(settings as any);
  const lang = getLanguage(ds.language);
  if (/^present$/i.test(v)) return lang.pack.present;
  if (/^\d{4}$/.test(v)) return v;                                     // year only stays a year
  const m = /^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?$/.exec(v);
  if (!m) return v;
  const month = +m[2];
  if (month < 1 || month > 12) return v;
  return formatMonthYear(+m[1], month, ds.dateFormat, lang.locale);
}

// ───────────────────────────── Page formats ──────────────────────────────────
export interface PageFormatInfo { code: PageFormat; label: string; sub?: string; wMm: number; hMm: number; css: string; }
export const PAGE_FORMATS: PageFormatInfo[] = [
  { code: 'a4',     label: 'A4',     wMm: 210,   hMm: 297,   css: 'A4' },
  { code: 'letter', label: 'Letter', sub: '(US & Canada)', wMm: 215.9, hMm: 279.4, css: 'letter' },
];
export const MM_TO_PX = 96 / 25.4;
export function getPageFormat(code?: string | null): PageFormatInfo {
  return PAGE_FORMATS.find((p) => p.code === code) ?? PAGE_FORMATS[0];
}

// ───────────────────────────── Footer ────────────────────────────────────────
export interface FooterSlots { left: string; center: string; right: string; }

/** Footer columns for one physical page (page / pages are real numbers). */
export function buildFooterSlots(p: Profile | null | undefined, page = 1, pages = 1): FooterSlots | null {
  if (!p) return null;
  const f = { ...DEFAULT_FOOTER, ...(p.footer ?? {}) };
  const fill = (t: string) => (t || '')
    .replace(/\{\{\s*name\s*\}\}/gi, p.fullName || '')
    .replace(/\{\{\s*phone\s*\}\}/gi, p.phone || '')
    .replace(/\{\{\s*email\s*\}\}/gi, p.email || '')
    .replace(/\{\{\s*pages\s*\}\}/gi, String(pages))
    .replace(/\{\{\s*page\s*\}\}/gi, String(page));
  let slots: FooterSlots = { left: '', center: '', right: '' };
  if (f.custom) {
    slots = { left: fill(f.left), center: fill(f.center), right: fill(f.right) };
  } else {
    if (f.name && p.fullName) slots.left = p.fullName;
    if (f.email && p.email) slots.center = p.email;
    if (f.pageNumbers) slots.right = `${page} / ${pages}`;
  }
  return slots.left || slots.center || slots.right ? slots : null;
}
