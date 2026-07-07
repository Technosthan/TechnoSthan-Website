import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFoundState = ({
  title = "Not found",
  description = "The page you requested could not be loaded.",
  primaryLabel = "Back to programs",
  primaryTo = "/programs",
  secondaryLabel = "Go home",
  secondaryTo = "/",
}) => {
  return (
    <div className="card glass not-found-card">
      <div className="not-found-icon">
        <AlertTriangle size={28} />
      </div>
      <h1>{title}</h1>
      <p className="muted-copy">{description}</p>
      <div className="program-card-actions">
        <Link to={primaryTo} className="btn btn-primary">
          {primaryLabel}
        </Link>
        <Link to={secondaryTo} className="btn btn-secondary">
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundState;
