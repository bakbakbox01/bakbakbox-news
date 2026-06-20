import News from '../models/News.js';
import Category from '../models/Category.js';
import { isMockMode } from '../config/dataMode.js';
import * as mock from '../data/mock/store.js';
import {
  aggregateNewsStats,
  aggregateCategoryStats,
} from './stats.service.js';

const NEWS_POPULATE = [
  { path: 'category', select: 'name slug' },
  { path: 'author', select: 'firstName lastName email' },
];

const isNewRecord = (createdAt, updatedAt) =>
  Math.abs(new Date(updatedAt) - new Date(createdAt)) < 1000;

/**
 * Returns dashboard summary statistics.
 */
export const getDashboardStatistics = async () => {
  if (isMockMode()) {
    return {
      ...mock.mockAggregateNewsStats(),
      ...mock.mockAggregateCategoryStats(),
    };
  }

  const [newsStats, categoryStats] = await Promise.all([
    aggregateNewsStats(),
    aggregateCategoryStats(),
  ]);

  return {
    ...newsStats,
    ...categoryStats,
  };
};

/**
 * Returns the most recently updated news articles.
 */
export const getRecentNews = async (limit = 5) => {
  if (isMockMode()) return mock.mockGetRecentNews(limit);

  const news = await News.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate(NEWS_POPULATE)
    .select(
      'title slug shortDescription status isBreaking views publishedAt createdAt updatedAt image category author'
    );

  return news;
};

/**
 * Returns a merged activity feed from news and category changes.
 */
export const getLatestActivity = async (limit = 10) => {
  if (isMockMode()) return mock.mockGetLatestActivity(limit);

  const fetchLimit = Math.min(limit * 2, 50);

  const [recentNews, recentCategories] = await Promise.all([
    News.find()
      .sort({ updatedAt: -1 })
      .limit(fetchLimit)
      .populate('author', 'firstName lastName email')
      .populate('category', 'name slug')
      .select('title slug status updatedAt createdAt author category'),
    Category.find()
      .sort({ updatedAt: -1 })
      .limit(fetchLimit)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .select('name slug updatedAt createdAt createdBy updatedBy'),
  ]);

  const newsActivity = recentNews.map((article) => ({
    type: isNewRecord(article.createdAt, article.updatedAt)
      ? 'news_created'
      : 'news_updated',
    entity: 'news',
    entityId: article._id,
    title: article.title,
    slug: article.slug,
    status: article.status,
    category: article.category,
    performedBy: article.author,
    timestamp: article.updatedAt,
  }));

  const categoryActivity = recentCategories.map((category) => ({
    type: isNewRecord(category.createdAt, category.updatedAt)
      ? 'category_created'
      : 'category_updated',
    entity: 'category',
    entityId: category._id,
    title: category.name,
    slug: category.slug,
    performedBy: category.updatedBy || category.createdBy,
    timestamp: category.updatedAt,
  }));

  return [...newsActivity, ...categoryActivity]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

/**
 * Returns full dashboard overview in a single request.
 */
export const getDashboardOverview = async ({
  recentLimit = 5,
  activityLimit = 10,
} = {}) => {
  const [statistics, recentNews, latestActivity] = await Promise.all([
    getDashboardStatistics(),
    getRecentNews(recentLimit),
    getLatestActivity(activityLimit),
  ]);

  return {
    statistics,
    recentNews,
    latestActivity,
  };
};
