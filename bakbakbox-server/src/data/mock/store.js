import { ApiError } from '../../utils/apiError.util.js';
import { signAccessToken } from '../../utils/jwt.util.js';
import { createMockSeed, MOCK_ADMIN_ID } from './seed.js';

let store = null;

const clone = (value) => structuredClone(value);

const applyRecentFilter = (items, recentHours) => {
  if (!recentHours) return items;

  const cutoff = Date.now() - recentHours * 60 * 60 * 1000;

  return items.filter((n) => {
    const date = n.publishedAt || n.createdAt;
    return date && new Date(date).getTime() >= cutoff;
  });
};

const paginate = (items, page = 1, limit = 10) => {
  const p = Number(page) || 1;
  const l = Number(limit) || 10;
  const total = items.length;
  const start = (p - 1) * l;

  return {
    items: items.slice(start, start + l),
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
};

const sortItems = (items, sortBy = 'publishedAt', sortOrder = 'desc') => {
  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    const aVal = a[sortBy] ?? a.createdAt;
    const bVal = b[sortBy] ?? b.createdAt;

    if (aVal === bVal) {
      return direction * (new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (aVal instanceof Date || bVal instanceof Date || sortBy.includes('At')) {
      return direction * (new Date(aVal) - new Date(bVal));
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction * (aVal - bVal);
    }

    return direction * String(aVal).localeCompare(String(bVal));
  });
};

const resolveCategoryRef = (categoryId) => {
  const category = store.categories.find(
    (c) => c._id === categoryId || c.slug === categoryId
  );
  return category ? clone(category) : null;
};

const populateNews = (article) => ({
  ...clone(article),
  category:
    typeof article.category === 'object'
      ? clone(article.category)
      : resolveCategoryRef(article.category),
  author: clone(store.admin),
});

const sanitizeAdmin = (admin) => {
  const copy = clone(admin);
  delete copy.password;
  delete copy.passwordResetToken;
  delete copy.passwordResetExpires;
  return copy;
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const initMockStore = async () => {
  if (!store) {
    store = await createMockSeed();
  }
  return store;
};

export const getMockStore = () => store;

// ─── Auth ────────────────────────────────────────────────────────────────────

export const mockFindAdminById = (id) => {
  const admin = store.admins.find((a) => a._id === id);
  return admin ? sanitizeAdmin(admin) : null;
};

export const mockFindAdminByEmail = (email, includePassword = false) => {
  const admin = store.admins.find((a) => a.email === email.toLowerCase());
  if (!admin) return null;
  return includePassword ? clone(admin) : sanitizeAdmin(admin);
};

export const mockAdminCount = () => store.admins.length;

export const mockRegisterAdmin = async ({
  firstName,
  lastName,
  email,
  password,
  role,
}) => {
  const existing = store.admins.find((a) => a.email === email.toLowerCase());
  if (existing) {
    throw new ApiError(409, 'An admin with this email already exists');
  }

  const bcrypt = await import('bcryptjs');
  const admin = {
    _id: `mock${Date.now()}`,
    firstName,
    lastName,
    email: email.toLowerCase(),
    password: await bcrypt.default.hash(password, 12),
    role: store.admins.length === 0 ? 'superadmin' : role || 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.admins.push(admin);
  const token = signAccessToken({ id: admin._id, email: admin.email, role: admin.role });

  return { admin: sanitizeAdmin(admin), token };
};

export const mockLoginAdmin = async ({ email, password }) => {
  const admin = store.admins.find((a) => a.email === email.toLowerCase());
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const bcrypt = await import('bcryptjs');
  const valid = await bcrypt.default.compare(password, admin.password);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  admin.lastLogin = new Date();
  const token = signAccessToken({ id: admin._id, email: admin.email, role: admin.role });

  return { admin: sanitizeAdmin(admin), token };
};

export const mockGetAdminProfile = (adminId) => {
  const admin = mockFindAdminById(adminId);
  if (!admin) throw new ApiError(404, 'Admin not found');
  return admin;
};

export const mockChangePassword = async (adminId, currentPassword, newPassword) => {
  const admin = store.admins.find((a) => a._id === adminId);
  if (!admin) throw new ApiError(404, 'Admin not found');

  const bcrypt = await import('bcryptjs');
  const valid = await bcrypt.default.compare(currentPassword, admin.password);
  if (!valid) throw new ApiError(401, 'Current password is incorrect');

  admin.password = await bcrypt.default.hash(newPassword, 12);
  admin.updatedAt = new Date();
  return sanitizeAdmin(admin);
};

export const mockForgotPassword = async (email) => ({
  message: 'If an account with that email exists, a password reset link has been sent',
  resetUrl: `${process.env.CLIENT_URL || 'http://localhost:4200'}/reset-password?token=mock-reset-token`,
});

export const mockResetPassword = async () => {
  throw new ApiError(400, 'Password reset token is invalid or has expired');
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const mockGetCategories = ({
  page = 1,
  limit = 10,
  search = '',
  isActive,
  sortBy = 'sortOrder',
  sortOrder = 'asc',
}) => {
  let items = [...store.categories];

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }

  if (isActive !== undefined) {
    items = items.filter((c) => c.isActive === isActive);
  }

  items = sortItems(items, sortBy, sortOrder);
  const { items: pageItems, pagination } = paginate(items, page, limit);

  return { categories: clone(pageItems), pagination };
};

export const mockGetCategoryById = (identifier) => {
  const category = store.categories.find(
    (c) => c._id === identifier || c.slug === identifier
  );
  if (!category) throw new ApiError(404, 'Category not found');
  return clone(category);
};

export const mockCreateCategory = (data, adminId) => {
  const duplicate = store.categories.find(
    (c) => c.name === data.name || c.slug === data.slug
  );
  if (duplicate) {
    throw new ApiError(409, 'A category with this name or slug already exists');
  }

  const category = {
    _id: `6500${Date.now()}`,
    ...data,
    slug: data.slug || slugify(data.name),
    createdBy: sanitizeAdmin(store.admin),
    updatedBy: sanitizeAdmin(store.admin),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.categories.push(category);
  return clone(category);
};

export const mockUpdateCategory = (id, data, adminId) => {
  const index = store.categories.findIndex((c) => c._id === id);
  if (index === -1) throw new ApiError(404, 'Category not found');

  Object.assign(store.categories[index], data, {
    updatedBy: sanitizeAdmin(store.admin),
    updatedAt: new Date(),
  });

  return clone(store.categories[index]);
};

export const mockDeleteCategory = (id) => {
  const index = store.categories.findIndex((c) => c._id === id);
  if (index === -1) throw new ApiError(404, 'Category not found');
  const [removed] = store.categories.splice(index, 1);
  return clone(removed);
};

// ─── News ────────────────────────────────────────────────────────────────────

export const mockGetNews = async ({
  page = 1,
  limit = 10,
  search = '',
  category,
  status,
  isBreaking,
  tag,
  sortBy = 'publishedAt',
  sortOrder = 'desc',
  recentHours,
  isAdmin = false,
}) => {
  let items = [...store.news];

  if (!isAdmin) {
    items = items.filter((n) => n.status === 'published');
  } else if (status) {
    items = items.filter((n) => n.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter((n) => n.title.toLowerCase().includes(q));
  }

  if (category) {
    const cat = store.categories.find(
      (c) => c._id === category || c.slug === category
    );
    if (!cat) throw new ApiError(404, 'Category not found');
    items = items.filter(
      (n) => n.category?.slug === cat.slug || n.category?._id === cat._id
    );
  }

  if (isBreaking !== undefined) {
    items = items.filter((n) => n.isBreaking === isBreaking);
  }

  if (tag) {
    items = items.filter((n) => n.tags?.includes(tag.toLowerCase()));
  }

  if (recentHours && !isAdmin) {
    items = applyRecentFilter(items, recentHours);
  }

  items = sortItems(items, sortBy, sortOrder);
  const { items: pageItems, pagination } = paginate(items, page, limit);

  return {
    news: pageItems.map(populateNews),
    pagination,
  };
};

export const mockGetNewsById = (identifier, isAdmin = false) => {
  const article = store.news.find(
    (n) => n._id === identifier || n.slug === identifier
  );

  if (!article || (!isAdmin && article.status !== 'published')) {
    throw new ApiError(404, 'News article not found');
  }

  return populateNews(article);
};

export const mockCreateNews = (data, adminId, file) => {
  const category = store.categories.find((c) => c._id === data.category);
  if (!category?.isActive) {
    throw new ApiError(404, 'Category not found');
  }

  const article = {
    _id: `6600${Date.now()}`,
    ...data,
    slug: data.slug || slugify(data.title),
    category: clone(category),
    author: clone(store.admin),
    tags: data.tags?.map((t) => t.toLowerCase()) ?? [],
    image: file
      ? {
          url: file.url,
          publicId: file.publicId,
          format: file.format,
          width: file.width,
          height: file.height,
        }
      : null,
    views: 0,
    publishedAt: data.status === 'published' ? new Date() : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.news.unshift(article);
  return populateNews(article);
};

export const mockUpdateNews = (id, data, file) => {
  const index = store.news.findIndex((n) => n._id === id);
  if (index === -1) throw new ApiError(404, 'News article not found');

  const article = store.news[index];

  if (data.category) {
    const category = store.categories.find((c) => c._id === data.category);
    if (!category) throw new ApiError(404, 'Category not found');
    article.category = clone(category);
    delete data.category;
  }

  if (file) {
    article.image = {
      url: file.url,
      publicId: file.publicId,
      format: file.format,
      width: file.width,
      height: file.height,
    };
  } else if (data.removeImage === true) {
    article.image = null;
    delete data.removeImage;
  }

  Object.assign(article, data, { updatedAt: new Date() });

  if (data.status === 'published' && !article.publishedAt) {
    article.publishedAt = new Date();
  }

  return populateNews(article);
};

export const mockDeleteNews = (id) => {
  const index = store.news.findIndex((n) => n._id === id);
  if (index === -1) throw new ApiError(404, 'News article not found');
  const [removed] = store.news.splice(index, 1);
  return populateNews(removed);
};

export const mockIncrementViewCount = (identifier) => {
  const article = store.news.find(
    (n) =>
      (n._id === identifier || n.slug === identifier) && n.status === 'published'
  );

  if (!article) throw new ApiError(404, 'News article not found');

  article.views += 1;
  return populateNews(article);
};

// ─── Dashboard / Stats ───────────────────────────────────────────────────────

export const mockAggregateNewsStats = () => {
  const published = store.news.filter((n) => n.status === 'published');
  return {
    totalNews: store.news.length,
    totalViews: store.news.reduce((sum, n) => sum + (n.views || 0), 0),
    breakingNewsCount: store.news.filter((n) => n.isBreaking).length,
    draftCount: store.news.filter((n) => n.status === 'draft').length,
    publishedCount: published.length,
    archivedCount: store.news.filter((n) => n.status === 'archived').length,
  };
};

export const mockAggregateCategoryStats = () => ({
  totalCategories: store.categories.length,
  activeCategories: store.categories.filter((c) => c.isActive).length,
  inactiveCategories: store.categories.filter((c) => !c.isActive).length,
});

export const mockGetRecentNews = (limit = 5) =>
  sortItems(store.news, 'updatedAt', 'desc')
    .slice(0, limit)
    .map(populateNews);

export const mockGetLatestActivity = (limit = 10) => {
  const newsActivity = store.news.map((article) => ({
    type: 'news_updated',
    entity: 'news',
    entityId: article._id,
    title: article.title,
    slug: article.slug,
    status: article.status,
    category: clone(article.category),
    performedBy: sanitizeAdmin(store.admin),
    timestamp: article.updatedAt,
  }));

  const categoryActivity = store.categories.map((category) => ({
    type: 'category_updated',
    entity: 'category',
    entityId: category._id,
    title: category.name,
    slug: category.slug,
    performedBy: sanitizeAdmin(store.admin),
    timestamp: category.updatedAt,
  }));

  return [...newsActivity, ...categoryActivity]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

export const mockGetDashboardOverview = async ({
  recentLimit = 5,
  activityLimit = 10,
} = {}) => ({
  statistics: {
    ...mockAggregateNewsStats(),
    ...mockAggregateCategoryStats(),
  },
  recentNews: mockGetRecentNews(recentLimit),
  latestActivity: mockGetLatestActivity(activityLimit),
});

/** Minimal admin doc for req.admin in middleware */
export const mockAdminDoc = (id) => {
  const admin = store.admins.find((a) => a._id === id);
  if (!admin) return null;

  return {
    _id: admin._id,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
    firstName: admin.firstName,
    lastName: admin.lastName,
  };
};

const MAX_SYNCED_NEWS = 100;

/** Insert live RSS articles into mock store (deduped by syncId) */
export const mockUpsertSyncedArticles = (articles) => {
  if (!store) return 0;

  let added = 0;

  for (const article of articles) {
    const exists = store.news.some(
      (n) =>
        n.syncId === article.syncId ||
        n.slug === article.slug ||
        n.tags?.includes(`sync:${article.syncId}`)
    );

    if (exists) continue;

    const category =
      store.categories.find((c) => c.slug === article.categorySlug) ||
      store.categories[0];

    store.news.unshift({
      _id: `sync${Date.now()}${added}`,
      syncId: article.syncId,
      title: article.title,
      slug: article.slug,
      shortDescription: article.shortDescription,
      content: article.content,
      sourceUrl: article.sourceUrl ?? null,
      sourceName: article.sourceName ?? null,
      image: article.image,
      category: clone(category),
      author: clone(store.admin),
      tags: [...article.tags, `sync:${article.syncId}`],
      isBreaking: article.isBreaking,
      status: 'published',
      views: article.views,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    });

    added += 1;
  }

  if (store.news.length > MAX_SYNCED_NEWS) {
    store.news = store.news.slice(0, MAX_SYNCED_NEWS);
  }

  return added;
};

/** Remove auto-synced mock articles older than maxAgeHours */
export const mockPruneStaleSyncedArticles = (maxAgeHours) => {
  if (!store || !maxAgeHours) return 0;

  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
  const before = store.news.length;

  store.news = store.news.filter((n) => {
    const isSynced = n.syncId || n.tags?.some((t) => t.startsWith('sync:'));
    if (!isSynced) return true;

    const date = n.publishedAt || n.createdAt;
    return date && new Date(date).getTime() >= cutoff;
  });

  return before - store.news.length;
};

export { MOCK_ADMIN_ID };
