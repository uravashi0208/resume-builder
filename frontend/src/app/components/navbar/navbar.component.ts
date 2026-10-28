// src/app/components/navbar/navbar.component.ts
// COMMON NAVBAR - badha logged-in pages par dekhay che (login/register par nahi)

import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isAuthPage$: Observable<boolean>;

  constructor(private authService: AuthService, private router: Router) {
    // login / register page par navbar hide rakhva mate current url track kare che
    this.isAuthPage$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url.includes('/login') || this.router.url.includes('/register')),
      startWith(this.router.url.includes('/login') || this.router.url.includes('/register'))
    );
  }

  get currentUser$() {
    return this.authService.currentUser$;
  }

  logout() {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }
}
