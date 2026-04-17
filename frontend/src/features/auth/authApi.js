import axiosInstance from "../../shared/lib/axiosInstance";

export const registerUser = (data) =>
  axiosInstance.post("/api/auth/register", data);

export const loginUser = (data) => axiosInstance.post("/api/auth/login", data);

export const googleLogin = (idToken) =>
  axiosInstance.post("/api/auth/google", { idToken });
