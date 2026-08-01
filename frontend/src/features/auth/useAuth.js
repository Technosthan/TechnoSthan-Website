import { useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  authenticateUser,
  googleLogin,
  sendOTP,
  verifyOTP,
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

  const getErrorMessage = (error) => {
    const message = error?.response?.data?.message || error?.message || "";
    if (/E11000|duplicate key|MongoServerError|ValidationError|index:/i.test(message)) {
      return "Something went wrong. Please try again.";
    }
    return message || "Something went wrong. Please try again.";
  };

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
    setIsRegister(false);
  };

  // Traditional register/login (keep for backward compatibility)
  const register = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data);
      const {
        pendingUserId,
        contactType,
        nextStep,
        missingContactType,
        nextContactType,
      } = res.data.data;
      setTempData({ pendingUserId, [contactType]: data.contact });
      setOtpMethod(contactType === "email" ? "email" : "sms");
      const nextInputType =
        nextStep === "input-second-field"
          ? missingContactType ||
            nextContactType ||
            (contactType === "email" ? "phone" : "email")
          : contactType;
      setInputType(nextInputType);
      setStep(nextStep || "verify-otp");
      setInputValue(nextStep === "input-second-field" ? "" : data.contact);
      return { pendingUserId, contactType, nextStep };
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
      const {
        token,
        user: userData,
        requiresVerification,
        emailVerified,
        phoneVerified,
      } = res.data.data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return {
        token,
        user: userData,
        requiresVerification,
        emailVerified,
        phoneVerified,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Unified authenticate function
  const authenticate = async (data) => {
    setLoading(true);
    try {
      console.log("[useAuth] authenticate payload:", data);
      const res = await authenticateUser(data);
      console.log("[useAuth] authenticate response:", res?.data);
      const { flow, ...resultData } = res.data.data;

      if (flow === "login") {
        // User exists - login successful
        const {
          token,
          user: userData,
          requiresVerification,
          emailVerified,
          phoneVerified,
        } = resultData;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return {
          flow: "login",
          token,
          user: userData,
          requiresVerification,
          emailVerified,
          phoneVerified,
        };
      } else if (flow === "registration") {
        // User doesn't exist - start registration flow
        const { pendingUserId, contactType, nextStep } = resultData;
        setIsRegister(true);
        setInputValue(data.contact);
        setInputType(contactType);
        setTempData({ pendingUserId, [contactType]: data.contact });
        setOtpMethod(contactType === "email" ? "email" : "sms");
        setStep(nextStep);
        return { flow: "registration", pendingUserId, contactType, nextStep };
      }
    } catch (error) {
      console.error(
        "[useAuth] authenticate error:",
        error?.response?.data || error?.message || error,
      );
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
      // Register flow: collect both email and phone
      if (type === "phone") {
        setTempData({ phone: value });
        setStep("input-second-field"); // Ask for email next
      } else {
        setTempData({ email: value });
        setStep("input-second-field"); // Ask for phone next
      }
    } else {
      // Login flow: go directly to OTP
      setStep("otp");
    }
  };

  const handleSendOTP = async (method) => {
    setLoading(true);
    try {
      await sendOTP({
        contact: inputValue,
        method,
        pendingUserId: tempData.pendingUserId,
      });

      setOtpMethod(method);
      setStep(isRegister ? "verify-otp" : "verify-otp");
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
      });

      setTempData((prev) => ({
        ...prev,
        [otpMethod === "email" ? "emailVerified" : "phoneVerified"]: true,
      }));

      const innerData = res.data?.data;
      if (innerData?.finalized) {
        // Both verified, login
        const { token, user: userData } = innerData;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        resetFlow();
        return { token, user: userData };
      }

      // If registration not finalized, move to the next step returned by the backend
      if (!innerData?.finalized && isRegister) {
        const nextStep = innerData?.nextStep || "input-second-field";
        const nextContactType =
          innerData?.nextContactType ||
          innerData?.missingContactType ||
          (otpMethod === "email" ? "phone" : "email");

        setStep(nextStep);
        setInputType(nextContactType);

        if (nextStep === "verify-otp") {
          setInputValue(tempData[nextContactType] || inputValue || "");
        } else {
          setInputValue("");
        }
      }

      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "OTP verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSecondFieldSubmit = async (value) => {
    const type = detectInputType(value);

    if (isRegister) {
      if (inputType === "email" && type === "phone") {
        // Email was verified, now verify phone
        setTempData((prev) => ({ ...prev, phone: value }));
        setInputValue(value);
        setInputType("phone");
        setStep("verify-otp");

        // Send phone OTP
        await sendOTP({
          contact: value,
          method: "sms",
          pendingUserId: tempData.pendingUserId,
        });
        setOtpMethod("sms");
      } else if (inputType === "phone" && type === "email") {
        // Phone was verified, now verify email
        setTempData((prev) => ({ ...prev, email: value }));
        setInputValue(value);
        setInputType("email");
        setStep("verify-otp");

        // Send email OTP
        await sendOTP({
          contact: value,
          method: "email",
          pendingUserId: tempData.pendingUserId,
        });
        setOtpMethod("email");
      }
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

  const syncStoredUser = (updates) => {
    const storedUser = getCurrentUser();
    if (!storedUser) return null;

    const nextUser = { ...storedUser, ...updates };
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    window.dispatchEvent(new CustomEvent("userUpdated", { detail: nextUser }));
    return nextUser;
  };

  const isAdmin = () => {
    const currentUser = getCurrentUser();
    return currentUser?.role === "admin";
  };

  // Login OTP functions
  const sendLoginOTP = async (contact, method) => {
    setLoading(true);
    try {
      const res = await sendOTP({ contact, method });
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
    authenticate,

    // Setters for internal use
    setInputValue,
    setInputType,
    setTempData,

    // Additional utility functions
    logout,
    isAuthenticated,
    isAdmin,
    getCurrentUser,
    syncStoredUser,
  };
};
