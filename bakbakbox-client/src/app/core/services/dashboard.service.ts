import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  DashboardOverview,
  DashboardStatistics,
} from '../models/dashboard.model';
import { NewsArticle } from '../models/news.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getOverview(recentLimit = 5, activityLimit = 10): Observable<DashboardOverview> {
    return this.api
      .get<DashboardOverview>(API_ENDPOINTS.dashboard, {
        recentLimit,
        activityLimit,
      })
      .pipe(map((res) => res.data));
  }

  getStatistics(): Observable<DashboardStatistics> {
    return this.api
      .get<{ statistics: DashboardStatistics }>(`${API_ENDPOINTS.dashboard}/statistics`)
      .pipe(map((res) => res.data.statistics));
  }

  getRecentNews(limit = 5): Observable<NewsArticle[]> {
    return this.api
      .get<{ recentNews: NewsArticle[] }>(`${API_ENDPOINTS.dashboard}/recent-news`, { limit })
      .pipe(map((res) => res.data.recentNews));
  }
}
