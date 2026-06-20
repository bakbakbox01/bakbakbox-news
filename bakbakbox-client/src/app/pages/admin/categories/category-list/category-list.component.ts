import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryApiService } from '../../../../core/services/category-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Category, CategoryFormValue } from '../../../../core/models/category.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly categories = signal<Category[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly displayedColumns = ['name', 'slug', 'sortOrder', 'isActive', 'actions'];

  ngOnInit(): void {
    this.loadCategories();
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadCategories();
      });
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryApi
      .getCategories({
        page: this.pageIndex() + 1,
        limit: this.pageSize(),
        search: this.searchControl.value || undefined,
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      })
      .subscribe({
        next: (res) => {
          this.categories.set(res.categories);
          this.total.set(res.pagination.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Failed to load categories');
          this.loading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCategories();
  }

  openDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '480px',
      data: { category },
    });

    dialogRef.afterClosed().subscribe((result: CategoryFormValue | undefined) => {
      if (!result) return;

      const request$ = category
        ? this.categoryApi.updateCategory(category._id, result)
        : this.categoryApi.createCategory(result);

      request$.subscribe({
        next: () => {
          this.notify.success(category ? 'Category updated' : 'Category created');
          this.loadCategories();
        },
        error: (err) => this.notify.error(err.message ?? 'Failed to save category'),
      });
    });
  }

  deleteCategory(category: Category): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      { width: '400px', data: { title: 'Delete Category', message: `Delete "${category.name}"?`, confirmText: 'Delete' } }
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.categoryApi.deleteCategory(category._id).subscribe({
        next: () => {
          this.notify.success('Category deleted');
          this.loadCategories();
        },
        error: (err) => this.notify.error(err.message ?? 'Failed to delete category'),
      });
    });
  }
}
