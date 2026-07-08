import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, CreditCard, FileBadge2, FolderKanban, HelpCircle, LogOut, Menu, PanelLeft, UserCircle2, X, GraduationCap } from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: PanelLeft },
  { label: "My Programs", path: "/dashboard/my-programs", icon: GraduationCap },
  { label: "My Workshops", path: "/dashboard/my-workshops", icon: CalendarDays },
  { label: "My Enrollments", path: "/dashboard/my-enrollments", icon: BookOpen },
  { label: "Payments", path: "/dashboard/payments", icon: CreditCard },
  { label: "Certificates", path: "/dashboard/certificates", icon: FileBadge2 },
  { label: "Assignments / Projects", path: "/dashboard/assignments", icon: FolderKanban },
  { label: "Profile", path: "/dashboard/profile", icon: UserCircle2 },
  { label: "Support", path: "/dashboard/support", icon: HelpCircle },
];

const StudentLayout = () => {
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="student-shell">
      <aside className={`student-sidebar glass ${mobileOpen ? "is-open" : ""}`}>
        <div className="student-sidebar-top">
          <div>
            <p className="badge">Student portal</p>
            <h2>Welcome, {user?.name || "learner"}</h2>
            <p className="muted-copy">Your learning journey and support tools live here.</p>
          </div>
          <button type="button" className="icon-btn student-sidebar-close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="student-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="student-link"
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="btn btn-secondary student-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="student-main-shell">
        <header className="student-mobile-bar">
          <button type="button" className="icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open student menu">
            <Menu size={18} />
          </button>
        </header>

        {mobileOpen ? <button type="button" className="dashboard-backdrop" onClick={() => setMobileOpen(false)} /> : null}

        <main className="student-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
