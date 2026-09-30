import { Injectable, computed, signal } from '@angular/core';

import { AuthenticatedUser, AuthResponse } from '../models/job';

@Injectable({
  providedIn: 'root',
})
export class AuthSession {
  private readonly storageKey = 'skillmatch-session';
  private readonly currentSession = signal<AuthResponse['data'] | null>(this.readSession());

  readonly user = computed(() => this.currentSession()?.user ?? null);
  readonly token = computed(() => this.currentSession()?.token ?? null);
  readonly isAuthenticated = computed(() => this.currentSession() !== null);

  setSession(session: AuthResponse['data']): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.currentSession.set(session);
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
    this.currentSession.set(null);
  }

  private readSession(): AuthResponse['data'] | null {
    const storedSession = localStorage.getItem(this.storageKey);

    if (storedSession === null) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as { token: string; user: AuthenticatedUser };
    } catch {
      localStorage.removeItem(this.storageKey);

      return null;
    }
  }
}
