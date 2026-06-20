import { NavItem } from '../models/nav-item.model';

export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/', exact: true, icon: '🏠' },
  { label: 'Latest', path: '/news', icon: '📰' },
  { label: 'Breaking', path: '/breaking', icon: '⚡' },
  { label: 'Trending', path: '/trending', icon: '🔥' },
  { label: 'Categories', path: '/categories', icon: '🗂️' },
];

export const PUBLIC_FOOTER_LINKS: NavItem[] = [
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Latest News', path: '/news' },
];
