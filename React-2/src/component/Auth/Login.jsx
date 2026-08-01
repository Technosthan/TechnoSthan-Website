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
} from "lucide-react";
import { FaMicrosoft } from "react-icons/fa";
import { SiGithub } from "react-icons/si";
import api from "../../lib/api";
import { getDashboardPath, setAuth } from "../../utils/auth";
import AuthLayout from "./AuthLayout";
import GoogleIcon from "./GoogleIcon";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");
    const redirectPath = urlParams.get("redirect");

    if (token && user) {
      const userData = JSON.parse(decodeURIComponent(user));
      setAuth({ token, user: userData });
      navigate(redirectPath || getDashboardPath(userData.role), {
        replace: true,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const resolveFieldError = (message = "") => {
    const normalized = String(message).toLowerCase();

    if (normalized.includes("email")) {
      return "email";
    }
    if (normalized.includes("password")) {
      return "password";
    }

    return "";
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
  };

  const handleLogin = async (e) => {
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

      const { data } = await api.post("/api/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      setAuth({ token: data.data.token, user: data.data.user });
      navigate(getDashboardPath(data.data.user.role), {
        replace: true,
      });
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
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

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setError("");
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError("");
    window.location.href = `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/auth/google`;
  };

  const socialProviders = [
    {
      key: "google",
      label: "Google",
      icon: <GoogleIcon />,
      onClick: handleGoogleLogin,
      disabled: false,
    },
    {
      key: "github",
      label: "GitHub",
      icon: <SiGithub size={20} />,
      disabled: true,
      title: "Coming soon",
    },
    {
      key: "microsoft",
      label: "Microsoft",
      icon: <FaMicrosoft size={20} />,
      disabled: true,
      title: "Coming soon",
    },
  ];

  const submitLabel = loading ? "Signing in..." : "Login";

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to your TechnoSthan workspace"
      trustMessage="Trusted by teams that value secure access, stable workflows, and a polished digital experience."
    >
      <form className="auth-form" onSubmit={handleLogin} noValidate>
        {error && <div className="auth-form__banner">{error}</div>}

        <div className="auth-field">
          <label htmlFor="login-email">Email</label>
          <div className={`auth-input ${fieldErrors.email ? "is-error" : ""}`}>
            <Mail size={17} />
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@technosthan.com"
              value={form.email}
              onChange={handleChange("email")}
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
          <label htmlFor="login-password">Password</label>
          <div
            className={`auth-input ${fieldErrors.password ? "is-error" : ""}`}
          >
            <Lock size={17} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange("password")}
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

        <div className="auth-form__meta">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember Me</span>
          </label>

          <Link className="auth-link" to="/forgot-password">
            Forgot Password?
          </Link>
        </div>

        <button className="auth-button" type="submit" disabled={loading}>
          <span>{submitLabel}</span>
          {loading ? <LoaderCircle size={18} className="spin" /> : null}
        </button>
      </form>

      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      <div className="auth-social-row">
        {socialProviders.map((provider) => (
          <button
            key={provider.key}
            type="button"
            className="auth-social-btn auth-social-btn--provider"
            onClick={provider.onClick}
            disabled={provider.disabled || (provider.key === "google" && googleLoading)}
            title={provider.title || ""}
          >
            {provider.icon}
            <span>
              {provider.key === "google" && googleLoading
                ? "Connecting..."
                : provider.label}
            </span>
          </button>
        ))}
      </div>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/register">Create Account</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
