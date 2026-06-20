import { NavItem } from '../models/nav-item.model';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
  { label: 'News', path: '/admin/news', icon: 'article' },
  { label: 'Categories', path: '/admin/categories', icon: 'category' },
  { label: 'Media', path: '/admin/media', icon: 'photo_library' },
];

export const ADMIN_HEADER_ACTIONS: NavItem[] = [
  { label: 'View Site', path: '/', icon: 'open_in_new' },
];
