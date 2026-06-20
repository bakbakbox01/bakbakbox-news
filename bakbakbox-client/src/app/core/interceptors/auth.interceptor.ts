import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const isAuthEndpoint = (url: string): boolean =>
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.includes('/auth/forgot-password') ||
  url.includes('/auth/reset-password');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token && !isAuthEndpoint(req.url)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  }

  return next(req);
};
