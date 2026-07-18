import { NavLink } from "react-router-dom";
import { ADMIN_ROUTE } from "../../../shared/constants";

const navItems = [
  { label: "Dashboard", path: ADMIN_ROUTE },
  {
    label: "Services",
    path: `${ADMIN_ROUTE}/services`,
  },
  {
    label: "Industries",
    path: `${ADMIN_ROUTE}/industries`,
  },
  {
    label: "Case Studies",
    path: `${ADMIN_ROUTE}/case-studies`,
  },
  {
    label: "Technology",
    path: `${ADMIN_ROUTE}/technology`,
  },
  {
    label: "Products",
    path: `${ADMIN_ROUTE}/products`,
  },
  {
    label: "Client Testimonials",
    path: `${ADMIN_ROUTE}/testimonials`,
  },
  {
    label: "Hero Visual",
    path: `${ADMIN_ROUTE}/hero-visual`,
  },
  {
    label: "Leads",
    path: `${ADMIN_ROUTE}/leads`,
  },
  {
    label: "Media Library",
    path: `${ADMIN_ROUTE}/media-library`,
  },
  {
    label: "SEO",
    path: `${ADMIN_ROUTE}/seo`,
  },
];

const Sidebar = ({ onNavigate }) => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <span className="logo-icon">TS</span>
        <div>
          <h1>TechnoSthan</h1>
          <p>Enterprise CMS workspace</p>
        </div>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ADMIN_ROUTE}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
