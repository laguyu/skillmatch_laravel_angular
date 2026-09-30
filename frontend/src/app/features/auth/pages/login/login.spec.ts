import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { AuthApi } from '../../../../core/api/auth-api';
import { AuthSession } from '../../../../core/auth/auth-session';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let authApi: jasmine.SpyObj<AuthApi>;

  beforeEach(async () => {
    authApi = jasmine.createSpyObj<AuthApi>('AuthApi', ['login']);
    authApi.login.and.returnValue(throwError(() => new Error('Invalid credentials')));

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthApi, useValue: authApi },
        { provide: AuthSession, useValue: jasmine.createSpyObj<AuthSession>('AuthSession', ['setSession']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
  });

  it('re-enables the submit button after a failed request', () => {
    const root = fixture.nativeElement as HTMLElement;
    const email = root.querySelector<HTMLInputElement>('#email')!;
    const password = root.querySelector<HTMLInputElement>('#password')!;
    email.value = 'person@example.com';
    email.dispatchEvent(new Event('input'));
    password.value = 'valid-password';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    root.querySelector('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authApi.login).toHaveBeenCalledOnceWith({
      email: 'person@example.com',
      password: 'valid-password',
    });
    expect(root.querySelector<HTMLButtonElement>('button')!.disabled).toBeFalse();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('No fue posible iniciar sesión');
  });
});