import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NewsArticle, NewsStatus } from '../../../../core/models/news.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss',
})
export class NewsListComponent implements OnInit {
  private readonly newsApi = inject(NewsApiService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly news = signal<NewsArticle[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusControl = new FormControl<NewsStatus | ''>('', { nonNullable: true });

  readonly displayedColumns = ['title', 'category', 'status', 'views', 'isBreaking', 'actions'];

  ngOnInit(): void {
    this.loadNews();
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadNews();
      });
  }

  loadNews(): void {
    this.loading.set(true);
    this.newsApi
      .getNews({
        page: this.pageIndex() + 1,
        limit: this.pageSize(),
        search: this.searchControl.value || undefined,
        status: this.statusControl.value || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      })
      .subscribe({
        next: (res) => {
          this.news.set(res.news);
          this.total.set(res.pagination.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Failed to load news');
          this.loading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadNews();
  }

  onStatusChange(): void {
    this.pageIndex.set(0);
    this.loadNews();
  }

  categoryName(article: NewsArticle): string {
    return typeof article.category === 'object' ? article.category.name : '—';
  }

  editNews(id: string): void {
    void this.router.navigate(['/admin/news', id, 'edit']);
  }

  deleteNews(article: NewsArticle): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '400px',
        data: {
          title: 'Delete News',
          message: `Are you sure you want to delete "${article.title}"?`,
          confirmText: 'Delete',
        },
      }
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.newsApi.deleteNews(article._id).subscribe({
        next: () => {
          this.notify.success('News deleted successfully');
          this.loadNews();
        },
        error: (err) => this.notify.error(err.message ?? 'Failed to delete news'),
      });
    });
  }
}
