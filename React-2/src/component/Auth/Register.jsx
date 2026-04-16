import React, { useState, useEffect } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    identifier: "", // 🔥 email OR phone
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // GOOGLE CALLBACK
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError("Google authentication failed. Please try again.");
      setGoogleLoading(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    } 
    else if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);

      const userData = JSON.parse(decodeURIComponent(user));

      alert(`Welcome ${userData.name}! Account created successfully.`);

      navigate(userData.role === "admin" ? "/admin" : "/");

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      alert("Registration successful! Please login.");
      navigate("/login");

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError("");
    window.location.href = "http://localhost:5000/api/auth/google";
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

          {/* 🔥 UPDATED INPUT */}
          <input
            type="text"
            name="identifier"
            placeholder="Email or Phone Number"
            required
            value={form.identifier}
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

          <button type="submit">
            {loading ? "Signing up..." : "Sign Up"}
          </button>

        </form>

        <button 
          className="google-btn" 
          onClick={handleGoogleLogin} 
          disabled={googleLoading}
        >
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