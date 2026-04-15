import { useState } from "react";
import { loginUser, registerUser, googleLogin } from "./authApi";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const getErrorMessage = (error) =>
    error?.response?.data?.message || error?.message || "Something went wrong";

  const login = async (data) => {
    setLoading(true);
    try {
      const res = await loginUser(data);
      const { token, user: userData } = res.data.data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { token, user: userData };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken) => {
    setLoading(true);
    try {
      const res = await googleLogin(idToken);
      const { token, user: userData } = res.data.data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { token, user: userData };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data);
      return res.data; // Return the full response data
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  const getCurrentUser = () => {
    if (user) return user;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const isAdmin = () => {
    const currentUser = getCurrentUser();
    return currentUser?.role === "admin";
  };

  return {
    login,
    loginWithGoogle,
    register,
    logout,
    loading,
    user: getCurrentUser(),
    isAuthenticated,
    isAdmin,
  };
};
