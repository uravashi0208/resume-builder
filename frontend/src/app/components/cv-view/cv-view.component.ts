// src/app/components/cv-view/cv-view.component.ts
// Read-only page for one application: header, CV / Job description (tabs or side by side). No download / print.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { ProfileService } from '../../services/profile.service';
import { Application } from '../../models/application.model';
import { Profile } from '../../models/profile.model';
import { TabOption } from '../../shared/components/segmented-tabs/segmented-tabs.component';
import { stripTags } from '../../shared/utils/text';

type View = 'cv' | 'jd' | 'both';

@Component({
  selector: 'app-cv-view',
  templateUrl: './cv-view.component.html',
  styleUrls: ['./cv-view.component.css'],
})
export class CvViewComponent implements OnInit {
  readonly tabs: TabOption[] = [
    { value: 'cv',   label: 'CV' },
    { value: 'jd',   label: 'Job Description' },
    { value: 'both', label: 'Side by side', wideOnly: true },
  ];

  profile: Profile | null = null;
  application: Application | null = null;
  hasJobDescription = false;
  loading = true;
  view: View = 'cv';

  constructor(
    private profileService: ProfileService,
    private applicationService: ApplicationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const appId = this.route.snapshot.paramMap.get('id');
    if (!appId) return this.loadSharedProfile();

    this.applicationService.getApplicationById(appId).subscribe({
      next: (app) => {
        this.application = app;
        this.hasJobDescription = !!stripTags(app.jobDescription);
        app.profile ? this.show(app.profile) : this.loadSharedProfile();
      },
      error: () => this.loadSharedProfile(),
    });
  }

  private loadSharedProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (p) => this.show(p),
      error: () => (this.loading = false),
    });
  }

  private show(p: Profile) {
    this.profile = p;
    this.loading = false;
  }

  setView(v: string) {
    this.view = v as View;
  }

  back() {
    this.router.navigate([this.application ? '/applications' : '/dashboard']);
  }
}
