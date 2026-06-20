import { Routes } from '@angular/router';

export const publicRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'news',
    loadComponent: () =>
      import('./news-feed/news-feed.component').then((m) => m.NewsFeedComponent),
    data: {
      mode: 'latest',
      title: 'Latest News',
      subtitle: 'The most recently published stories',
    },
  },
  {
    path: 'breaking',
    loadComponent: () =>
      import('./news-feed/news-feed.component').then((m) => m.NewsFeedComponent),
    data: {
      mode: 'breaking',
      title: 'Breaking News',
      subtitle: 'Urgent and developing stories',
    },
  },
  {
    path: 'trending',
    loadComponent: () =>
      import('./news-feed/news-feed.component').then((m) => m.NewsFeedComponent),
    data: {
      mode: 'trending',
      title: 'Trending News',
      subtitle: 'Most viewed stories right now',
    },
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories-list/categories-list.component').then((m) => m.CategoriesListComponent),
  },
  {
    path: 'category/:slug',
    loadComponent: () =>
      import('./category-page/category-page.component').then((m) => m.CategoryPageComponent),
  },
  {
    path: 'news/:slug',
    loadComponent: () =>
      import('./news-detail/news-detail.component').then((m) => m.NewsDetailComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./search-page/search-page.component').then((m) => m.SearchPageComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.component').then((m) => m.ContactComponent),
  },
];
