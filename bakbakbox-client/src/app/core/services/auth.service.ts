import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  tap,
  throwError,
} from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/api.constants';
import { Admin, AuthData } from '../models/admin.model';
import { ApiResponse } from '../models/api-response.model';
import { LoginCredentials } from '../models/login.model';

type StorageType = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly adminSignal = signal<Admin | null>(null);
  private readonly loadingSignal = signal(false);

  readonly admin = this.adminSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isAuthenticated = computed(
    () => !!this.getToken() && !!this.adminSignal()
  );
  readonly isSuperAdmin = computed(
    () => this.adminSignal()?.role === 'superadmin'
  );
  readonly fullName = computed(() => {
    const admin = this.adminSignal();
    return admin ? `${admin.firstName} ${admin.lastName}` : '';
  });

  constructor() {
    this.restoreSession();
  }

  getToken(): string | null {
    return (
      this.storage.getItem(STORAGE_KEYS.token, 'session') ??
      this.storage.getItem(STORAGE_KEYS.token, 'local')
    );
  }

  getRememberedEmail(): string {
    return this.storage.getItem(STORAGE_KEYS.rememberedEmail, 'local') ?? '';
  }

  login(credentials: LoginCredentials): Observable<ApiResponse<AuthData>> {
    this.loadingSignal.set(true);

    const { rememberMe = false, email, password } = credentials;

    return this.api
      .post<AuthData>(API_ENDPOINTS.auth.login, { email, password })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setSession(
              response.data.token,
              response.data.admin,
              rememberMe
            );
            this.persistRememberedEmail(email, rememberMe);
          }
        }),
        catchError((error) => throwError(() => error)),
        finalize(() => this.loadingSignal.set(false))
      );
  }

  logout(navigate = true): Observable<ApiResponse<null>> {
    this.loadingSignal.set(true);

    return this.api.post<null>(API_ENDPOINTS.auth.logout).pipe(
      catchError(() => of({ success: true, message: 'Logged out', data: null })),
      tap(() => this.clearSession()),
      finalize(() => {
        this.loadingSignal.set(false);
        if (navigate) {
          void this.router.navigate(['/admin/login']);
        }
      })
    );
  }

  validateSession(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.api.get<{ admin: Admin }>(API_ENDPOINTS.auth.me).pipe(
      tap((response) => {
        if (response.success && response.data?.admin) {
          const storageType = this.getActiveStorageType();
          this.storage.setObject(
            STORAGE_KEYS.admin,
            response.data.admin,
            storageType
          );
          this.adminSignal.set(response.data.admin);
        }
      }),
      map((response) => response.success && !!response.data?.admin),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  redirectAfterLogin(returnUrl?: string): void {
    const target = this.sanitizeReturnUrl(returnUrl) ?? '/admin/dashboard';
    void this.router.navigateByUrl(target);
  }

  restoreSession(): void {
    const storageType = this.getActiveStorageType();
    const token = this.storage.getItem(STORAGE_KEYS.token, storageType);
    const admin = this.storage.getObject<Admin>(STORAGE_KEYS.admin, storageType);

    if (token && admin) {
      this.adminSignal.set(admin);
    }
  }

  setSession(token: string, admin: Admin, rememberMe: boolean): void {
    const storageType: StorageType = rememberMe ? 'local' : 'session';

    this.clearSession();
    this.storage.setItem(STORAGE_KEYS.token, token, storageType);
    this.storage.setObject(STORAGE_KEYS.admin, admin, storageType);
    this.storage.setItem(
      STORAGE_KEYS.rememberMe,
      String(rememberMe),
      'local'
    );
    this.adminSignal.set(admin);
  }

  clearSession(): void {
    this.storage.removeItem(STORAGE_KEYS.token);
    this.storage.removeItem(STORAGE_KEYS.admin);
    this.adminSignal.set(null);
  }

  private persistRememberedEmail(email: string, rememberMe: boolean): void {
    if (rememberMe) {
      this.storage.setItem(STORAGE_KEYS.rememberedEmail, email, 'local');
      return;
    }

    this.storage.removeItem(STORAGE_KEYS.rememberedEmail, 'local');
  }

  private getActiveStorageType(): StorageType {
    const rememberMe =
      this.storage.getItem(STORAGE_KEYS.rememberMe, 'local') === 'true';
    return rememberMe ? 'local' : 'session';
  }

  private sanitizeReturnUrl(url?: string): string | null {
    if (!url || url.startsWith('/admin/login') || url.startsWith('http')) {
      return null;
    }

    return url;
  }
}
