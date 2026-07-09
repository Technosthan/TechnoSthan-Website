import axiosInstance from "./axiosInstance";

export const getMyNotifications = () =>
  axiosInstance.get("/api/notifications");

export const getMyUnreadNotificationCount = () =>
  axiosInstance.get("/api/notifications/unread-count");

export const markMyNotificationRead = (notificationId) =>
  axiosInstance.patch(`/api/notifications/${notificationId}/read`);

export default {
  getMyNotifications,
  getMyUnreadNotificationCount,
  markMyNotificationRead,
};
