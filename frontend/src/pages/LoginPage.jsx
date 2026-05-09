import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  XCircle,
  Mail,
  Shield,
  UserPlus,
  User,
  MessageSquare,
  Phone,
  CheckCircle,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { sendOTP, verifyOTP } from "../features/auth/authApi";

const LoginPage = () => {
  const {
    loading,
    step,
    inputType,
    otpMethod,
    isRegister,
    handleSendOTP,
    handleVerifyOTP,
    handleSecondFieldSubmit,
    generateQR,
    handleGoogleLogin,
    resetFlow,
    authenticate,
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();

  const [isOtpLogin, setIsOtpLogin] = useState(false); // Toggle between password and OTP login
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!contact.trim()) {
      setError("Please enter your email or phone");
      return;
    }

    // Validate email or phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    if (!emailRegex.test(contact) && !phoneRegex.test(contact)) {
      setError("Please enter a valid email or 10-digit phone number");
      return;
    }

    setOtpLoading(true);
    setError("");
    try {
      const method = emailRegex.test(contact) ? "email" : "sms";
      await sendOTP({
        contact,
        method,
      });
      setIsOtpSent(true);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }
    setOtpLoading(true);
    setError("");
    try {
      const res = await verifyOTP({
        contact,
        otp,
      });
      const { token, user: userData } = res.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate(userData.role === "admin" ? "/admin/dashboard" : "/");
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };
  const [form, setForm] = useState({
    contact: "",
    password: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [qrData, setQrData] = useState(null);

  const isEmail = (contact) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = (contact) => /^\d{10}$/.test(contact);

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      const userData = JSON.parse(user);
      if (
        userData.requiresVerification ||
        !userData.emailVerified ||
        !userData.phoneVerified
      ) {
        navigate("/profile?verification=required");
      } else {
        navigate(userData.role === "admin" ? "/admin/dashboard" : "/");
      }
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (!isOtpLogin && isRegister && step === "input-second-field") {
      setForm((prev) => ({ ...prev, contact: "", otp: "" }));
    }
    if (!isOtpLogin && isRegister && step === "verify-otp") {
      setForm((prev) => ({ ...prev, otp: "" }));
    }
  }, [isOtpLogin, isRegister, step]);

  const validate = () => {
    let errors = {};
    if (isOtpLogin || step !== "input") {
      if (step === "input") {
        if (!form.contact.trim()) errors.contact = "Email or Phone is required";
        else if (!isEmail(form.contact) && !isPhone(form.contact))
          errors.contact = "Invalid email or phone";
      }
      if (step === "verify-otp") {
        if (!form.otp.trim()) errors.otp = "OTP is required";
        if (form.otp.length !== 6) errors.otp = "OTP must be 6 digits";
      }
      if (step === "input-second-field") {
        if (!form.contact.trim()) {
          errors.contact = "Email or Phone is required";
        } else if (inputType === "email" && !isPhone(form.contact)) {
          errors.contact = "Enter a valid 10-digit phone number";
        } else if (inputType === "phone" && !isEmail(form.contact)) {
          errors.contact = "Enter a valid email address";
        }
      }
    } else {
      // Unified password-based validation
      if (step === "input") {
        if (!form.contact.trim()) errors.contact = "Email or Phone is required";
        else if (!isEmail(form.contact) && !isPhone(form.contact))
          errors.contact = "Invalid email or phone";
        if (!form.password.trim()) errors.password = "Password is required";
      }
      if (step === "verify-otp") {
        if (!form.otp.trim()) errors.otp = "OTP is required";
        if (form.otp.length !== 6) errors.otp = "OTP must be 6 digits";
      }
      if (step === "input-second-field") {
        if (!form.contact.trim()) {
          errors.contact = "Email or Phone is required";
        } else if (inputType === "email" && !isPhone(form.contact)) {
          errors.contact = "Enter a valid 10-digit phone number";
        } else if (inputType === "phone" && !isEmail(form.contact)) {
          errors.contact = "Enter a valid email address";
        }
      }
    }
    setFieldError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    try {
      if (isOtpLogin) {
        if (!isOtpSent) {
          await handleSendOtp();
        } else {
          await handleVerifyOtp();
        }
        return;
      }

      if (isRegister && step === "verify-otp") {
        await handleVerifyOTP(form.otp);
        return;
      }

      if (isRegister && step === "input-second-field") {
        await handleSecondFieldSubmit(form.contact);
        return;
      }

      const result = await authenticate({
        contact: form.contact,
        password: form.password,
      });

      if (result.flow === "login") {
        const userData = JSON.parse(localStorage.getItem("user") || "null");
        if (result.requiresVerification) {
          navigate("/profile?verification=required");
        } else {
          navigate(userData?.role === "admin" ? "/admin/dashboard" : "/");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  const handleGenerateQR = async () => {
    try {
      const qr = await generateQR();
      setQrData(qr);
    } catch (err) {
      setError(err.message || "Failed to generate QR code");
    }
  };

  const toggleOtpLogin = () => {
    setIsOtpLogin(!isOtpLogin);
    setIsOtpSent(false);
    setContact("");
    setOtp("");
    setError("");
    if (isOtpLogin) {
      resetFlow();
      setForm({ ...form, otp: "" });
    }
  };

  const getStepTitle = () => {
    if (isOtpLogin) {
      return isOtpSent ? "Enter OTP" : "OTP Login";
    }
    if (step === "input") return "Welcome";
    if (step === "verify-otp")
      return `Verify ${inputType === "email" ? "Email" : "Phone"}`;
    if (step === "input-second-field")
      return inputType === "email" ? "Enter Phone" : "Enter Email";
    return "Welcome";
  };

  const getStepDescription = () => {
    if (isOtpLogin) {
      return isOtpSent
        ? `Enter the 6-digit code sent to your ${isEmail(contact) ? "email" : "phone"}`
        : "Enter your email or phone to login";
    }
    if (step === "input")
      return "Enter your credentials to login or create account";
    if (step === "verify-otp")
      return `Enter the 6-digit code sent to your ${inputType === "email" ? "email" : "phone"}`;
    if (step === "input-second-field")
      return inputType === "email"
        ? "Enter your phone to continue registration"
        : "Enter your email to continue registration";
    return "Enter your credentials to login or create account";
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${theme.bg} ${theme.text}`}
    >
      <div
        className={`${theme.cardOpacity} p-8 rounded-3xl shadow-2xl w-full max-w-md`}
      >
        {/* Tabs */}
        {/* Title */}
        <div className="text-center mb-6">
          <Shield className={`mx-auto mb-2 ${theme.accent}`} size={28} />
          <h2 className="text-2xl font-semibold">{getStepTitle()}</h2>
          <p className={theme.textSecondary}>{getStepDescription()}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-500 text-sm flex items-center gap-2">
            <XCircle size={16} />
            {error}
          </div>
        )}

        {/* Progress Indicator - Removed for simple OTP */}

        {/* OTP Login Form */}
        {isOtpLogin && !isOtpSent && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Mail className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Enter your email or phone"
                value={contact}
                className={`${theme.input} pl-10`}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpLoading}
              className={`w-full ${theme.button} py-3 rounded-xl flex cursor-pointer justify-center items-center gap-2`}
            >
              {otpLoading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <MessageSquare size={18} />
              )}
              Send OTP
            </button>
          </div>
        )}

        {isOtpLogin && isOtpSent && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Shield className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                className={`${theme.input} pl-10`}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              className={`w-full ${theme.button} py-3 rounded-xl cursor-pointer flex justify-center items-center gap-2`}
            >
              {otpLoading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <CheckCircle size={18} />
              )}
              Verify OTP
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unified Authentication Form */}
          {!isOtpLogin && step === "input" && (
            <>
              {/* Contact */}
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Email or Phone"
                  value={form.contact}
                  className={`${theme.input} pl-10`}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                />
                {fieldError.contact && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldError.contact}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  className={`${theme.input} pl-10 pr-10`}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                {fieldError.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldError.password}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${theme.button} py-3 rounded-xl cursor-pointer flex justify-center items-center gap-2`}
              >
                {loading ? "Please wait..." : "Continue"}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <a
                  href="/forgot-password"
                  className="text-blue-500 text-sm hover:text-blue-600"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Login with OTP toggle */}
              <button
                type="button"
                onClick={toggleOtpLogin}
                className="w-full text-blue-500 text-sm cursor-pointer hover:text-blue-600"
              >
                Login with OTP instead
              </button>
            </>
          )}

          {/* Registration Flow - OTP Verification */}
          {!isOtpLogin && isRegister && step === "verify-otp" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  OTP sent via {otpMethod}
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={form.otp}
                    className={`${theme.input} pl-10 text-center tracking-widest`}
                    maxLength={6}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        otp: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
                {fieldError.otp && (
                  <p className="text-red-500 text-xs mt-1">{fieldError.otp}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSendOTP(otpMethod)}
                disabled={loading}
                className="w-full text-blue-500 text-sm cursor-pointer hover:text-blue-600 flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                Resend OTP
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${theme.button} py-3 rounded-xl cursor-pointer flex justify-center items-center gap-2`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {/* Registration Flow - Second Field Input */}
          {!isOtpLogin && isRegister && step === "input-second-field" && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  {inputType === "email" ? (
                    <Phone className="text-gray-400" size={18} />
                  ) : (
                    <Mail className="text-gray-400" size={18} />
                  )}
                </div>
                <input
                  type="text"
                  placeholder={
                    inputType === "email" ? "Phone Number" : "Email Address"
                  }
                  value={form.contact}
                  className={`${theme.input} pl-10`}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                />
                {fieldError.contact && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldError.contact}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${theme.button} py-3 rounded-xl cursor-pointer flex justify-center items-center gap-2`}
              >
                {loading ? "Please wait..." : "Continue"}
              </button>
            </div>
          )}

          {/* QR Login Option */}
          {!isOtpLogin && step === "input" && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleGenerateQR}
                className="text-blue-500 text-sm cursor-pointer hover:text-blue-600 flex items-center justify-center gap-2 mx-auto"
              >
                <QrCode size={16} />
                Login with QR Code
              </button>
            </div>
          )}

          {/* QR Code Display */}
          {qrData && (
            <div className="text-center">
              <img src={qrData.qrCode} alt="QR Code" className="mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Scan with your mobile device
              </p>
            </div>
          )}

          {/* Google Login */}
          {!isOtpLogin && step === "input" && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={`w-full ${theme.card} ${theme.border} py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          )}

          {/* Social Login Options */}
          {!isOtpLogin && step === "input" && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`${theme.border} w-full`} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className={`${theme.surface} px-2 ${theme.textSecondary}`}
                  >
                    Or login with
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => navigate("/login/telegram")}
                  className="p-3 rounded-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  title="Login with Telegram"
                >
                  <MessageSquare size={20} />
                </button>
                <button
                  onClick={() => navigate("/login/whatsapp")}
                  className="p-3 rounded-full cursor-pointer bg-green-500 hover:bg-green-600 text-white transition-colors"
                  title="Login with WhatsApp"
                >
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
