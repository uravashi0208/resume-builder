// src/app/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMsg = '';
  loading = false;

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
    // Jyare already logged-in user /login par aave to dashboard par moklo
    this.authService.authInitialized$.subscribe((user) => {
      if (user) this.router.navigate(['/dashboard']);
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading  = true;
    this.errorMsg = '';
    const { email, password } = this.loginForm.value;

    this.authService
      .login(email, password)
      .then(() => this.router.navigate(['/dashboard']))
      .catch((err) => (this.errorMsg = err.message))
      .finally(() => (this.loading = false));
  }
}