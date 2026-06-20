import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const requiredInProduction = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLIENT_URL',
];

const validateEnvironment = () => {
  if (!isProduction) {
    return;
  }

  const missing = requiredInProduction.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtCookieExpiresIn: Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'bakbakbox-news',
  },
  rateLimit: {
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    authMax: Number(process.env.RATE_LIMIT_AUTH_MAX) || 20,
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  },
  logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  shutdownTimeoutMs: Number(process.env.SHUTDOWN_TIMEOUT_MS) || 10000,
  newsSync: {
    enabled: process.env.NEWS_SYNC_ENABLED !== 'false',
    intervalMs: Number(process.env.NEWS_SYNC_INTERVAL_MS) || 30000,
    maxAgeHours: Number(process.env.NEWS_SYNC_MAX_AGE_HOURS) || 48,
  },
  newsRecentHours: Number(process.env.NEWS_RECENT_HOURS) || 24,
};

validateEnvironment();

export default env;
