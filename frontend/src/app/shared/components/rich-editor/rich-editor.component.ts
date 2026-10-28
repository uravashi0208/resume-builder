// src/app/shared/components/rich-editor/rich-editor.component.ts
// Rich text editor built on TipTap (ProseMirror) instead of contenteditable + execCommand.
// Same selector / inputs / ControlValueAccessor as before, so no other file needs to change.

import {
  Component, Input, ViewChild, ElementRef, Optional, Self,
  AfterViewInit, OnDestroy, NgZone,
} from '@angular/core';
import { ControlValueAccessor, NgControl, AbstractControl } from '@angular/forms';
import { Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Paragraph from '@tiptap/extension-paragraph';

export type Alignment = 'left' | 'center' | 'right' | 'justify';

/** "fake" bullets people copy from PDF / Word / LinkedIn. Symbol bullets may have no space ("•Build"); - and * need one. */
const BULLET_RE = /^[\s\u00a0]*(?:[•·▪▫●○◦‣⁃∙■□▶►✓✔➢➤][\s\u00a0]*|[-–—*][\s\u00a0]+)/;

/** old content was saved as <div>…</div> blocks – keep reading those as paragraphs */
const ParagraphWithDiv = Paragraph.extend({
  parseHTML() { return [{ tag: 'p' }, { tag: 'div' }]; },
});

/**
 * Pasted HTML: remove literal bullet characters ("•Build…") and turn runs of such
 * lines into a real <ul>. This is what caused the "double dot" (real bullet + typed •).
 */
function fixPastedBullets(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  const stripLeadingBullet = (el: Element): boolean => {
    const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;
    while (node && !node.nodeValue?.trim()) node = walker.nextNode() as Text | null;
    if (node && BULLET_RE.test(node.nodeValue || '')) {
      node.nodeValue = (node.nodeValue || '').replace(BULLET_RE, '');
      return true;
    }
    return false;
  };

  // 1) <li> that start with a literal bullet
  body.querySelectorAll('li').forEach((li) => stripLeadingBullet(li));

  // 2) consecutive <p>/<div> lines that start with a bullet -> one <ul>
  const groupInto = (parent: Element) => {
    const kids = Array.from(parent.children);
    let ul: HTMLUListElement | null = null;
    for (const el of kids) {
      const isLine = el.tagName === 'P' || el.tagName === 'DIV';
      if (isLine && stripLeadingBullet(el)) {
        if (!ul) { ul = doc.createElement('ul'); parent.insertBefore(ul, el); }
        const li = doc.createElement('li');
        while (el.firstChild) li.appendChild(el.firstChild);
        ul.appendChild(li);
        parent.removeChild(el);
      } else {
        ul = null;
        if (el.tagName === 'DIV') groupInto(el);
      }
    }
  };
  groupInto(body);
  return body.innerHTML;
}

/** Pasted plain text: lines starting with • - * become a bullet list */
function plainTextToHtml(text: string): string | null {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
  if (!lines.length || !lines.some((l) => BULLET_RE.test(l))) return null;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let out = '', inList = false;
  for (const l of lines) {
    if (BULLET_RE.test(l)) {
      if (!inList) { out += '<ul>'; inList = true; }
      out += `<li>${esc(l.replace(BULLET_RE, ''))}</li>`;
    } else {
      if (inList) { out += '</ul>'; inList = false; }
      out += `<p>${esc(l.trim())}</p>`;
    }
  }
  return out + (inList ? '</ul>' : '');
}

/** Output stays compatible with the resume templates: <ul><li>text</li></ul> and <div> blocks */
function toResumeHtml(html: string): string {
  return html
    .replace(/<li>\s*<p(?:\s[^>]*)?>([\s\S]*?)<\/p>\s*<\/li>/g, '<li>$1</li>')
    .replace(/<p>\s*<\/p>/g, '<div><br></div>')
    .replace(/<p(\s[^>]*)?>/g, '<div$1>')
    .replace(/<\/p>/g, '</div>');
}

@Component({
  selector: 'app-rich-editor',
  templateUrl: './rich-editor.component.html',
  styleUrls: ['./rich-editor.component.css'],
})
export class RichEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {

  @Input() label        = '';
  @Input() placeholder  = '';
  @Input() required     = false;
  @Input() disabled     = false;
  @Input() hint         = '';
  @Input() errorMessage = '';
  @Input() minHeight    = '100px';
  @Input() showAlign    = true;
  @Input() showLink     = true;
  @Input() control: AbstractControl | null = null;

  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  editor: Editor | null = null;

  isBold = false;
  isItalic = false;
  isUnderline = false;
  isBullet = false;
  alignment: Alignment = 'left';

  private _value = '';
  private _onChange:  (v: string) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl, private zone: NgZone) {
    if (ngControl) ngControl.valueAccessor = this;
  }

  // ── ControlValueAccessor ────────────────────────────────────────────────
  writeValue(val: string): void {
    this._value = val ?? '';
    if (this.editor && toResumeHtml(this.editor.getHTML()) !== this._value) {
      this.editor.commands.setContent(this._value, false);
      this.syncStates();
    }
  }
  registerOnChange(fn: (v: string) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.editor?.setEditable(!isDisabled);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.editor = new Editor({
        element: this.editorRef.nativeElement,
        content: this._value,
        editable: !this.disabled,
        extensions: [
          StarterKit.configure({
            paragraph: false, heading: false, blockquote: false, code: false, codeBlock: false,
            horizontalRule: false, strike: false,
          }),
          ParagraphWithDiv,
          Underline,
          Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { target: '_blank', rel: 'noopener' } }),
          TextAlign.configure({ types: ['paragraph'] }),
          Placeholder.configure({ placeholder: this.placeholder }),
        ],
        editorProps: {
          attributes: { class: 're-content', style: `min-height:${this.minHeight}` },
          transformPastedHTML: (html) => fixPastedBullets(html),
          handlePaste: (_view, event) => {
            const cd = event.clipboardData;
            if (!cd || cd.getData('text/html')) return false;
            const html = plainTextToHtml(cd.getData('text/plain'));
            if (!html) return false;
            this.editor?.commands.insertContent(html);
            return true;
          },
        },
        onUpdate: ({ editor }) => {
          const out = editor.isEmpty ? '' : toResumeHtml(editor.getHTML());
          this._value = out;
          this.zone.run(() => { this._onChange(out); this.syncStates(); });
        },
        onSelectionUpdate: () => this.zone.run(() => this.syncStates()),
        onBlur: () => this.zone.run(() => this._onTouched()),
      });
    });
    this.syncStates();
  }

  ngOnDestroy(): void { this.editor?.destroy(); }

  // ── Toolbar actions ──────────────────────────────────────────────────────
  toggleBold():       void { this.editor?.chain().focus().toggleBold().run(); }
  toggleItalic():     void { this.editor?.chain().focus().toggleItalic().run(); }
  toggleUnderline():  void { this.editor?.chain().focus().toggleUnderline().run(); }
  toggleBulletList(): void { this.editor?.chain().focus().toggleBulletList().run(); }

  insertLink(): void {
    if (!this.editor) return;
    const prev = this.editor.getAttributes('link')['href'] || '';
    const url = prompt('Enter URL:', prev);
    if (url === null) return;
    if (url === '') { this.editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  setAlign(align: Alignment): void {
    this.editor?.chain().focus().setTextAlign(align).run();
    this.alignment = align;
  }

  private syncStates(): void {
    const e = this.editor;
    if (!e) return;
    this.isBold = e.isActive('bold');
    this.isItalic = e.isActive('italic');
    this.isUnderline = e.isActive('underline');
    this.isBullet = e.isActive('bulletList');
    this.alignment = (['center', 'right', 'justify'] as Alignment[]).find((a) => e.isActive({ textAlign: a })) || 'left';
  }

  // ── Error helpers ─────────────────────────────────────────────────────────
  get firstError(): string {
    if (this.errorMessage) return this.errorMessage;
    const ctrl = this.control ?? this.ngControl?.control;
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return `${this.label || 'This field'} is required.`;
    return Object.keys(ctrl.errors)[0];
  }
  get isInvalid(): boolean {
    const ctrl = this.control ?? this.ngControl?.control;
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }
}
