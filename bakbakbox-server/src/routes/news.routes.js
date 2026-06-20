import { Router } from 'express';
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  incrementViewCount,
} from '../controllers/news.controller.js';
import { protect, optionalProtect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import {
  getNewsValidation,
  newsIdValidation,
  createNewsValidation,
  updateNewsValidation,
  deleteNewsValidation,
  incrementViewValidation,
  parseNewsBody,
} from '../validators/news.validator.js';

const router = Router();

router.get('/', optionalProtect, getNewsValidation, validate, getNews);
router.post('/:id/view', incrementViewValidation, validate, incrementViewCount);
router.get('/:id', optionalProtect, newsIdValidation, validate, getNewsById);

router.use(protect, requireAdmin);

router.post(
  '/',
  uploadSingle('image'),
  handleUploadError,
  parseNewsBody,
  createNewsValidation,
  validate,
  createNews
);

router.put(
  '/:id',
  uploadSingle('image'),
  handleUploadError,
  parseNewsBody,
  updateNewsValidation,
  validate,
  updateNews
);

router.delete('/:id', deleteNewsValidation, validate, deleteNews);

export default router;
