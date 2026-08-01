import React, { useState } from "react";
import "./Auth.css";
import { Link, useParams } from "react-router-dom";
import { Eye, EyeOff, Lock, LoaderCircle, MailWarning } from "lucide-react";
import api from "../../lib/api";
import AuthLayout from "./AuthLayout";

const ResetPassword = () => {
  const { token } = useParams();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextFieldErrors = {};
    if (!form.password) {
      nextFieldErrors.password = "Password is required.";
    }
    if (!form.confirmPassword) {
      nextFieldErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      nextFieldErrors.confirmPassword = "Passwords do not match.";
    }
    if (!token) {
      nextFieldErrors.token = "Reset token is missing or invalid.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      const { data } = await api.post(
        `/api/auth/reset-password/${encodeURIComponent(token)}`,
        {
          password: form.password,
          confirmPassword: form.confirmPassword,
        },
      );

      setSuccessMessage(
        data?.message || "Password has been reset successfully.",
      );
      setForm({ password: "", confirmPassword: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create your new password to continue"
      trustMessage="Your reset link is single-use and expires automatically for security."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {successMessage && (
          <div className="auth-form__banner auth-form__banner--success">
            {successMessage}
          </div>
        )}
        {error && <div className="auth-form__banner">{error}</div>}

        <div className="auth-field">
          <label htmlFor="reset-password">New Password</label>
          <div className={`auth-input ${fieldErrors.password ? "is-error" : ""}`}>
            <Lock size={17} />
            <input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="Enter your new password"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="auth-input__toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="auth-field__error">
              <MailWarning size={14} />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="confirm-password">Confirm Password</label>
          <div
            className={`auth-input ${fieldErrors.confirmPassword ? "is-error" : ""}`}
          >
            <Lock size={17} />
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className="auth-input__toggle"
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={
                showConfirmPassword ? "Hide confirm password" : "Show confirm password"
              }
            >
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="auth-field__error">
              <MailWarning size={14} />
              <span>{fieldErrors.confirmPassword}</span>
            </p>
          )}
        </div>

        {fieldErrors.token && (
          <p className="auth-field__error auth-field__error--standalone">
            <MailWarning size={14} />
            <span>{fieldErrors.token}</span>
          </p>
        )}

        <button className="auth-button" type="submit" disabled={loading}>
          <span>{loading ? "Updating..." : "Update Password"}</span>
          {loading ? <LoaderCircle size={18} className="spin" /> : null}
        </button>
      </form>

      <p className="auth-switch">
        <Link to="/login">Back to Login</Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
