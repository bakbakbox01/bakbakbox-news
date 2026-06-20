import { Router } from 'express';
import {
  getOverview,
  getStatistics,
  getRecentNews,
  getLatestActivity,
} from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  dashboardQueryValidation,
  recentNewsValidation,
  latestActivityValidation,
} from '../validators/dashboard.validator.js';

const router = Router();

router.use(protect, requireAdmin);

router.get('/', dashboardQueryValidation, validate, getOverview);
router.get('/statistics', getStatistics);
router.get('/recent-news', recentNewsValidation, validate, getRecentNews);
router.get('/activity', latestActivityValidation, validate, getLatestActivity);

export default router;
