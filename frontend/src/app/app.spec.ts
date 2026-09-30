import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthApi } from './core/api/auth-api';
import { AuthSession } from './core/auth/auth-session';
import { App } from './app';

describe('App', () => {
  let authApi: jasmine.SpyObj<AuthApi>;

  beforeEach(async () => {
    localStorage.removeItem('skillmatch-session');
    authApi = jasmine.createSpyObj<AuthApi>('AuthApi', ['logout']);
    authApi.logout.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: AuthApi, useValue: authApi }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the router outlet and guest navigation', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.querySelector('a[href="/login"]')).not.toBeNull();
    expect(compiled.querySelector('a[href="/registro"]')).not.toBeNull();
  });

  it('shows dashboard and logout for an authenticated user', () => {
    const session = TestBed.inject(AuthSession);
    session.setSession({
      token: 'demo-token',
      user: {
        id: 1,
        name: 'Demo Candidate',
        email: 'candidate@example.test',
        role: 'candidate',
        headline: null,
      },
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[href="/dashboard"]')).not.toBeNull();
    expect(compiled.querySelector('button.logout-button')).not.toBeNull();

    compiled.querySelector<HTMLButtonElement>('button.logout-button')!.click();
    fixture.detectChanges();

    expect(authApi.logout).toHaveBeenCalledTimes(1);
    expect(session.isAuthenticated()).toBeFalse();
    expect(compiled.querySelector('a[href="/login"]')).not.toBeNull();
  });
});
