import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import {
  Lock,
  Eye,
  EyeOff,
  XCircle,
  Mail,
  Shield,
  MessageSquare,
  Phone,
  CheckCircle,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { sendOTP, verifyOTP } from "../features/auth/authApi";

const getSafeAuthMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const message = error?.response?.data?.message || error?.message || "";
  if (/E11000|duplicate key|MongoServerError|ValidationError|index:/i.test(message)) {
    return fallback;
  }
  return message || fallback;
};

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

  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");

  const [otpLoading, setOtpLoading] = useState(false);

  const [form, setForm] = useState({
    contact: "",
    password: "",
    otp: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [qrData, setQrData] = useState(null);

  const isEmail = (value) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

  const isPhone = (value) => /^\d{10}$/.test(value);

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
      setForm((prev) => ({
        ...prev,
        contact: "",
        otp: "",
      }));
    }

    if (!isOtpLogin && isRegister && step === "verify-otp") {
      setForm((prev) => ({
        ...prev,
        otp: "",
      }));
    }
  }, [isOtpLogin, isRegister, step]);

  // =========================
  // OTP LOGIN
  // =========================

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    if (!contact.trim()) {
      setError("Please enter your email or phone number");
      return;
    }

    if (!isEmail(contact) && !isPhone(contact)) {
      setError("Enter valid email or 10 digit phone number");
      return;
    }

    setOtpLoading(true);

    try {
      const method = isEmail(contact) ? "email" : "sms";

      // Attempt to get reCAPTCHA token (v3). Falls back to null.
      const getRecaptchaToken = async () => {
        try {
          const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
          if (!siteKey) return null;

          // If grecaptcha not loaded, inject script
          if (!window.grecaptcha) {
            await new Promise((resolve, reject) => {
              const s = document.createElement("script");
              s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
              s.async = true;
              s.defer = true;
              s.onload = resolve;
              s.onerror = reject;
              document.head.appendChild(s);
            });
          }

          if (window.grecaptcha && window.grecaptcha.execute) {
            return await new Promise((resolve) => {
              window.grecaptcha.ready(() => {
                window.grecaptcha
                  .execute(siteKey, { action: "send_otp" })
                  .then((tok) => resolve(tok))
                  .catch(() => resolve(null));
              });
            });
          }
        } catch (e) {
          // ignore and continue without token
          console.warn("reCAPTCHA unavailable:", e);
        }
        return null;
      };

      const recaptchaToken = await getRecaptchaToken();

      const res = await sendOTP({
        contact,
        method,
        recaptchaToken,
      });

      // Optional backend response
      if (res?.data?.isNewUser) {
        setSuccess("Account not found. Creating new account automatically...");
      } else {
        setSuccess("OTP sent successfully");
      }

      setIsOtpSent(true);
    } catch (err) {
      setError(getSafeAuthMessage(err, "Failed to send OTP"));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setOtpLoading(true);

    try {
      const res = await verifyOTP({
        contact,
        otp,
      });

      const { token, user: userData } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setSuccess("Login successful");

      navigate(userData.role === "admin" ? "/admin/dashboard" : "/");
    } catch (err) {
      setError(getSafeAuthMessage(err, "Invalid OTP"));
    } finally {
      setOtpLoading(false);
    }
  };

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    let errors = {};

    if (isOtpLogin || step !== "input") {
      if (step === "input") {
        if (!form.contact.trim()) {
          errors.contact = "Email or phone is required";
        } else if (!isEmail(form.contact) && !isPhone(form.contact)) {
          errors.contact = "Enter valid email or 10 digit phone";
        }
      }

      if (step === "verify-otp") {
        if (!form.otp.trim()) {
          errors.otp = "OTP is required";
        } else if (form.otp.length !== 6) {
          errors.otp = "OTP must be 6 digits";
        }
      }

      if (step === "input-second-field") {
        if (!form.contact.trim()) {
          errors.contact = "Field is required";
        } else if (inputType === "email" && !isPhone(form.contact)) {
          errors.contact = "Enter valid 10 digit phone number";
        } else if (inputType === "phone" && !isEmail(form.contact)) {
          errors.contact = "Enter valid email address";
        }
      }
    } else {
      if (step === "input") {
        if (!form.contact.trim()) {
          errors.contact = "Email or phone is required";
        } else if (!isEmail(form.contact) && !isPhone(form.contact)) {
          errors.contact = "Enter valid email or 10 digit phone";
        }

        if (!form.password.trim()) {
          errors.password = "Password is required";
        } else if (form.password.length < 6) {
          errors.password = "Password must be at least 6 characters";
        }
      }
    }

    setFieldError(errors);

    return Object.keys(errors).length === 0;
  };

  // =========================
  // MAIN LOGIN / REGISTER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validate()) return;

    try {
      // OTP LOGIN
      if (isOtpLogin) {
        if (!isOtpSent) {
          await handleSendOtp();
        } else {
          await handleVerifyOtp();
        }
        return;
      }

      // REGISTER OTP VERIFY
      if (isRegister && step === "verify-otp") {
        await handleVerifyOTP(form.otp);

        setSuccess("Account verified successfully");

        return;
      }

      // REGISTER SECOND FIELD
      if (isRegister && step === "input-second-field") {
        await handleSecondFieldSubmit(form.contact);

        setSuccess("OTP sent successfully");

        return;
      }

      // LOGIN / AUTO REGISTER
      const result = await authenticate({
        contact: form.contact,
        password: form.password,
      });

      // AUTO REGISTER MESSAGE
      if (result?.flow === "register") {
        setSuccess("Account not found. Starting registration process...");
      }

      // LOGIN SUCCESS
      if (result?.flow === "login") {
        const userData = JSON.parse(localStorage.getItem("user") || "null");

        setSuccess("Login successful");

        if (result.requiresVerification) {
          navigate("/profile?verification=required");
        } else {
          navigate(userData?.role === "admin" ? "/admin/dashboard" : "/");
        }
      }
    } catch (err) {
      console.error(
        "[LoginPage] authenticate error details:",
        err?.response?.data || err?.message || err,
      );
      setError(getSafeAuthMessage(err));
    }
  };

  // =========================
  // QR
  // =========================

  const handleGenerateQR = async () => {
    setError("");

    try {
      const qr = await generateQR();

      setQrData(qr);
    } catch (err) {
      setError(getSafeAuthMessage(err, "Failed to generate QR code"));
    }
  };

  // =========================
  // TOGGLE OTP LOGIN
  // =========================

  const toggleOtpLogin = () => {
    setIsOtpLogin(!isOtpLogin);

    setIsOtpSent(false);

    setContact("");
    setOtp("");

    setError("");
    setSuccess("");

    if (isOtpLogin) {
      resetFlow();

      setForm({
        ...form,
        otp: "",
      });
    }
  };

  // =========================
  // TITLES
  // =========================

  const getStepTitle = () => {
    if (isOtpLogin) {
      return isOtpSent ? "Enter OTP" : "OTP Login";
    }

    if (step === "input") return "Welcome";

    if (step === "verify-otp") {
      return `Verify ${inputType === "email" ? "Email" : "Phone"}`;
    }

    if (step === "input-second-field") {
      return inputType === "email" ? "Enter Phone" : "Enter Email";
    }

    return "Welcome";
  };

  const getStepDescription = () => {
    if (isOtpLogin) {
      return isOtpSent
        ? `Enter the OTP sent to your ${isEmail(contact) ? "email" : "phone"}`
        : "Login using OTP";
    }

    if (step === "input") {
      return "Login or create account";
    }

    if (step === "verify-otp") {
      return `Enter OTP sent to your ${
        inputType === "email" ? "email" : "phone"
      }`;
    }

    if (step === "input-second-field") {
      return inputType === "email"
        ? "Enter phone number"
        : "Enter email address";
    }

    return "Welcome";
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${theme.bg} ${theme.text}`}
    >
      <div
        className={`${theme.cardOpacity} p-8 rounded-3xl shadow-2xl w-full max-w-md`}
      >
        {/* TITLE */}
        <div className="text-center mb-6">
          <Shield className={`mx-auto mb-2 ${theme.accent}`} size={28} />

          <h2 className="text-2xl font-semibold">{getStepTitle()}</h2>

          <p className={theme.textSecondary}>{getStepDescription()}</p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <XCircle size={16} />
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* OTP LOGIN */}
        {isOtpLogin && !isOtpSent && (
          <div className="space-y-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Mail className="text-gray-400" size={18} />
              </div>

              <input
                type="text"
                placeholder="Enter email or phone"
                value={contact}
                className={`${theme.input} pl-10`}
                onChange={(e) => {
                  setContact(e.target.value);
                  setError("");
                  setSuccess("");
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpLoading}
              className={`w-full ${theme.button} py-3 rounded-xl flex justify-center cursor-pointer items-center gap-2`}
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

        {/* VERIFY OTP */}
        {isOtpLogin && isOtpSent && (
          <div className="space-y-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Shield className="text-gray-400" size={18} />
              </div>

              <input
                type="text"
                placeholder="Enter 6 digit OTP"
                value={otp}
                maxLength={6}
                className={`${theme.input} pl-10`}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));

                  setError("");
                  setSuccess("");
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              className={`w-full ${theme.button} py-3 rounded-xl flex justify-center cursor-pointer items-center gap-2`}
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

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isOtpLogin && step === "input" && (
            <>
              {/* CONTACT */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <Mail className="text-gray-400" size={18} />
                  </div>

                  <input
                    type="text"
                    placeholder="Email or Phone"
                    value={form.contact}
                    className={`${theme.input} pl-10`}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        contact: e.target.value,
                      });

                      setFieldError({
                        ...fieldError,
                        contact: "",
                      });

                      setError("");
                      setSuccess("");
                    }}
                  />
                </div>

                {fieldError.contact && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldError.contact}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <Lock className="text-gray-400" size={18} />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    className={`${theme.input} pl-10 pr-10`}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        password: e.target.value,
                      });

                      setFieldError({
                        ...fieldError,
                        password: "",
                      });

                      setError("");
                      setSuccess("");
                    }}
                  />

                  <div
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>

                {fieldError.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldError.password}
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${theme.button} py-3 rounded-xl flex justify-center items-center gap-2 cursor-pointer`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin " size={18} />
                    Please wait...
                  </>
                ) : (
                  "Continue"
                )}
              </button>

              {/* FORGOT */}
              <div className="text-center">
                <a
                  href="/forgot-password"
                  className="text-blue-500 text-sm hover:text-blue-600"
                >
                  Forgot Password?
                </a>
              </div>

              {/* OTP LOGIN TOGGLE */}
              <button
                type="button"
                onClick={toggleOtpLogin}
                className="w-full text-blue-500 text-sm hover:text-blue-600 cursor-pointer"
              >
                Login with OTP instead
              </button>
            </>
          )}

          {/* REGISTER OTP VERIFY */}
          {!isOtpLogin && isRegister && step === "verify-otp" && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <Lock className="text-gray-400" size={18} />
                </div>

                <input
                  type="text"
                  placeholder="Enter 6 digit OTP"
                  value={form.otp}
                  maxLength={6}
                  className={`${theme.input} pl-10 text-center tracking-widest`}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      otp: e.target.value.replace(/\D/g, ""),
                    });

                    setError("");
                  }}
                />
              </div>

              {fieldError.otp && (
                <p className="text-red-500 text-xs">{fieldError.otp}</p>
              )}

              <button
                type="button"
                onClick={() => handleSendOTP(otpMethod)}
                disabled={loading}
                className="w-full text-blue-500 text-sm flex justify-center items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                Resend OTP
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${theme.button} py-3 rounded-xl cursor-pointer`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {/* SECOND FIELD */}
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
                  onChange={(e) => {
                    setForm({
                      ...form,
                      contact: e.target.value,
                    });

                    setError("");
                  }}
                />
              </div>

              {fieldError.contact && (
                <p className="text-red-500 text-xs">{fieldError.contact}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${theme.button}  py-3 rounded-xl cursor-pointer`}
              >
                {loading ? "Please wait..." : "Continue"}
              </button>
            </div>
          )}

          {/* QR LOGIN */}
          {!isOtpLogin && step === "input" && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleGenerateQR}
                className="text-blue-500 text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <QrCode size={16} />
                Login with QR Code
              </button>
            </div>
          )}

          {/* QR DISPLAY */}
          {qrData && (
            <div className="text-center">
              <img src={qrData.qrCode} alt="QR Code" className="mx-auto mb-2" />

              <p className="text-sm text-gray-600">
                Scan with your mobile device
              </p>
            </div>
          )}

          {/* GOOGLE */}
          {!isOtpLogin && step === "input" && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={`w-full ${theme.card} ${theme.border} py-3 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:opacity-90 transition`}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />

              <span>Continue with Google</span>
            </button>
          )}

          {/* SOCIAL LOGIN */}
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
                  className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                >
                  <FaTelegram size={20} />
                </button>

                <button
                  onClick={() => navigate("/login/whatsapp")}
                  className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                >
                  <FaWhatsapp size={20} />
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
