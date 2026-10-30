// src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, authErrorMessage } from '../../services/auth.service';

/** Confirm-password control: error { mismatch } when it differs from the sibling `password` control. */
function matchPassword(control: AbstractControl): ValidationErrors | null {
  const pwd = control.parent?.get('password')?.value;
  return control.value && control.value !== pwd ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMsg = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm:  ['', [Validators.required, matchPassword]],
    });
    // re-check "confirm" whenever "password" changes
    this.registerForm.get('password')!.valueChanges.subscribe(() =>
      this.registerForm.get('confirm')!.updateValueAndValidity()
    );
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.registerForm.value;

    this.authService
      .register(email, password)
      .then(() => this.router.navigate(['/template-select']))
      .catch((err) => (this.errorMsg = authErrorMessage(err)))
      .finally(() => (this.loading = false));
  }
}
