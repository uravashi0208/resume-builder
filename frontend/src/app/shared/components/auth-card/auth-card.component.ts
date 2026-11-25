// The card used by Login AND Register: tabs, title, fields slot, messages, submit button, switch link.
//   <form [formGroup]="f" (ngSubmit)="submit()">
//     <app-auth-card title="Welcome back" submitLabel="Sign in" …> <app-input-field …/> <div extra>…</div> </app-auth-card>
//   </form>
// (The <form> stays in the page so formControlName keeps working; the submit button inside submits it.)
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-card glass">
      <nav class="tabs auth-switch">
        <a routerLink="/login" routerLinkActive="active">Sign in</a>
        <a routerLink="/register" routerLinkActive="active">Create account</a>
      </nav>

      <h2 class="display">{{ title }}</h2>
      <p class="auth-subtitle">{{ subtitle }}</p>

      <div class="auth-fields"><ng-content></ng-content></div>
      <ng-content select="[extra]"></ng-content>

      <p class="msg-error"   *ngIf="errorMsg">{{ errorMsg }}</p>
      <p class="msg-success" *ngIf="infoMsg">{{ infoMsg }}</p>

      <button type="submit" class="btn-primary btn-block" [disabled]="disabled || loading">
        <span>{{ loading ? loadingLabel : submitLabel }}</span>
        <app-icon name="arrow-right"></app-icon>
      </button>
      <p class="switch-link">{{ switchText }} <a [routerLink]="switchLink">{{ switchLabel }}</a></p>
    </div>`,
})
export class AuthCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() submitLabel = '';
  @Input() loadingLabel = '';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() errorMsg = '';
  @Input() infoMsg = '';
  @Input() switchText = '';
  @Input() switchLabel = '';
  @Input() switchLink = '/login';
}
