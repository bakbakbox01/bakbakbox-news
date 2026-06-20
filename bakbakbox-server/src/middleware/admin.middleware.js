import Admin from '../models/Admin.js';
import { ApiError } from '../utils/apiError.util.js';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { isMockMode } from '../config/dataMode.js';
import { mockAdminCount, mockAdminDoc } from '../data/mock/store.js';

const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
};

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  if (!req.admin) {
    throw new ApiError(401, 'Not authorized. Please log in');
  }

  if (!['admin', 'superadmin'].includes(req.admin.role)) {
    throw new ApiError(403, 'You do not have permission to access this resource');
  }

  next();
});

export const requireSuperAdmin = asyncHandler(async (req, _res, next) => {
  if (!req.admin) {
    throw new ApiError(401, 'Not authorized. Please log in');
  }

  if (req.admin.role !== 'superadmin') {
    throw new ApiError(403, 'Superadmin access required');
  }

  next();
});

/**
 * Allows open registration when no admins exist;
 * otherwise requires an authenticated superadmin.
 */
export const registerGuard = asyncHandler(async (req, _res, next) => {
  const adminCount = isMockMode()
    ? mockAdminCount()
    : await Admin.countDocuments();

  if (adminCount === 0) {
    return next();
  }

  const token = extractToken(req);

  if (!token) {
    throw new ApiError(
      403,
      'Registration is closed. Contact a superadmin to create an account'
    );
  }

  const decoded = verifyAccessToken(token);

  const admin = isMockMode()
    ? mockAdminDoc(decoded.id)
    : await Admin.findById(decoded.id);

  if (!admin || !admin.isActive) {
    throw new ApiError(401, 'Not authorized. Please log in');
  }

  if (admin.role !== 'superadmin') {
    throw new ApiError(403, 'Only superadmins can register new admins');
  }

  req.admin = admin;
  req.token = token;
  next();
});
