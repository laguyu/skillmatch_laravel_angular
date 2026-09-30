import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSession } from './auth-session';

export const authGuard: CanActivateFn = () => {
  const authSession = inject(AuthSession);

  return authSession.isAuthenticated() || inject(Router).createUrlTree(['/login']);
};
