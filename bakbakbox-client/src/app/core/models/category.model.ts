import { PaginationMeta } from './news.model';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: PaginationMeta;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryFormValue {
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}
