import env from './env.js';

const normalizeOrigin = (value) => value.trim().replace(/\/$/, '');

const parseOrigins = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:4200';

  if (normalizeOrigin(raw) === '*') {
    return ['*'];
  }

  return raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
};

const isVercelOrigin = (origin) =>
  /^https:\/\/[\w-]+\.vercel\.app$/i.test(origin);

const isLocalOrigin = (origin) =>
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const matchesAllowedOrigin = (origin, allowed) => {
  if (allowed === '*') {
    return true;
  }

  if (allowed === origin) {
    return true;
  }

  if (allowed.includes('*.vercel.app') && isVercelOrigin(origin)) {
    return true;
  }

  return false;
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.some((allowed) => matchesAllowedOrigin(origin, allowed))) {
    return true;
  }

  // Vercel production + preview deployments (frontend on Vercel, API on Render)
  if (env.isProduction && isVercelOrigin(origin)) {
    return true;
  }

  // Local Angular dev against remote or local API
  if (isLocalOrigin(origin)) {
    return true;
  }

  return false;
};

export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = parseOrigins();

    if (isOriginAllowed(origin, allowedOrigins)) {
      callback(null, origin ?? true);
      return;
    }

    console.warn(
      `[CORS] Blocked origin: ${origin}. Configured CLIENT_URL: ${process.env.CLIENT_URL || '(default localhost)'}`
    );
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
  maxAge: env.isProduction ? 86400 : 0,
};
