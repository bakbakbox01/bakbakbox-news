const DEFAULT_WIDTH = 1200;

const UNSPLASH = (id) =>
  `https://images.unsplash.com/${id}?w=1200&q=85&auto=format&fit=crop`;

const FALLBACK_IMAGE_POOL = {
  world: [
    UNSPLASH('photo-1504711434969-e33886168f5c'),
    UNSPLASH('photo-1526304640581-d334cdbbf45e'),
    UNSPLASH('photo-1495020689069-4fdac416a997'),
    UNSPLASH('photo-1451187580459-43490279c0fa'),
    UNSPLASH('photo-1524661135-423995f22d0b'),
    UNSPLASH('photo-1519682337058-a94d519337bc'),
  ],
  india: [
    UNSPLASH('photo-1524492412937-840fa43f2d48'),
    UNSPLASH('photo-1587474260584-136574528ed5'),
    UNSPLASH('photo-1564507592333-9a3e5c4a2f1b'),
    UNSPLASH('photo-1571896349848-8c8986987411'),
    UNSPLASH('photo-1609137144813-7d065133a55f'),
    UNSPLASH('photo-1599669454699-248309875704'),
  ],
  hindi: [
    UNSPLASH('photo-1587474260584-136574528ed5'),
    UNSPLASH('photo-1524492412937-840fa43f2d48'),
    UNSPLASH('photo-1504711434969-e33886168f5c'),
    UNSPLASH('photo-1586339949916-3e9457bef220'),
    UNSPLASH('photo-1516321318423-f06f85e504b3'),
    UNSPLASH('photo-1495020689069-4fdac416a997'),
  ],
  business: [
    UNSPLASH('photo-1611974789855-9c2a0a7236a3'),
    UNSPLASH('photo-1460925895917-afdab827c52f'),
    UNSPLASH('photo-1554224155-6726b3ff858f'),
    UNSPLASH('photo-1553729450-ef66a1f95233'),
    UNSPLASH('photo-1556761175-5973dc0f32e7'),
    UNSPLASH('photo-1486312338219-ce68d2c6f44d'),
  ],
  sports: [
    UNSPLASH('photo-1574629810360-7efbbe195018'),
    UNSPLASH('photo-1461896836934-ffe607ba8211'),
    UNSPLASH('photo-1517649763962-0c62306601b7'),
    UNSPLASH('photo-1579952363873-27f3bade9f55'),
    UNSPLASH('photo-1551958219-4297e47c6a8a'),
    UNSPLASH('photo-1519868265208-6b3f4f4a2f1b'),
  ],
  technology: [
    UNSPLASH('photo-1485827404703-89b55fcc595e'),
    UNSPLASH('photo-1518770660439-4636190af475'),
    UNSPLASH('photo-1451187580459-43490279c0fa'),
    UNSPLASH('photo-1519389950473-47ba0277781c'),
    UNSPLASH('photo-1526374965328-7f61d4dc18c5'),
    UNSPLASH('photo-1550751827-4bd374c873da'),
  ],
  politics: [
    UNSPLASH('photo-1529107380895-2603c7105780'),
    UNSPLASH('photo-1541873676-a1813149419'),
    UNSPLASH('photo-1551836022-d5d88e9218df'),
    UNSPLASH('photo-1556761175-b413da4baf72'),
    UNSPLASH('photo-1551836022-de0273fb97bb'),
    UNSPLASH('photo-1529107380895-2603c7105780'),
  ],
  entertainment: [
    UNSPLASH('photo-1489599849927-2ee91cede3ba'),
    UNSPLASH('photo-1478720568477-152d9b134e8e'),
    UNSPLASH('photo-1514525253161-7a46d19cd819'),
    UNSPLASH('photo-1492684223066-81342ee5ff30'),
    UNSPLASH('photo-1516450360452-9312f5e86fc7'),
    UNSPLASH('photo-1501281668745-f7f57925c3b4'),
  ],
  default: [
    UNSPLASH('photo-1504711434969-e33886168f5c'),
    UNSPLASH('photo-1586339949916-3e9457bef220'),
    UNSPLASH('photo-1495020689069-4fdac416a997'),
    UNSPLASH('photo-1516321318423-f06f85e504b3'),
    UNSPLASH('photo-1526304640581-d334cdbbf45e'),
    UNSPLASH('photo-1454165804606-c3d57bc86b40'),
  ],
};

const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const appendQueryParam = (url, key, value) => {
  if (new RegExp(`([?&])${key}=`, 'i').test(url)) {
    return url.replace(new RegExp(`([?&]${key}=)\\d+`, 'i'), `$1${value}`);
  }

  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}${key}=${value}`;
};

export const upgradeSyncImageUrl = (url, targetWidth = DEFAULT_WIDTH) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  let upgraded = url.trim();
  if (!/^https?:\/\//i.test(upgraded)) {
    return upgraded;
  }

  if (/ichef\.bbci\.co\.uk/i.test(upgraded)) {
    upgraded = upgraded.replace(/\/news\/\d+\//i, `/news/${targetWidth}/`);
    upgraded = upgraded.replace(/\/ace\/standard\/\d+\//i, `/ace/standard/${targetWidth}/`);
    upgraded = upgraded.replace(/\/images\/ic\/(\d+)x(\d+)\//i, (_match, width, height) => {
      const ratio = Number(height) / Number(width);
      const nextWidth = targetWidth;
      const nextHeight = Math.max(1, Math.round(nextWidth * ratio));
      return `/images/ic/${nextWidth}x${nextHeight}/`;
    });
  }

  if (/images\.unsplash\.com/i.test(upgraded)) {
    upgraded = upgraded.replace(/([?&])w=\d+/i, `$1w=${targetWidth}`);
    if (!/[?&]w=\d+/i.test(upgraded)) {
      upgraded = appendQueryParam(upgraded, 'w', targetWidth);
    }
    upgraded = upgraded.replace(/([?&])q=\d+/i, '$1q=85');
    if (!/[?&]q=\d+/i.test(upgraded)) {
      upgraded = appendQueryParam(upgraded, 'q', 85);
    }
    if (!/[?&]auto=/i.test(upgraded)) {
      upgraded = appendQueryParam(upgraded, 'auto', 'format');
    }
  }

  if (/toiimg\.com/i.test(upgraded)) {
    upgraded = upgraded.replace(/width-\d+/gi, `width-${targetWidth}`);
    upgraded = upgraded.replace(/,width-\d+/gi, `,width-${targetWidth}`);
  }

  if (/images\.indianexpress\.com/i.test(upgraded)) {
    upgraded = upgraded.replace(/([?&])w=\d+/i, `$1w=${targetWidth}`);
    if (!/[?&]w=\d+/i.test(upgraded)) {
      upgraded = appendQueryParam(upgraded, 'w', targetWidth);
    }
  }

  upgraded = upgraded.replace(/([?&])w=\d+/i, `$1w=${targetWidth}`);
  upgraded = upgraded.replace(/([?&])width=\d+/i, `$1width=${targetWidth}`);

  return upgraded;
};

export const pickArticleFallbackImage = (categorySlug = 'default', key = '', targetWidth = DEFAULT_WIDTH) => {
  const pool = FALLBACK_IMAGE_POOL[categorySlug] ?? FALLBACK_IMAGE_POOL.default;
  const index = hashString(key || categorySlug) % pool.length;
  return upgradeSyncImageUrl(pool[index], targetWidth);
};

export const buildSyncImageMeta = (url, categorySlug, targetWidth = DEFAULT_WIDTH) => {
  const upgradedUrl = upgradeSyncImageUrl(url, targetWidth);

  return {
    url: upgradedUrl,
    publicId: `sync/${categorySlug}-${Date.now()}`,
    format: 'jpg',
    width: targetWidth,
    height: Math.round(targetWidth * 0.5625),
  };
};

export { FALLBACK_IMAGE_POOL };
