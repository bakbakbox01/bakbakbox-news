import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CategoryApiService } from '../../../../core/services/category-api.service';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Category } from '../../../../core/models/category.model';
import { NewsStatus } from '../../../../core/models/news.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.scss',
})
export class NewsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly newsApi = inject(NewsApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly notify = inject(NotificationService);

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly removeImage = signal(false);

  readonly newsId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.newsId;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    shortDescription: ['', [Validators.maxLength(500)]],
    content: ['', [Validators.required, Validators.minLength(20)]],
    category: ['', Validators.required],
    tags: [''],
    isBreaking: [false],
    status: ['draft' as NewsStatus, Validators.required],
  });

  ngOnInit(): void {
    this.loadCategories();

    if (this.isEditMode && this.newsId) {
      this.loadNews(this.newsId);
    }
  }

  loadCategories(): void {
    this.categoryApi.getAllCategories().subscribe({
      next: (cats) => this.categories.set(cats.filter((c) => c.isActive)),
      error: (err) => this.notify.error(err.message ?? 'Failed to load categories'),
    });
  }

  loadNews(id: string): void {
    this.loading.set(true);
    this.newsApi.getNewsById(id).subscribe({
      next: (article) => {
        this.form.patchValue({
          title: article.title,
          shortDescription: article.shortDescription,
          content: article.content,
          category: typeof article.category === 'object' ? article.category._id : article.category,
          tags: article.tags.join(', '),
          isBreaking: article.isBreaking,
          status: article.status,
        });
        if (article.image?.url) {
          this.previewUrl.set(article.image.url);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.notify.error(err.message ?? 'Failed to load news');
        this.loading.set(false);
        void this.router.navigate(['/admin/news']);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.removeImage.set(false);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  clearImage(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.removeImage.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const tags = raw.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: raw.title,
      shortDescription: raw.shortDescription,
      content: raw.content,
      category: raw.category,
      tags,
      isBreaking: raw.isBreaking,
      status: raw.status,
    };

    this.submitting.set(true);

    const request$ =
      this.isEditMode && this.newsId
        ? this.newsApi.updateNews(
            this.newsId,
            payload,
            this.selectedFile() ?? undefined,
            this.removeImage()
          )
        : this.newsApi.createNews(payload, this.selectedFile() ?? undefined);

    request$.subscribe({
      next: () => {
        this.notify.success(this.isEditMode ? 'News updated successfully' : 'News created successfully');
        void this.router.navigate(['/admin/news']);
      },
      error: (err) => {
        this.notify.error(err.message ?? 'Failed to save news');
        this.submitting.set(false);
      },
    });
  }
}
