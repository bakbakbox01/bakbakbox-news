import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeroComponent } from '../../../shared/components/page-hero/page-hero.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { fadeInUp, listStagger } from '../../../shared/animations/public.animations';

const CATEGORY_ICONS = ['🌍', '💼', '⚽', '🎬', '💻', '🏛️', '🔬', '❤️', '📈', '🎓', '🏥', '✈️'];
const CATEGORY_ACCENTS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669', '#0891b2', '#4f46e5', '#dc2626'];

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, PageHeroComponent, EmptyStateComponent],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss',
  animations: [fadeInUp, listStagger],
})
export class CategoriesListComponent implements OnInit {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly seo = inject(SeoService);

  readonly loading = signal(true);
  readonly categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Categories',
      description: 'Browse news by category on Bak Bak Box News.',
    });

    this.categoryApi.getAllCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats.filter((c) => c.isActive));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  categoryIcon(index: number): string {
    return CATEGORY_ICONS[index % CATEGORY_ICONS.length];
  }

  categoryAccent(index: number): string {
    return CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length];
  }
}
