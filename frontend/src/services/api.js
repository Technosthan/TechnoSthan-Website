import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 30000 });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// Auth
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);

// User
export const uploadFile = (formData, onProgress) =>
  api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress,
  });
export const getMyStatus = (params) => api.get("/status", { params });
export const updateHeaders = (updates) => api.put("/headers", { updates });
export const deleteMyContacts = () => api.delete("/my-contacts");

// Admin
export const getAdminUploads = (params) =>
  api.get("/admin/uploads", { params });
export const approveUploads = (uploadedBy) =>
  api.post(`/admin/approve/${uploadedBy}`);
export const rejectUploads = (uploadedBy, reason) =>
  api.post(`/admin/reject/${uploadedBy}`, { reason });
export const getEmailConfig = () => api.get("/admin/email-config");
export const updateEmailConfig = (data) => api.put("/admin/email-config", data);
export const getSystemSettings = () => api.get("/admin/system-settings");
export const updateSystemSettings = (data) =>
  api.put("/admin/system-settings", data);
export const getActivity = (params) => api.get("/admin/activity", { params });
export const getNotifications = () => api.get("/admin/notifications");

export default api;
