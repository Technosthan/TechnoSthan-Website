import axiosInstance from "../../shared/lib/axiosInstance";

export const registerUser = (data) =>
  axiosInstance.post("/api/auth/register", data);
export const loginUser = (data) => axiosInstance.post("/api/auth/login", data);
export const googleLogin = () =>
  (window.location.href = `${axiosInstance.defaults.baseURL}/api/auth/google`);

// OTP-based auth APIs
export const sendOTP = (data) => axiosInstance.post("/api/auth/send-otp", data);
export const verifyOTP = (data) =>
  axiosInstance.post("/api/auth/verify-otp", data);
export const registerWithOTP = (data) =>
  axiosInstance.post("/api/auth/register-otp", data);
export const loginWithOTP = (data) =>
  axiosInstance.post("/api/auth/login-otp", data);
export const generateQRLogin = () =>
  axiosInstance.post("/api/auth/qr-login/generate");
export const verifyQRLogin = (data) =>
  axiosInstance.post("/api/auth/qr-login/verify", data);

// Password reset
export const forgotPassword = (data) =>
  axiosInstance.post("/api/auth/forgot-password", data);
export const resetPassword = (data) =>
  axiosInstance.post("/api/auth/reset-password", data);

// Login OTP verify
export const verifyLoginOTP = (data) =>
  axiosInstance.post("/api/auth/verify-login-otp", data);
