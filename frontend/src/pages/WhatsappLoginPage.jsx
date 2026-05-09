import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendLoginOtp } from "../features/auth/authApi";
import { useAuth } from "../features/auth/useAuth";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const WhatsappLoginPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { verifyLoginOTPFunc } = useAuth();
  const { theme } = useTheme();

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendLoginOtp({ phone, method: "whatsapp" });
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyLoginOTPFunc({ phone, otp, method: "whatsapp" });
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
            <MessageCircle className="text-green-500 mr-2" size={24} />
            <h2 className="text-xl font-semibold">Login with WhatsApp</h2>
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
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${theme.input}`}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
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
                <label className="block text-sm font-medium mb-2">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${theme.input}`}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button
                onClick={() => setStep("phone")}
                className="w-full text-green-500 py-2"
              >
                Change Phone Number
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsappLoginPage;
