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

const   VerifyEmailPage = () => {
  const {
    loading,
    handleVerifyOTP,
    handleSendOTP,
    inputValue,
    otpMethod,
    tempData,
    setInputValue,
    setInputType,
    setTempData,
    sendLoginOTP,
    verifyLoginOTPFunc,
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();

  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("verify"); // verify or enter-phone

  const purpose = searchParams.get("purpose") || "register";

  useEffect(() => {
    const contact = searchParams.get("contact");
    if (!contact) {
      navigate("/login");
      return;
    }
    setInputValue(contact);
    setInputType("email");

    if (purpose === "login") {
      sendLoginOTP(contact, "email");
    }
  }, [
    searchParams,
    navigate,
    setInputValue,
    setInputType,
    purpose,
    sendLoginOTP,
  ]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      if (purpose === "login") {
        await verifyLoginOTPFunc({ contact: inputValue, otp, method: "email" });
        navigate("/");
      } else {
        const res = await handleVerifyOTP(otp);
        if (res.registrationComplete) {
          navigate("/");
        } else {
          setStep("enter-phone");
        }
      }
    } catch (err) {
      setError(err.message || "Verification failed");
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    try {
      setInputValue(phone);
      setInputType("phone");
      setTempData((prev) => ({ ...prev, phone }));
      await handleSendOTP("sms");
      navigate("/verify-phone?contact=" + phone);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const handleResend = async () => {
    try {
      await handleSendOTP("email");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${theme.bg} ${theme.text}`}
    >
      <div
        className={`${theme.cardOpacity} p-8 rounded-3xl shadow-2xl w-full max-w-md`}
      >
        <div className="text-center mb-6">
          <Shield className={`mx-auto mb-2 ${theme.accent}`} size={28} />
          <h2 className="text-2xl font-semibold">
            {step === "verify" ? "Verify Email" : "Enter Phone Number"}
          </h2>
          <p className={theme.textSecondary}>
            {step === "verify"
              ? "Enter the 6-digit code sent to your email"
              : "Enter your phone number to complete verification"}
          </p>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm flex items-center gap-2">
            <XCircle size={16} />
            {error}
          </div>
        )}

        {step === "verify" ? (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Lock className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                className={`${theme.input} pl-10 text-center tracking-widest`}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${theme.button} py-3 rounded-xl flex justify-center items-center gap-2`}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full text-blue-500 text-sm hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Resend OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Phone className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                className={`${theme.input} pl-10`}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${theme.button} py-3 rounded-xl flex justify-center items-center gap-2`}
            >
              {loading ? "Sending..." : "Send Phone OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
