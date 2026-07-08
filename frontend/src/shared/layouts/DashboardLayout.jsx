import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, LogOut, Menu, PanelLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const COLLAPSED_KEY = "technosthan_admin_sidebar_collapsed";
const GROUPS_KEY = "technosthan_admin_sidebar_groups";

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (_error) {
    return fallback;
  }
};

const defaultGroups = [
  { label: "Dashboard", items: [{ label: "Overview", path: "/admin" }] },
  {
    label: "Website UI Update",
    items: [
      { label: "Hero", path: "/admin/hero" },
      { label: "Campaigns", path: "/admin/campaigns" },
      { label: "Workshops", path: "/admin/workshops" },
      { label: "Testimonials", path: "/admin/testimonials" },
    ],
  },
  {
    label: "Academic Management",
    items: [
      { label: "Programs", path: "/admin/programs" },
      { label: "Workshops", path: "/admin/workshops" },
      { label: "Enquiries", path: "/admin/enquiries" },
    ],
  },
  {
    label: "Student Management",
    items: [
      { label: "Students", path: "/admin/students" },
      { label: "Enrollments", path: "/admin" },
      { label: "Enquiries", path: "/admin/enquiries" },
    ],
  },
  {
    label: "Marketing & Campaigns",
    items: [
      { label: "Campaign Manager", path: "/admin/campaigns" },
      { label: "Announcements", path: "/admin/settings" },
      { label: "Leads", path: "/admin/enquiries" },
    ],
  },
  {
    label: "Payments & Reports",
    items: [
      { label: "Payments", path: "/admin/payments" },
      { label: "Reports", path: "/admin" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Profile", path: "/dashboard/profile" },
      { label: "Website Settings", path: "/admin/settings" },
      { label: "Auth Settings", path: "/admin/settings" },
    ],
  },
];

const DashboardLayout = ({ title, navGroups, children, onLogout }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => readStorage(COLLAPSED_KEY, false));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(() => readStorage(GROUPS_KEY, {}));

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  const groups = useMemo(() => navGroups || defaultGroups, [navGroups]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className={`dashboard-shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className={`dashboard-sidebar glass ${mobileOpen ? "is-open" : ""}`}>
        <div className="dashboard-sidebar-top">
          <div className="dashboard-brand">
            <p className="badge">{user?.role || "Dashboard"}</p>
            <h2>{title}</h2>
            {!collapsed ? (
              <p className="muted-copy">
                {user?.name || "TechnoSthan user"}
                {user?.email ? ` • ${user.email}` : ""}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="icon-btn sidebar-collapse-btn"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar collapse"
          >
            <PanelLeft size={18} />
          </button>
        </div>

        <nav className="dashboard-nav">
          {groups.map((group) => {
            const isOpen = Boolean(openGroups[group.label] ?? true);
            return (
              <div key={group.label} className="dashboard-group">
                <button type="button" className="dashboard-group-toggle" onClick={() => toggleGroup(group.label)}>
                  <span>{!collapsed ? group.label : group.label.slice(0, 1)}</span>
                  {!collapsed ? <ChevronDown size={16} className={isOpen ? "rotate-180" : ""} /> : null}
                </button>
                {isOpen ? (
                  <div className="dashboard-group-items">
                    {group.items.map((item, index) => (
                      <NavLink
                        key={`${group.label}-${item.path}-${index}`}
                        to={item.path}
                        className="dashboard-link"
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="dashboard-link-dot" />
                        {!collapsed ? item.label : item.label.slice(0, 1)}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <button type="button" className="btn btn-secondary dashboard-logout" onClick={onLogout}>
          <LogOut size={16} />
          <span className="dashboard-logout-text">{!collapsed ? "Logout" : null}</span>
        </button>
      </aside>

      <div className="dashboard-mobile-bar">
        <button type="button" className="icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">
          <Menu size={18} />
        </button>
      </div>

      {mobileOpen ? <button type="button" className="dashboard-backdrop" onClick={() => setMobileOpen(false)} /> : null}

      <main className="dashboard-content">{children}</main>
    </div>
  );
};

export default DashboardLayout;
