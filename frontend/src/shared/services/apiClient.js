const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const AUTH_FREE_PATHS = ["/auth/login", "/auth/register", "/auth/logout"];

const shouldAttachAuth = (url, options = {}) => {
  if (options.skipAuth) {
    return false;
  }

  return !AUTH_FREE_PATHS.some((path) => url.endsWith(path));
};

const request = async (url, options = {}) => {
  const token = shouldAttachAuth(url, options)
    ? localStorage.getItem("technosthan_access_token")
    : null;
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const apiClient = {
  get: (url) => request(url),
  post: (url, body) =>
    request(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url, body) =>
    request(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: (url, body) =>
    request(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: "DELETE" }),
};
