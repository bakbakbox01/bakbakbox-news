import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  Category,
  CategoryFormValue,
  CategoryListResponse,
  CategoryQueryParams,
} from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly api = inject(ApiService);

  getCategories(params: CategoryQueryParams = {}): Observable<CategoryListResponse> {
    const query: Record<string, string | number | boolean> = { ...params };
    if (params.isActive !== undefined) {
      query['isActive'] = String(params.isActive);
    }

    return this.api
      .get<CategoryListResponse>(API_ENDPOINTS.categories, query)
      .pipe(map((res) => res.data));
  }

  getAllCategories(): Observable<Category[]> {
    return this.getCategories({ limit: 100, sortBy: 'sortOrder', sortOrder: 'asc' }).pipe(
      map((res) => res.categories.filter((c) => c.isActive))
    );
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.api
      .get<{ category: Category }>(`${API_ENDPOINTS.categories}/${slug}`)
      .pipe(map((res) => res.data.category));
  }

  createCategory(data: CategoryFormValue): Observable<Category> {
    return this.api
      .post<{ category: Category }>(API_ENDPOINTS.categories, data)
      .pipe(map((res) => res.data.category));
  }

  updateCategory(id: string, data: Partial<CategoryFormValue>): Observable<Category> {
    return this.api
      .put<{ category: Category }>(`${API_ENDPOINTS.categories}/${id}`, data)
      .pipe(map((res) => res.data.category));
  }

  deleteCategory(id: string): Observable<void> {
    return this.api.delete(`${API_ENDPOINTS.categories}/${id}`).pipe(map(() => undefined));
  }
}
