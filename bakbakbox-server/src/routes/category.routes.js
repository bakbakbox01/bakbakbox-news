import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getCategoriesValidation,
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
} from '../validators/category.validator.js';

const router = Router();

router.get('/', getCategoriesValidation, validate, getCategories);
router.get('/:id', categoryIdValidation, validate, getCategory);

router.use(protect, requireAdmin);

router.post('/', createCategoryValidation, validate, createCategory);
router.put('/:id', updateCategoryValidation, validate, updateCategory);
router.delete('/:id', deleteCategoryValidation, validate, deleteCategory);

export default router;
