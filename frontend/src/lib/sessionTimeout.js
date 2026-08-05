import api from "./api";
import {
  clearAuth,
  getLastActivityAt,
  setLastActivityAt,
  SESSION_EVENT_TYPES,
} from "../utils/auth";

export const SESSION_TIMEOUT_UNITS = Object.freeze({
  minute: "minute",
  hour: "hour",
  day: "day",
  week: "week",
});

export const DEFAULT_SESSION_TIMEOUT = Object.freeze({
  sessionTimeoutEnabled: true,
  sessionTimeoutValue: 30,
  sessionTimeoutUnit: SESSION_TIMEOUT_UNITS.minute,
});

const SESSION_TIMEOUT_MS_MAP = Object.freeze({
  [SESSION_TIMEOUT_UNITS.minute]: 60 * 1000,
  [SESSION_TIMEOUT_UNITS.hour]: 60 * 60 * 1000,
  [SESSION_TIMEOUT_UNITS.day]: 24 * 60 * 60 * 1000,
  [SESSION_TIMEOUT_UNITS.week]: 7 * 24 * 60 * 60 * 1000,
});

const SESSION_TIMEOUT_UNIT_LABELS = Object.freeze({
  [SESSION_TIMEOUT_UNITS.minute]: "minute",
  [SESSION_TIMEOUT_UNITS.hour]: "hour",
  [SESSION_TIMEOUT_UNITS.day]: "day",
  [SESSION_TIMEOUT_UNITS.week]: "week",
});

const MAX_SESSION_TIMEOUT_MS = 10 * 365 * 24 * 60 * 60 * 1000;

export const sessionTimeoutToMs = (value, unit) => {
  const numericValue = Number(value);
  const normalizedUnit = String(unit || "").trim().toLowerCase();

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return null;
  }

  const multiplier = SESSION_TIMEOUT_MS_MAP[normalizedUnit];
  if (!multiplier) {
    return null;
  }

  const timeoutMs = numericValue * multiplier;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > MAX_SESSION_TIMEOUT_MS) {
    return null;
  }

  return timeoutMs;
};

export const normalizeSessionTimeoutSettings = (settings = {}) => {
  const sessionTimeoutEnabled =
    settings.sessionTimeoutEnabled === undefined
      ? DEFAULT_SESSION_TIMEOUT.sessionTimeoutEnabled
      : Boolean(settings.sessionTimeoutEnabled);

  const normalizedValue = Number(settings.sessionTimeoutValue);
  const sessionTimeoutValue =
    Number.isInteger(normalizedValue) && normalizedValue > 0
      ? normalizedValue
      : DEFAULT_SESSION_TIMEOUT.sessionTimeoutValue;

  const normalizedUnit = String(settings.sessionTimeoutUnit || "")
    .trim()
    .toLowerCase();
  const sessionTimeoutUnit =
    Object.values(SESSION_TIMEOUT_UNITS).includes(normalizedUnit)
      ? normalizedUnit
      : DEFAULT_SESSION_TIMEOUT.sessionTimeoutUnit;

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

export const formatSessionTimeoutLabel = (value, unit) => {
  const numericValue = Number(value);
  const normalizedUnit = String(unit || "").trim().toLowerCase();

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return null;
  }

  const label = SESSION_TIMEOUT_UNIT_LABELS[normalizedUnit] || normalizedUnit;
  return `${numericValue} ${label}${numericValue === 1 ? "" : "s"}`;
};

export const formatSessionTimeoutSummary = (settings = {}) => {
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

export const isSessionTimedOut = (
  lastActivityAt,
  timeoutMs,
  now = Date.now(),
) => {
  const activityTimestamp = Number(lastActivityAt);
  const configuredTimeout = Number(timeoutMs);

  if (
    !Number.isFinite(activityTimestamp) ||
    !Number.isFinite(configuredTimeout) ||
    configuredTimeout < 1
  ) {
    return false;
  }

  return now - activityTimestamp >= configuredTimeout;
};

export const refreshLastActivity = (timestamp = Date.now()) => {
  setLastActivityAt(timestamp);
  return timestamp;
};

export const performCentralLogout = async ({
  reason = SESSION_EVENT_TYPES.LOGOUT,
  message = "",
} = {}) => {
  try {
    await api.post("/api/auth/logout");
  } catch (error) {
    // Ignore backend logout failures; the client session still needs to clear.
  } finally {
    clearAuth({
      reason,
      message,
      broadcast: true,
    });
  }
};

export const getStoredSessionAge = () => {
  const activityAt = getLastActivityAt();
  if (!activityAt) {
    return null;
  }

  return Date.now() - activityAt;
};
