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

  const getErrorMessage = (error) =>
    error?.response?.data?.message || error?.message || "Something went wrong";

  // Detect input type
  const detectInputType = (value) => {
    // TEMPORARILY DISABLED: Phone authentication system
    // const type = value.includes("@") ? "email" : "phone";
    // console.log("Input:", value, "Detected Type:", type);
    // return type;
    const type = "email"; // Always email
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

  // Unified authenticate function
  const authenticate = async (data) => {
    setLoading(true);
    try {
      const res = await authenticateUser(data);
      const { flow, ...resultData } = res.data.data;

      if (flow === "login") {
        // User exists - login successful
        const { token, user: userData } = resultData;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return { flow: "login", token, user: userData };
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

    // TEMPORARILY DISABLED: Phone authentication system
    // if (isRegister) {
    //   // Register flow: always phone first
    //   setInputType("phone");
    //   setTempData({ phone: value });
    //   setStep("otp");
    // } else {
    //   // Login flow
    //   setStep("otp");
    // }
    // Always email, go to otp
    setStep("otp");
  };

  const handleSendOTP = async (method) => {
    setLoading(true);
    try {
      // TEMPORARILY DISABLED: Phone authentication system
      // await sendOTP({
      //   contact: inputValue,
      //   method,
      //   pendingUserId: tempData.pendingUserId,
      // });
      await sendOTP({
        contact: inputValue,
        method: "email", // Always email
        pendingUserId: tempData.pendingUserId,
      });

      setOtpMethod("email");
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
        // TEMPORARILY DISABLED: Phone authentication system
        // [otpMethod === "email" ? "emailVerified" : "phoneVerified"]: true,
        emailVerified: true,
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

      // TEMPORARILY DISABLED: Phone authentication system
      // If registration not finalized, move to second-field input to collect remaining contact
      // if (!innerData?.finalized && isRegister) {
      //   setStep("input-second-field");
      //   // Keep the verified contact type so the UI can ask for the missing contact
      //   setInputType(otpMethod === "email" ? "email" : "phone");
      //   setInputValue("");
      // }

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

  // TEMPORARILY DISABLED: Phone authentication system
  // const handleSecondFieldSubmit = async (value) => {
  //   const type = detectInputType(value);

  //   if (isRegister) {
  //     if (inputType === "email" && type === "phone") {
  //       // Email was verified, now verify phone
  //       setTempData((prev) => ({ ...prev, phone: value }));
  //       setInputValue(value);
  //       setInputType("phone");
  //       setStep("verify-otp");

  //       // Send phone OTP
  //       await sendOTP({
  //         contact: value,
  //         method: "sms",
  //         pendingUserId: tempData.pendingUserId,
  //       });
  //       setOtpMethod("sms");
  //     } else if (inputType === "phone" && type === "email") {
  //       // Phone was verified, now verify email
  //       setTempData((prev) => ({ ...prev, email: value }));
  //       setInputValue(value);
  //       setInputType("email");
  //       setStep("verify-otp");

  //       // Send email OTP
  //       await sendOTP({
  //         contact: value,
  //         method: "email",
  //         pendingUserId: tempData.pendingUserId,
  //       });
  //       setOtpMethod("email");
  //     }
  //   }
  // };

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
    // TEMPORARILY DISABLED: Phone authentication system
    // handleSecondFieldSubmit,
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
  };
};
