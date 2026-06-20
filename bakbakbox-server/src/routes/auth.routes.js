import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  requireAdmin,
  registerGuard,
} from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', registerGuard, registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

router.use(protect);

router.post('/logout', logout);
router.get('/me', requireAdmin, getMe);
router.post(
  '/change-password',
  requireAdmin,
  changePasswordValidation,
  validate,
  changePassword
);

export default router;
