import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/hooks/useAuth";

const initialState = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  category: "Student",
  termsAccepted: false,
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.termsAccepted) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const session = await register({
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        category: form.category,
      });
      navigate(session.user?.role === "ADMIN" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section auth-section">
      <div className="container auth-shell">
        <div className="auth-intro glass">
          <p className="badge">Create your account</p>
          <h1>Join TechnoSthan Innovation Hub.</h1>
          <p className="muted-copy">
            Register once and use the same profile for enrollments, dashboard access, and payment history.
          </p>
        </div>

        <form className="auth-card glass" onSubmit={handleSubmit}>
          <h2>Register</h2>
          <div className="grid auth-two-col">
            <label className="field">
              <span>Full Name</span>
              <input className="input" name="fullName" value={form.fullName} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Mobile Number</span>
              <input className="input" name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" className="input" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Category</span>
              <select className="select" name="category" value={form.category} onChange={handleChange}>
                <option>Student</option>
                <option>Working Professional</option>
                <option>Startup Founder</option>
                <option>Faculty</option>
                <option>Industry Partner</option>
                <option>Other</option>
              </select>
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" className="input" name="password" value={form.password} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Confirm Password</span>
              <input type="password" className="input" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
            </label>
          </div>

          <label className="checkbox-row auth-terms">
            <input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={handleChange} />
            <span>I agree to Terms & Conditions</span>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div className="auth-footer-note">
            <Link to="/login" className="auth-link">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Register;
