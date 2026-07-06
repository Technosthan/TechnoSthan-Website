import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <section className="section auth-section">
      <div className="container auth-shell">
        <div className="auth-intro glass">
          <p className="badge">Password help</p>
          <h1>Need help accessing your account?</h1>
          <p className="muted-copy">
            If you forgot your password, contact the TechnoSthan team or use the main account support flow to reset your credentials.
          </p>
        </div>

        <div className="auth-card glass">
          <h2>Reset options</h2>
          <p className="muted-copy">
            A dedicated reset flow can be connected here later. For now, please use the official support channel.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
