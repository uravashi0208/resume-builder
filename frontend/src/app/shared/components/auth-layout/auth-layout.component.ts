// src/app/shared/components/auth-layout/auth-layout.component.ts
// Common shell for Login + Register: animated backdrop, brand hero (left) and a slot for the form card (right).
// Styles live in src/auth.css. Usage:
//   <app-auth-layout heroTitle="..." heroAccent="..." heroSub="..."> <form class="auth-card glass">…</form> </app-auth-layout>
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  @Input() heroTitle  = '';
  @Input() heroAccent = '';
  @Input() heroSub    = '';
  readonly points = [
    'ATS-friendly templates recruiters can parse',
    'A4 & Letter pages with a clean automatic split',
    'Write in 25 languages, export a crisp PDF',
  ];
}
