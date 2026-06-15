import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL;
const normalizedBaseURL = rawBaseURL
  ? rawBaseURL.replace(/\/+$/, "")
  : "https://technosthan-it.onrender.com/api";

const api = axios.create({
  baseURL: normalizedBaseURL.endsWith("/api")
    ? normalizedBaseURL
    : `${normalizedBaseURL}/api`,
});

export default api;
