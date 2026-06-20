import crypto from 'crypto';

export const generateSlug = (title, fallbackKey = '') => {
  let slug = title
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-\u0900-\u097F]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug || slug.length < 3) {
    const hash = crypto
      .createHash('md5')
      .update(String(fallbackKey || title))
      .digest('hex')
      .slice(0, 10);
    slug = `article-${hash}`;
  }

  return slug.slice(0, 120);
};
