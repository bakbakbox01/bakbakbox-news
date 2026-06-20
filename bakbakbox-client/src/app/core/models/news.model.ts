export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NewsImage {
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
}

export interface NewsCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface NewsAuthorRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type NewsStatus = 'draft' | 'published' | 'archived';

export interface NewsArticle {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  image: NewsImage | null;
  category: NewsCategoryRef | string;
  author: NewsAuthorRef | string;
  tags: string[];
  isBreaking: boolean;
  status: NewsStatus;
  views: number;
  publishedAt: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  news: NewsArticle[];
  pagination: PaginationMeta;
}

export interface NewsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: NewsStatus;
  isBreaking?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  /** Only return articles published/created within the last N hours */
  recentHours?: number;
}

export interface NewsFormValue {
  title: string;
  shortDescription: string;
  content: string;
  category: string;
  tags: string[];
  isBreaking: boolean;
  status: NewsStatus;
}
