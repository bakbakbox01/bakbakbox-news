import Parser from 'rss-parser';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import News from '../models/News.js';
import { isMockMode } from '../config/dataMode.js';
import { NEWS_FEEDS } from '../config/newsFeeds.js';
import { bootstrapDatabase } from './bootstrap.service.js';
import { mockUpsertSyncedArticles, mockPruneStaleSyncedArticles } from '../data/mock/store.js';
import { generateSlug } from '../utils/slug.util.js';
import { pickArticleFallbackImage, upgradeSyncImageUrl } from '../utils/imageUrl.util.js';
import {
  buildSourceLine,
  enrichArticleBody,
  isCorruptArticleContent,
  normalizeArticleContent,
  plainTextLength,
  sanitizeArticleHtml,
} from '../utils/articleContent.util.js';
import { logger } from '../config/logger.js';
import env from '../config/env.js';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'BakBakBox-News/1.0 (+https://bakbakbox.local)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

const stripHtml = (html = '') =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractImageUrl = (item, categorySlug) => {
  const fromEnclosure =
    item.enclosure?.type?.startsWith('image/') ? item.enclosure.url : null;

  const fromMedia =
    item.mediaContent?.$?.url ||
    item.mediaContent?.url ||
    item.mediaThumbnail?.$?.url ||
    item.mediaThumbnail?.url;

  const fromContent = item.content?.match(/<img[^>]+src="([^"]+)"/i)?.[1];

  const fallbackKey = item.guid || item.link || item.title || categorySlug;
  const fallbackUrl = pickArticleFallbackImage(categorySlug, fallbackKey);

  const url = fromEnclosure || fromMedia || fromContent;
  if (url) {
    const upgradedUrl = upgradeSyncImageUrl(url);
    return {
      url: upgradedUrl,
      publicId: `sync/${generateSlug(item.title || 'news').slice(0, 40)}`,
      format: 'jpg',
      width: 1200,
      height: 675,
    };
  }

  return {
    url: fallbackUrl,
    publicId: `sync/fallback-${categorySlug}-${generateSlug(fallbackKey).slice(0, 24)}`,
    format: 'jpg',
    width: 1200,
    height: 675,
  };
};

const normalizeItem = (item, feed) => {
  const title = (item.title || '').trim();
  const minTitleLen = feed.lang === 'hi' ? 4 : 10;
  if (!title || title.length < minTitleLen) return null;

  const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
  const description = stripHtml(item.contentSnippet || item.summary || item.content || '');
  const link = item.link || item.guid || '';
  const syncId = item.guid || item.id || link || `${feed.source}-${title}`;
  const slug = generateSlug(title, syncId);
  const hoursSincePublish = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);

  const htmlContent =
    item.contentEncoded ||
    item['content:encoded'] ||
    item.content ||
    item.summary ||
    '';
  let body = sanitizeArticleHtml(
    htmlContent && htmlContent.includes('<')
      ? htmlContent.slice(0, 12000)
      : `<p>${description || title}</p>`
  );

  if (isCorruptArticleContent(body) || plainTextLength(body) < 80) {
    body = sanitizeArticleHtml(description || title);
  }

  const sourceLine = buildSourceLine(link, feed.source, feed.lang);

  const tags = [
    'auto-sync',
    feed.categorySlug,
    feed.source.toLowerCase().replace(/\s+/g, '-'),
  ];

  if (feed.lang) {
    tags.push(`lang:${feed.lang}`);
  }

  return {
    syncId,
    slug,
    title: title.slice(0, 200),
    shortDescription: (description || title).slice(0, 500),
    bodyHtml: body,
    sourceLine,
    content: normalizeArticleContent({
      content: body,
      shortDescription: (description || title).slice(0, 500),
      title: title.slice(0, 200),
      sourceLine,
      lang: feed.lang || 'en',
    }),
    sourceUrl: link || null,
    sourceName: feed.source,
    image: extractImageUrl(item, feed.categorySlug),
    categorySlug: feed.categorySlug,
    source: feed.source,
    tags,
    isBreaking: hoursSincePublish <= 3,
    status: 'published',
    views: Math.floor(Math.random() * 500) + 50,
    publishedAt: pubDate,
    createdAt: pubDate,
    updatedAt: new Date(),
  };
};

const enrichArticles = async (articles, limit = 6) => {
  let enriched = 0;
  const candidates = articles.filter(
    (article) => article.sourceUrl && plainTextLength(article.bodyHtml) < 400
  );

  for (const article of candidates.slice(0, limit)) {
    const body = await enrichArticleBody(article);
    if (plainTextLength(body) > plainTextLength(article.bodyHtml)) {
      article.bodyHtml = body;
      article.content = normalizeArticleContent({
        content: body,
        shortDescription: article.shortDescription,
        title: article.title,
        sourceLine: article.sourceLine,
        lang: article.tags?.includes('lang:hi') ? 'hi' : 'en',
      });
      enriched += 1;
    }
  }

  if (enriched > 0) {
    logger.info(`News sync: enriched ${enriched} article(s) with full page content`);
  }

  return articles;
};

const fetchFeedItems = async (feed) => {
  try {
    const parsed = await parser.parseURL(feed.url);
    return (parsed.items || [])
      .slice(0, 12)
      .map((item) => normalizeItem(item, feed))
      .filter(Boolean);
  } catch (error) {
    logger.warn(`RSS fetch failed [${feed.source}]: ${error.message}`);
    return [];
  }
};

const syncToDatabase = async (articles) => {
  const admin =
    (await Admin.findOne({ role: 'superadmin', isActive: true })) ||
    (await Admin.findOne({ isActive: true }));

  if (!admin) {
    logger.warn('News sync skipped: no admin account in database');
    return 0;
  }

  const categories = await Category.find({ isActive: true });
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  let added = 0;

  for (const article of articles) {
    const category = categoryBySlug[article.categorySlug];
    if (!category) continue;

    const exists = await News.findOne({
      $or: [{ slug: article.slug }, { tags: `sync:${article.syncId}` }],
    });

    if (exists) continue;

    try {
      await News.create({
        title: article.title,
        slug: article.slug,
        shortDescription: article.shortDescription,
        content: article.content,
        sourceUrl: article.sourceUrl,
        sourceName: article.sourceName,
        image: article.image,
        category: category._id,
        author: admin._id,
        tags: [...article.tags, `sync:${article.syncId}`],
        isBreaking: article.isBreaking,
        status: 'published',
        views: article.views,
        publishedAt: article.publishedAt,
      });
      added += 1;
    } catch (error) {
      if (error.code !== 11000) {
        logger.warn(`News sync insert failed: ${error.message}`);
      }
    }
  }

  return added;
};

const pruneStaleSyncedNews = async () => {
  const maxAgeHours = env.newsSync.maxAgeHours;
  if (!maxAgeHours) return 0;

  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

  const result = await News.deleteMany({
    tags: { $regex: /^sync:/ },
    $or: [
      { publishedAt: { $lt: cutoff } },
      { publishedAt: null, createdAt: { $lt: cutoff } },
    ],
  });

  return result.deletedCount ?? 0;
};

let lastSyncAt = null;
let lastAddedCount = 0;
let lastError = null;
let isSyncing = false;

export const getNewsSyncStatus = () => ({
  enabled: process.env.NEWS_SYNC_ENABLED !== 'false',
  intervalMs: Number(process.env.NEWS_SYNC_INTERVAL_MS) || 30000,
  lastSyncAt,
  lastAddedCount,
  lastError,
  isSyncing,
  mode: isMockMode() ? 'mock' : 'database',
  feeds: NEWS_FEEDS.length,
});

export const syncNewsFeeds = async () => {
  if (isSyncing) {
    return { skipped: true, added: 0 };
  }

  isSyncing = true;
  lastError = null;

  try {
    if (!isMockMode()) {
      await bootstrapDatabase();
    }

    const batches = await Promise.all(NEWS_FEEDS.map(fetchFeedItems));
    const articles = batches.flat();

    const unique = new Map();
    for (const article of articles) {
      if (!unique.has(article.syncId)) {
        unique.set(article.syncId, article);
      }
    }

    const sorted = [...unique.values()].sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    await enrichArticles(sorted);

    const added = isMockMode()
      ? mockUpsertSyncedArticles(sorted)
      : await syncToDatabase(sorted);

    const pruned = isMockMode()
      ? mockPruneStaleSyncedArticles(env.newsSync.maxAgeHours)
      : await pruneStaleSyncedNews();

    lastSyncAt = new Date().toISOString();
    lastAddedCount = added;

    if (added > 0) {
      logger.info(`News sync: ${added} new article(s) from live RSS feeds`);
    }

    if (pruned > 0) {
      logger.info(`News sync: removed ${pruned} stale auto-synced article(s)`);
    }

    return { added, pruned, totalFetched: sorted.length };
  } catch (error) {
    lastError = error.message;
    logger.error(`News sync error: ${error.message}`);
    throw error;
  } finally {
    isSyncing = false;
  }
};
