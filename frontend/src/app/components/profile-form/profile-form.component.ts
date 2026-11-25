// src/app/components/profile-form/profile-form.component.ts
// "My profile" page — the shared <app-cv-form> with every section, plus Save.

import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { CvFormService } from '../../services/cv-form.service';
import { Profile } from '../../models/profile.model';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
})
export class ProfileFormComponent implements OnInit {
  form: FormGroup = this.cv.build();
  saving = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private cv: CvFormService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileService.getMyProfile().subscribe({
      next: (profile) => this.cv.patch(this.form, profile),
      error: () => { /* new user -> the empty form stays */ },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Please fill all required fields (Basic Info).';
      return;
    }

    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.profileService.saveProfile(this.form.value as Profile).subscribe({
      next: () => {
        this.successMsg = 'Profile saved successfully!';
        this.saving = false;
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to save profile.';
        this.saving = false;
      },
    });
  }
}
