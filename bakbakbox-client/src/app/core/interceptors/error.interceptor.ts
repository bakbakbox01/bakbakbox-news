import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const isAuthEndpoint = (url: string): boolean =>
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.includes('/auth/forgot-password') ||
  url.includes('/auth/reset-password');

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.error?.message ||
        error.message ||
        'An unexpected error occurred. Please try again.';

      if (
        error.status === 401 &&
        !isAuthEndpoint(req.url) &&
        !router.url.startsWith('/admin/login')
      ) {
        auth.clearSession();
        void router.navigate(['/admin/login'], {
          queryParams: { returnUrl: router.url },
        });
      }

      return throwError(() => ({
        status: error.status,
        message,
        error: error.error,
      }));
    })
  );
};
