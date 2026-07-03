import { useEffect } from "react";
import { io } from "socket.io-client";
import { getStoredToken } from "../utils/auth";

const SOCKET_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const useRealtimeNotifications = (handlers = {}, enabled = true) => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const token = getStoredToken();
    if (!token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    Object.entries(handlers).forEach(([event, handler]) => {
      if (typeof handler === "function") {
        socket.on(event, handler);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, handlers]);
};

export default useRealtimeNotifications;
