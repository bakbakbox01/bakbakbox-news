import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

type HttpParamValue = string | number | boolean;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, HttpParamValue>): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(this.buildUrl(path), {
      params: this.buildParams(params),
    });
  }

  post<T>(path: string, body?: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.buildUrl(path), body);
  }

  put<T>(path: string, body?: unknown): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(this.buildUrl(path), body);
  }

  patch<T>(path: string, body?: unknown): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(this.buildUrl(path), body);
  }

  delete<T>(path: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(this.buildUrl(path));
  }

  postFormData<T>(path: string, formData: FormData): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.buildUrl(path), formData);
  }

  putFormData<T>(path: string, formData: FormData): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(this.buildUrl(path), formData);
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private buildParams(params?: Record<string, HttpParamValue>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
