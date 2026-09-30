import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthApi } from '../../../../core/api/auth-api';
import { AuthSession } from '../../../../core/auth/auth-session';
import { UserRole } from '../../../../core/models/job';

@Component({
  selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly authSession = inject(AuthSession);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    headline: ['', [Validators.maxLength(160)]],
    role: ['candidate' as UserRole, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(12)]],
    password_confirmation: ['', [Validators.required]],
  });

  protected submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.controls.password.value !== this.form.controls.password_confirmation.value) {
      this.errorMessage.set('Las contraseñas deben coincidir.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authApi
      .register(this.form.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.authSession.setSession(response.data);
          void this.router.navigateByUrl('/dashboard');
        },
        error: (error: HttpErrorResponse) => {
          const serverMessage = error.error?.message;

          this.errorMessage.set(
            typeof serverMessage === 'string'
              ? serverMessage
              : 'No fue posible crear la cuenta. Revisa los datos e inténtalo otra vez.',
          );
        },
      });
  }

}
