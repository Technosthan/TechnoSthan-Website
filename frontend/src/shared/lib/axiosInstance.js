import axios from "axios";
import { resolveApiBaseUrl, isSameOriginApiProxyEnabled } from "./apiConfig";

const baseURL = resolveApiBaseUrl({
  allowSameOriginProxy: isSameOriginApiProxyEnabled(),
});

export const API_BASE_URL = baseURL || "";

const axiosInstance = axios.create({
  baseURL: baseURL || undefined,
});

axiosInstance.interceptors.request.use((config) => {
  const requestUrl = String(config.url || "");

  if (
    !baseURL &&
    import.meta.env.PROD &&
    requestUrl.startsWith("/api/")
  ) {
    return Promise.reject(
      new Error(
        "Missing VITE_API_BASE_URL in production. API requests are disabled to avoid same-origin fallback.",
      ),
    );
  }

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (baseURL) {
    config.baseURL = baseURL;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem("token");
    if (error.response?.status === 401 && token) {
      // Token is invalid or expired, clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
