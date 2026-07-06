import { createContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "../services/apiClient";

export const AuthContext = createContext(null);

const TOKEN_KEY = "technosthan_access_token";

const readToken = () => localStorage.getItem(TOKEN_KEY);
const persistToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => readToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/auth/me");
        if (!active) return;

        setUser(response.user || null);
        if (response.token) {
          persistToken(response.token);
          setToken(response.token);
        }
      } catch (_error) {
        if (!active) return;
        persistToken(null);
        setToken(null);
        setUser(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, [token]);

  const setSession = (session) => {
    persistToken(session.token);
    setToken(session.token);
    setUser(session.user);
    setLoading(false);
  };

  const login = async (payload) => {
    const response = await apiClient.post("/auth/login", payload);
    setSession(response);
    return response;
  };

  const register = async (payload) => {
    const response = await apiClient.post("/auth/register", payload);
    setSession(response);
    return response;
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } finally {
      persistToken(null);
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
      isStudent: user?.role === "STUDENT",
      login,
      register,
      logout,
      setUser,
      setToken,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
