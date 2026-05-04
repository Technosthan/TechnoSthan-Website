import axiosInstance from "./axiosInstance";

export const getPublicAnnouncements = () =>
  axiosInstance.get("/api/announcements");

export const dismissAnnouncement = (announcementId) =>
  axiosInstance.post(`/api/announcements/${announcementId}/dismiss`);

export const getUnreadCount = () =>
  axiosInstance.get(`/api/announcements/unread-count`);

export default { getPublicAnnouncements };
