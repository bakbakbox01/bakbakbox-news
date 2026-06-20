import Admin from '../models/Admin.js';
import { ApiError } from '../utils/apiError.util.js';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { isMockMode } from '../config/dataMode.js';
import { mockAdminDoc } from '../data/mock/store.js';

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

const resolveAdmin = async (decoded) => {
  if (isMockMode()) {
    return mockAdminDoc(decoded.id);
  }

  const admin = await Admin.findById(decoded.id);
  if (!admin) return null;
  return admin;
};

export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ApiError(401, 'Not authorized. Please log in');
  }

  const decoded = verifyAccessToken(token);
  const admin = await resolveAdmin(decoded);

  if (!admin) {
    throw new ApiError(401, 'Admin belonging to this token no longer exists');
  }

  if (!admin.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  if (decoded.email !== admin.email) {
    throw new ApiError(401, 'Token is invalid. Please log in again');
  }

  req.admin = admin;
  req.token = token;
  next();
});

export const optionalProtect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const admin = await resolveAdmin(decoded);

    if (admin?.isActive && decoded.email === admin.email) {
      req.admin = admin;
      req.token = token;
    }
  } catch {
    // Invalid token — continue as public user
  }

  next();
});
