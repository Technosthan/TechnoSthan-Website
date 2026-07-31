import axios from "axios";
import { getAuthToken } from "../shared/utils";

const rawBaseURL = import.meta.env.VITE_API_URL;
const normalizedBaseURL = rawBaseURL
  ? rawBaseURL.replace(/\/+$/, "")
  : window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`;

const api = axios.create({
  baseURL: normalizedBaseURL.endsWith("/api")
    ? normalizedBaseURL
    : `${normalizedBaseURL}/api`,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
