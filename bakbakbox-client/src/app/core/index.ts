/**
 * Core module barrel — singleton services, guards, interceptors, and models.
 */
export { ApiService } from './services/api.service';
export { AuthService } from './services/auth.service';
export { StorageService } from './services/storage.service';

export { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export { authInterceptor } from './interceptors/auth.interceptor';
export { errorInterceptor } from './interceptors/error.interceptor';

export type { ApiResponse, PaginationMeta, PaginatedData } from './models/api-response.model';
export type { Admin, AuthData } from './models/admin.model';
export type { LoginCredentials, LoginFormValue } from './models/login.model';
export type { NavItem } from './models/nav-item.model';

export { API_ENDPOINTS, STORAGE_KEYS } from './constants/api.constants';
export { PUBLIC_NAV_ITEMS, PUBLIC_FOOTER_LINKS } from './constants/public-nav.constants';
export { ADMIN_NAV_ITEMS, ADMIN_HEADER_ACTIONS } from './constants/admin-nav.constants';
