import * as dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/apiResponse.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export const getOverview = asyncHandler(async (req, res) => {
  const { recentLimit, activityLimit } = req.query;

  const data = await dashboardService.getDashboardOverview({
    recentLimit,
    activityLimit,
  });

  sendSuccess(res, 200, 'Dashboard overview retrieved successfully', data);
});

export const getStatistics = asyncHandler(async (_req, res) => {
  const statistics = await dashboardService.getDashboardStatistics();

  sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', {
    statistics,
  });
});

export const getRecentNews = asyncHandler(async (req, res) => {
  const limit = req.query.limit ?? 5;
  const recentNews = await dashboardService.getRecentNews(limit);

  sendSuccess(res, 200, 'Recent news retrieved successfully', { recentNews });
});

export const getLatestActivity = asyncHandler(async (req, res) => {
  const limit = req.query.limit ?? 10;
  const latestActivity = await dashboardService.getLatestActivity(limit);

  sendSuccess(res, 200, 'Latest activity retrieved successfully', {
    latestActivity,
  });
});
