import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { NewsApiService } from '../../../core/services/news-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { Category } from '../../../core/models/category.model';
import { NewsArticle } from '../../../core/models/news.model';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeroComponent } from '../../../shared/components/page-hero/page-hero.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { fadeInUp, listStagger } from '../../../shared/animations/public.animations';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    NewsCardComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    PageHeroComponent,
    EmptyStateComponent,
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss',
  animations: [fadeInUp, listStagger],
})
export class CategoryPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly newsApi = inject(NewsApiService);
  private readonly seo = inject(SeoService);

  readonly loading = signal(true);
  readonly category = signal<Category | null>(null);
  readonly news = signal<NewsArticle[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 9;

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
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.page.set(1);
        this.loadCategory(slug);
      }
    });
  }

  loadCategory(slug: string): void {
    this.loading.set(true);

    this.categoryApi.getCategoryBySlug(slug).subscribe({
      next: (cat) => {
        this.category.set(cat);
        this.seo.updateTags({
          title: cat.name,
          description: cat.description || `Latest ${cat.name} news and updates.`,
        });
        this.loadNews(slug);
      },
      error: () => this.loading.set(false),
    });
  }

  loadNews(slug: string): void {
    this.newsApi.getNewsByCategory(slug, this.page(), this.limit).subscribe({
      next: (res) => {
        this.news.set(res.news);
        this.total.set(res.pagination.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(page: number): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;
    this.page.set(page);
    this.loading.set(true);
    this.loadNews(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
