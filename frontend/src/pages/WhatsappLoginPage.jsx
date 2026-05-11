import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendLoginOtp } from "../features/auth/authApi";
import { useAuth } from "../features/auth/useAuth";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { FaWhatsapp } from "react-icons/fa";

const WhatsappLoginPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

    // Exact 10 digit validation
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

      // Resend cooldown
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
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
      await verifyLoginOTPFunc({
        phone,
        otp,
        method: "whatsapp",
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid OTP");
    }

    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${theme.bg} ${theme.text}`}
    >
      <div className={`max-w-md w-full ${theme.card} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/login")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center">
            <FaWhatsapp className="text-green-500 mr-2" size={24} />
            <h2 className="text-xl font-semibold">
              Login with WhatsApp
            </h2>
          </div>
        </div>

        {step === "phone" && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your phone number to receive OTP on WhatsApp
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
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${theme.input}`}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">
                  {error}
                </p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading || !phone.trim()}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

        {step === "otp" && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the OTP sent to your WhatsApp
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest ${theme.input}`}
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">
                  {error}
                </p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                  className="flex-1 text-green-500 hover:text-green-600 py-2 text-sm transition"
                >
                  Change Phone Number
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
                    className="flex-1 text-green-500 hover:text-green-600 py-2 text-sm transition"
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

export default WhatsappLoginPage;