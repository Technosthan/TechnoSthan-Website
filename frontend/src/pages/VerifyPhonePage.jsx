import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyOTP, sendOTP } from "../features/auth/authApi";
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
      setError(
        err.response?.data?.message || err.message || "Verification failed",
      );
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
          <h2 className="text-2xl font-semibold">Verify Phone</h2>
          <p className={theme.textSecondary}>
            Enter the 6-digit code sent to your phone
          </p>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm flex items-center gap-2">
            <XCircle size={16} />
            {error}
          </div>
        )}

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
            {loading ? "Verifying..." : "Verify Phone"}
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
      </div>
    </div>
  );
};

export default VerifyPhonePage;
