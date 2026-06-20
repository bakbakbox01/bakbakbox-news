import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import { isMockMode } from '../config/dataMode.js';
import { DEFAULT_CATEGORIES } from '../data/mock/seed.js';
import { logger } from '../config/logger.js';

const bootstrapDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    return;
  }

  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    return;
  }

  await Admin.create({
    firstName: process.env.ADMIN_FIRST_NAME?.trim() || 'Admin',
    lastName: process.env.ADMIN_LAST_NAME?.trim() || 'User',
    email,
    password: await bcrypt.hash(password, 12),
    role: 'superadmin',
    isActive: true,
  });

  logger.info(`Bootstrap: created superadmin ${email}`);
};

/**
 * Ensures default categories and optional first admin exist in MongoDB.
 */
export const bootstrapDatabase = async () => {
  if (isMockMode()) {
    return;
  }

  let added = 0;

  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create({ ...cat, isActive: true });
      added += 1;
    }
  }

  if (added > 0) {
    logger.info(`Bootstrap: added ${added} new categor${added === 1 ? 'y' : 'ies'}`);
  }

  await bootstrapDefaultAdmin();
};
