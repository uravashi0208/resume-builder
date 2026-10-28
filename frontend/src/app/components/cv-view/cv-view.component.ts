// src/app/components/cv-view/cv-view.component.ts
// "View CV" ane "Download PDF" (browser print) action mate vaprai che

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile.model';

@Component({
  selector: 'app-cv-view',
  templateUrl: './cv-view.component.html',
  styleUrls: ['./cv-view.component.css'],
})
export class CvViewComponent implements OnInit {
  profile: Profile | null = null;
  loading = true;

  constructor(
    private profileService: ProfileService,
    private applicationService: ApplicationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const appId = this.route.snapshot.paramMap.get('id');
    if (appId) {
      // CV of one specific application (its own template)
      this.applicationService.getApplicationById(appId).subscribe({
        next: (app) => app.profile ? this.show(app.profile) : this.loadSharedProfile(),
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

    // ?download=true hoy to automatic print dialog khulse (Save as PDF)
    if (this.route.snapshot.queryParamMap.get('download') === 'true') {
      // wait for fonts + the paginator to lay the pages out before the print dialog opens
      const go = () => setTimeout(() => window.print(), 700);
      const fonts = (document as any).fonts;
      fonts?.ready ? fonts.ready.then(go) : go();
    }
  }

  printCv() {
    window.print();
  }
}
