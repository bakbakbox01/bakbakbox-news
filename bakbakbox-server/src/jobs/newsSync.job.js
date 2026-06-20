import env from '../config/env.js';
import { logger } from '../config/logger.js';
import { syncNewsFeeds } from '../services/newsSync.service.js';

let intervalId = null;

const runSync = () => {
  syncNewsFeeds().catch((error) => {
    logger.warn(`Scheduled news sync failed: ${error.message}`);
  });
};

export const startNewsSyncJob = () => {
  if (!env.newsSync.enabled) {
    logger.info('Live news sync is disabled (NEWS_SYNC_ENABLED=false)');
    return;
  }

  logger.info(
    `Live news sync started — checking RSS feeds every ${env.newsSync.intervalMs / 1000}s`
  );

  runSync();

  intervalId = setInterval(runSync, env.newsSync.intervalMs);
  intervalId.unref?.();
};

export const stopNewsSyncJob = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Live news sync stopped');
  }
};
