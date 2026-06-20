import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './config/cors.js';
import { helmetConfig } from './config/helmet.js';
import { logger, morganStream } from './config/logger.js';
import env from './config/env.js';
import { isDatabaseConnected } from './config/database.js';
import { isMockMode } from './config/dataMode.js';
import { getNewsSyncStatus } from './services/newsSync.service.js';
import routes from './routes/index.js';
import {
  apiLimiter,
  authLimiter,
} from './middleware/rateLimiter.middleware.js';
import {
  corsErrorHandler,
  errorHandler,
  notFoundHandler,
} from './middleware/error.middleware.js';

const app = express();

if (env.isProduction) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(helmetConfig);
app.use(compression());
app.use(cors(corsOptions));
app.use(corsErrorHandler);
app.use(
  morgan(env.isProduction ? 'combined' : 'dev', { stream: morganStream })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  const mock = isMockMode();
  const dbConnected = isDatabaseConnected();

  res.status(mock || dbConnected ? 200 : 503).json({
    status: mock ? 'mock' : dbConnected ? 'ok' : 'degraded',
    service: 'bakbakbox-server',
    environment: env.nodeEnv,
    database: mock ? 'mock' : dbConnected ? 'connected' : 'disconnected',
    newsSync: getNewsSyncStatus(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

logger.info(`Express app configured [${env.nodeEnv}]`);

export default app;
