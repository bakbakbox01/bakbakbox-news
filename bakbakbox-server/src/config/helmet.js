import helmet from 'helmet';
import env from './env.js';

export const helmetConfig = helmet({
  contentSecurityPolicy: env.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: env.isProduction
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,
});
