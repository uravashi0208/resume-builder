// src/app/guards/auth.guard.ts
//
// PROBLEM (before fix):
//   AuthService.currentUser$ starts with BehaviorSubject(false/null).
//   take(1) grabbed that initial null BEFORE Firebase resolved the
//   persisted session → guard redirected to /login on every page refresh.
//
// FIX:
//   Use authInitialized$ which completes only AFTER Firebase's first
//   onAuthStateChanged callback fires (i.e. the real auth state).

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.authInitialized$.pipe(
      map((user) => {
        if (user) return true;
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}