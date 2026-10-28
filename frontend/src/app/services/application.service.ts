// src/app/services/application.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Application } from '../models/application.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private authHeaders$(): Observable<HttpHeaders> {
    return from(this.authService.getIdToken()).pipe(
      switchMap((token) =>
        from([
          new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }),
        ])
      )
    );
  }

  getMyApplications(): Observable<Application[]> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.get<Application[]>(this.apiUrl, { headers }))
    );
  }

  getApplicationById(id: string): Observable<Application> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.get<Application>(`${this.apiUrl}/${id}`, { headers }))
    );
  }

  createApplication(app: Application): Observable<any> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.post(this.apiUrl, app, { headers }))
    );
  }

  updateApplication(id: string, app: Partial<Application>): Observable<any> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.patch(`${this.apiUrl}/${id}`, app, { headers }))
    );
  }

  deleteApplication(id: string): Observable<any> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.delete(`${this.apiUrl}/${id}`, { headers }))
    );
  }
}
