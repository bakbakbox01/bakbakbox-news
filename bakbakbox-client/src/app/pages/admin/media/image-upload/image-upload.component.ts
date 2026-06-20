import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UploadApiService } from '../../../../core/services/upload-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UploadedImage } from '../../../../core/models/dashboard.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PageHeaderComponent, LoadingSpinnerComponent],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent {
  private readonly uploadApi = inject(UploadApiService);
  private readonly notify = inject(NotificationService);

  readonly uploading = signal(false);
  readonly uploadedImages = signal<UploadedImage[]>([]);
  readonly previewUrl = signal<string | null>(null);
  private selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.notify.error('Image must not exceed 5MB');
      return;
    }

    this.selectedFile = file;
    this.previewUrl.set(URL.createObjectURL(file));
  }

  upload(): void {
    if (!this.selectedFile) {
      this.notify.error('Please select an image first');
      return;
    }

    this.uploading.set(true);
    this.uploadApi.uploadImage(this.selectedFile).subscribe({
      next: (image) => {
        this.uploadedImages.update((imgs) => [image, ...imgs]);
        this.notify.success('Image uploaded successfully');
        this.previewUrl.set(null);
        this.selectedFile = null;
        this.uploading.set(false);
      },
      error: (err) => {
        this.notify.error(err.message ?? 'Upload failed');
        this.uploading.set(false);
      },
    });
  }

  copyUrl(url: string): void {
    navigator.clipboard.writeText(url).then(() => this.notify.info('URL copied to clipboard'));
  }
}
