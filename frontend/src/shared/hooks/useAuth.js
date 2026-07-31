import { useSyncExternalStore } from "react";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearAuthToken,
  decodeJwtPayload,
  getAuthToken,
  getAuthUser,
  setAuthSession,
} from "../utils";

const subscribe = (callback) => {
  window.addEventListener("storage", callback);
  window.addEventListener("auth-token-changed", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("auth-token-changed", callback);
  };
};

const getSnapshot = () =>
  `${getAuthToken() || ""}|${localStorage.getItem(AUTH_USER_KEY) || ""}`;

export default function useAuth() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
  const [token] = snapshot.split("|");
  const user = getAuthUser() || decodeJwtPayload(token) || null;

  const login = (nextToken, nextUser) => {
    const derivedUser =
      nextUser || decodeJwtPayload(nextToken);
    setAuthSession({
      token: nextToken,
      user: derivedUser,
    });
    window.dispatchEvent(
      new Event("auth-token-changed")
    );
  };

  const logout = () => {
    clearAuthToken();
    window.dispatchEvent(
      new Event("auth-token-changed")
    );
  };

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === "admin",
    login,
    logout,
    storageKey: AUTH_TOKEN_KEY,
    userStorageKey: AUTH_USER_KEY,
  };
}
