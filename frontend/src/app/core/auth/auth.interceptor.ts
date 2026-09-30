import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_URL } from '../api/job-api';
import { AuthSession } from './auth-session';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = inject(API_URL).replace(/\/$/, '');
  const token = inject(AuthSession).token();
  const targetsApi = request.url === apiUrl || request.url.startsWith(`${apiUrl}/`);

  if (token === null || !targetsApi) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};