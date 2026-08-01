import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useAuth } from "../features/auth/useAuth";
import AuthLayout from "../components/AuthLayout";
import { useTheme } from "../contexts/ThemeContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { requestPasswordReset, loading } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await requestPasswordReset(email);
      setMessage("Password reset link has been sent to your email.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we’ll send you a link to reset your password."
      footerNote="Use the same account email that you already registered with."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={theme.input}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {error ? (
          <div className="status-badge rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            <ShieldCheck className="inline-block align-text-bottom" size={16} />
            <span className="ml-2">{error}</span>
          </div>
        ) : null}

        {message ? (
          <div className="status-badge rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
            <ShieldCheck className="inline-block align-text-bottom" size={16} />
            <span className="ml-2">{message}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={`primary-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.button}`}
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Mail size={18} />}
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <div className="text-center">
          <Link to="/login" className={theme.link}>
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
