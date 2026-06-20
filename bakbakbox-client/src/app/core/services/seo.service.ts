import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoTags {
  title: string;
  description?: string;
  keywords?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private readonly siteName = 'Bak Bak Box News';
  private readonly defaultDescription =
    'Your trusted source for breaking news, trending stories, and in-depth coverage.';

  updateTags(tags: SeoTags): void {
    const pageTitle = tags.title.includes(this.siteName)
      ? tags.title
      : `${tags.title} | ${this.siteName}`;

    this.title.setTitle(pageTitle);

    this.meta.updateTag({
      name: 'description',
      content: tags.description ?? this.defaultDescription,
    });

    if (tags.keywords) {
      this.meta.updateTag({ name: 'keywords', content: tags.keywords });
    }

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({
      property: 'og:description',
      content: tags.description ?? this.defaultDescription,
    });
  }

  reset(): void {
    this.title.setTitle(this.siteName);
    this.meta.updateTag({ name: 'description', content: this.defaultDescription });
  }
}
