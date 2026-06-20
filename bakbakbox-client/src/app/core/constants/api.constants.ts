export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  news: '/news',
  categories: '/categories',
  dashboard: '/dashboard',
  upload: '/upload',
} as const;

export const STORAGE_KEYS = {
  token: 'bakbakbox_token',
  admin: 'bakbakbox_admin',
  rememberMe: 'bakbakbox_remember_me',
  rememberedEmail: 'bakbakbox_remembered_email',
} as const;
