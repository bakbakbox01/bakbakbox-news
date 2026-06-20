export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  appName: 'Bak Bak Box News',
  /** Home page shows only news from the last N hours */
  recentNewsHours: 24,
  /** Match server RSS sync interval for live refresh */
  newsRefreshMs: 30000,
};
