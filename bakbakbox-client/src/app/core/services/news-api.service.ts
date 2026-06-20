import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  NewsArticle,
  NewsFormValue,
  NewsListResponse,
  NewsQueryParams,
} from '../models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsApiService {
  private readonly api = inject(ApiService);

  getNews(params: NewsQueryParams = {}): Observable<NewsListResponse> {
    const query: Record<string, string | number | boolean> = { ...params } as Record<
      string,
      string | number | boolean
    >;

    if (params.isBreaking !== undefined) {
      query['isBreaking'] = String(params.isBreaking);
    }

    return this.api
      .get<NewsListResponse>(API_ENDPOINTS.news, query)
      .pipe(map((res) => res.data));
  }

  getNewsBySlug(slug: string): Observable<NewsArticle> {
    return this.getNewsById(slug);
  }

  incrementViews(slug: string): Observable<NewsArticle> {
    return this.api
      .post<{ article: NewsArticle }>(`${API_ENDPOINTS.news}/${slug}/view`)
      .pipe(map((res) => res.data.article));
  }

  getLatestNews(page = 1, limit = 10, recentHours?: number): Observable<NewsListResponse> {
    return this.getNews({
      page,
      limit,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
      recentHours,
    });
  }

  getBreakingNews(page = 1, limit = 10, recentHours?: number): Observable<NewsListResponse> {
    return this.getNews({
      page,
      limit,
      isBreaking: true,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
      recentHours,
    });
  }

  getTrendingNews(page = 1, limit = 10, recentHours?: number): Observable<NewsListResponse> {
    return this.getNews({
      page,
      limit,
      sortBy: 'views',
      sortOrder: 'desc',
      recentHours,
    });
  }

  getNewsByCategory(slug: string, page = 1, limit = 10): Observable<NewsListResponse> {
    return this.getNews({
      page,
      limit,
      category: slug,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
  }

  searchNews(query: string, page = 1, limit = 10): Observable<NewsListResponse> {
    return this.getNews({
      page,
      limit,
      search: query,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
  }

  getNewsById(id: string): Observable<NewsArticle> {
    return this.api
      .get<{ article: NewsArticle }>(`${API_ENDPOINTS.news}/${id}`)
      .pipe(map((res) => res.data.article));
  }

  createNews(data: NewsFormValue, image?: File): Observable<NewsArticle> {
    return this.api
      .postFormData<{ article: NewsArticle }>(API_ENDPOINTS.news, this.toFormData(data, image))
      .pipe(map((res) => res.data.article));
  }

  updateNews(id: string, data: Partial<NewsFormValue>, image?: File, removeImage = false): Observable<NewsArticle> {
    const formData = this.toFormData(data as NewsFormValue, image, removeImage);
    return this.api
      .putFormData<{ article: NewsArticle }>(`${API_ENDPOINTS.news}/${id}`, formData)
      .pipe(map((res) => res.data.article));
  }

  deleteNews(id: string): Observable<void> {
    return this.api.delete(`${API_ENDPOINTS.news}/${id}`).pipe(map(() => undefined));
  }

  private toFormData(data: Partial<NewsFormValue>, image?: File, removeImage = false): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (key === 'tags') {
        formData.append(key, JSON.stringify(value));
        return;
      }

      if (typeof value === 'boolean') {
        formData.append(key, String(value));
        return;
      }

      formData.append(key, String(value));
    });

    if (image) {
      formData.append('image', image);
    }

    if (removeImage) {
      formData.append('removeImage', 'true');
    }

    return formData;
  }
}
