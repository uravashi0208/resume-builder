// src/app/shared/utils/text.ts
// Small text helpers shared by the editor and the resume renderer.

/** removes every HTML tag and decodes the common entities (&nbsp; &amp; ...) */
export function stripTags(html?: string | null): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .trim();
}

/**
 * Skills-like fields must be plain "a, b, c" text. If HTML got in (rich editor, paste) every block end /
 * line break becomes a comma, all tags are removed, and the list is normalised.
 */
export function htmlToPlainList(html?: string | null): string {
  return stripTags(
    (html ?? '').replace(/<\s*(br|\/div|\/p|\/li)\s*\/?>/gi, ',').replace(/\r?\n/g, ','),
  )
    .split(',').map((x) => x.trim()).filter(Boolean).join(', ');
}
