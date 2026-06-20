import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { NewsApiService } from '../../../core/services/news-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { NewsArticle, NewsListResponse } from '../../../core/models/news.model';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeroComponent, PageHeroVariant } from '../../../shared/components/page-hero/page-hero.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { fadeInUp, listStagger } from '../../../shared/animations/public.animations';

export type NewsFeedMode = 'latest' | 'breaking' | 'trending';

const FEED_CONFIG: Record<
  NewsFeedMode,
  { icon: string; badge: string; badgePulse: boolean; variant: PageHeroVariant; emptyIcon: string; emptyTitle: string }
> = {
  breaking: {
    icon: '⚡',
    badge: 'LIVE UPDATES',
    badgePulse: true,
    variant: 'breaking',
    emptyIcon: '⚡',
    emptyTitle: 'No breaking news',
  },
  trending: {
    icon: '🔥',
    badge: 'HOT NOW',
    badgePulse: false,
    variant: 'trending',
    emptyIcon: '🔥',
    emptyTitle: 'Nothing trending yet',
  },
  latest: {
    icon: '📰',
    badge: 'FRESH STORIES',
    badgePulse: false,
    variant: 'latest',
    emptyIcon: '📰',
    emptyTitle: 'No articles yet',
  },
};

@Component({
  selector: 'app-news-feed',
  standalone: true,
  imports: [
    NewsCardComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    PageHeroComponent,
    EmptyStateComponent,
  ],
  templateUrl: './news-feed.component.html',
  styleUrl: './news-feed.component.scss',
  animations: [fadeInUp, listStagger],
})
export class NewsFeedComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly newsApi = inject(NewsApiService);
  private readonly seo = inject(SeoService);

  readonly loading = signal(true);
  readonly news = signal<NewsArticle[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 9;

  readonly title = signal('');
  readonly subtitle = signal('');
  readonly mode = signal<NewsFeedMode>('latest');

  readonly feedConfig = computed(() => FEED_CONFIG[this.mode()]);
  readonly spotlight = computed(() => {
    const items = this.news();
    return this.page() === 1 && items.length ? items[0] : null;
  });
  readonly gridNews = computed(() => {
    const items = this.news();
    if (this.page() === 1 && items.length > 1) return items.slice(1);
    if (this.page() === 1 && items.length === 1) return [];
    return items;
  });

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.mode.set(data['mode'] as NewsFeedMode);
      this.title.set(data['title'] as string);
      this.subtitle.set(data['subtitle'] as string);
      this.seo.updateTags({ title: this.title(), description: this.subtitle() });
      this.page.set(1);
      this.loadNews();
    });
  }

  loadNews(): void {
    this.loading.set(true);

    let request$: Observable<NewsListResponse>;
    switch (this.mode()) {
      case 'breaking':
        request$ = this.newsApi.getBreakingNews(this.page(), this.limit);
        break;
      case 'trending':
        request$ = this.newsApi.getTrendingNews(this.page(), this.limit);
        break;
      default:
        request$ = this.newsApi.getLatestNews(this.page(), this.limit);
    }

    request$.subscribe({
      next: (res) => {
        this.news.set(res.news);
        this.total.set(res.pagination.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  trendingRank(index: number): number | null {
    if (this.mode() !== 'trending' || this.page() !== 1) return null;
    return index + 2;
  }
}
