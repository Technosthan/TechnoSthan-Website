import { NavLink } from "react-router-dom";
import { ADMIN_ROUTE } from "../../../shared/constants";

const navItems = [
  { label: "Dashboard", path: ADMIN_ROUTE },
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
];

const Sidebar = ({ onNavigate }) => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <span className="logo-icon">⚡</span>
        <div>
          <h1>TechnoSthan</h1>
          <p>Admin workspace</p>
        </div>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ADMIN_ROUTE}
            className={({ isActive }) =>
              `admin-nav-link ${
                isActive ? "active" : ""
              }`
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
