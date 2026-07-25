export const AUTH_STORAGE_KEYS = {
  token: "token",
  user: "user",
  lastActivityAt: "lastActivityAt",
  sessionEvent: "session-event",
  workspaceSettingsUpdatedAt: "workspace-settings-updated-at",
};

export const SESSION_EVENT_TYPES = Object.freeze({
  LOGOUT: "logout",
  SESSION_EXPIRED: "session-expired",
  AUTH_EXPIRED: "auth-expired",
});

export const normalizeRole = (role) => {
  const normalized = String(role || "")
    .trim()
    .toUpperCase();

  return ["ADMIN", "HR", "USER"].includes(normalized) ? normalized : "USER";
};

export const getStoredToken = () => localStorage.getItem(AUTH_STORAGE_KEYS.token);

export const getLastActivityAt = () => {
  const value = Number(localStorage.getItem(AUTH_STORAGE_KEYS.lastActivityAt));
  return Number.isFinite(value) ? value : null;
};

export const setLastActivityAt = (timestamp = Date.now()) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.lastActivityAt, String(timestamp));
  return timestamp;
};

export const clearLastActivityAt = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.lastActivityAt);
};

export const broadcastSessionEvent = (event = {}) => {
  const payload = {
    id:
      event.id ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    type: event.type || SESSION_EVENT_TYPES.LOGOUT,
    reason: event.reason || event.type || SESSION_EVENT_TYPES.LOGOUT,
    message: event.message || "",
    at: event.at || Date.now(),
  };

  localStorage.setItem(
    AUTH_STORAGE_KEYS.sessionEvent,
    JSON.stringify(payload),
  );

  window.dispatchEvent(
    new CustomEvent("session-event", {
      detail: payload,
    }),
  );

  return payload;
};

export const readSessionEvent = () => {
  try {
    const rawEvent = localStorage.getItem(AUTH_STORAGE_KEYS.sessionEvent);
    if (!rawEvent) {
      return null;
    }

    return JSON.parse(rawEvent);
  } catch {
    return null;
  }
};

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    if (!rawUser) {
      return null;
    }

    const user = JSON.parse(rawUser);
    return {
      ...user,
      role: normalizeRole(user?.role),
    };
  } catch {
    clearAuth();
    return null;
  }
};

export const setAuth = ({ token, user }) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
  localStorage.setItem(
    AUTH_STORAGE_KEYS.user,
    JSON.stringify({
      ...user,
      role: normalizeRole(user?.role),
    }),
  );
  clearLastActivityAt();
  setLastActivityAt(Date.now());
  localStorage.removeItem(AUTH_STORAGE_KEYS.sessionEvent);
  window.dispatchEvent(new Event("auth-change"));
};

export const clearAuth = ({
  reason = SESSION_EVENT_TYPES.LOGOUT,
  message = "",
  broadcast = true,
} = {}) => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  clearLastActivityAt();
  if (broadcast) {
    broadcastSessionEvent({
      type: reason,
      reason,
      message,
    });
  }
  window.dispatchEvent(new Event("auth-change"));
};

export const isAuthenticated = () => Boolean(getStoredToken() && getStoredUser());

export const hasRole = (user, acceptedRoles = []) =>
  acceptedRoles.map(normalizeRole).includes(normalizeRole(user?.role));

export const getDashboardPath = (role) => {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "ADMIN") {
    return "/admin";
  }
  if (normalizedRole === "HR") {
    return "/hr";
  }
  return "/dashboard";
};

export const getDailyTasksPath = (role) => {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "HR") {
    return "/hr/daily-tasks";
  }
  if (normalizedRole === "USER") {
    return "/dashboard/daily-tasks";
  }
  return "/admin/daily-tasks";
};
