import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSession } from './auth-session';

export const recruiterGuard: CanActivateFn = () => {
  const authSession = inject(AuthSession);

  return authSession.user()?.role === 'recruiter' || inject(Router).createUrlTree(['/dashboard']);
};