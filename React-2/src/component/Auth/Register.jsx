import React, { useEffect, useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailWarning,
  LoaderCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import api from "../../lib/api";
import { getDashboardPath, setAuth } from "../../utils/auth";
import AuthLayout from "./AuthLayout";
import GoogleIcon from "./GoogleIcon";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setError("");
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");
    const errorParam = urlParams.get("error");
    const redirectPath = urlParams.get("redirect");

    if (errorParam) {
      setError("Google authentication failed. Please try again.");
      setGoogleLoading(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (token && user) {
      const userData = JSON.parse(decodeURIComponent(user));
      setAuth({ token, user: userData });
      navigate(redirectPath || getDashboardPath(userData.role), { replace: true });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const resolveFieldError = (message = "") => {
    const normalized = String(message).toLowerCase();

    if (normalized.includes("name")) {
      return "name";
    }
    if (normalized.includes("email")) {
      return "email";
    }
    if (normalized.includes("confirm")) {
      return "confirmPassword";
    }
    if (normalized.includes("admin")) {
      return "adminCode";
    }
    if (normalized.includes("password")) {
      return "password";
    }

    return "";
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!acceptTerms) {
      nextErrors.terms = "Please accept the Terms and Privacy policy.";
    }

    return nextErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      const { data } = await api.post("/api/auth/register", {
        name: form.name,
        email: form.email.trim(),
        password: form.password,
        adminCode: form.adminCode || "",
      });

      setAuth({ token: data.data.token, user: data.data.user });
      navigate(getDashboardPath(data.data.user.role), { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed.";
      const field = resolveFieldError(message);

      if (field) {
        setFieldErrors({ [field]: message });
        setError("");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError("");
    window.location.href = `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/auth/google`;
  };

  const submitLabel = loading ? "Creating account..." : "Create Account";

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Set up your TechnoSthan workspace in a few quick steps"
      trustMessage="Join a secure, modern platform built to keep your workspace organized, reliable, and ready for growth."
    >
      <form className="auth-form" onSubmit={handleRegister} noValidate>
        {error && <div className="auth-form__banner">{error}</div>}

        <div className="auth-field">
          <label htmlFor="register-name">Full Name</label>
          <div className={`auth-input ${fieldErrors.name ? "is-error" : ""}`}>
            <UserRound size={17} />
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          {fieldErrors.name && (
            <p className="auth-field__error">
              <MailWarning size={14} />
              <span>{fieldErrors.name}</span>
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Email</label>
          <div className={`auth-input ${fieldErrors.email ? "is-error" : ""}`}>
            <Mail size={17} />
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@technosthan.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          {fieldErrors.email && (
            <p className="auth-field__error">
              <MailWarning size={14} />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="register-password">Password</label>
          <div
            className={`auth-input ${fieldErrors.password ? "is-error" : ""}`}
          >
            <Lock size={17} />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="Create a password"
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
          <label htmlFor="register-confirm-password">Confirm Password</label>
          <div
            className={`auth-input ${fieldErrors.confirmPassword ? "is-error" : ""}`}
          >
            <Lock size={17} />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter your password"
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

        <div className="auth-field">
          <label htmlFor="register-admin-code">Admin Code</label>
          <div className={`auth-input ${fieldErrors.adminCode ? "is-error" : ""}`}>
            <ShieldCheck size={17} />
            <input
              id="register-admin-code"
              type="password"
              name="adminCode"
              autoComplete="off"
              placeholder="Optional admin code"
              value={form.adminCode}
              onChange={handleChange}
            />
          </div>
          {fieldErrors.adminCode && (
            <p className="auth-field__error">
              <MailWarning size={14} />
              <span>{fieldErrors.adminCode}</span>
            </p>
          )}
        </div>

        <label className="auth-check auth-check--terms">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => {
              setAcceptTerms(event.target.checked);
              setFieldErrors((current) => ({ ...current, terms: "" }));
              setError("");
            }}
          />
          <span>
            I agree to the Terms and Privacy Policy
          </span>
        </label>
        {fieldErrors.terms && (
          <p className="auth-field__error auth-field__error--standalone">
            <MailWarning size={14} />
            <span>{fieldErrors.terms}</span>
          </p>
        )}

        <button className="auth-button" type="submit" disabled={loading}>
          <span>{submitLabel}</span>
          {loading ? <LoaderCircle size={18} className="spin" /> : null}
        </button>
      </form>

      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      <button
      type="button"
      className="auth-social-btn"
      onClick={handleGoogleLogin}
      disabled={googleLoading}
    >
        <GoogleIcon />
        <span>{googleLoading ? "Connecting to Google..." : "Google signup"}</span>
      </button>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
