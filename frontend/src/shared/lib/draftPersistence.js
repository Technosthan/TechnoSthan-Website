const DRAFT_PREFIX = "technosthan:draft";
const DEFAULT_VERSION = 1;
const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === "[object Object]";

const isFileLike = (value) => {
  if (!value || typeof value !== "object") return false;
  if (typeof File !== "undefined" && value instanceof File) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  return Boolean(
    value?.constructor?.name &&
      ["File", "Blob", "FileList", "DataTransferItem"].includes(value.constructor.name),
  );
};

const isBinaryLike = (value) =>
  value instanceof ArrayBuffer ||
  ArrayBuffer.isView(value) ||
  (typeof Buffer !== "undefined" && Buffer.isBuffer?.(value));

const isDomLike = (value) => {
  if (!value || typeof value !== "object") return false;
  if (typeof window === "undefined") return false;
  return value === window || value === document || value instanceof Element;
};

const shouldDropKey = (key, value) => {
  const normalizedKey = String(key || "").toLowerCase();
  if (
    /password|token|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|otp|pin/.test(
      normalizedKey,
    )
  ) {
    return true;
  }

  if (normalizedKey.endsWith("bloburl") || normalizedKey.endsWith("objecturl")) {
    return true;
  }

  if (normalizedKey === "previewurl" || normalizedKey === "preview_url") {
    return true;
  }

  if (normalizedKey === "file" && isFileLike(value)) {
    return true;
  }

  return false;
};

const sanitizeDraftValue = (value, seen = new WeakSet()) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return value.startsWith("blob:") ? "" : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return String(value);
  }

  if (typeof value === "function" || typeof value === "symbol") {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (isFileLike(value) || isBinaryLike(value) || isDomLike(value)) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeDraftValue(item, seen))
      .filter((item) => item !== undefined);
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  if (seen.has(value)) {
    return undefined;
  }
  seen.add(value);

  const next = {};
  for (const [key, childValue] of Object.entries(value)) {
    if (shouldDropKey(key, childValue)) {
      continue;
    }

    if (typeof childValue === "string" && childValue.startsWith("blob:")) {
      continue;
    }

    if (childValue && typeof childValue === "object") {
      const childNormalizedKey = String(key || "").toLowerCase();
      if (
        childNormalizedKey.includes("file") &&
        isFileLike(childValue)
      ) {
        continue;
      }
    }

    const sanitized = sanitizeDraftValue(childValue, seen);
    if (sanitized !== undefined) {
      next[key] = sanitized;
    }
  }

  seen.delete(value);
  return next;
};

const normalizeDraftUserId = (userId) => {
  const value = String(userId || "").trim();
  return value || "anonymous";
};

export const buildDraftKey = ({
  module,
  mode,
  recordId = "new",
  userId = "anonymous",
}) =>
  `${DRAFT_PREFIX}:${String(module || "unknown").trim()}:${String(mode || "create").trim()}:${String(recordId || "new").trim()}:${normalizeDraftUserId(userId)}`;

export const getCurrentDraftUserId = (user) =>
  normalizeDraftUserId(user?._id || user?.id || user?.userId);

export const getDraftStorageInfo = (key) => {
  if (!isBrowser() || !key) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const loadDraft = (key, expectedVersion = DEFAULT_VERSION) => {
  const parsed = getDraftStorageInfo(key);
  if (!parsed) {
    return null;
  }

  if (
    expectedVersion !== null &&
    expectedVersion !== undefined &&
    Number(parsed.version) !== Number(expectedVersion)
  ) {
    clearDraft(key);
    return null;
  }

  if (parsed.expiresAt) {
    const expiresAt = new Date(parsed.expiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      clearDraft(key);
      return null;
    }
  }

  return parsed;
};

export const saveDraft = ({
  key,
  module,
  mode,
  recordId = null,
  userId = "anonymous",
  data,
  version = DEFAULT_VERSION,
  expiresInMs = DEFAULT_EXPIRY_MS,
}) => {
  if (!isBrowser() || !key) {
    return { success: false, error: new Error("Draft storage is unavailable") };
  }

  try {
    const now = new Date();
    const payload = {
      version,
      module,
      mode,
      recordId,
      userId: normalizeDraftUserId(userId),
      savedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + expiresInMs).toISOString(),
      data: sanitizeDraftValue(data),
    };

    window.localStorage.setItem(key, JSON.stringify(payload));
    return { success: true, payload };
  } catch (error) {
    return { success: false, error };
  }
};

export const clearDraft = (key) => {
  if (!isBrowser() || !key) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const hasDraft = (key) => Boolean(loadDraft(key));

export const getDraftMetadata = (key) => {
  const draft = loadDraft(key);
  if (!draft) return null;

  return {
    version: draft.version,
    module: draft.module,
    mode: draft.mode,
    recordId: draft.recordId,
    userId: draft.userId,
    savedAt: draft.savedAt,
    expiresAt: draft.expiresAt,
  };
};

export const discardDraft = (key) => clearDraft(key);

export const listDraftKeysForUser = (userId) => {
  if (!isBrowser()) {
    return [];
  }

  const normalizedUserId = normalizeDraftUserId(userId);
  const keys = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith(`${DRAFT_PREFIX}:`)) {
      continue;
    }
    const parts = key.split(":");
    if (parts[parts.length - 1] === normalizedUserId) {
      keys.push(key);
    }
  }
  return keys;
};

export const listDraftEntriesForUser = (userId) => {
  if (!isBrowser()) {
    return [];
  }

  return listDraftKeysForUser(userId)
    .map((key) => {
      const draft = loadDraft(key);
      if (!draft) {
        return null;
      }
      return { key, ...draft };
    })
    .filter(Boolean);
};

export const listDraftEntriesForModule = (userId, moduleName) => {
  const normalizedModule = String(moduleName || "").trim();
  if (!normalizedModule) {
    return [];
  }

  return listDraftEntriesForUser(userId).filter(
    (draft) => String(draft.module || "").trim() === normalizedModule,
  );
};

export const deleteDraftEntry = (key) => clearDraft(key);

export const clearExpiredDraftEntriesForUser = (userId) => {
  if (!isBrowser()) {
    return 0;
  }

  let removed = 0;
  for (const draft of listDraftEntriesForUser(userId)) {
    if (!draft?.key) {
      continue;
    }

    const expiresAt = draft.expiresAt ? new Date(draft.expiresAt) : null;
    if (
      !expiresAt ||
      Number.isNaN(expiresAt.getTime()) ||
      expiresAt.getTime() <= Date.now()
    ) {
      if (clearDraft(draft.key)) {
        removed += 1;
      }
    }
  }
  return removed;
};

export const removeExpiredDraftsForUser = (userId) => {
  if (!isBrowser()) {
    return 0;
  }

  let removed = 0;
  for (const key of listDraftKeysForUser(userId)) {
    const draft = loadDraft(key);
    if (!draft) {
      removed += 1;
    }
  }
  return removed;
};

export const findLatestDraftKeyForModule = (userId, moduleName) => {
  if (!isBrowser()) {
    return null;
  }

  const normalizedUserId = normalizeDraftUserId(userId);
  const normalizedModule = String(moduleName || "").trim();
  let latestKey = null;
  let latestSavedAt = 0;

  for (const key of listDraftKeysForUser(normalizedUserId)) {
    if (!key.includes(`:${normalizedModule}:`)) {
      continue;
    }

    const draft = loadDraft(key);
    if (!draft?.savedAt) {
      continue;
    }

    const savedAt = new Date(draft.savedAt).getTime();
    if (Number.isNaN(savedAt)) {
      continue;
    }

    if (savedAt > latestSavedAt) {
      latestSavedAt = savedAt;
      latestKey = key;
    }
  }

  return latestKey;
};
