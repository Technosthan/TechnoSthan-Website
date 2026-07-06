import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";

const DashboardLayout = ({ title, navItems, children, onLogout }) => {
  const { user } = useAuth();

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar glass">
        <div>
          <p className="badge">{user?.role || "Dashboard"}</p>
          <h2>{title}</h2>
          <p className="muted-copy">
            {user?.name || "TechnoSthan user"} {user?.email ? `• ${user.email}` : ""}
          </p>
        </div>

        <nav className="dashboard-nav">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className="dashboard-link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="btn btn-secondary dashboard-logout" onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
