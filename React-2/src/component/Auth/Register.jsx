import React, { useEffect, useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { getDashboardPath, setAuth } from "../../utils/auth";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    adminCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const { data } = await api.post("/api/auth/register", {
        name: form.name,
        email: form.email.trim(),
        password: form.password,
        adminCode: form.adminCode || "",
      });

      setAuth({ token: data.data.token, user: data.data.user });
      navigate(getDashboardPath(data.data.user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError("");
    window.location.href = `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Create Account</h1>
        <p>Join TechnoSthan</p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="adminCode"
            placeholder="Admin Code (optional)"
            value={form.adminCode}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <button className="google-btn" onClick={handleGoogleLogin} disabled={googleLoading}>
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <p className="switch-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
