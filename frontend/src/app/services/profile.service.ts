// src/app/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Profile } from '../models/profile.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profiles`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Firebase ID token thi authorized headers banave che
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

  // CREATE / UPSERT
  saveProfile(profile: Profile): Observable<any> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.post(this.apiUrl, profile, { headers }))
    );
  }

  // READ - logged in user's own profile
  getMyProfile(): Observable<Profile> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.get<Profile>(`${this.apiUrl}/me`, { headers }))
    );
  }

  // READ by id (public view / template preview)
  getProfileById(id: string): Observable<Profile> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.get<Profile>(`${this.apiUrl}/${id}`, { headers }))
    );
  }

  // READ ALL
  getAllProfiles(): Observable<Profile[]> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.get<Profile[]>(`${this.apiUrl}/all`, { headers }))
    );
  }

  // UPDATE (partial)
  updateProfile(partial: Partial<Profile>): Observable<any> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.patch(this.apiUrl, partial, { headers }))
    );
  }

  // DELETE
  deleteProfile(): Observable<any> {
    return this.authHeaders$().pipe(
      switchMap((headers) => this.http.delete(this.apiUrl, { headers }))
    );
  }
}
