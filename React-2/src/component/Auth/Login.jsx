import React, { useState, useEffect } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "", // email OR phone
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // GOOGLE CALLBACK
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);

      const userData = JSON.parse(decodeURIComponent(user));

      alert(`Welcome ${userData.name}!`);

      navigate(userData.role === "admin" ? "/admin" : "/");

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Convert identifier to email format for backend
      const loginData = {
        email: form.identifier,
        password: form.password
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/auth/login`,
        loginData
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate(res.data.user.role === "admin" ? "/admin" : "/");

    } catch (err) {
      //  SIGNUP SUGGESTION
      setError(
        "Invalid Email/Phone or Password . Don’t have an account? Sign up first."
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

        {/* ERROR */}
        {error && (
          <div className="error-box">
            <p>{error}</p>

            {/*ONLY SUGGESTION LINK */}
            <span
              className="signup-link"
              onClick={() => navigate("/register")}
            >
              Create Account →
            </span>
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* EMAIL / PHONE INPUT */}
          <input
            type="text"
            placeholder="Email or Phone Number"
            required
            onChange={(e) =>
              setForm({ ...form, identifier: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button type="submit">
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default Login;