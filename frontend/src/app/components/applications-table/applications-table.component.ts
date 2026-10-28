// src/app/components/applications-table/applications-table.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { Application, ApplicationStatus } from '../../models/application.model';

const PAGE_SIZE = 15;

@Component({
  selector: 'app-applications-table',
  templateUrl: './applications-table.component.html',
  styleUrls: ['./applications-table.component.css'],
})
export class ApplicationsTableComponent implements OnInit {
  allApplications: Application[] = [];
  filteredApplications: Application[] = [];
  pagedApplications: Application[] = [];

  loading = true;
  errorMsg = '';

  // Search + filter
  searchTerm = '';
  statusFilter: 'All' | ApplicationStatus = 'All';
  statusOptions: ('All' | ApplicationStatus)[] = ['All', 'Applied', 'Accepted', 'Rejected'];

  // Pagination
  currentPage = 1;
  pageSize = PAGE_SIZE;
  totalPages = 1;

  constructor(private applicationService: ApplicationService, private router: Router) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.applicationService.getMyApplications().subscribe({
      next: (apps) => {
        this.allApplications = apps;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to load applications.';
        this.loading = false;
      },
    });
  }

  // ---------- Search + Status filter ----------
  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredApplications = this.allApplications.filter((app) => {
      const matchesSearch =
        !term ||
        app.companyName?.toLowerCase().includes(term) ||
        app.appliedTitle?.toLowerCase().includes(term) ||
        app.location?.toLowerCase().includes(term);

      const matchesStatus = this.statusFilter === 'All' || app.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.applyFilters();
  }

  onStatusFilterChange(value: 'All' | ApplicationStatus) {
    this.statusFilter = value;
    this.applyFilters();
  }

  // ---------- Pagination ----------
  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredApplications.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;

    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedApplications = this.filteredApplications.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ---------- Navigation ----------
  addApplication() {
    this.router.navigate(['/applications/select-template']);
  }

  editApplication(app: Application) {
    this.router.navigate(['/applications/edit', app.id]);
  }

  deleteApp(app: Application) {
    if (!app.id) return;
    if (!confirm(`Delete application for "${app.companyName}"?`)) return;

    this.applicationService.deleteApplication(app.id).subscribe({
      next: () => this.loadApplications(),
    });
  }

  // ---------- Actions ----------
  viewCv(app: Application) {
    window.open(`/cv-view/${app.id}`, '_blank');
  }

  downloadPdf(app: Application) {
    window.open(`/cv-view/${app.id}?download=true`, '_blank');
  }

  /** summary tiles above the table */
  get stats() {
    const all = this.allApplications ?? [];
    const n = (st: string) => all.filter((a) => a.status === st).length;
    return [
      { label: 'Total',    value: all.length,   cls: 'total' },
      { label: 'Applied',  value: n('Applied'),  cls: 'applied' },
      { label: 'Accepted', value: n('Accepted'), cls: 'accepted' },
      { label: 'Rejected', value: n('Rejected'), cls: 'rejected' },
    ];
  }

  statusClass(status: ApplicationStatus): string {
    if (status === 'Accepted') return 'badge accepted';
    if (status === 'Rejected') return 'badge rejected';
    return 'badge applied';
  }
}
