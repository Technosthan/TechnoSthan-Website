import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useRealtimeNotifications from "./useRealtimeNotifications";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
  markNotificationRead as apiMarkNotificationRead,
} from "../lib/notifications";

const normalizeNotification = (item) => ({
  id: item._id || item.id || `${item.type}-${Date.now()}`,
  title: item.title || "Notification",
  message: item.message || "You have a new alert.",
  time:
    item.createdAt || item.updatedAt || item.time || new Date().toISOString(),
  type: item.type || "system",
  isRead: Boolean(item.isRead ?? item.read ?? false),
  status:
    item.status ||
    (Boolean(item.isRead ?? item.read ?? false) ? "completed" : "pending"),
  relatedTaskInstanceId:
    item.relatedTaskInstanceId || item.taskInstanceId || null,
  relatedTemplateId: item.relatedTemplateId || null,
  dateKey: item.dateKey || null,
  templateId: item.templateId || {
    priority: item.priority || "medium",
  },
  dueDate:
    item.dueDate || item.time || item.createdAt || new Date().toISOString(),
  tone:
    item.type === "task_popup"
      ? "cyan"
      : item.type === "task_reminder"
        ? "amber"
        : item.type === "task_update"
          ? "emerald"
          : item.type === "daily_task"
            ? "cyan"
            : item.type === "system"
              ? "slate"
              : item.tone || "slate",
});

const mergeUniqueNotifications = (items = []) => {
  const map = new Map();
  items.forEach((item) => {
    if (!item?.id) {
      return;
    }
    if (!map.has(item.id)) {
      map.set(item.id, item);
      return;
    }
    const existing = map.get(item.id);
    map.set(item.id, {
      ...existing,
      ...item,
      isRead: Boolean(existing.isRead || item.isRead),
    });
  });
  return Array.from(map.values());
};

const useDashboardNotifications = ({
  enabled = true,
  onNewNotification,
} = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenIdsRef = useRef(new Set());

  const loadNotifications = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      const [notificationsResponse, unreadResponse] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      const items = Array.isArray(notificationsResponse.data)
        ? notificationsResponse.data
            .map(normalizeNotification)
            .filter((item) => item.type !== "daily_task")
        : [];

      const uniqueItems = mergeUniqueNotifications(items);
      seenIdsRef.current = new Set(uniqueItems.map((item) => item.id));
      setNotifications(uniqueItems);
      setUnreadCount(Number(unreadResponse?.data?.count || 0));
    } catch (error) {
      console.error("Failed to load dashboard notifications:", error);
    }
  }, [enabled]);

  const handleRealtimeNotification = useCallback(
    (payload) => {
      const item = normalizeNotification(payload);
      if (item.type === "daily_task") {
        return;
      }

      if (!item.id || seenIdsRef.current.has(item.id)) {
        return;
      }

      seenIdsRef.current.add(item.id);
      setNotifications((current) => [item, ...current]);
      if (!item.isRead) {
        setUnreadCount((current) => current + 1);
      }
      if (typeof onNewNotification === "function") {
        onNewNotification(item);
      }
    },
    [onNewNotification],
  );

  const socketHandlers = useMemo(
    () => ({
      task_reminder: handleRealtimeNotification,
      task_popup: handleRealtimeNotification,
    }),
    [handleRealtimeNotification],
  );

  useRealtimeNotifications(socketHandlers, enabled);

  useEffect(() => {
    loadNotifications();
  }, [enabled, loadNotifications]);

  const markNotificationRead = useCallback(async (id) => {
    if (!id) return null;

    const response = await apiMarkNotificationRead(id);
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
    return response;
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const response = await apiMarkAllNotificationsRead();
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
    setUnreadCount(0);
    return response;
  }, []);

  return {
    notifications,
    unreadCount,
    reloadNotifications: loadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  };
};

export default useDashboardNotifications;
