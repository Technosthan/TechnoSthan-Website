import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useRealtimeNotifications from "./useRealtimeNotifications";
import {
  getNotifications,
  getUnreadNotificationCount,
  markDailyTaskNotificationsRead,
} from "../lib/notifications";
import { getStoredUser, normalizeRole } from "../utils/auth";

const normalizeDailyTaskNotification = (item) => ({
  id: item._id || item.id,
  title: item.title || "Daily Task",
  message: item.message || "You have a new daily task.",
  isRead: Boolean(item.isRead ?? item.read),
  createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
  relatedTaskInstanceId: item.relatedTaskInstanceId || null,
  relatedTemplateId: item.relatedTemplateId || null,
  deliveryChannels: Array.isArray(item.deliveryChannels)
    ? item.deliveryChannels
    : [],
});

const useDailyTaskBellNotifications = ({ enabled = true } = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenIdsRef = useRef(new Set());
  const userRole = normalizeRole(getStoredUser()?.role);

  const queryParams = useMemo(
    () => ({
      type: "daily_task",
    }),
    [],
  );

  const loadNotifications = useCallback(async () => {
    if (!enabled || userRole === "ADMIN") {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const [notificationsResponse, unreadResponse] = await Promise.all([
        getNotifications(queryParams),
        getUnreadNotificationCount(queryParams),
      ]);

      const items = Array.isArray(notificationsResponse.data)
        ? notificationsResponse.data.map(normalizeDailyTaskNotification)
        : [];

      seenIdsRef.current = new Set(items.map((item) => item.id));
      setNotifications(items);
      setUnreadCount(Number(unreadResponse?.data?.count || 0));
    } catch (error) {
      console.error("Failed to load daily task bell notifications:", error);
    }
  }, [enabled, queryParams, userRole]);

  const handleRealtimeNotification = useCallback(
    (payload) => {
      const item = normalizeDailyTaskNotification(payload);
      if (!item.id || userRole === "ADMIN") {
        return;
      }

      if (seenIdsRef.current.has(item.id)) {
        return;
      }

      seenIdsRef.current.add(item.id);
      setNotifications((current) => [item, ...current]);
      if (!item.isRead) {
        setUnreadCount((current) => current + 1);
      }
    },
    [userRole],
  );

  const socketHandlers = useMemo(
    () => ({
      daily_task_notification: handleRealtimeNotification,
    }),
    [handleRealtimeNotification],
  );

  useRealtimeNotifications(socketHandlers, enabled && userRole !== "ADMIN");

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const acknowledgeDailyTasks = useCallback(async () => {
    if (userRole === "ADMIN") {
      return null;
    }

    const response = await markDailyTaskNotificationsRead(queryParams);
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
    setUnreadCount(0);
    return response;
  }, [queryParams, userRole]);

  return {
    notifications,
    unreadCount,
    reloadNotifications: loadNotifications,
    acknowledgeDailyTasks,
  };
};

export default useDailyTaskBellNotifications;
