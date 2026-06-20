import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Category } from '../../../../core/models/category.model';

export interface CategoryDialogData {
  category?: Category;
}

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Category' : 'Add Category' }}</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="d-flex flex-column gap-2 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" formControlName="description"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Sort Order</mat-label>
          <input matInput type="number" formControlName="sortOrder" />
        </mat-form-field>
        <mat-checkbox formControlName="isActive">Active</mat-checkbox>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          {{ isEdit ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
})
export class CategoryDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<CategoryDialogComponent>);
  readonly data = inject<CategoryDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.category;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    sortOrder: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
  });

  constructor() {
    if (this.data.category) {
      this.form.patchValue(this.data.category);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}
