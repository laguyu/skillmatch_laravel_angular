import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthApi } from '../../../core/api/auth-api';
import { AuthSession } from '../../../core/auth/auth-session';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly authSession = inject(AuthSession);
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly isLoggingOut = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);
    this.errorMessage.set(null);

    this.authApi
      .logout()
      .pipe(finalize(() => this.isLoggingOut.set(false)))
      .subscribe({
        next: () => {
          this.authSession.clearSession();
          void this.router.navigateByUrl('/');
        },
        error: () => this.errorMessage.set('No se pudo cerrar la sesión. Inténtalo de nuevo.'),
      });
  }
}
