import bcrypt from 'bcryptjs';

export const MOCK_ADMIN_ID = '6a35d1b50483f84bbc4924c4';

export const MOCK_CREDENTIALS = {
  email: 'admin@bakbakbox.com',
  password: 'Admin@123456',
};

const now = new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);

/** Default categories — used for RSS mapping and DB bootstrap */
export const DEFAULT_CATEGORIES = [
  { name: 'World', slug: 'world', description: 'Global headlines and international affairs', sortOrder: 1 },
  { name: 'India', slug: 'india', description: 'National news from across India', sortOrder: 2 },
  { name: 'Hindi News', slug: 'hindi', description: 'ताज़ा खबरें हिंदी में', sortOrder: 3 },
  { name: 'Business', slug: 'business', description: 'Markets, economy, and corporate news', sortOrder: 4 },
  { name: 'Sports', slug: 'sports', description: 'Cricket, football, and all major sports', sortOrder: 5 },
  { name: 'Technology', slug: 'technology', description: 'Tech trends, gadgets, and innovation', sortOrder: 6 },
  { name: 'Entertainment', slug: 'entertainment', description: 'Movies, music, and celebrity buzz', sortOrder: 7 },
  { name: 'Politics', slug: 'politics', description: 'Elections, policy, and government updates', sortOrder: 8 },
];

export const createMockSeed = async () => {
  const passwordHash = await bcrypt.hash(MOCK_CREDENTIALS.password, 12);

  const author = {
    _id: MOCK_ADMIN_ID,
    firstName: 'Admin',
    lastName: 'User',
    email: MOCK_CREDENTIALS.email,
  };

  const categories = DEFAULT_CATEGORIES.map((cat, i) => ({
    _id: `65000000000000000000000${i + 1}`,
    ...cat,
    isActive: true,
    createdBy: author,
    updatedBy: author,
    createdAt: hoursAgo(720),
    updatedAt: hoursAgo(24),
  }));

  const admin = {
    _id: MOCK_ADMIN_ID,
    firstName: 'Admin',
    lastName: 'User',
    email: MOCK_CREDENTIALS.email,
    password: passwordHash,
    role: 'superadmin',
    isActive: true,
    lastLogin: hoursAgo(0.5),
    createdAt: hoursAgo(720),
    updatedAt: hoursAgo(0.5),
  };

  return {
    admin,
    admins: [admin],
    categories,
    news: [], // live RSS sync only — no static dummy articles
  };
};
