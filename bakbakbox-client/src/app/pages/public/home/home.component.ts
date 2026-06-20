import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { NewsApiService } from '../../../core/services/news-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { Category } from '../../../core/models/category.model';
import { NewsArticle } from '../../../core/models/news.model';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import {
  fadeInUp,
  listStagger,
  slideInRight,
  scaleIn,
  fadeIn,
} from '../../../shared/animations/public.animations';
import { environment } from '../../../../environments/environment';

const CATEGORY_ACCENTS = ['#2563eb', '#dc2626', '#ea580c', '#059669', '#7c3aed', '#0891b2', '#db2777', '#4f46e5'];
const CATEGORY_ICONS = ['🌍', '🇮🇳', '📰', '💼', '⚽', '💻', '🎬', '🏛️'];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    NewsCardComponent,
    LoadingSpinnerComponent,
    BrandLogoComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [fadeInUp, listStagger, slideInRight, scaleIn, fadeIn],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly newsApi = inject(NewsApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly seo = inject(SeoService);

  /** Only show fresh news on home — not older RSS backlog */
  private readonly recentHours = environment.recentNewsHours;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly loading = signal(true);
  readonly breaking = signal<NewsArticle[]>([]);
  readonly latest = signal<NewsArticle[]>([]);
  readonly trending = signal<NewsArticle[]>([]);
  readonly categories = signal<Category[]>([]);

  /** Hero stat totals from API pagination — not fetched page size */
  readonly totalLatest = signal(0);
  readonly totalBreaking = signal(0);
  readonly totalCategories = signal(0);

  /** Animated count-up values for hero stats */
  readonly displayLatestCount = signal(0);
  readonly displayBreakingCount = signal(0);
  readonly displayCategoriesCount = signal(0);

  private heroStatsAnimated = false;
  private countUpFrameIds: number[] = [];

  readonly exploreLinks = [
    { icon: '⚡', label: 'Breaking News', desc: 'Live & urgent stories', route: '/breaking', accent: '#ef4444' },
    { icon: '🔥', label: 'Trending Now', desc: 'Most read today', route: '/trending', accent: '#f59e0b' },
    { icon: '🗂️', label: 'Categories', desc: 'Explore by topic', route: '/categories', accent: '#8b5cf6' },
    { icon: '🔍', label: 'Search', desc: 'Find any story', route: '/search', accent: '#2563eb' },
  ];

  readonly displayLatest = computed(() => {
    if (this.latest().length) return this.latest();
    if (this.breaking().length) return this.breaking().slice(0, 4);
    return [];
  });

  readonly displayTrending = computed(() => {
    if (this.trending().length) return this.trending();
    if (this.breaking().length) return this.breaking().slice(0, 5);
    return [];
  });

  readonly usingBreakingFallback = computed(
    () => !this.latest().length && this.breaking().length > 0
  );

  readonly usingTrendingFallback = computed(
    () => !this.trending().length && this.breaking().length > 0
  );

  readonly trustItems = [
    { icon: '📰', title: '24/7 Coverage', desc: 'Updated around the clock', accent: '#2563eb', stat: 'Always on' },
    { icon: '✓', title: 'Verified Sources', desc: 'Trusted reporting you can rely on', accent: '#059669', stat: 'Fact-checked' },
    { icon: '⚡', title: 'Instant Alerts', desc: 'Breaking news as it happens', accent: '#ea580c', stat: 'Real-time' },
  ];

  readonly heroParticles = Array.from({ length: 22 }, (_, i) => i);

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Home',
      description: 'Latest breaking news, trending stories, and top headlines from Bak Bak Box News.',
    });

    this.loadNews(true);

    this.refreshTimer = setInterval(
      () => this.loadNews(false),
      environment.newsRefreshMs
    );
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.countUpFrameIds.forEach((id) => cancelAnimationFrame(id));
  }

  private loadNews(showLoader: boolean): void {
    if (showLoader) {
      this.loading.set(true);
    }

    forkJoin({
      breaking: this.newsApi.getBreakingNews(1, 3, this.recentHours),
      latest: this.newsApi.getLatestNews(1, 6, this.recentHours),
      trending: this.newsApi.getTrendingNews(1, 5, this.recentHours),
      categories: this.categoryApi.getAllCategories(),
    }).subscribe({
      next: ({ breaking, latest, trending, categories }) => {
        this.breaking.set(breaking.news);
        this.latest.set(latest.news);
        this.trending.set(trending.news);
        this.categories.set(categories.filter((c) => c.isActive).slice(0, 8));
        this.totalLatest.set(latest.pagination.total);
        this.totalBreaking.set(breaking.pagination.total);
        this.totalCategories.set(categories.filter((c) => c.isActive).length);
        this.updateHeroStats(showLoader);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  categoryAccent(index: number): string {
    return CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length];
  }

  categoryIcon(index: number): string {
    return CATEGORY_ICONS[index % CATEGORY_ICONS.length];
  }

  trendingBarWidth(views: number, index: number): number {
    const items = this.displayTrending();
    const max = items[0]?.views ?? views;
    if (!max) return 20;
    const ratio = (views / max) * 100;
    return Math.max(15, Math.min(100, ratio - index * 3));
  }

  private updateHeroStats(animate: boolean): void {
    const latest = this.totalLatest();
    const breaking = this.totalBreaking();
    const categories = this.totalCategories();

    if (animate && !this.heroStatsAnimated) {
      this.runCountUp(latest, (v) => this.displayLatestCount.set(v));
      this.runCountUp(breaking, (v) => this.displayBreakingCount.set(v), 1000);
      this.runCountUp(categories, (v) => this.displayCategoriesCount.set(v), 900);
      this.heroStatsAnimated = true;
      return;
    }

    this.displayLatestCount.set(latest);
    this.displayBreakingCount.set(breaking);
    this.displayCategoriesCount.set(categories);
  }

  private runCountUp(
    target: number,
    setter: (value: number) => void,
    duration = 1200
  ): void {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setter(target);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.round(target * eased));

      if (progress < 1) {
        const frameId = requestAnimationFrame(tick);
        this.countUpFrameIds.push(frameId);
      }
    };

    const frameId = requestAnimationFrame(tick);
    this.countUpFrameIds.push(frameId);
  }
}
