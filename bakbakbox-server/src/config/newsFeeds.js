/**
 * Live RSS feeds — international, Indian (English), and Hindi sources.
 * Parsed every NEWS_SYNC_INTERVAL_MS and merged into the news feed.
 */
export const NEWS_FEEDS = [
  // ── International ──────────────────────────────────────────────────────────
  {
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    categorySlug: 'world',
    source: 'BBC News',
    lang: 'en',
  },
  {
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    categorySlug: 'world',
    source: 'BBC World',
    lang: 'en',
  },
  {
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    categorySlug: 'business',
    source: 'BBC Business',
    lang: 'en',
  },
  {
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    categorySlug: 'technology',
    source: 'BBC Technology',
    lang: 'en',
  },
  {
    url: 'https://feeds.bbci.co.uk/sport/rss.xml',
    categorySlug: 'sports',
    source: 'BBC Sport',
    lang: 'en',
  },
  {
    url: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
    categorySlug: 'politics',
    source: 'BBC Politics',
    lang: 'en',
  },

  // ── India (English) ────────────────────────────────────────────────────────
  {
    url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    categorySlug: 'india',
    source: 'Times of India',
    lang: 'en',
  },
  {
    url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
    categorySlug: 'india',
    source: 'NDTV',
    lang: 'en',
  },
  {
    url: 'https://www.thehindu.com/news/national/?service=rss',
    categorySlug: 'india',
    source: 'The Hindu',
    lang: 'en',
  },
  {
    url: 'https://indianexpress.com/feed/',
    categorySlug: 'india',
    source: 'Indian Express',
    lang: 'en',
  },
  {
    url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    categorySlug: 'india',
    source: 'Hindustan Times',
    lang: 'en',
  },
  {
    url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
    categorySlug: 'india',
    source: 'Google News India',
    lang: 'en',
  },

  // ── Hindi ──────────────────────────────────────────────────────────────────
  {
    url: 'https://feeds.bbci.co.uk/hindi/rss.xml',
    categorySlug: 'hindi',
    source: 'BBC Hindi',
    lang: 'hi',
  },
  {
    url: 'https://www.indiatoday.in/rss/home',
    categorySlug: 'hindi',
    source: 'India Today Hindi',
    lang: 'hi',
  },
  {
    url: 'https://www.indiatoday.in/rss/1206578',
    categorySlug: 'hindi',
    source: 'India Today',
    lang: 'hi',
  },
  {
    url: 'https://www.abplive.com/news/india/feed',
    categorySlug: 'hindi',
    source: 'ABP News',
    lang: 'hi',
  },
  {
    url: 'https://www.amarujala.com/rss/india-news.xml',
    categorySlug: 'hindi',
    source: 'Amar Ujala',
    lang: 'hi',
  },
  {
    url: 'https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi',
    categorySlug: 'hindi',
    source: 'Google News Hindi',
    lang: 'hi',
  },
];

export const CATEGORY_IMAGES = {
  world: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=85&auto=format',
  india: 'https://images.unsplash.com/photo-1524492412937-840fa43f2d48?w=1200&q=85&auto=format',
  hindi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=85&auto=format',
  business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=85&auto=format',
  sports: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=85&auto=format',
  technology: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=85&auto=format',
  politics: 'https://images.unsplash.com/photo-1529107380895-2603c7105780?w=1200&q=85&auto=format',
  entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=85&auto=format',
};
