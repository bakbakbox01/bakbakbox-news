import './src/config/env.js';
import app from './src/app.js';
import {
  connectDatabase,
  disconnectDatabase,
} from './src/config/database.js';
import { isMockMode } from './src/config/dataMode.js';
import { configureCloudinary } from './src/config/cloudinary.js';
import { logger } from './src/config/logger.js';
import env from './src/config/env.js';
import { startNewsSyncJob, stopNewsSyncJob } from './src/jobs/newsSync.job.js';
import { bootstrapDatabase } from './src/services/bootstrap.service.js';

const SHUTDOWN_TIMEOUT_MS = env.shutdownTimeoutMs;

let server;

const startServer = async () => {
  const dataSource = await connectDatabase();

  if (isMockMode()) {
    logger.warn(
      'Running without MongoDB — live RSS sync only (no static mock news). Set MONGODB_URI to use database.'
    );
  } else {
    configureCloudinary();
    await bootstrapDatabase();
  }

  server = app.listen(env.port, () => {
    logger.info(
      `Server running on port ${env.port} [${env.nodeEnv}] [${dataSource}]`
    );
    startNewsSyncJob();
  });
};

const shutdown = async (signal) => {
  logger.warn(`${signal} received. Shutting down gracefully...`);

  const forceExitTimer = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  forceExitTimer.unref();

  try {
    stopNewsSyncJob();

    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      logger.info('HTTP server closed');
    }

    await disconnectDatabase();
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { message: error.message });
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  shutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { message: error.message, stack: error.stack });
  shutdown('UNCAUGHT_EXCEPTION');
});

startServer().catch((error) => {
  logger.error('Failed to start server', { message: error.message });
  process.exit(1);
});
