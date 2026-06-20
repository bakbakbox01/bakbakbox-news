import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.util.js';
import { getTokenCookieOptions } from '../utils/jwt.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export const register = asyncHandler(async (req, res) => {
  const { admin, token } = await authService.registerAdmin(req.body);

  res.cookie('token', token, getTokenCookieOptions());

  sendSuccess(res, 201, 'Admin registered successfully', { admin, token });
});

export const login = asyncHandler(async (req, res) => {
  const { admin, token } = await authService.loginAdmin(req.body);

  res.cookie('token', token, getTokenCookieOptions());

  sendSuccess(res, 200, 'Login successful', { admin, token });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  sendSuccess(res, 200, 'Logged out successfully', null);
});

export const getMe = asyncHandler(async (req, res) => {
  const admin = await authService.getAdminProfile(req.admin._id);

  sendSuccess(res, 200, 'Profile retrieved successfully', { admin });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await authService.changePassword(
    req.admin._id,
    currentPassword,
    newPassword
  );

  sendSuccess(res, 200, 'Password changed successfully', { admin });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  sendSuccess(res, 200, result.message, {
    ...(result.resetUrl && { resetUrl: result.resetUrl }),
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const { admin, token: accessToken } = await authService.resetPassword(
    token,
    newPassword
  );

  res.cookie('token', accessToken, getTokenCookieOptions());

  sendSuccess(res, 200, 'Password reset successful', {
    admin,
    token: accessToken,
  });
});
