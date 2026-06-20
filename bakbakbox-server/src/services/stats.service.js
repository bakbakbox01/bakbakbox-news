import News from '../models/News.js';
import Category from '../models/Category.js';
import { isMockMode } from '../config/dataMode.js';
import * as mock from '../data/mock/store.js';

const extractCount = (facetResult) => facetResult?.[0]?.count ?? 0;

const extractSum = (facetResult) => facetResult?.[0]?.sum ?? 0;

/**
 * Count all news articles.
 */
export const countNews = (filter = {}) => News.countDocuments(filter);

/**
 * Count all categories.
 */
export const countCategories = (filter = {}) => Category.countDocuments(filter);

/**
 * Sum total views across all news articles.
 */
export const sumNewsViews = async (filter = {}) => {
  const [result] = await News.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$views' } } },
  ]);

  return result?.total ?? 0;
};

/**
 * Count news articles matching a filter.
 */
export const countNewsByFilter = (filter) => News.countDocuments(filter);

/**
 * Aggregate news counts by status and breaking flag in a single query.
 */
export const aggregateNewsStats = async () => {
  if (isMockMode()) return mock.mockAggregateNewsStats();

  const [result] = await News.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        totalViews: [{ $group: { _id: null, sum: { $sum: '$views' } } }],
        breaking: [{ $match: { isBreaking: true } }, { $count: 'count' }],
        draft: [{ $match: { status: 'draft' } }, { $count: 'count' }],
        published: [{ $match: { status: 'published' } }, { $count: 'count' }],
        archived: [{ $match: { status: 'archived' } }, { $count: 'count' }],
      },
    },
  ]);

  return {
    totalNews: extractCount(result.total),
    totalViews: extractSum(result.totalViews),
    breakingNewsCount: extractCount(result.breaking),
    draftCount: extractCount(result.draft),
    publishedCount: extractCount(result.published),
    archivedCount: extractCount(result.archived),
  };
};

/**
 * Count active and inactive categories.
 */
export const aggregateCategoryStats = async () => {
  if (isMockMode()) return mock.mockAggregateCategoryStats();

  const [result] = await Category.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        active: [{ $match: { isActive: true } }, { $count: 'count' }],
        inactive: [{ $match: { isActive: false } }, { $count: 'count' }],
      },
    },
  ]);

  return {
    totalCategories: extractCount(result.total),
    activeCategories: extractCount(result.active),
    inactiveCategories: extractCount(result.inactive),
  };
};
