// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app  = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.app);

  // null  = not yet initialized (Firebase SDK still checking persisted session)
  // User  = logged in
  // false = logged out (explicitly)
  private currentUserSubject = new BehaviorSubject<User | null | false>(false);
  currentUser$: Observable<User | null | false> = this.currentUserSubject.asObservable();

  /**
   * Emits only after Firebase has resolved the persisted auth state.
   * Guards use this so they never act on the uninitialized `false` value.
   */
  readonly authInitialized$: Observable<User | null> = new Observable((observer) => {
    // onAuthStateChanged fires once immediately with the persisted user (or null).
    const unsubscribe = onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);   // update shared subject too
      observer.next(user);
      observer.complete();                  // completes after first real emission
    });
    return unsubscribe;
  });

  constructor() {
    // Keep subject in sync for the rest of the app lifetime
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }
}