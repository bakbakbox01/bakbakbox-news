import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NewsApiService } from '../../../core/services/news-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { NewsArticle } from '../../../core/models/news.model';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeroComponent } from '../../../shared/components/page-hero/page-hero.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { fadeInUp, listStagger } from '../../../shared/animations/public.animations';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NewsCardComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    PageHeroComponent,
    EmptyStateComponent,
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
  animations: [fadeInUp, listStagger],
})
export class SearchPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly newsApi = inject(NewsApiService);
  private readonly seo = inject(SeoService);

  readonly loading = signal(false);
  readonly news = signal<NewsArticle[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly query = signal('');
  readonly limit = 9;

  readonly searchControl = new FormControl('', { nonNullable: true });

  searchMeta(): string {
    if (!this.query()) return '';
    return this.total() ? `${this.total()} results for "${this.query()}"` : '';
  }

  noResultsMessage(): string {
    return `We couldn't find any articles matching "${this.query()}". Try different keywords.`;
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q')?.trim() ?? '';
      this.query.set(q);
      this.searchControl.setValue(q);
      this.page.set(1);

      if (q) {
        this.seo.updateTags({ title: `Search: ${q}`, description: `Search results for "${q}"` });
        this.search();
      } else {
        this.news.set([]);
        this.total.set(0);
      }
    });
  }

  onSearch(): void {
    const q = this.searchControl.value.trim();
    if (q) {
      void this.router.navigate(['/search'], { queryParams: { q } });
    }
  }

  search(): void {
    if (!this.query()) return;

    this.loading.set(true);
    this.newsApi.searchNews(this.query(), this.page(), this.limit).subscribe({
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
    this.search();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
