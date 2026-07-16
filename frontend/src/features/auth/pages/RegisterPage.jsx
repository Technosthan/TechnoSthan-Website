import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiUserPlus } from "react-icons/fi";

import AuthForm from "../components/AuthForm";
import { registerStudent } from "../../../api/auth.api";
import useAuth from "../../../shared/hooks/useAuth";
import Navbar from "../../../shared/components/Navbar";
import { getLandingRouteForUser } from "../../../shared/utils";

import "../styles/auth.css";


const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values) => {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await registerStudent({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      const token = response.data?.data?.token;
      const user = response.data?.data?.user;

      if (!token) {
        throw new Error("Token missing from response");
      }

      login(token, user);
      toast.success("Account created successfully");

      navigate(getLandingRouteForUser(user), {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create your account right now.";

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
                <FiUserPlus />
              </div>

              <div>
                <strong>TechnoSthan</strong>
                <span>Create your account</span>
              </div>
            </div>

            <div className="auth-heading">
              <h1>Create your account</h1>
              <p>
                Join TechnoSthan and get started with your
                account.
              </p>
            </div>

            <AuthForm
              mode="register"
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />

            <div className="auth-footer">
              <span>Already have an account?</span>
              <Link to="/login">Sign in</Link>
            </div>
          </div>

          <p className="auth-copyright">
            © {new Date().getFullYear()} TechnoSthan. All
            rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
