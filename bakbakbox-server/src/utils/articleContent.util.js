import * as cheerio from 'cheerio';

const STRIP_HTML = (html = '') =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'h2',
  'h3',
  'h4',
  'strong',
  'em',
  'b',
  'i',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'figure',
  'figcaption',
  'img',
]);

const ARTICLE_SELECTORS = [
  'article [itemprop="articleBody"]',
  '[itemprop="articleBody"]',
  'article .article-body',
  'article .story-content',
  'article .article-content',
  '.article__content',
  '.article__body',
  '.story-content',
  '.story__content',
  '.detail-body',
  '.article-body',
  '.article-content',
  '.entry-content',
  '.post-content',
  '.news-content',
  '.main-content article',
  'article',
  'main article',
  'main',
];

const SITE_SELECTORS = {
  'amarujala.com': ['.article__content', '.story-content', '.detail-body', '[itemprop="articleBody"]'],
  'indianexpress.com': ['.full-details', '.ie-content-block', '#main-content article'],
  'thehindu.com': ['.articlebodycontent', '.article-section'],
  'ndtv.com': ['.sp-cn-ins_storybody', '.content_text'],
  'indiatoday.in': ['.story-left', '.story-content'],
  'abplive.com': ['.article-content', '.story-content'],
  'bbc.com': ['article', '[data-component="text-block"]'],
  'bbc.co.uk': ['article', '[data-component="text-block"]'],
};

const NOISE_LINE = [
  /^विज्ञापन$/i,
  /^advertisement$/i,
  /^link copied$/i,
  /^add as a preferredsource on google$/i,
  /^published by:/i,
  /^updated .+ ist$/i,
  /^यह खबर एप पर पढ़ें$/i,
  /^खबरें लगातार पढ़ने के लिए/i,
  /^संक्षिप्त विज्ञापन देखें$/i,
  /^विज्ञापन लोड हो रहा है$/i,
  /^लॉगिन करें$/i,
  /^विस्तार$/i,
  /^सार$/i,
  /^या\s+वेबसाइट पर पढ़ना/i,
  /^एजेंसी,/i,
  /^source:/i,
  /^photo\s*:/i,
  /^-\s*फोटो\s*:/i,
  /^-\s*photo\s*:/i,
];

const METADATA_KEYS = /"_id"|"slug"|"title_hn"|"status"\s*:|"type"\s*:\s*"story"/;

export const plainTextLength = (html = '') => STRIP_HTML(html).length;

export const stripLeadingJson = (text = '') => {
  let value = text.trim();
  if (!value.startsWith('{')) {
    return value;
  }

  let depth = 0;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      value = value.slice(i + 1).trim();
      break;
    }
  }

  return value.replace(/^\s*\{[\s\S]*?\}\s*/, '').trim();
};

const isNoiseLine = (line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 2) return true;
  if (METADATA_KEYS.test(trimmed)) return true;
  if (/^[\d\s\-:|,APM]+$/i.test(trimmed) && trimmed.length < 40) return true;
  return NOISE_LINE.some((pattern) => pattern.test(trimmed));
};

export const splitSourceLine = (content = '') => {
  const sourceMatch = content.match(
    /(<p class="article-source">[\s\S]*?<\/p>|<p><em>Source:[\s\S]*?<\/p>)\s*$/i
  );

  if (!sourceMatch) {
    return { body: content.trim(), sourceLine: '' };
  }

  return {
    body: content.slice(0, sourceMatch.index).trim(),
    sourceLine: sourceMatch[0].trim(),
  };
};

const plainTextToParagraphs = (text = '') => {
  const cleaned = stripLeadingJson(text)
    .replace(/\r/g, '')
    .replace(/\t+/g, ' ')
    .replace(/[ \u00a0]+/g, ' ')
    .trim();

  const chunks = cleaned
    .split(/\n{2,}|(?:\.\s+(?=[A-Z\u0900-\u097F]))/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part.length >= 40 && !isNoiseLine(part));

  if (!chunks.length) {
    return '';
  }

  return chunks.map((part) => `<p>${part}</p>`).join('');
};

const sanitizeNode = ($, el) => {
  const tag = el.name?.toLowerCase();
  if (!tag || !ALLOWED_TAGS.has(tag)) {
    $(el).replaceWith($(el).text());
    return;
  }

  const attribs = { ...el.attribs };
  for (const key of Object.keys(attribs)) {
    if (key === 'href' && tag === 'a') {
      const href = attribs.href || '';
      if (!/^https?:\/\//i.test(href)) {
        $(el).removeAttr('href');
      } else {
        $(el).attr({ href, target: '_blank', rel: 'noopener noreferrer' });
      }
      continue;
    }

    if (tag === 'img' && (key === 'src' || key === 'alt')) {
      continue;
    }

    $(el).removeAttr(key);
  }

  if (tag === 'img') {
    const src = el.attribs?.src || '';
    if (!/^https?:\/\//i.test(src)) {
      $(el).remove();
    }
  }
};

export const sanitizeArticleHtml = (html = '') => {
  if (!html) {
    return '';
  }

  if (!html.includes('<')) {
    return plainTextToParagraphs(html);
  }

  const $ = cheerio.load(html, { decodeEntities: false });
  $('script, style, iframe, form, object, embed, noscript, svg, nav, footer, header, aside').remove();
  $('[class*="ad-"], [class*="advert"], [id*="ad-"], [class*="promo"], [class*="cookie"]').remove();

  $('*').each((_, el) => {
    if (el.type === 'tag') {
      sanitizeNode($, el);
    }
  });

  const cleaned = $('body').length ? $('body').html() : $.root().html();
  const normalized = (cleaned || '').trim();

  if (METADATA_KEYS.test(normalized.slice(0, 500))) {
    return plainTextToParagraphs(STRIP_HTML(normalized));
  }

  return normalized.slice(0, 12000);
};

export const buildSourceLine = (link, source, lang) => {
  const langLabel = lang === 'hi' ? 'हिंदी' : lang === 'en' ? 'English' : '';
  if (link) {
    return `<p class="article-source"><em>Source: <a href="${link}" target="_blank" rel="noopener noreferrer">${source}</a>${langLabel ? ` · ${langLabel}` : ''}</em></p>`;
  }
  return `<p class="article-source"><em>Source: ${source}${langLabel ? ` · ${langLabel}` : ''}</em></p>`;
};

const selectorsForUrl = (pageUrl) => {
  try {
    const host = new URL(pageUrl).hostname.replace(/^www\./, '');
    const siteKey = Object.keys(SITE_SELECTORS).find((domain) => host.includes(domain));
    return siteKey ? [...SITE_SELECTORS[siteKey], ...ARTICLE_SELECTORS] : ARTICLE_SELECTORS;
  } catch {
    return ARTICLE_SELECTORS;
  }
};

const scoreParagraph = (text) => {
  if (isNoiseLine(text)) return 0;
  if (METADATA_KEYS.test(text)) return 0;
  if (text.length < 50) return 0;
  return text.length;
};

export const extractArticleFromHtml = (pageHtml, pageUrl) => {
  const $ = cheerio.load(pageHtml);
  $('script, style, nav, footer, header, aside, iframe, noscript, form, svg').remove();
  $('[class*="ad-"], [class*="advert"], [id*="ad-"], [class*="promo"], [class*="cookie"]').remove();

  for (const selector of selectorsForUrl(pageUrl)) {
    const block = $(selector).first();
    const html = block.html()?.trim();
    const textLen = plainTextLength(html || '');
    if (html && textLen >= 280 && !METADATA_KEYS.test(STRIP_HTML(html).slice(0, 300))) {
      const sanitized = sanitizeArticleHtml(html);
      if (plainTextLength(sanitized) >= 280) {
        return sanitized;
      }
    }
  }

  const paragraphs = $('p')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter((text) => scoreParagraph(text) > 0)
    .slice(0, 20);

  if (paragraphs.length >= 2) {
    return paragraphs.map((p) => `<p>${p}</p>`).join('');
  }

  const ogDesc = $('meta[property="og:description"]').attr('content')?.trim();
  if (ogDesc && ogDesc.length >= 80 && !isNoiseLine(ogDesc)) {
    return `<p>${ogDesc}</p>`;
  }

  return null;
};

export const fetchFullArticleHtml = async (url) => {
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; BakBakBox-News/1.0; +https://bakbakbox.local)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return extractArticleFromHtml(html, url);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const isDuplicateOfTitle = (html = '', title = '') => {
  const bodyText = STRIP_HTML(html).trim();
  const titleText = STRIP_HTML(title).trim();
  return Boolean(bodyText && titleText && bodyText === titleText);
};

export const isCorruptArticleContent = (content = '') => {
  const head = content.slice(0, 1000);
  return (
    /^\s*\{/.test(content.trim()) ||
    METADATA_KEYS.test(head) ||
    /Link Copied/i.test(head) ||
    /Add as a preferredsource on google/i.test(head)
  );
};

export const isMinimalArticleContent = (content = '', title = '') => {
  const { body } = splitSourceLine(content);
  return plainTextLength(body) < 180 || isDuplicateOfTitle(body, title);
};

const buildPreviewNotice = (lang = 'en') => {
  if (lang === 'hi') {
    return '<p class="article-preview-note">यह संक्षिप्त खबर है। पूरी रिपोर्ट पढ़ने के लिए नीचे दिए गए स्रोत लिंक पर जाएं।</p>';
  }

  return '<p class="article-preview-note">This is a brief headline. Read the full story on the source website using the link below.</p>';
};

export const normalizeArticleContent = ({
  content = '',
  shortDescription = '',
  title = '',
  sourceLine = '',
  lang = 'en',
}) => {
  const { body, sourceLine: embeddedSource } = splitSourceLine(content);
  const finalSource = sourceLine || embeddedSource;
  let cleanedBody = sanitizeArticleHtml(body);

  if (isCorruptArticleContent(cleanedBody) || plainTextLength(cleanedBody) < 120) {
    const fallback = sanitizeArticleHtml(shortDescription || title);
    cleanedBody =
      plainTextLength(fallback) >= 80 && !isDuplicateOfTitle(fallback, title)
        ? fallback
        : buildPreviewNotice(lang);
  }

  if (!cleanedBody || isDuplicateOfTitle(cleanedBody, title)) {
    cleanedBody = buildPreviewNotice(lang);
  }

  return `${cleanedBody}${finalSource}`;
};

export const enrichArticleBody = async (article) => {
  if (!article.sourceUrl) {
    return sanitizeArticleHtml(article.bodyHtml || article.content);
  }

  const currentBody = splitSourceLine(article.bodyHtml || article.content).body;
  const currentLen = plainTextLength(currentBody);
  const corrupt = isCorruptArticleContent(currentBody);

  if (corrupt) {
    const fallback = sanitizeArticleHtml(article.shortDescription || article.title);
    if (plainTextLength(fallback) >= 80) {
      return fallback;
    }
  }

  if (!corrupt && currentLen >= 400) {
    return sanitizeArticleHtml(currentBody);
  }

  const fetched = await fetchFullArticleHtml(article.sourceUrl);
  if (fetched && plainTextLength(fetched) >= 120 && !isCorruptArticleContent(fetched)) {
    return fetched;
  }

  return sanitizeArticleHtml(article.shortDescription || article.title || currentBody);
};

export const repairArticleContent = async (articleDoc) => {
  const { sourceLine } = splitSourceLine(articleDoc.content);
  const fallbackSource =
    sourceLine ||
    buildSourceLine(
      articleDoc.sourceUrl,
      articleDoc.sourceName || 'Source',
      articleDoc.tags?.includes('lang:hi') ? 'hi' : 'en'
    );

  const body = await enrichArticleBody({
    sourceUrl: articleDoc.sourceUrl,
    bodyHtml: articleDoc.content,
    content: articleDoc.content,
    shortDescription: articleDoc.shortDescription,
    title: articleDoc.title,
  });

  return normalizeArticleContent({
    content: body,
    shortDescription: articleDoc.shortDescription,
    title: articleDoc.title,
    sourceLine: fallbackSource,
    lang: articleDoc.tags?.includes('lang:hi') ? 'hi' : 'en',
  });
};
