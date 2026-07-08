import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../../shared/constants/routes";

const PaymentSuccess = () => {
  const location = useLocation();
  const programTitle = location.state?.programTitle || "your program";
  const amount = location.state?.amount;

  return (
    <section className="section">
      <div className="container">
        <div className="card glass success-card">
          <p className="badge">Enrollment complete</p>
          <h1>Payment successful</h1>
          <p className="muted-copy">
            You are now enrolled in {programTitle}
            {amount ? ` for ₹${Number(amount).toLocaleString("en-IN")}` : ""}.
          </p>
          <div className="hero-actions">
            <Link to={ROUTES.DASHBOARD} className="btn btn-primary">
              Go to Dashboard
            </Link>
            <Link to={ROUTES.PROGRAMS} className="btn btn-secondary">
              Browse More Programs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;
