import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth";
import { sendOTP, verifyOTP } from "../features/auth/authApi";
import { useTheme } from "../contexts/ThemeContext";
import AuthLayout from "../components/AuthLayout";

const getSafeAuthMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  const message = error?.response?.data?.message || error?.message || "";
  if (
    /E11000|duplicate key|MongoServerError|ValidationError|index:/i.test(message)
  ) {
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

  const authSubtitle = useMemo(() => {
    if (isOtpLogin) {
      return "Use OTP to access your farmer support and learning account.";
    }

    return "Login with password or choose one of the existing secure sign-in methods.";
  }, [isOtpLogin]);

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

      const getRecaptchaToken = async () => {
        try {
          const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
          if (!siteKey) return null;

          if (!window.grecaptcha) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
              script.async = true;
              script.defer = true;
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          if (window.grecaptcha && window.grecaptcha.execute) {
            return await new Promise((resolve) => {
              window.grecaptcha.ready(() => {
                window.grecaptcha
                  .execute(siteKey, { action: "send_otp" })
                  .then((tokenValue) => resolve(tokenValue))
                  .catch(() => resolve(null));
              });
            });
          }
        } catch (err) {
          console.warn("reCAPTCHA unavailable:", err);
        }

        return null;
      };

      const recaptchaToken = await getRecaptchaToken();
      const res = await sendOTP({
        contact,
        method,
        recaptchaToken,
      });

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

  const validate = () => {
    const errors = {};

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
        setSuccess("Account verified successfully");
        return;
      }

      if (isRegister && step === "input-second-field") {
        await handleSecondFieldSubmit(form.contact);
        setSuccess("OTP sent successfully");
        return;
      }

      const result = await authenticate({
        contact: form.contact,
        password: form.password,
      });

      if (result?.flow === "register") {
        setSuccess("Account not found. Starting registration process...");
      }

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

  const handleGenerateQR = async () => {
    setError("");

    try {
      const qr = await generateQR();
      setQrData(qr);
    } catch (err) {
      setError(getSafeAuthMessage(err, "Failed to generate QR code"));
    }
  };

  const toggleOtpLogin = () => {
    setIsOtpLogin((current) => !current);
    setIsOtpSent(false);
    setContact("");
    setOtp("");
    setError("");
    setSuccess("");

    if (isOtpLogin) {
      resetFlow();
      setForm((prev) => ({
        ...prev,
        otp: "",
      }));
    }
  };

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
      return `Enter OTP sent to your ${inputType === "email" ? "email" : "phone"}`;
    }

    if (step === "input-second-field") {
      return inputType === "email"
        ? "Enter phone number"
        : "Enter email address";
    }

    return "Welcome";
  };

  const renderMainForm = () => (
    <div className="space-y-5">
      {error ? (
        <div className="status-badge rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          <XCircle className="inline-block align-text-bottom" size={16} />
          <span className="ml-2">{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="status-badge rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
          <CheckCircle className="inline-block align-text-bottom" size={16} />
          <span className="ml-2">{success}</span>
        </div>
      ) : null}

      {isOtpLogin && !isOtpSent ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="otp-contact" className="mb-2 block text-sm font-medium">
              Email or phone
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="otp-contact"
                type="text"
                placeholder="Enter email or phone"
                value={contact}
                className={`${theme.input} pl-11`}
                onChange={(e) => {
                  setContact(e.target.value);
                  setError("");
                  setSuccess("");
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpLoading}
            className={`primary-button w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
          >
            {otpLoading ? <RefreshCw className="animate-spin" size={18} /> : <MessageSquare size={18} />}
            Send OTP
          </button>
        </div>
      ) : null}

      {isOtpLogin && isOtpSent ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="otp-code" className="mb-2 block text-sm font-medium">
              OTP
            </label>
            <div className="relative">
              <Shield className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="otp-code"
                type="text"
                placeholder="Enter 6 digit OTP"
                value={otp}
                maxLength={6}
                className={`${theme.input} pl-11 text-center tracking-[0.35em]`}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError("");
                  setSuccess("");
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={otpLoading}
            className={`primary-button w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
          >
            {otpLoading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            Verify OTP
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isOtpLogin && step === "input" ? (
          <>
            <div>
              <label htmlFor="login-contact" className="mb-2 block text-sm font-medium">
                Email or phone
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="login-contact"
                  type="text"
                  placeholder="Email or Phone"
                  value={form.contact}
                  aria-invalid={Boolean(fieldError.contact)}
                  aria-describedby={fieldError.contact ? "login-contact-error" : undefined}
                  className={`${theme.input} pl-11`}
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
              {fieldError.contact ? (
                <p id="login-contact-error" className="mt-1 text-xs text-red-500">
                  {fieldError.contact}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  aria-invalid={Boolean(fieldError.password)}
                  aria-describedby={fieldError.password ? "login-password-error" : undefined}
                  className={`${theme.input} pl-11 pr-11`}
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
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldError.password ? (
                <p id="login-password-error" className="mt-1 text-xs text-red-500">
                  {fieldError.password}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`primary-button w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Please wait...
                </>
              ) : (
                "Continue"
              )}
            </button>

            <div className="flex flex-col items-center gap-3 pt-1 text-sm">
              <a
                href="/forgot-password"
                className={`${theme.link} font-medium`}
              >
                Forgot password?
              </a>

              <button
                type="button"
                onClick={toggleOtpLogin}
                className={`${theme.link} font-medium`}
              >
                Login with OTP instead
              </button>
            </div>
          </>
        ) : null}

        {!isOtpLogin && isRegister && step === "verify-otp" ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="register-otp" className="mb-2 block text-sm font-medium">
                OTP
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="register-otp"
                  type="text"
                  placeholder="Enter 6 digit OTP"
                  value={form.otp}
                  maxLength={6}
                  className={`${theme.input} pl-11 text-center tracking-[0.35em]`}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      otp: e.target.value.replace(/\D/g, ""),
                    });
                    setError("");
                  }}
                />
              </div>
            </div>

            {fieldError.otp ? (
              <p className="text-xs text-red-500">{fieldError.otp}</p>
            ) : null}

            <button
              type="button"
              onClick={() => handleSendOTP(otpMethod)}
              disabled={loading}
              className={`${theme.link} inline-flex items-center gap-2 text-sm font-medium`}
            >
              <RefreshCw size={14} />
              Resend OTP
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`primary-button w-full rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        ) : null}

        {!isOtpLogin && isRegister && step === "input-second-field" ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="secondary-contact" className="mb-2 block text-sm font-medium">
                {inputType === "email" ? "Phone number" : "Email address"}
              </label>
              <div className="relative">
                {inputType === "email" ? (
                  <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                ) : (
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                )}
                <input
                  id="secondary-contact"
                  type="text"
                  placeholder={inputType === "email" ? "Phone Number" : "Email Address"}
                  value={form.contact}
                  aria-invalid={Boolean(fieldError.contact)}
                  aria-describedby={fieldError.contact ? "secondary-contact-error" : undefined}
                  className={`${theme.input} pl-11`}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      contact: e.target.value,
                    });
                    setError("");
                  }}
                />
              </div>
              {fieldError.contact ? (
                <p id="secondary-contact-error" className="mt-1 text-xs text-red-500">
                  {fieldError.contact}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`primary-button w-full rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
            >
              {loading ? "Please wait..." : "Continue"}
            </button>
          </div>
        ) : null}

        {!isOtpLogin && step === "input" ? (
          <div className="space-y-5 pt-2">
            <button
              type="button"
              onClick={handleGenerateQR}
              className="ghost-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              <QrCode size={16} />
              Login with QR Code
            </button>

            {qrData ? (
              <div className="rounded-3xl border border-white/10 bg-black/5 p-4 text-center dark:bg-white/5">
                <img
                  src={qrData.qrCode}
                  alt="QR code for login"
                  className="mx-auto mb-3 max-h-56 rounded-2xl bg-white p-2"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Scan with your mobile device
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleGoogleLogin}
              className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${theme.card} ${theme.border}`}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                aria-hidden="true"
                className="h-5 w-5"
              />
              Continue with Google
            </button>

            <div className="pt-2">
              <div className="relative">
                <div className={`absolute inset-0 flex items-center`}>
                  <div className={`w-full border-t ${theme.border}`} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`${theme.surface} px-3 ${theme.textSecondary}`}>
                    Or login with
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/login/telegram")}
                  aria-label="Login with Telegram"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white transition hover:bg-blue-600"
                >
                  <FaTelegram size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login/whatsapp")}
                  aria-label="Login with WhatsApp"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600"
                >
                  <FaWhatsapp size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );

  return (
    <AuthLayout title={getStepTitle()} subtitle={authSubtitle}>
      {renderMainForm()}
    </AuthLayout>
  );
};

export default LoginPage;
