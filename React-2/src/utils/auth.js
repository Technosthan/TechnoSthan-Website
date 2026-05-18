export const AUTH_STORAGE_KEYS = {
  token: "token",
  user: "user",
};

export const normalizeRole = (role) => {
  const normalized = String(role || "")
    .trim()
    .toUpperCase();

  return ["ADMIN", "HR", "USER"].includes(normalized) ? normalized : "USER";
};

export const getStoredToken = () => localStorage.getItem(AUTH_STORAGE_KEYS.token);

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
  window.dispatchEvent(new Event("auth-change"));
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
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
