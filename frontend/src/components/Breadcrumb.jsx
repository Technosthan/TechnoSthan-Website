import { Link } from "react-router-dom";

export default function Breadcrumb({ items = [] }) {
  const trail = [{ label: "Home", path: "/" }, ...items];

  return (
    <nav className="breadcrumb container" aria-label="Breadcrumb">
      {trail.map((item, index) => {
        const isLast = index === trail.length - 1;

        return (
          <span key={`${item.label}-${index}`}>
            {isLast || !item.path ? (
              <span>{item.label}</span>
            ) : (
              <Link to={item.path}>{item.label}</Link>
            )}
            {!isLast ? <span> / </span> : null}
          </span>
        );
      })}
    </nav>
  );
}
