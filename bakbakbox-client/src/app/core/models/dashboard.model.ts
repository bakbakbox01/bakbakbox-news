import { NewsArticle } from './news.model';

export interface DashboardStatistics {
  totalNews: number;
  totalCategories: number;
  totalViews: number;
  breakingNewsCount: number;
  draftCount: number;
  publishedCount: number;
  archivedCount: number;
  activeCategories: number;
  inactiveCategories: number;
}

export interface DashboardActivity {
  type: string;
  entity: 'news' | 'category';
  entityId: string;
  title: string;
  slug: string;
  status?: string;
  performedBy?: { firstName: string; lastName: string; email: string };
  timestamp: string;
}

export interface DashboardOverview {
  statistics: DashboardStatistics;
  recentNews: NewsArticle[];
  latestActivity: DashboardActivity[];
}

export interface UploadedImage {
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
}
