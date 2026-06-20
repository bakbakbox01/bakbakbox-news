import { Injectable } from '@angular/core';

type StorageType = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class StorageService {
  getItem(key: string, type: StorageType = 'local'): string | null {
    try {
      return this.resolveStorage(type).getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string, type: StorageType = 'local'): void {
    try {
      this.resolveStorage(type).setItem(key, value);
    } catch {
      // Storage unavailable
    }
  }

  removeItem(key: string, type?: StorageType): void {
    try {
      if (!type) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        return;
      }

      this.resolveStorage(type).removeItem(key);
    } catch {
      // ignore
    }
  }

  getObject<T>(key: string, type: StorageType = 'local'): T | null {
    const raw = this.getItem(key, type);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setObject(key: string, value: unknown, type: StorageType = 'local'): void {
    this.setItem(key, JSON.stringify(value), type);
  }

  clearAuth(type?: StorageType): void {
    if (!type || type === 'local') {
      try {
        localStorage.clear();
      } catch {
        // ignore
      }
    }

    if (!type || type === 'session') {
      try {
        sessionStorage.clear();
      } catch {
        // ignore
      }
    }
  }

  private resolveStorage(type: StorageType): Storage {
    return type === 'session' ? sessionStorage : localStorage;
  }
}
