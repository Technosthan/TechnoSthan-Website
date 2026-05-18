import React, { useEffect, useState } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { getDashboardPath, setAuth } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const { data } = await api.post("/api/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      setAuth({ token: data.data.token, user: data.data.user });
      navigate(getDashboardPath(data.data.user.role), {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Connect-With-TechnoSthan</h1>
        <p>Login to continue</p>

        {error && (
          <div className="error-box">
            <p>{error}</p>
            <span className="signup-link" onClick={() => navigate("/register")}>
              Create Account {"->"}
            </span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
