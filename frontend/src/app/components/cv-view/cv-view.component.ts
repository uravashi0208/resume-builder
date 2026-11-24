// src/app/components/cv-view/cv-view.component.ts
// Read-only view of the CV saved with one application (or the shared profile). No download / print.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { ProfileService } from '../../services/profile.service';
import { Application } from '../../models/application.model';
import { Profile } from '../../models/profile.model';
import { stripTags } from '../../shared/utils/text';

@Component({
  selector: 'app-cv-view',
  templateUrl: './cv-view.component.html',
  styleUrls: ['./cv-view.component.css'],
})
export class CvViewComponent implements OnInit {
  profile: Profile | null = null;
  application: Application | null = null;
  loading = true;

  constructor(
    private profileService: ProfileService,
    private applicationService: ApplicationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const appId = this.route.snapshot.paramMap.get('id');
    if (appId) {
      this.applicationService.getApplicationById(appId).subscribe({
        next: (app) => {
          this.application = app;
          app.profile ? this.show(app.profile) : this.loadSharedProfile();
        },
        error: () => this.loadSharedProfile(),
      });
    } else {
      this.loadSharedProfile();
    }
  }

  private loadSharedProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (p) => this.show(p),
      error: () => { this.loading = false; },
    });
  }

  private show(p: Profile) {
    this.profile = p;
    this.loading = false;
  }

  get hasJobDescription(): boolean {
    return !!stripTags(this.application?.jobDescription);
  }

  back() {
    this.router.navigate([this.application ? '/applications' : '/dashboard']);
  }
}
