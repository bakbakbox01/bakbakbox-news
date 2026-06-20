import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const parseNewsBody = (req, _res, next) => {
  if (req.body.tags !== undefined && typeof req.body.tags === 'string') {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch {
      req.body.tags = req.body.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
    }
  }

  if (req.body.isBreaking === 'true') {
    req.body.isBreaking = true;
  } else if (req.body.isBreaking === 'false') {
    req.body.isBreaking = false;
  }

  if (req.body.removeImage === 'true') {
    req.body.removeImage = true;
  } else if (req.body.removeImage === 'false') {
    req.body.removeImage = false;
  }

  next();
};

export const getNewsValidation = [
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
    .isLength({ max: 200 })
    .withMessage('Search term cannot exceed 200 characters'),
  query('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category filter cannot be empty'),
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  query('isBreaking')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isBreaking must be true or false'),
  query('tag')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tag filter cannot exceed 50 characters'),
  query('sortBy')
    .optional()
    .isIn(['title', 'publishedAt', 'createdAt', 'updatedAt', 'views'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),
  query('recentHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('recentHours must be between 1 and 168')
    .toInt(),
];

export const newsIdValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('News ID is required')
    .custom((value) => {
      if (!isValidObjectId(value) && !/^[a-z0-9-]+$/.test(value)) {
        throw new Error('Invalid news identifier');
      }
      return true;
    }),
];

const newsBodyValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 220 })
    .withMessage('Slug cannot exceed 220 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 20 })
    .withMessage('Content must be at least 20 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid category ID');
      }
      return true;
    }),
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array with at most 20 items'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),
  body('isBreaking')
    .optional()
    .isBoolean()
    .withMessage('isBreaking must be a boolean'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('publishedAt must be a valid date'),
];

export const createNewsValidation = [...newsBodyValidation];

export const updateNewsValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('News ID is required')
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid news ID');
      }
      return true;
    }),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 220 })
    .withMessage('Slug cannot exceed 220 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ min: 20 })
    .withMessage('Content must be at least 20 characters'),
  body('category')
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid category ID');
      }
      return true;
    }),
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array with at most 20 items'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),
  body('isBreaking')
    .optional()
    .isBoolean()
    .withMessage('isBreaking must be a boolean'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('publishedAt must be a valid date'),
  body('removeImage')
    .optional()
    .isBoolean()
    .withMessage('removeImage must be a boolean'),
];

export const deleteNewsValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('News ID is required')
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid news ID');
      }
      return true;
    }),
];

export const incrementViewValidation = [...newsIdValidation];
