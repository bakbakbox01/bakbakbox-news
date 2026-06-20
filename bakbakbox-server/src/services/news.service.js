import News from '../models/News.js';
import Category from '../models/Category.js';
import { deleteCloudinaryImage } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.util.js';
import { isMockMode } from '../config/dataMode.js';
import * as mock from '../data/mock/store.js';
import mongoose from 'mongoose';
import {
  buildSourceLine,
  isCorruptArticleContent,
  isMinimalArticleContent,
  normalizeArticleContent,
  plainTextLength,
  repairArticleContent,
  splitSourceLine,
} from '../utils/articleContent.util.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const POPULATE_FIELDS = [
  { path: 'category', select: 'name slug' },
  { path: 'author', select: 'firstName lastName email' },
];

const buildImageFromFile = (file) => {
  if (!file) {
    return null;
  }

  return {
    url: file.url,
    publicId: file.publicId,
    format: file.format,
    width: file.width,
    height: file.height,
  };
};

const removeCloudinaryImage = async (image) => {
  if (!image?.publicId) {
    return;
  }

  try {
    await deleteCloudinaryImage(image.publicId);
  } catch (error) {
    console.error('Failed to delete Cloudinary image:', error.message);
  }
};

const resolveCategoryFilter = async (category) => {
  if (!category) {
    return null;
  }

  if (isValidObjectId(category)) {
    const exists = await Category.findById(category);
    if (!exists) {
      throw new ApiError(404, 'Category not found');
    }
    return category;
  }

  const categoryDoc = await Category.findOne({ slug: category });

  if (!categoryDoc) {
    throw new ApiError(404, 'Category not found');
  }

  return categoryDoc._id;
};

const validateCategory = async (categoryId) => {
  if (!categoryId || !isValidObjectId(categoryId)) {
    throw new ApiError(400, 'Valid category ID is required');
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (!category.isActive) {
    throw new ApiError(400, 'Selected category is not active');
  }

  return category;
};

export const getNews = async ({
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
  if (isMockMode()) {
    return mock.mockGetNews({
      page,
      limit,
      search,
      category,
      status,
      isBreaking,
      tag,
      sortBy,
      sortOrder,
      recentHours,
      isAdmin,
    });
  }

  const filter = {};

  if (!isAdmin) {
    filter.status = 'published';
  } else if (status) {
    filter.status = status;
  }

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  if (category) {
    filter.category = await resolveCategoryFilter(category);
  }

  if (isBreaking !== undefined) {
    filter.isBreaking = isBreaking;
  }

  if (tag) {
    filter.tags = { $in: [tag.toLowerCase()] };
  }

  if (recentHours && !isAdmin) {
    const cutoff = new Date(Date.now() - recentHours * 60 * 60 * 1000);
    filter.$or = [
      { publishedAt: { $gte: cutoff } },
      { publishedAt: null, createdAt: { $gte: cutoff } },
    ];
  }

  const allowedSortFields = [
    'title',
    'publishedAt',
    'createdAt',
    'updatedAt',
    'views',
  ];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'publishedAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;

  const [news, total] = await Promise.all([
    News.find(filter)
      .sort({ [sortField]: sortDirection, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(POPULATE_FIELDS),
    News.countDocuments(filter),
  ]);

  return {
    news,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const resolveSourceUrl = (articleDoc) => {
  if (articleDoc.sourceUrl) {
    return articleDoc.sourceUrl;
  }

  const match = articleDoc.content?.match(/<a href="(https?:\/\/[^"]+)"/i);
  return match?.[1] ?? null;
};

const articleLang = (articleDoc) =>
  articleDoc.tags?.includes('lang:hi') ? 'hi' : 'en';

const cleanSyncedArticleFast = (articleDoc, sourceUrl) => {
  const { sourceLine } = splitSourceLine(articleDoc.content);
  const fallbackSource =
    sourceLine ||
    buildSourceLine(
      sourceUrl,
      articleDoc.sourceName || 'Source',
      articleLang(articleDoc)
    );

  return normalizeArticleContent({
    content: articleDoc.content,
    shortDescription: articleDoc.shortDescription,
    title: articleDoc.title,
    sourceLine: fallbackSource,
    lang: articleLang(articleDoc),
  });
};

const queueBackgroundArticleRepair = (articleDoc, sourceUrl) => {
  repairArticleContent({
    ...articleDoc.toObject(),
    sourceUrl,
  })
    .then((content) => {
      if (!content || content === articleDoc.content) {
        return null;
      }

      return News.findByIdAndUpdate(articleDoc._id, {
        content,
        sourceUrl,
      });
    })
    .catch(() => null);
};

const enrichSyncedArticleOnRead = async (articleDoc) => {
  const isSynced = articleDoc.tags?.some((tag) => String(tag).startsWith('sync:'));
  if (!isSynced) {
    return articleDoc;
  }

  const sourceUrl = resolveSourceUrl(articleDoc);
  const corrupt = isCorruptArticleContent(articleDoc.content);
  const minimal = isMinimalArticleContent(articleDoc.content, articleDoc.title);

  if (corrupt || minimal) {
    const nextContent = cleanSyncedArticleFast(articleDoc, sourceUrl);
    if (nextContent !== articleDoc.content) {
      articleDoc.content = nextContent;
      await News.findByIdAndUpdate(articleDoc._id, {
        content: nextContent,
        ...(sourceUrl ? { sourceUrl } : {}),
      });
    }
  }

  if (sourceUrl && (corrupt || minimal)) {
    queueBackgroundArticleRepair(articleDoc, sourceUrl);
  }

  return articleDoc;
};

export const getNewsById = async (identifier, isAdmin = false) => {
  if (isMockMode()) return mock.mockGetNewsById(identifier, isAdmin);

  const query = isValidObjectId(identifier)
    ? { _id: identifier }
    : { slug: identifier };

  if (!isAdmin) {
    query.status = 'published';
  }

  const article = await News.findOne(query).populate(POPULATE_FIELDS);

  if (!article) {
    throw new ApiError(404, 'News article not found');
  }

  if (!isAdmin) {
    await enrichSyncedArticleOnRead(article);
  }

  return article;
};

export const createNews = async (data, adminId, file) => {
  if (isMockMode()) return mock.mockCreateNews(data, adminId, file);

  await validateCategory(data.category);

  const duplicate = await News.findOne({
    $or: [{ title: data.title }, { slug: data.slug }],
  });

  if (duplicate) {
    throw new ApiError(409, 'A news article with this title or slug already exists');
  }

  const image = buildImageFromFile(file);

  const normalizedData = {
    ...data,
    tags: data.tags?.map((tag) => tag.toLowerCase()),
  };

  const article = await News.create({
    ...normalizedData,
    image,
    author: adminId,
  });

  return article.populate(POPULATE_FIELDS);
};

export const updateNews = async (id, data, file) => {
  if (isMockMode()) return mock.mockUpdateNews(id, data, file);

  const article = await News.findById(id);

  if (!article) {
    throw new ApiError(404, 'News article not found');
  }

  if (data.category) {
    await validateCategory(data.category);
  }

  if (data.title && data.title !== article.title) {
    const duplicateTitle = await News.findOne({
      title: data.title,
      _id: { $ne: id },
    });

    if (duplicateTitle) {
      throw new ApiError(409, 'A news article with this title already exists');
    }
  }

  const newImage = buildImageFromFile(file);

  if (newImage) {
    await removeCloudinaryImage(article.image);
    article.image = newImage;
  } else if (data.removeImage === true) {
    await removeCloudinaryImage(article.image);
    article.image = null;
    delete data.removeImage;
  }

  const updates = { ...data };
  if (data.tags) {
    updates.tags = data.tags.map((tag) => tag.toLowerCase());
  }

  Object.assign(article, updates);

  if (data.status === 'published' && !article.publishedAt) {
    article.publishedAt = new Date();
  }

  await article.save();

  return article.populate(POPULATE_FIELDS);
};

export const deleteNews = async (id) => {
  if (isMockMode()) return mock.mockDeleteNews(id);

  const article = await News.findById(id);

  if (!article) {
    throw new ApiError(404, 'News article not found');
  }

  await removeCloudinaryImage(article.image);
  await article.deleteOne();

  return article;
};

export const incrementViewCount = async (identifier) => {
  if (isMockMode()) return mock.mockIncrementViewCount(identifier);

  const query = isValidObjectId(identifier)
    ? { _id: identifier, status: 'published' }
    : { slug: identifier, status: 'published' };

  const article = await News.findOneAndUpdate(
    query,
    { $inc: { views: 1 } },
    { new: true }
  ).populate(POPULATE_FIELDS);

  if (!article) {
    throw new ApiError(404, 'News article not found');
  }

  return article;
};
