import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyOTP, sendOTP } from "../features/auth/authApi";
import { useAuth } from "../features/auth/useAuth";
import AuthLayout from "../components/AuthLayout";
import { useTheme } from "../contexts/ThemeContext";
import { CheckCircle, Lock, Phone, RefreshCw, Shield, XCircle } from "lucide-react";

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

const VerifyPhonePage = () => {
  const { loading, setInputValue, setInputType, inputValue } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);

  useEffect(() => {
    const contact = searchParams.get("contact");
    const pendingId = searchParams.get("pendingUserId");
    if (!contact) {
      navigate("/login");
      return;
    }
    setInputValue(contact);
    setInputType("phone");
    setPendingUserId(pendingId);
  }, [searchParams, navigate, setInputValue, setInputType]);

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
      const res = await verifyOTP({
        contact: inputValue,
        otp,
      });
      const { data } = res.data || {};
      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.removeItem("pendingUserId");
        navigate(data.user.role === "admin" ? "/admin/dashboard" : "/");
      } else {
        setError("Verification incomplete");
      }
    } catch (err) {
      setError(getSafeAuthMessage(err, "Verification failed"));
    }
  };

  const handleResend = async () => {
    try {
      await sendOTP({
        contact: inputValue,
        method: "sms",
        pendingUserId,
      });
    } catch (err) {
      setError(getSafeAuthMessage(err, "Failed to resend OTP"));
    }
  };

  return (
    <AuthLayout
      title="Verify phone"
      subtitle="Enter the 6-digit code sent to your phone."
      footerNote="This page keeps the same phone verification flow already configured."
    >
      {error ? (
        <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          <XCircle className="inline-block align-text-bottom" size={16} />
          <span className="ml-2">{error}</span>
        </div>
      ) : null}

      <form onSubmit={handleVerifySubmit} className="space-y-5">
        <div>
          <label htmlFor="verify-phone-otp" className="mb-2 block text-sm font-medium">
            OTP
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="verify-phone-otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              className={`${theme.input} pl-11 text-center tracking-[0.35em]`}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`primary-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          {loading ? "Verifying..." : "Verify phone"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className={`ghost-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${theme.link}`}
        >
          <RefreshCw size={14} />
          Resend OTP
        </button>
      </form>
    </AuthLayout>
  );
};

export default VerifyPhonePage;
