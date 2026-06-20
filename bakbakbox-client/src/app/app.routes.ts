import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent
      ),
    loadChildren: () =>
      import('./pages/public/public.routes').then((m) => m.publicRoutes),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
