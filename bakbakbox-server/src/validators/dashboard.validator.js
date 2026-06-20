import { query } from 'express-validator';

export const dashboardQueryValidation = [
  query('recentLimit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('recentLimit must be between 1 and 20')
    .toInt(),
  query('activityLimit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('activityLimit must be between 1 and 50')
    .toInt(),
];

export const recentNewsValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('limit must be between 1 and 20')
    .toInt(),
];

export const latestActivityValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be between 1 and 50')
    .toInt(),
];
