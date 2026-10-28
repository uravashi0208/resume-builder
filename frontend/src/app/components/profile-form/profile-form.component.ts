// src/app/components/profile-form/profile-form.component.ts
// AA COMMON/REUSABLE COMPONENT CHE - koi pan template mate same form use thay
// PDF resume na badha fields ahiya reactive form ma che (dynamic FormArrays sathe)

import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { Profile, DEFAULT_GDPR_CONSENT } from '../../models/profile.model';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.css'],
})
export class ProfileFormComponent implements OnInit {
  profileForm!: FormGroup;
  saving = false;
  successMsg = '';
  errorMsg = '';
  selectedTemplate = 'template-one';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectedTemplate = this.route.snapshot.queryParamMap.get('template') || 'template-one';
    this.buildForm();
    this.loadExistingProfile();
  }

  private buildForm() {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      professionalTitle: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: [''],
      aboutMe: [''],
      gdprConsent: [DEFAULT_GDPR_CONSENT],
      template: [this.selectedTemplate, Validators.required],

      education: this.fb.array([this.createEducationGroup()]),
      coreCompetencies: this.fb.array([this.fb.control('')]),
      technicalSkills: this.fb.array([this.createSkillGroup()]),
      interests: this.fb.array([this.fb.control('')]),
      experience: this.fb.array([this.createExperienceGroup()]),

      socialLinks: this.fb.group({
        linkedin: [''],
        github: [''],
        portfolio: [''],
        twitter: [''],
      }),
    });
  }

  // ---------- Existing profile load (edit mode) ----------
  private loadExistingProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (profile: Profile) => this.patchForm(profile),
      error: () => {
        /* No profile yet -> naya user, fresh form j rehse */
      },
    });
  }

  private patchForm(profile: Profile) {
    this.profileForm.patchValue({
      fullName: profile.fullName,
      professionalTitle: profile.professionalTitle,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      aboutMe: profile.aboutMe,
      gdprConsent: profile.gdprConsent ?? DEFAULT_GDPR_CONSENT,
      template: profile.template || this.selectedTemplate,
      socialLinks: profile.socialLinks,
    });

    this.setArray('education', profile.education, () => this.createEducationGroup());
    this.setArray('technicalSkills', profile.technicalSkills, () => this.createSkillGroup());
    this.setArray('experience', profile.experience, () => this.createExperienceGroup());
    // old saved data: present = true -> show "Present" in End Date
    profile.experience?.forEach((exp, i) => {
      if (exp.present) this.experience.at(i).get('endDate')?.setValue('Present');
    });
    this.setSimpleArray('coreCompetencies', profile.coreCompetencies);
    this.setSimpleArray('interests', profile.interests);
  }

  private setArray(name: string, items: any[], factory: () => FormGroup) {
    const arr = this.profileForm.get(name) as FormArray;
    arr.clear();
    (items && items.length ? items : [{}]).forEach((item) => {
      const group = factory();
      group.patchValue(item);
      arr.push(group);
    });
  }

  private setSimpleArray(name: string, items: string[]) {
    const arr = this.profileForm.get(name) as FormArray;
    arr.clear();
    (items && items.length ? items : ['']).forEach((val) => arr.push(this.fb.control(val)));
  }

  // ---------- FormArray getters (template ma vaprai) ----------
  get education() {
    return this.profileForm.get('education') as FormArray;
  }
  get coreCompetencies() {
    return this.profileForm.get('coreCompetencies') as FormArray;
  }
  get technicalSkills() {
    return this.profileForm.get('technicalSkills') as FormArray;
  }
  get interests() {
    return this.profileForm.get('interests') as FormArray;
  }
  get experience() {
    return this.profileForm.get('experience') as FormArray;
  }

  // ---------- FormGroup factories ----------
  private createEducationGroup(): FormGroup {
    return this.fb.group({
      degree: [''],
      institute: [''],
      duration: [''],
      score: [''],
      description: [''],
    });
  }

  private createSkillGroup(): FormGroup {
    return this.fb.group({
      category: [''],
      items: [''],
    });
  }

  private createExperienceGroup(): FormGroup {
    const group = this.fb.group({
      role: [''],
      company: [''],
      location: [''],
      startDate: [''],
      endDate: [''],
      present: [false],
      description: [''],
    });
    // "Present" now lives inside the End Date picker -> keep the old `present` flag in sync
    group.get('endDate')?.valueChanges.subscribe((v) =>
      group.get('present')?.setValue(v === 'Present', { emitEvent: false }));
    return group;
  }

  // ---------- Add / Remove row handlers (dynamic fields) ----------
  addEducation() {
    this.education.push(this.createEducationGroup());
  }
  removeEducation(i: number) {
    this.education.removeAt(i);
  }

  addCompetency() {
    this.coreCompetencies.push(this.fb.control(''));
  }
  removeCompetency(i: number) {
    this.coreCompetencies.removeAt(i);
  }

  addSkillGroup() {
    this.technicalSkills.push(this.createSkillGroup());
  }
  removeSkillGroup(i: number) {
    this.technicalSkills.removeAt(i);
  }

  addInterest() {
    this.interests.push(this.fb.control(''));
  }
  removeInterest(i: number) {
    this.interests.removeAt(i);
  }

  resetGdprConsent() {
    this.profileForm.get('gdprConsent')?.setValue(DEFAULT_GDPR_CONSENT);
  }

  addExperience() {
    this.experience.push(this.createExperienceGroup());
  }
  removeExperience(i: number) {
    this.experience.removeAt(i);
  }

  // ---------- Submit -> Node API -> Firestore ----------
  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const profileData: Profile = this.profileForm.value;

    this.profileService.saveProfile(profileData).subscribe({
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