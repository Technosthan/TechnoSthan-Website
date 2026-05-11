import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendLoginOtp } from "../features/auth/authApi";
import { useAuth } from "../features/auth/useAuth";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { FaTelegramPlane } from "react-icons/fa";

const TelegramLoginPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // 'phone', 'not-linked', or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [botLink, setBotLink] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [botStarted, setBotStarted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const { verifyLoginOTPFunc } = useAuth();
  const { theme } = useTheme();

  const handleSendOtp = async () => {
    const cleanPhone = phone.trim();

    // Empty validation
    if (!cleanPhone) {
      setError("Phone number is required");
      return;
    }

    // Only digits validation
    if (!/^\d+$/.test(cleanPhone)) {
      setError("Phone number must contain only numbers");
      return;
    }

    // Length validation
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

      // Check if Telegram is not linked (comes as 200 success with flag)
      if (response.data?.telegramNotLinked === true) {
        setBotLink(response.data.botLink);
        setLinkCode(response.data.linkCode || "");
        setBotStarted(false);
        setStep("not-linked");
      } else if (response.data?.success === true) {
        // OTP sent successfully
        setStep("otp");

        // Set resend cooldown
        setResendCooldown(60);

        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      // Also check error response in case it comes as error
      if (err.response?.data?.telegramNotLinked === true) {
        setBotLink(err.response.data.botLink);
        setLinkCode(err.response.data.linkCode || "");
        setBotStarted(false);
        setStep("not-linked");
      } else {
        setError(err.response?.data?.message || "Failed to send OTP");
      }
    }

    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    // Empty OTP validation
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    // OTP only numbers
    if (!/^\d+$/.test(otp)) {
      setError("OTP must contain only numbers");
      return;
    }

    // OTP length validation
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
    }

    setLoading(false);
  };

  const openTelegramBot = () => {
    window.open(botLink, "_blank");
  };

  const handleBotStarted = () => {
    setBotStarted(true);

    // After a short delay, try sending OTP again
    setTimeout(() => {
      handleSendOtp();
    }, 1000);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${theme.bg} ${theme.text}`}
    >
      <div className={`max-w-md w-full ${theme.card} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/login")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center">
            <FaTelegramPlane className="text-blue-500 mr-2" size={24} />
            <h2 className="text-xl font-semibold">Login with Telegram</h2>
          </div>
        </div>

        {step === "phone" && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your phone number to receive OTP on Telegram
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    className="absolute left-3 top-3 text-gray-400"
                    size={16}
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.input}`}
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading || !phone.trim()}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⟳</span>
                    Sending...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          </div>
        )}

        {step === "not-linked" && (
          <div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">
                ⚠️ Telegram Account Not Connected
              </p>

              <p className="text-xs text-amber-700 dark:text-amber-300">
                Please start our Telegram bot first to receive OTP. It's quick
                and secure!
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={openTelegramBot}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                <ExternalLink size={18} />
                Open Telegram Bot
              </button>

              {linkCode && (
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300 mb-2">
                    Linking Code
                  </p>

                  <p className="text-lg font-semibold tracking-widest text-blue-900 dark:text-blue-100">
                    {linkCode}
                  </p>

                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    Send{" "}
                    <span className="font-semibold">
                      /link {linkCode}
                    </span>{" "}
                    to the bot after pressing Start.
                  </p>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${theme.card}`}>
                    After starting the bot
                  </span>
                </div>
              </div>

              {!botStarted ? (
                <button
                  onClick={handleBotStarted}
                  className="w-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2 rounded-lg font-medium transition"
                >
                  I Have Started the Bot
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 py-2">
                  <CheckCircle size={18} />
                  <span className="text-sm">Retrying...</span>
                </div>
              )}

              <button
                onClick={() => {
                  setStep("phone");
                  setPhone("");
                  setError("");
                  setLinkCode("");
                  setBotStarted(false);
                }}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 text-sm transition"
              >
                Use Different Phone Number
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Need help? Contact support@agritech.com
            </p>
          </div>
        )}

        {step === "otp" && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the OTP sent to your Telegram
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  OTP
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest ${theme.input}`}
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⟳</span>
                    Verifying...
                  </span>
                ) : (
                  "Verify & Login"
                )}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                  }}
                  className="flex-1 text-blue-500 hover:text-blue-600 py-2 text-sm transition"
                >
                  Change Phone
                </button>

                {resendCooldown > 0 ? (
                  <button
                    disabled
                    className="flex-1 text-gray-400 py-2 text-sm cursor-not-allowed"
                  >
                    Resend OTP ({resendCooldown}s)
                  </button>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    className="flex-1 text-blue-500 hover:text-blue-600 py-2 text-sm transition"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramLoginPage;