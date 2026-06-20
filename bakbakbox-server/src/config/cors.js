import env from './env.js';

const parseOrigins = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:4200';
  return raw.split(',').map((origin) => origin.trim());
};

export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = parseOrigins();

    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: env.isProduction ? 86400 : 0,
};
