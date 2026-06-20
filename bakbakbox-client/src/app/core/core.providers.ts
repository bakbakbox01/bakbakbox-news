import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const coreProviders = [
  // Functional interceptors are registered in app.config.ts via withInterceptors
];

export const httpInterceptors = [authInterceptor, errorInterceptor];
