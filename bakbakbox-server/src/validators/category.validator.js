import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const getCategoriesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
  query('sortBy')
    .optional()
    .isIn(['name', 'sortOrder', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),
];

export const categoryIdValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Category ID is required')
    .custom((value) => {
      if (!isValidObjectId(value) && !/^[a-z0-9-]+$/.test(value)) {
        throw new Error('Invalid category identifier');
      }
      return true;
    }),
];

export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Slug cannot exceed 120 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

export const updateCategoryValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Category ID is required')
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid category ID');
      }
      return true;
    }),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Slug cannot exceed 120 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

export const deleteCategoryValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Category ID is required')
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid category ID');
      }
      return true;
    }),
];
