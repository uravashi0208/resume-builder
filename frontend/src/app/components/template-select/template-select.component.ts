// src/app/components/template-select/template-select.component.ts
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getSampleProfile, TEMPLATE_OPTIONS } from '../../models/sample-profile';

@Component({
  selector: 'app-template-select',
  templateUrl: './template-select.component.html',
  styleUrls: ['./template-select.component.css'],
})
export class TemplateSelectComponent {
  // Same 6 designs as the editor gallery
  templates = TEMPLATE_OPTIONS.map((t) => ({ id: t.id, name: t.label, sample: getSampleProfile(t.id) }));

  constructor(private router: Router, private route: ActivatedRoute) {}

  selectTemplate(templateId: string) {
    // coming from "Add Application" -> go to the application editor with the chosen template
    if (this.route.snapshot.data['target'] === 'application') {
      this.router.navigate(['/applications/new'], { queryParams: { template: templateId } });
      return;
    }
    // Selected template id sathe profile-form page par jashe
    this.router.navigate(['/profile-form'], { queryParams: { template: templateId } });
  }
}
