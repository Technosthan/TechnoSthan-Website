import axiosInstance from "../../shared/lib/axiosInstance";

const apiBaseURL =
  axiosInstance.defaults.baseURL ||
  import.meta.env.VITE_API_BASE_URL_PROD ||
  import.meta.env.VITE_API_BASE_URL ||
  window.location.origin;

export const registerUser = (data) =>
  axiosInstance.post("/api/auth/register", data);
export const loginUser = (data) => axiosInstance.post("/api/auth/login", data);
export const authenticateUser = (data) =>
  axiosInstance.post("/api/auth/authenticate", data);
export const googleLogin = () => {
  if (!apiBaseURL) {
    console.error("Missing API base URL for Google login.");
    return;
  }

  window.location.href = `${apiBaseURL}/api/auth/google`;
};

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

// Social login OTP
export const sendLoginOtp = (data) =>
  axiosInstance.post("/api/auth/send-login-otp", data);
export const verifyLoginOtp = (data) =>
  axiosInstance.post("/api/auth/verify-login-otp", data);

// Login OTP verify
export const verifyLoginOTP = (data) =>
  axiosInstance.post("/api/auth/verify-login-otp", data);
