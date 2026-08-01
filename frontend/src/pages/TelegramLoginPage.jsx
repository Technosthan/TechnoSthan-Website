import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTelegram } from "react-icons/fa";
import { ArrowLeft, CheckCircle, ExternalLink, MessageSquare, Phone, RefreshCw } from "lucide-react";
import { sendLoginOtp } from "../features/auth/authApi";
import { useAuth } from "../features/auth/useAuth";
import AuthLayout from "../components/AuthLayout";
import { useTheme } from "../contexts/ThemeContext";

const TelegramLoginPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [botLink, setBotLink] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [botStarted, setBotStarted] = useState(false);
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
      const response = await sendLoginOtp({
        phone: cleanPhone,
        method: "telegram",
      });

      if (response.data?.telegramNotLinked === true) {
        setBotLink(response.data.botLink);
        setLinkCode(response.data.linkCode || "");
        setBotStarted(false);
        setStep("not-linked");
      } else if (response.data?.success === true) {
        setStep("otp");
        setResendCooldown(60);
      }
    } catch (err) {
      if (err.response?.data?.telegramNotLinked === true) {
        setBotLink(err.response.data.botLink);
        setLinkCode(err.response.data.linkCode || "");
        setBotStarted(false);
        setStep("not-linked");
      } else {
        setError(err.response?.data?.message || "Failed to send OTP");
      }
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
      await verifyLoginOTPFunc({ phone, otp, method: "telegram" });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const openTelegramBot = () => {
    window.open(botLink, "_blank");
  };

  const handleBotStarted = () => {
    setBotStarted(true);
    setTimeout(() => {
      handleSendOtp();
    }, 1000);
  };

  return (
    <AuthLayout
      title="Login with Telegram"
      subtitle="Use your Telegram-linked phone number to receive and verify a login OTP."
      footerNote="This keeps the existing Telegram OTP flow and backend checks unchanged."
    >
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} />
        Back to login
      </button>

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-200">
        <FaTelegram className="shrink-0 text-blue-500" size={20} />
        <span>Telegram-based login requires a connected Telegram bot account.</span>
      </div>

      {step === "phone" && (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter your phone number to receive OTP on Telegram.
          </p>

          <div>
            <label htmlFor="telegram-phone" className="mb-2 block text-sm font-medium">
              Phone number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="telegram-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                className={`${theme.input} pl-11`}
                placeholder="9876543210"
                maxLength={10}
                disabled={loading}
              />
            </div>
          </div>

          {error ? (
            <p className="text-sm font-medium text-red-500">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || !phone.trim()}
            className={`primary-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <MessageSquare size={18} />}
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === "not-linked" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
            <p className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
              Telegram account not connected
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Please start our Telegram bot first to receive OTP. It’s quick and secure.
            </p>
          </div>

          <button
            type="button"
            onClick={openTelegramBot}
            className={`secondary-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.buttonSecondary}`}
          >
            <ExternalLink size={18} />
            Open Telegram Bot
          </button>

          {linkCode ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="mb-2 text-xs uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
                Linking code
              </p>
              <p className="text-lg font-semibold tracking-[0.3em] text-blue-900 dark:text-blue-100">
                {linkCode}
              </p>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                Send <span className="font-semibold">/link {linkCode}</span> to the bot after pressing Start.
              </p>
            </div>
          ) : null}

          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`${theme.surface} px-3 ${theme.textSecondary}`}>
                After starting the bot
              </span>
            </div>
          </div>

          {!botStarted ? (
            <button
              type="button"
              onClick={handleBotStarted}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-500 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/20"
            >
              I have started the bot
            </button>
          ) : (
            <div className="flex items-center gap-2 py-2 text-green-600 dark:text-green-400">
              <CheckCircle size={18} />
              <span className="text-sm">Retrying...</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setPhone("");
              setError("");
              setLinkCode("");
              setBotStarted(false);
            }}
            className="w-full py-2 text-sm text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Use different phone number
          </button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Need help? Contact support@agritech.com
          </p>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter the OTP sent to your Telegram.
          </p>

          <div>
            <label htmlFor="telegram-otp" className="mb-2 block text-sm font-medium">
              OTP
            </label>
            <input
              id="telegram-otp"
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
                className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-900/20"
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

export default TelegramLoginPage;
