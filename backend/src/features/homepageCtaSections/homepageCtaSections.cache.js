import HomepageCtaSection from "./homepageCtaSections.model.js";

const CACHE_TTL_MS = Number(process.env.PUBLIC_HOMEPAGE_CTA_SECTIONS_CACHE_TTL_MS || 30000);

let cachedSnapshot = null;
let cacheExpiresAt = 0;
let pendingLoadPromise = null;

const cloneValue = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const isFresh = () => Boolean(cachedSnapshot && Date.now() < cacheExpiresAt);

export const invalidateHomepageCtaSectionsCache = () => {
  cachedSnapshot = null;
  cacheExpiresAt = 0;
  pendingLoadPromise = null;
};

const loadHomepageCtaSectionsDocument = async () => {
  const sections = await HomepageCtaSection.find({ isActive: true })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  return sections || [];
};

export const primeHomepageCtaSectionsCache = (sections = []) => {
  cachedSnapshot = cloneValue(Array.isArray(sections) ? sections : []);
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return cloneValue(cachedSnapshot);
};

export const loadPublicHomepageCtaSectionsSnapshot = async () => {
  if (isFresh()) {
    return cloneValue(cachedSnapshot);
  }

  if (!pendingLoadPromise) {
    pendingLoadPromise = loadHomepageCtaSectionsDocument()
      .then((sections) => primeHomepageCtaSectionsCache(sections))
      .finally(() => {
        pendingLoadPromise = null;
      });
  }

  return cloneValue(await pendingLoadPromise);
};

