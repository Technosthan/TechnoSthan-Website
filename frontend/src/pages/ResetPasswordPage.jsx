import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { useAuth } from "../features/auth/useAuth";
import AuthLayout from "../components/AuthLayout";
import { useTheme } from "../contexts/ThemeContext";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { resetUserPassword, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { theme } = useTheme();

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await resetUserPassword(token, password);
      setMessage(
        "Password has been reset successfully. You can now log in with your new password.",
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="The password reset link is invalid or has expired."
      >
        <div className="space-y-5">
          <div className="status-badge rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            <ShieldCheck className="inline-block align-text-bottom" size={16} />
            <span className="ml-2">{error || "Invalid reset link."}</span>
          </div>

          <Link
            to="/forgot-password"
            className={`secondary-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${theme.buttonSecondary}`}
          >
            Request a new password reset
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Choose a new password and use it for your next sign-in."
      footerNote="Use a strong password that you can remember safely."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            New password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={theme.input}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium"
          >
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={theme.input}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
