import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { NewsApiService } from '../../../core/services/news-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { NewsArticle } from '../../../core/models/news.model';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeroComponent } from '../../../shared/components/page-hero/page-hero.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { newsImageSrcSet, resolveNewsImageUrl } from '../../../core/utils/news-image.util';
import { fadeInUp, listStagger } from '../../../shared/animations/public.animations';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    NewsCardComponent,
    LoadingSpinnerComponent,
    PageHeroComponent,
    EmptyStateComponent,
    SafeHtmlPipe,
  ],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss',
  animations: [fadeInUp, listStagger],
})
export class NewsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly newsApi = inject(NewsApiService);
  private readonly seo = inject(SeoService);

  readonly loading = signal(true);
  readonly article = signal<NewsArticle | null>(null);
  readonly related = signal<NewsArticle[]>([]);
  readonly popular = signal<NewsArticle[]>([]);
  readonly imageFailed = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadArticle(slug);
      }
    });
  }

  loadArticle(slug: string): void {
    this.loading.set(true);
    this.article.set(null);
    this.imageFailed.set(false);

    this.newsApi.getNewsBySlug(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.loading.set(false);

        this.seo.updateTags({
          title: article.title,
          description: article.shortDescription || article.title,
          keywords: (article.tags ?? []).join(', '),
        });

        const categorySlug =
          typeof article.category === 'object' ? article.category.slug : '';

        forkJoin({
          related: categorySlug
            ? this.newsApi.getNewsByCategory(categorySlug, 1, 4)
            : this.newsApi.getLatestNews(1, 4),
          popular: this.newsApi.getTrendingNews(1, 5),
        }).subscribe({
          next: ({ related, popular }) => {
            this.related.set(related.news.filter((n) => n.slug !== slug).slice(0, 3));
            this.popular.set(popular.news.filter((n) => n.slug !== slug).slice(0, 5));
          },
        });

        this.newsApi.incrementViews(slug).subscribe();
      },
      error: () => {
        this.article.set(null);
        this.loading.set(false);
      },
    });
  }

  categoryName(article: NewsArticle): string {
    return typeof article.category === 'object' ? article.category.name : '';
  }

  categorySlug(article: NewsArticle): string {
    return typeof article.category === 'object' ? article.category.slug : '';
  }

  authorName(article: NewsArticle): string {
    if (typeof article.author === 'object') {
      return `${article.author.firstName} ${article.author.lastName}`;
    }
    return 'Editorial Team';
  }

  articleMeta(article: NewsArticle): string {
    return `By ${this.authorName(article)} · ${article.views} views`;
  }

  sourceUrl(article: NewsArticle): string | null {
    if (article.sourceUrl) {
      return article.sourceUrl;
    }

    const match = article.content.match(/href="(https?:\/\/[^"]+)"/i);
    return match?.[1] ?? null;
  }

  sourceLabel(article: NewsArticle): string {
    return article.sourceName || 'original website';
  }

  displayTags(article: NewsArticle): string[] {
    return (article.tags ?? []).filter(
      (tag) =>
        tag !== 'auto-sync' &&
        !tag.startsWith('sync:') &&
        !tag.startsWith('lang:')
    );
  }

  isHindiArticle(article: NewsArticle): boolean {
    return (article.tags ?? []).includes('lang:hi');
  }

  contentPlainLength(html: string | null | undefined): number {
    return (html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length;
  }

  hasRichContent(article: NewsArticle): boolean {
    return this.contentPlainLength(article.content) >= 180;
  }

  minimalContentMessage(article: NewsArticle): string {
    return this.isHindiArticle(article)
      ? 'यह संक्षिप्त खबर है। पूरी रिपोर्ट पढ़ने के लिए नीचे दिए गए स्रोत लिंक पर जाएं।'
      : 'This is a brief headline. Read the full story on the source website using the link below.';
  }

  imageKey(article: NewsArticle): string {
    return article.slug || article._id || article.title;
  }

  imageUrl(article: NewsArticle): string {
    const categorySlug = this.categorySlug(article) || 'default';
    const key = this.imageKey(article);
    const sourceUrl = this.imageFailed() ? null : article.image?.url;
    return resolveNewsImageUrl(sourceUrl, categorySlug, key, 1400);
  }

  imageSrcSet(article: NewsArticle): string {
    const categorySlug = this.categorySlug(article) || 'default';
    const key = this.imageKey(article);
    const sourceUrl = this.imageFailed() ? null : article.image?.url;
    return newsImageSrcSet(sourceUrl, [720, 1080, 1400], categorySlug, key);
  }

  onImageError(): void {
    this.imageFailed.set(true);
  }
}
