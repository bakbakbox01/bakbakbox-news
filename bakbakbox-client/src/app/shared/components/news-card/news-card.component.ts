import { Component, effect, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewsArticle } from '../../../core/models/news.model';
import { newsImageSrcSet, resolveNewsImageUrl } from '../../../core/utils/news-image.util';

const CATEGORY_ACCENTS: Record<string, string> = {
  world: '#2563eb',
  india: '#dc2626',
  hindi: '#ea580c',
  business: '#059669',
  sports: '#7c3aed',
  technology: '#0891b2',
  entertainment: '#db2777',
  politics: '#4f46e5',
};

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.scss',
})
export class NewsCardComponent {
  readonly article = input.required<NewsArticle>();
  readonly featured = input(false);
  readonly horizontal = input(false);
  readonly rank = input<number | null>(null);

  private readonly imageFailed = signal(false);

  constructor() {
    effect(() => {
      this.article();
      this.imageFailed.set(false);
    });
  }

  categoryName(article: NewsArticle): string {
    return typeof article.category === 'object' ? article.category.name : '';
  }

  categorySlug(article: NewsArticle): string {
    return typeof article.category === 'object' ? article.category.slug : 'default';
  }

  categoryAccent(article: NewsArticle): string {
    const slug = this.categorySlug(article);
    return CATEGORY_ACCENTS[slug] ?? '#2563eb';
  }

  displayDescription(article: NewsArticle): string {
    const desc = article.shortDescription?.trim();
    if (!desc) return '';

    const title = article.title.trim();
    if (desc === title) return '';

    if (desc.startsWith(title)) {
      const rest = desc.slice(title.length).replace(/^[\s:–—-]+/, '').trim();
      return rest.length >= 24 ? rest : '';
    }

    return desc;
  }

  isPopularViews(views: number): boolean {
    return views >= 200;
  }

  isFreshDate(article: NewsArticle): boolean {
    const raw = article.publishedAt || article.createdAt;
    if (!raw) return false;

    const hours = (Date.now() - new Date(raw).getTime()) / (1000 * 60 * 60);
    return hours <= 24;
  }

  imageKey(article: NewsArticle): string {
    return article.slug || article._id || article.title;
  }

  displayImageUrl(article: NewsArticle): string {
    const width = this.featured() ? 1200 : 960;
    const categorySlug = this.categorySlug(article);
    const key = this.imageKey(article);

    if (this.imageFailed()) {
      return resolveNewsImageUrl(null, categorySlug, key, width);
    }

    return resolveNewsImageUrl(article.image?.url, categorySlug, key, width);
  }

  displayImageSrcSet(article: NewsArticle): string {
    const widths = this.featured() ? [640, 960, 1200] : [480, 720, 960];
    const categorySlug = this.categorySlug(article);
    const key = this.imageKey(article);
    const sourceUrl = this.imageFailed() ? null : article.image?.url;

    return newsImageSrcSet(sourceUrl, widths, categorySlug, key);
  }

  onImageError(): void {
    this.imageFailed.set(true);
  }
}
