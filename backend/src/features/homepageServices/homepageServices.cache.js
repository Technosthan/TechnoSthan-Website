import HomepageService from "./homepageServices.model.js";

const CACHE_TTL_MS = Number(process.env.PUBLIC_HOMEPAGE_SERVICES_CACHE_TTL_MS || 30000);

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

export const invalidateHomepageServicesCache = () => {
  cachedSnapshot = null;
  cacheExpiresAt = 0;
  pendingLoadPromise = null;
};

const loadHomepageServicesDocument = async () => {
  const services = await HomepageService.find({
    isActive: true,
    status: "published",
  })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  return services || [];
};

export const primeHomepageServicesCache = (services = []) => {
  cachedSnapshot = cloneValue(Array.isArray(services) ? services : []);
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return cloneValue(cachedSnapshot);
};

export const loadPublicHomepageServicesSnapshot = async () => {
  if (isFresh()) {
    return cloneValue(cachedSnapshot);
  }

  if (!pendingLoadPromise) {
    pendingLoadPromise = loadHomepageServicesDocument()
      .then((services) => primeHomepageServicesCache(services))
      .finally(() => {
        pendingLoadPromise = null;
      });
  }

  return cloneValue(await pendingLoadPromise);
};
