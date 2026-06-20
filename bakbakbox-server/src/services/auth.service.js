import Admin from '../models/Admin.js';
import { ApiError } from '../utils/apiError.util.js';
import { isMockMode } from '../config/dataMode.js';
import * as mock from '../data/mock/store.js';
import {
  signAccessToken,
  signResetToken,
  hashResetToken,
} from '../utils/jwt.util.js';

const sanitizeAdmin = (admin) => {
  if (!admin) {
    return null;
  }

  const adminObj = admin.toJSON ? admin.toJSON() : admin;
  delete adminObj.password;
  delete adminObj.passwordResetToken;
  delete adminObj.passwordResetExpires;
  return adminObj;
};

const buildTokenPayload = (admin) => ({
  id: admin._id,
  email: admin.email,
  role: admin.role,
});

export const registerAdmin = async ({
  firstName,
  lastName,
  email,
  password,
  role,
}) => {
  if (isMockMode()) {
    return mock.mockRegisterAdmin({ firstName, lastName, email, password, role });
  }

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    throw new ApiError(409, 'An admin with this email already exists');
  }

  const adminCount = await Admin.countDocuments();

  if (adminCount > 0 && role === 'superadmin') {
    throw new ApiError(
      403,
      'Only the first registered account can be a superadmin'
    );
  }

  const admin = await Admin.create({
    firstName,
    lastName,
    email,
    password,
    role: adminCount === 0 ? 'superadmin' : role || 'admin',
  });

  const token = signAccessToken(buildTokenPayload(admin));

  return {
    admin: sanitizeAdmin(admin),
    token,
  };
};

export const loginAdmin = async ({ email, password }) => {
  if (isMockMode()) return mock.mockLoginAdmin({ email, password });

  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!admin.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  const isPasswordValid = await admin.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = signAccessToken(buildTokenPayload(admin));

  return {
    admin: sanitizeAdmin(admin),
    token,
  };
};

export const getAdminProfile = async (adminId) => {
  if (isMockMode()) return mock.mockGetAdminProfile(adminId);

  const admin = await Admin.findById(adminId);

  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  if (!admin.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  return sanitizeAdmin(admin);
};

export const changePassword = async (adminId, currentPassword, newPassword) => {
  if (isMockMode()) {
    return mock.mockChangePassword(adminId, currentPassword, newPassword);
  }

  const admin = await Admin.findById(adminId).select('+password');

  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  const isCurrentPasswordValid = await admin.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  admin.password = newPassword;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  await admin.save();

  return sanitizeAdmin(admin);
};

export const forgotPassword = async (email) => {
  if (isMockMode()) return mock.mockForgotPassword(email);

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return {
      message:
        'If an account with that email exists, a password reset link has been sent',
    };
  }

  const { resetToken, hashedToken } = signResetToken();

  admin.passwordResetToken = hashedToken;
  admin.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await admin.save({ validateBeforeSave: false });

  // TODO: Integrate email service (e.g. Nodemailer, SendGrid) to send resetToken
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Password reset URL: ${resetUrl}`);
  }

  return {
    message:
      'If an account with that email exists, a password reset link has been sent',
    ...(process.env.NODE_ENV !== 'production' && { resetUrl }),
  };
};

export const resetPassword = async (token, newPassword) => {
  if (isMockMode()) return mock.mockResetPassword(token, newPassword);

  const hashedToken = hashResetToken(token);

  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!admin) {
    throw new ApiError(400, 'Password reset token is invalid or has expired');
  }

  admin.password = newPassword;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  await admin.save();

  const accessToken = signAccessToken(buildTokenPayload(admin));

  return {
    admin: sanitizeAdmin(admin),
    token: accessToken,
  };
};
