import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = Router();

router.use(protect, requireAdmin);

router.post(
  '/',
  uploadSingle('image'),
  handleUploadError,
  uploadImage
);

export default router;
