import { Routes } from '@angular/router';
import { adminGuard, guestGuard } from '../../core/guards/auth.guard';

export const adminChildRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    data: { breadcrumb: 'Dashboard' },
  },
  {
    path: 'news',
    loadComponent: () =>
      import('./news/news-list/news-list.component').then((m) => m.NewsListComponent),
    data: { breadcrumb: 'Manage News' },
  },
  {
    path: 'news/create',
    loadComponent: () =>
      import('./news/news-form/news-form.component').then((m) => m.NewsFormComponent),
    data: { breadcrumb: 'Add News' },
  },
  {
    path: 'news/:id/edit',
    loadComponent: () =>
      import('./news/news-form/news-form.component').then((m) => m.NewsFormComponent),
    data: { breadcrumb: 'Edit News' },
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/category-list/category-list.component').then(
        (m) => m.CategoryListComponent
      ),
    data: { breadcrumb: 'Categories' },
  },
  {
    path: 'media',
    loadComponent: () =>
      import('./media/image-upload/image-upload.component').then(
        (m) => m.ImageUploadComponent
      ),
    data: { breadcrumb: 'Media Upload' },
  },
];

export const adminRoutes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../../layouts/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: adminChildRoutes,
  },
];
