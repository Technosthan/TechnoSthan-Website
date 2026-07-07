import { buildApiUrl } from "./apiBase";

const AUTH_FREE_RULES = [
  { path: "/auth/login", methods: ["POST"] },
  { path: "/auth/register", methods: ["POST"] },
  { path: "/auth/logout", methods: ["POST"] },
  { path: "/hero", methods: ["GET"] },
  { path: "/programs", methods: ["GET"] },
  { path: "/workshops", methods: ["GET"] },
  { path: "/enquiries", methods: ["POST"] },
  { path: "/campaigns/active", methods: ["GET"] },
];

const shouldAttachAuth = (url, options = {}) => {
  if (options.skipAuth) {
    return false;
  }

  const method = String(options.method || "GET").toUpperCase();
  return !AUTH_FREE_RULES.some(({ path, methods }) => {
    const isPathMatch = url === path || url.startsWith(`${path}/`);
    return isPathMatch && methods.includes(method);
  });
};

const request = async (url, options = {}) => {
  const token = shouldAttachAuth(url, options)
    ? localStorage.getItem("technosthan_access_token")
    : null;
  const { headers: customHeaders, skipAuth, ...fetchOptions } = options;
  const response = await fetch(buildApiUrl(url), {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(customHeaders || {}),
    },
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
