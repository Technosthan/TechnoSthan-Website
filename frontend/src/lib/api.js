import axios from "axios";
import { clearAuth, getStoredToken, SESSION_EVENT_TYPES } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const responseMessage = String(error.response?.data?.message || "");
      const isSessionExpired =
        error.response?.data?.code === "SESSION_EXPIRED" ||
        /inactivity/i.test(responseMessage);

      clearAuth({
        reason: isSessionExpired
          ? SESSION_EVENT_TYPES.SESSION_EXPIRED
          : SESSION_EVENT_TYPES.AUTH_EXPIRED,
        message: responseMessage,
      });
    }
    return Promise.reject(error);
  },
);

export default api;
