import axiosInstance from "../../shared/lib/axiosInstance";

// Admin stats and analytics
export const getAdminStats = () => axiosInstance.get("/api/admin/stats");
export const getMonitoringStats = () =>
  axiosInstance.get("/api/admin/monitoring");

// User management
export const getAllUsers = () => axiosInstance.get("/api/admin/users");
export const createUser = (userData) =>
  axiosInstance.post("/api/admin/users", userData);
export const updateUserRole = (userId, role) =>
  axiosInstance.put(`/api/admin/users/${userId}/role`, { role });
export const updateUserStatus = (userId, status) =>
  axiosInstance.put(`/api/admin/users/${userId}/status`, { status });
export const deleteUser = (userId) =>
  axiosInstance.delete(`/api/admin/users/${userId}`);

// Content management (admin)
export const getAllContent = () => axiosInstance.get("/api/content");
export const createContent = (contentData) =>
  axiosInstance.post("/api/content", contentData);
export const updateContent = (contentId, contentData) =>
  axiosInstance.put(`/api/content/${contentId}`, contentData);
export const deleteContent = (contentId) =>
  axiosInstance.delete(`/api/content/${contentId}`);

// Settings management
export const getSettings = () => axiosInstance.get("/api/admin/settings");
export const updateSettings = (settingsData) =>
  axiosInstance.post("/api/admin/settings", settingsData);
export const getAuthSettings = () => axiosInstance.get("/api/admin/auth-settings");
export const updateAuthSettings = (settingsData) =>
  axiosInstance.put("/api/admin/auth-settings", settingsData);
export const testWhatsappConnection = () =>
  axiosInstance.post("/api/admin/test-whatsapp");
export const testTelegramConnection = () =>
  axiosInstance.post("/api/admin/test-telegram");

// AI config (provider independent)
export const getAIConfig = () => axiosInstance.get("/api/admin/ai-config");
export const updateAIConfig = (data) =>
  axiosInstance.put("/api/admin/ai-config", data);

// AI Provider Management
export const getAIProviders = () =>
  axiosInstance.get("/api/admin/ai-providers");
export const addAIProvider = (providerData) =>
  axiosInstance.post("/api/admin/ai-providers", providerData);
export const updateAIProvider = (providerId, updateData) =>
  axiosInstance.put(`/api/admin/ai-providers/${providerId}`, updateData);
export const deleteAIProvider = (providerId) =>
  axiosInstance.delete(`/api/admin/ai-providers/${providerId}`);
export const updateAIMode = (mode) =>
  axiosInstance.put("/api/admin/ai-mode", { mode });
export const updateProviderPriority = (providerId, priority) =>
  axiosInstance.put(`/api/admin/ai-providers/${providerId}/priority`, {
    priority,
  });

// User permissions
export const updateUserPermissions = (userId, permissionsData) =>
  axiosInstance.put(`/api/admin/users/${userId}/permissions`, permissionsData);

// Announcement management
export const getAnnouncements = () =>
  axiosInstance.get("/api/admin/announcements");
export const createAnnouncement = (announcementData) =>
  axiosInstance.post("/api/admin/announcements", announcementData);
export const updateAnnouncement = (announcementId, announcementData) =>
  axiosInstance.put(
    `/api/admin/announcements/${announcementId}`,
    announcementData,
  );
export const deleteAnnouncement = (announcementId) =>
  axiosInstance.delete(`/api/admin/announcements/${announcementId}`);

// Global search
export const globalSearch = (query, type) =>
  axiosInstance.get(
    `/api/admin/search?query=${encodeURIComponent(query)}${type ? `&type=${type}` : ""}`,
  );

// Quiz management (admin)
export const getAllQuestions = () => axiosInstance.get("/api/quiz/questions");
export const createQuestion = (questionData) =>
  axiosInstance.post("/api/quiz/questions", questionData);
export const updateQuestion = (questionId, questionData) =>
  axiosInstance.put(`/api/quiz/questions/${questionId}`, questionData);
export const deleteQuestion = (questionId) =>
  axiosInstance.delete(`/api/quiz/questions/${questionId}`);
export const getQuestionsByContentId = (contentId) =>
  axiosInstance.get(`/api/quiz/content/${contentId}`);
export const deleteQuestionsByContentId = (contentId) =>
  axiosInstance.delete(`/api/quiz/content/${contentId}`);
