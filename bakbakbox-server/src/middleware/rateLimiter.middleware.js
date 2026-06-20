import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const jsonMessage = (message) => ({
  success: false,
  message,
  data: null,
});

export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many requests. Please try again later.'),
});

export const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many authentication attempts. Please try again later.'),
});
