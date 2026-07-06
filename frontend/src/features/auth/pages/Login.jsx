import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, PhoneCall, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await login(form);
      const redirectTo =
        location.state?.from ||
        (session.user?.role === "ADMIN" ? "/admin" : "/dashboard");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const continueWithTechnoSthan = () => {
    window.location.href =
      import.meta.env.VITE_TECHNOSTHAN_AUTH_URL || "https://technosthan.com/login";
  };

  return (
    <section className="section auth-section">
      <div className="container auth-shell">
        <div className="auth-intro glass">
          <p className="badge">Welcome back</p>
          <h1>Sign in to your TechnoSthan Innovation Hub account.</h1>
          <p className="muted-copy">
            Access your dashboard, enrolled programs, payment history, and profile from one secure account.
          </p>

          <div className="auth-points">
            <div className="auth-point">
              <Mail size={18} />
              <span>Email or mobile login</span>
            </div>
            <div className="auth-point">
              <PhoneCall size={18} />
              <span>Works on desktop and mobile</span>
            </div>
            <div className="auth-point">
              <ShieldCheck size={18} />
              <span>Role-based dashboard access</span>
            </div>
          </div>
        </div>

        <form className="auth-card glass" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <label className="field">
            <span>Email or Mobile Number</span>
            <input
              name="emailOrPhone"
              className="input"
              value={form.emailOrPhone}
              onChange={handleChange}
              placeholder="you@example.com or 9876543210"
              autoComplete="username"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              className="input"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="auth-row-between">
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
            <Link to="/register" className="auth-link">
              Don&apos;t have an account? Register Now
            </Link>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <button
            type="button"
            className="btn btn-secondary auth-alt-btn"
            onClick={continueWithTechnoSthan}
          >
            Continue with TechnoSthan Account
          </button>

        </form>
      </div>
    </section>
  );
};

export default Login;
