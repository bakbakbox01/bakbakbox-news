import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ApiError } from './apiError.util.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new ApiError(500, 'JWT_SECRET is not configured');
  }

  return secret;
};

export const signAccessToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired. Please log in again');
    }

    throw new ApiError(401, 'Invalid token. Please log in again');
  }
};

export const signResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  return { resetToken, hashedToken };
};

export const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const getTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const expiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: expiresInDays * 24 * 60 * 60 * 1000,
  };
};
