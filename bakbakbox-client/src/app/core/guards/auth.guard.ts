import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

const loginRedirect = (router: Router, returnUrl: string) =>
  router.createUrlTree(['/admin/login'], {
    queryParams: { returnUrl },
  });

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  if (auth.getToken()) {
    return auth.validateSession().pipe(
      map((valid) => (valid ? true : loginRedirect(router, state.url)))
    );
  }

  return loginRedirect(router, state.url);
};

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    const admin = auth.admin();
    if (admin && ['admin', 'superadmin'].includes(admin.role)) {
      return true;
    }
    return router.createUrlTree(['/']);
  }

  if (auth.getToken()) {
    return auth.validateSession().pipe(
      map((valid) => {
        if (!valid) {
          return loginRedirect(router, state.url);
        }

        const admin = auth.admin();
        if (admin && ['admin', 'superadmin'].includes(admin.role)) {
          return true;
        }

        return router.createUrlTree(['/']);
      })
    );
  }

  return loginRedirect(router, state.url);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/admin/dashboard']);
};
