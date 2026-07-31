import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiShield } from "react-icons/fi";

import AuthForm from "../components/AuthForm";
import { loginUser } from "../../../api/auth.api";
import useAuth from "../../../shared/hooks/useAuth";
import { DASHBOARD_ROUTE, PROFILE_ROUTE } from "../../../shared/constants";
import Navbar from "../../../shared/components/Navbar";
import { getLandingRouteForUser } from "../../../shared/utils";

import "../styles/auth.css";

const isSafeRequestedRoute = (route, role) => {
  if (!route) {
    return false;
  }

  if (route === "/login" || route === "/register") {
    return false;
  }

  if (role === "admin") {
    return route.startsWith("/admin");
  }

  return route === DASHBOARD_ROUTE || route === PROFILE_ROUTE;
};

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (values) => {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      const token = response.data?.data?.token;
      const user = response.data?.data?.user;
      const databaseRole = user?.role?.toLowerCase();

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      if (!databaseRole) {
        throw new Error("User role is missing");
      }

      login(token, user);
      toast.success("Logged in successfully");

      const requestedRoute = location.state?.from?.pathname;
      const destination = isSafeRequestedRoute(requestedRoute, databaseRole)
        ? requestedRoute
        : getLandingRouteForUser(user);

      navigate(destination, {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to log in. Please check your credentials.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <Navbar />

      <main className="auth-page">
        <div className="auth-decoration auth-decoration-left" />
        <div className="auth-decoration auth-decoration-right" />

        <section className="auth-container">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="auth-logo-icon">
                <FiShield />
              </div>

              <div>
                <strong>TechnoSthan</strong>
                <span>Secure Account Portal</span>
              </div>
            </div>

            <div className="auth-heading">
              <h1>Welcome back</h1>
              <p>Sign in to continue to your TechnoSthan account.</p>
            </div>

            <AuthForm
              mode="login"
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />

            <div className="auth-footer">
              <span>New to TechnoSthan?</span>
              <Link to="/register">Create an account</Link>
            </div>
          </div>

          <p className="auth-copyright">
            © {new Date().getFullYear()} TechnoSthan. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
