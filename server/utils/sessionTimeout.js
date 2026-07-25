const SESSION_TIMEOUT_UNITS = Object.freeze({
  MINUTE: "minute",
  HOUR: "hour",
  DAY: "day",
  WEEK: "week",
});

const SESSION_TIMEOUT_UNIT_LABELS = Object.freeze({
  [SESSION_TIMEOUT_UNITS.MINUTE]: "minute",
  [SESSION_TIMEOUT_UNITS.HOUR]: "hour",
  [SESSION_TIMEOUT_UNITS.DAY]: "day",
  [SESSION_TIMEOUT_UNITS.WEEK]: "week",
});

const DEFAULT_SESSION_TIMEOUT = Object.freeze({
  sessionTimeoutEnabled: true,
  sessionTimeoutValue: 30,
  sessionTimeoutUnit: SESSION_TIMEOUT_UNITS.MINUTE,
});

const SESSION_TIMEOUT_MS_MAP = Object.freeze({
  [SESSION_TIMEOUT_UNITS.MINUTE]: 60 * 1000,
  [SESSION_TIMEOUT_UNITS.HOUR]: 60 * 60 * 1000,
  [SESSION_TIMEOUT_UNITS.DAY]: 24 * 60 * 60 * 1000,
  [SESSION_TIMEOUT_UNITS.WEEK]: 7 * 24 * 60 * 60 * 1000,
});

const MAX_SESSION_TIMEOUT_MS = 10 * 365 * 24 * 60 * 60 * 1000;

const normalizeSessionTimeoutUnit = (unit) => {
  const normalized = String(unit || "").trim().toLowerCase();
  return Object.values(SESSION_TIMEOUT_UNITS).includes(normalized)
    ? normalized
    : DEFAULT_SESSION_TIMEOUT.sessionTimeoutUnit;
};

const normalizeSessionTimeoutValue = (value) => {
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return DEFAULT_SESSION_TIMEOUT.sessionTimeoutValue;
  }

  return numericValue;
};

const sessionTimeoutToMs = (value, unit) => {
  const normalizedValue = Number(value);
  const normalizedUnit = normalizeSessionTimeoutUnit(unit);

  if (!Number.isInteger(normalizedValue) || normalizedValue < 1) {
    return null;
  }

  const multiplier = SESSION_TIMEOUT_MS_MAP[normalizedUnit];
  if (!multiplier) {
    return null;
  }

  const timeoutMs = normalizedValue * multiplier;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > MAX_SESSION_TIMEOUT_MS) {
    return null;
  }

  return timeoutMs;
};

const normalizeSessionTimeoutSettings = (settings = {}) => {
  const sessionTimeoutEnabled =
    settings.sessionTimeoutEnabled === undefined
      ? DEFAULT_SESSION_TIMEOUT.sessionTimeoutEnabled
      : Boolean(settings.sessionTimeoutEnabled);

  const sessionTimeoutValue = normalizeSessionTimeoutValue(
    settings.sessionTimeoutValue,
  );
  const sessionTimeoutUnit = normalizeSessionTimeoutUnit(
    settings.sessionTimeoutUnit,
  );
  const sessionTimeoutMs = sessionTimeoutToMs(
    sessionTimeoutValue,
    sessionTimeoutUnit,
  );

  return {
    sessionTimeoutEnabled,
    sessionTimeoutValue,
    sessionTimeoutUnit,
    sessionTimeoutMs,
  };
};

const formatSessionTimeoutLabel = (value, unit) => {
  const numericValue = Number(value);
  const normalizedUnit = normalizeSessionTimeoutUnit(unit);

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return null;
  }

  const label = SESSION_TIMEOUT_UNIT_LABELS[normalizedUnit] || normalizedUnit;
  return `${numericValue} ${label}${numericValue === 1 ? "" : "s"}`;
};

const formatSessionTimeoutSummary = (settings = {}) => {
  const normalized = normalizeSessionTimeoutSettings(settings);

  if (!normalized.sessionTimeoutEnabled) {
    return "Inactivity timeout is disabled.";
  }

  const label = formatSessionTimeoutLabel(
    normalized.sessionTimeoutValue,
    normalized.sessionTimeoutUnit,
  );

  return label
    ? `Users will be logged out after ${label} of inactivity.`
    : "Users will be logged out after the configured inactivity period.";
};

module.exports = {
  DEFAULT_SESSION_TIMEOUT,
  MAX_SESSION_TIMEOUT_MS,
  SESSION_TIMEOUT_UNITS,
  formatSessionTimeoutLabel,
  formatSessionTimeoutSummary,
  normalizeSessionTimeoutSettings,
  normalizeSessionTimeoutUnit,
  normalizeSessionTimeoutValue,
  sessionTimeoutToMs,
};
