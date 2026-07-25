import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";
import {
  AUTH_STORAGE_KEYS,
  SESSION_EVENT_TYPES,
  clearAuth,
  getLastActivityAt,
  getStoredToken,
  getStoredUser,
  setLastActivityAt,
} from "../utils/auth";
import {
  isSessionTimedOut,
  normalizeSessionTimeoutSettings,
  performCentralLogout,
  refreshLastActivity,
} from "../lib/sessionTimeout";
import { useSettings } from "../contexts/SettingsContext";
import { useToast } from "./Toast/ToastProvider";

const ACTIVITY_THROTTLE_MS = 5000;
const ACTIVITY_PING_THROTTLE_MS = 15000;
const SESSION_ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "touchstart",
  "scroll",
  "focus",
];

const SESSION_LOGIN_ROUTES = new Set(["/login", "/register"]);

const SessionTimeoutManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { settings, loading: settingsLoading } = useSettings();
  const [sessionTick, setSessionTick] = useState(0);
  const logoutTimerRef = useRef(null);
  const lastActivityPingRef = useRef(0);
  const lastLocalActivityRef = useRef(getLastActivityAt() || 0);
  const handledEventIdsRef = useRef(new Set());
  const isLoggingOutRef = useRef(false);

  const authenticatedUser = getStoredUser();
  const token = getStoredToken();
  const isAuthenticated = Boolean(token && authenticatedUser);
  const sessionTimeoutSettings = normalizeSessionTimeoutSettings(
    settings || {},
  );
  const timeoutEnabled =
    isAuthenticated && sessionTimeoutSettings.sessionTimeoutEnabled;
  const timeoutMs = sessionTimeoutSettings.sessionTimeoutMs;

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const finalizeLogout = async ({ reason, message, broadcast = true }) => {
    if (isLoggingOutRef.current) {
      return;
    }

    isLoggingOutRef.current = true;
    clearLogoutTimer();

    if (broadcast) {
      await performCentralLogout({ reason, message });
    } else {
      clearAuth({
        reason,
        message,
        broadcast: false,
      });
    }

    if (message || reason === SESSION_EVENT_TYPES.SESSION_EXPIRED) {
      showToast({
        title: "Session expired",
        message:
          message ||
          "Your session expired due to inactivity. Please log in again.",
        type: "error",
      });
    }

    navigate("/login", { replace: true });
    window.setTimeout(() => {
      isLoggingOutRef.current = false;
    }, 0);
  };

  const scheduleTimeout = () => {
    clearLogoutTimer();

    if (!timeoutEnabled || !timeoutMs) {
      return;
    }

    const currentActivity = getLastActivityAt() || Date.now();
    if (!getLastActivityAt()) {
      setLastActivityAt(currentActivity);
    }

    const elapsed = Date.now() - currentActivity;
    if (isSessionTimedOut(currentActivity, timeoutMs)) {
      finalizeLogout({
        reason: SESSION_EVENT_TYPES.SESSION_EXPIRED,
        message:
          "Your session expired due to inactivity. Please log in again.",
        broadcast: true,
      });
      return;
    }

    const remainingMs = Math.max(0, timeoutMs - elapsed);
    logoutTimerRef.current = window.setTimeout(() => {
      finalizeLogout({
        reason: SESSION_EVENT_TYPES.SESSION_EXPIRED,
        message:
          "Your session expired due to inactivity. Please log in again.",
        broadcast: true,
      });
    }, remainingMs);
  };

  const recordActivity = async (source = "interaction") => {
    if (!timeoutEnabled || isLoggingOutRef.current) {
      return;
    }

    const now = Date.now();
    const lastLocalActivity = lastLocalActivityRef.current || 0;

    if (
      source !== "route" &&
      lastLocalActivity &&
      now - lastLocalActivity < ACTIVITY_THROTTLE_MS
    ) {
      return;
    }

    lastLocalActivityRef.current = refreshLastActivity(now);
    setSessionTick((tick) => tick + 1);
    scheduleTimeout();

    if (
      source === "route" ||
      now - lastActivityPingRef.current >= ACTIVITY_PING_THROTTLE_MS
    ) {
      lastActivityPingRef.current = now;
      try {
        await api.post("/api/session/activity");
      } catch (error) {
        // Ignore heartbeat failures; the client timer still enforces inactivity.
      }
    }
  };

  useEffect(() => {
    const handleAuthChange = () => {
      setSessionTick((tick) => tick + 1);
    };

    const handleStorage = (event) => {
      if (
        [
          AUTH_STORAGE_KEYS.token,
          AUTH_STORAGE_KEYS.user,
          AUTH_STORAGE_KEYS.lastActivityAt,
          AUTH_STORAGE_KEYS.sessionEvent,
          AUTH_STORAGE_KEYS.workspaceSettingsUpdatedAt,
        ].includes(event.key)
      ) {
        setSessionTick((tick) => tick + 1);
      }
    };

    const handleSessionEvent = (event) => {
      const payload =
        event?.detail ||
        (() => {
          try {
            return event?.newValue ? JSON.parse(event.newValue) : null;
          } catch {
            return null;
          }
        })();

      if (!payload?.id || handledEventIdsRef.current.has(payload.id)) {
        return;
      }

      handledEventIdsRef.current.add(payload.id);

      if (isLoggingOutRef.current) {
        return;
      }

      clearLogoutTimer();
      clearAuth({
        reason: payload.reason || payload.type,
        message: payload.message || "",
        broadcast: false,
      });

      if (
        payload.type === SESSION_EVENT_TYPES.SESSION_EXPIRED ||
        payload.reason === SESSION_EVENT_TYPES.SESSION_EXPIRED
      ) {
        showToast({
          title: "Session expired",
          message:
            payload.message ||
            "Your session expired due to inactivity. Please log in again.",
          type: "error",
        });
      }

      navigate("/login", { replace: true });
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("session-event", handleSessionEvent);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("session-event", handleSessionEvent);
    };
  }, [navigate, showToast]);

  useEffect(() => {
    if (!isAuthenticated || !timeoutEnabled || settingsLoading) {
      clearLogoutTimer();
      return undefined;
    }

    scheduleTimeout();

    return () => {
      clearLogoutTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    timeoutEnabled,
    timeoutMs,
    settingsLoading,
    sessionTick,
    location.pathname,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !timeoutEnabled) {
      return undefined;
    }

    if (SESSION_LOGIN_ROUTES.has(location.pathname)) {
      return undefined;
    }

    recordActivity("route");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isAuthenticated, timeoutEnabled]);

  useEffect(() => {
    if (!isAuthenticated || !timeoutEnabled) {
      return undefined;
    }

    const handleActivity = () => {
      recordActivity("interaction");
    };

    const handleScroll = () => {
      recordActivity("scroll");
    };

    SESSION_ACTIVITY_EVENTS.forEach((eventName) => {
      const handler = eventName === "scroll" ? handleScroll : handleActivity;
      window.addEventListener(eventName, handler, { passive: true });
    });

    return () => {
      SESSION_ACTIVITY_EVENTS.forEach((eventName) => {
        const handler = eventName === "scroll" ? handleScroll : handleActivity;
        window.removeEventListener(eventName, handler);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, timeoutEnabled, timeoutMs]);

  return null;
};

export default SessionTimeoutManager;
