import { Link } from "react-router-dom";

export default function CTASection({
  title = "Ready to Build Something Great?",
  subtitle = "Tell us your vision and our team will shape it into a scalable product.",
  primaryLabel = "Start Your Project",
  primaryTo = "/contact",
}) {
  return (
    <section className="cta-section section-pad">
      <div className="container">
        <div className="cta-card">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <Link to={primaryTo} className="btn-primary">
            {primaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
