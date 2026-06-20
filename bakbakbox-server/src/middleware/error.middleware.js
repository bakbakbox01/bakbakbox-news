import { ApiError } from '../utils/apiError.util.js';
import { logger } from '../config/logger.js';
import env from '../config/env.js';

export const notFoundHandler = (_req, res, _next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
  });
};

export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.message === 'Origin not allowed by CORS') {
    statusCode = 403;
    message = 'Cross-origin request blocked';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}. Please use another value`;
  }

  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, {
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(`${statusCode} - ${message}`, {
      path: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(!env.isProduction && { stack: err.stack }),
  });
};

export const corsErrorHandler = (err, req, res, next) => {
  if (err.message?.includes('CORS')) {
    return next(new ApiError(403, 'Cross-origin request blocked'));
  }
  next(err);
};
