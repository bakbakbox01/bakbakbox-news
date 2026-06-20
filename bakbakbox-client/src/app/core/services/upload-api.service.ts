import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import { UploadedImage } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class UploadApiService {
  private readonly api = inject(ApiService);

  uploadImage(file: File): Observable<UploadedImage> {
    const formData = new FormData();
    formData.append('image', file);

    return this.api
      .postFormData<{ image: UploadedImage }>(API_ENDPOINTS.upload, formData)
      .pipe(map((res) => res.data.image));
  }
}
