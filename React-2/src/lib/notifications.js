import api from "./api";

export const getNotifications = async (params = {}) => {
  const { data } = await api.get("/api/notifications", { params });
  return data;
};

export const getUnreadNotificationCount = async (params = {}) => {
  const { data } = await api.get("/api/notifications/unread-count", {
    params,
  });
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.patch(`/api/notifications/${id}/read`);
  return data;
};

export const markDailyTaskNotificationsRead = async (params = {}) => {
  const { data } = await api.patch("/api/notifications/read-daily-task", null, {
    params,
  });
  return data;
};

export const markAllNotificationsRead = async (params = {}) => {
  const { data } = await api.patch("/api/notifications/read-all", null, {
    params,
  });
  return data;
};
