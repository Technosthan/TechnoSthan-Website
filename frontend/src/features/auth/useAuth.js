import { useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  googleLogin,
  sendOTP,
  verifyOTP,
  registerWithOTP,
  loginWithOTP,
  generateQRLogin,
  verifyQRLogin,
  forgotPassword,
  resetPassword,
  verifyLoginOTP,
} from "./authApi";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // OTP flow states
  const [step, setStep] = useState("input"); // input, otp, verify-second-field
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState(null); // "email" or "phone"
  const [otpMethod, setOtpMethod] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [tempData, setTempData] = useState({}); // Store temporary data during flow

  const getErrorMessage = (error) =>
    error?.response?.data?.message || error?.message || "Something went wrong";

  // Detect input type
  const detectInputType = (value) => {
    const type = value.includes("@") ? "email" : "phone";
    console.log("Input:", value, "Detected Type:", type);
    return type;
  };

  // Reset flow
  const resetFlow = () => {
    setStep("input");
    setInputValue("");
    setInputType(null);
    setOtpMethod("");
    setTempData({});
  };

  // Traditional register/login (keep for backward compatibility)
  const register = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data);
      const { pendingUserId, contactType } = res.data.data;
      setTempData({ pendingUserId, [contactType]: data.contact });
      setOtpMethod(contactType === "email" ? "email" : "sms");
      return { pendingUserId, contactType };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

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

  // OTP-based authentication flow
  const startAuthFlow = (isRegisterMode = false) => {
    setIsRegister(isRegisterMode);
    setStep("input");
    setInputValue("");
    setInputType(null);
    setOtpMethod("");
    setTempData({});
  };

  const handleInputSubmit = async (value) => {
    const type = detectInputType(value);
    setInputValue(value);
    setInputType(type);

    if (isRegister) {
      // Register flow: always phone first
      setInputType("phone");
      setTempData({ phone: value });
      setStep("otp");
    } else {
      // Login flow
      setStep("otp");
    }
  };

  const handleSendOTP = async (method) => {
    setLoading(true);
    try {
      const purpose = isRegister
        ? inputType === "email"
          ? "verify-email"
          : "verify-phone"
        : "login";

      await sendOTP({
        contact: inputValue,
        method,
        purpose,
        pendingUserId: tempData.pendingUserId,
      });

      setOtpMethod(method);
      setStep(isRegister ? "verify-otp" : "verify-otp");

      if (isRegister && inputType === "email") {
        // After email verification, registration complete
      } else if (isRegister && inputType === "phone") {
        // After phone verification, ask for email
        setStep("input-second-field");
        setInputType("email");
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setLoading(true);
    try {
      const res = await verifyOTP({
  contact: inputValue,
  otp,
  purpose: isRegister
    ? otpMethod === "email"
      ? "verify-email"
      : "verify-phone"
    : "login",
});

      setTempData((prev) => ({
        ...prev,
        [otpMethod === "email" ? "emailVerified" : "phoneVerified"]: true,
      }));

      if (res.data.data.registrationComplete) {
        // Both verified, login
        const { token, user: userData } = res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        resetFlow();
        return { token, user: userData };
      }

      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "OTP verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSecondFieldSubmit = async (value, name) => {
    const type = detectInputType(value);

    if (isRegister) {
      if (inputType === "email" && type === "phone") {
        // Email was verified, now verify phone
        setTempData((prev) => ({ ...prev, phone: value, name }));
        setInputValue(value);
        setInputType("phone");
        setStep("otp");

        // Send phone OTP
        await sendOTP({
          contact: value,
          method: "sms",
          purpose: "verify-phone",
          pendingUserId: tempData.pendingUserId,
        });
        setOtpMethod("sms");
      } else if (inputType === "phone" && type === "email") {
        // Phone was verified, now verify email
        setTempData((prev) => ({ ...prev, email: value, name }));
        setInputValue(value);
        setInputType("email");
        setStep("otp");

        // Send email OTP
        await sendOTP({
          contact: value,
          method: "email",
          purpose: "verify-email",
          pendingUserId: tempData.pendingUserId,
        });
        setOtpMethod("email");
      }
    }
  };

  const completeRegistration = async () => {
    setLoading(true);
    try {
      const res = await registerWithOTP({
        email: tempData.email,
        phone: tempData.phone,
        name: tempData.name,
      });

      const { token, user: userData } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      console.log("User registered with OTP and set:", userData);

      resetFlow();
      return { token, user: userData };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // QR Login
  const generateQR = async () => {
    setLoading(true);
    try {
      const res = await generateQRLogin();
      return res.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const verifyQR = async (qrData) => {
    setLoading(true);
    try {
      const res = await verifyQRLogin({ qrData });
      const { token, user: userData } = res.data.data;

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

  const handleGoogleLogin = () => {
    googleLogin();
  };

  // Forgot Password
  const requestPasswordReset = async (email) => {
    setLoading(true);
    try {
      await forgotPassword({ email });
      return { success: true };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (token, newPassword) => {
    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      return { success: true };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
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

  // Login OTP functions
  const sendLoginOTP = async (contact, method) => {
    setLoading(true);
    try {
      const res = await sendOTP({ contact, method, purpose: "login" });
      return res.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOTPFunc = async (data) => {
    setLoading(true);
    try {
      const res = await verifyLoginOTP(data);
      const { token, user: userData } = res.data.data;

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

  return {
    // State
    loading,
    user,
    step,
    inputValue,
    inputType,
    otpMethod,
    isRegister,
    tempData,

    // Actions
    register,
    login,
    startAuthFlow,
    handleInputSubmit,
    handleSendOTP,
    handleVerifyOTP,
    handleSecondFieldSubmit,
    generateQR,
    verifyQR,
    handleGoogleLogin,
    requestPasswordReset,
    resetUserPassword,
    resetFlow,
    sendLoginOTP,
    verifyLoginOTPFunc,

    // Setters for internal use
    setInputValue,
    setInputType,
    setTempData,

    // Additional utility functions
    logout,
    isAuthenticated,
    isAdmin,
    getCurrentUser,
  };
};
