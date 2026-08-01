import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { ArrowLeft, CheckCircle, MessageCircle, Phone, RefreshCw } from "lucide-react";
import { sendLoginOtp } from "../features/auth/authApi";
import { useAuth } from "../features/auth/useAuth";
import AuthLayout from "../components/AuthLayout";
import { useTheme } from "../contexts/ThemeContext";

const WhatsappLoginPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const { verifyLoginOTPFunc } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;

    const interval = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setError("Phone number is required");
      return;
    }

    if (!/^\d+$/.test(cleanPhone)) {
      setError("Phone number must contain only numbers");
      return;
    }

    if (cleanPhone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendLoginOtp({
        phone: cleanPhone,
        method: "whatsapp",
      });

      setStep("otp");
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    if (!/^\d+$/.test(otp)) {
      setError("OTP must contain only numbers");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyLoginOTPFunc({
        phone,
        otp,
        method: "whatsapp",
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Login with WhatsApp"
      subtitle="Use your WhatsApp-linked phone number to receive and verify a login OTP."
      footerNote="This keeps the existing WhatsApp OTP flow and backend checks unchanged."
    >
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} />
        Back to login
      </button>

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
        <FaWhatsapp className="shrink-0 text-emerald-500" size={20} />
        <span>WhatsApp-based login uses the same secure OTP backend flow.</span>
      </div>

      {step === "phone" && (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter your phone number to receive OTP on WhatsApp.
          </p>

          <div>
            <label htmlFor="whatsapp-phone" className="mb-2 block text-sm font-medium">
              Phone number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="whatsapp-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                className={`${theme.input} pl-11`}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                disabled={loading}
              />
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || !phone.trim()}
            className={`primary-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <MessageCircle size={18} />}
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter the OTP sent to your WhatsApp.
          </p>

          <div>
            <label htmlFor="whatsapp-otp" className="mb-2 block text-sm font-medium">
              OTP
            </label>
            <input
              id="whatsapp-otp"
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className={`${theme.input} text-center text-2xl tracking-[0.4em]`}
              placeholder="000000"
              maxLength={6}
              disabled={loading}
            />
          </div>

          {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            className={`primary-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            {loading ? "Verifying..." : "Verify & login"}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
              className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Change phone
            </button>

            {resendCooldown > 0 ? (
              <button
                type="button"
                disabled
                className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-400"
              >
                Resend OTP ({resendCooldown}s)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default WhatsappLoginPage;
