import * as newsService from '../services/news.service.js';
import { sendSuccess } from '../utils/apiResponse.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export const getNews = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    category,
    status,
    isBreaking,
    tag,
    sortBy,
    sortOrder,
    recentHours,
  } = req.query;

  const result = await newsService.getNews({
    page,
    limit,
    search,
    category,
    status,
    isBreaking:
      isBreaking === undefined ? undefined : isBreaking === 'true',
    tag,
    sortBy,
    sortOrder,
    recentHours,
    isAdmin: Boolean(req.admin),
  });

  sendSuccess(res, 200, 'News retrieved successfully', result);
});

export const getNewsById = asyncHandler(async (req, res) => {
  const article = await newsService.getNewsById(
    req.params.id,
    Boolean(req.admin)
  );

  sendSuccess(res, 200, 'News article retrieved successfully', { article });
});

export const createNews = asyncHandler(async (req, res) => {
  const article = await newsService.createNews(
    req.body,
    req.admin._id,
    req.file
  );

  sendSuccess(res, 201, 'News article created successfully', { article });
});

export const updateNews = asyncHandler(async (req, res) => {
  const article = await newsService.updateNews(
    req.params.id,
    req.body,
    req.file
  );

  sendSuccess(res, 200, 'News article updated successfully', { article });
});

export const deleteNews = asyncHandler(async (req, res) => {
  const article = await newsService.deleteNews(req.params.id);

  sendSuccess(res, 200, 'News article deleted successfully', { article });
});

export const incrementViewCount = asyncHandler(async (req, res) => {
  const article = await newsService.incrementViewCount(req.params.id);

  sendSuccess(res, 200, 'View count incremented successfully', { article });
});
