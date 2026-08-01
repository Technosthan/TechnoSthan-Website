import React, { useState } from "react";
import "./Auth.css";
import { Link } from "react-router-dom";
import { LoaderCircle, Mail, MailWarning } from "lucide-react";
import api from "../../lib/api";
import AuthLayout from "./AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setFieldError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      setFieldError("");

      const { data } = await api.post("/api/auth/forgot-password", {
        email: email.trim(),
      });

      setSuccessMessage(
        data?.message ||
          "If an account exists for this email, reset instructions have been sent.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send reset instructions right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive reset instructions"
      trustMessage="We’ll never reveal whether an email is registered. If an account exists, you’ll receive reset instructions securely."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {successMessage && (
          <div className="auth-form__banner auth-form__banner--success">
            {successMessage}
          </div>
        )}
        {error && <div className="auth-form__banner">{error}</div>}

        <div className="auth-field">
          <label htmlFor="forgot-email">Email</label>
          <div className={`auth-input ${fieldError ? "is-error" : ""}`}>
            <Mail size={17} />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="name@technosthan.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldError("");
                setError("");
                setSuccessMessage("");
              }}
            />
          </div>
          {fieldError && (
            <p className="auth-field__error">
              <MailWarning size={14} />
              <span>{fieldError}</span>
            </p>
          )}
        </div>

        <button className="auth-button" type="submit" disabled={loading}>
          <span>
            {loading ? "Sending..." : "Send Reset Link"}
          </span>
          {loading ? <LoaderCircle size={18} className="spin" /> : null}
        </button>
      </form>

      <p className="auth-switch">
        <Link to="/login">Back to Login</Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
