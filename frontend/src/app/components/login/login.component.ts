// src/app/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, authErrorMessage } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMsg = '';
  infoMsg = '';
  loading = false;
  resetting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Already logged-in user /login par aave to dashboard par moklo
    this.authService.authInitialized$.subscribe((user) => {
      if (user) this.router.navigate(['/dashboard']);
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading  = true;
    this.errorMsg = '';
    this.infoMsg  = '';
    const { email, password } = this.loginForm.value;

    this.authService
      .login(email, password)
      .then(() => this.router.navigate(['/dashboard']))
      .catch((err) => (this.errorMsg = authErrorMessage(err)))
      .finally(() => (this.loading = false));
  }

  /** Sends a Firebase password-reset email to the address typed in the Email field. */
  forgotPassword() {
    const email = this.loginForm.get('email')!;
    this.errorMsg = '';
    this.infoMsg  = '';
    email.markAsTouched();
    if (email.invalid) {
      this.errorMsg = 'Enter your email above, then click “Forgot password?”.';
      return;
    }
    this.resetting = true;
    this.authService
      .resetPassword(email.value)
      .then(() => (this.infoMsg = 'If an account exists for this email, a reset link is on its way.'))
      .catch((err) => (this.errorMsg = authErrorMessage(err)))
      .finally(() => (this.resetting = false));
  }
}
