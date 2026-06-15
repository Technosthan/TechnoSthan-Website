import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://technosthan-it.onrender.com/api",
});

export default api;
