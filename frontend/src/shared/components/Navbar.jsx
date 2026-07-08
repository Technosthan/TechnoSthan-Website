import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserCircle2, X } from "lucide-react";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { getMediaUrl } from "../utils/media";
import logo from "@/assets/technosthan-logo.png";

const navItems = [
  { label: "Home", path: ROUTES.HOME },
  { label: "Programs", path: ROUTES.SKILL_PROGRAMS },
  { label: "R&D", path: ROUTES.RD_SERVICES },
  { label: "Startup Support", path: ROUTES.STARTUP_SUPPORT },
  { label: "Contact", path: ROUTES.CONTACT },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const dropdownItems = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === "ADMIN") {
      return [
        { label: "Dashboard", path: ROUTES.ADMIN },
        { label: "My Programs", path: ROUTES.ADMIN_PROGRAMS },
        { label: "Profile", path: ROUTES.ADMIN_SETTINGS },
        { label: "Payments", path: ROUTES.ADMIN_PAYMENTS },
      ];
    }

    return [
      { label: "Dashboard", path: ROUTES.DASHBOARD },
      { label: "My Programs", path: ROUTES.DASHBOARD_PROGRAMS },
      { label: "Profile", path: ROUTES.DASHBOARD_PROFILE },
      { label: "Payments", path: ROUTES.DASHBOARD_PAYMENTS },
    ];
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="nav-shell glass">
      <div className="container nav-bar">
        <Link to={ROUTES.HOME} className="brand-mark">
          <img
            src={logo}
            alt="TechnoSthan Innovation Hub logo"
            className="brand-logo"
          />
          <div>
            <div className="brand-title">TechnoSthan</div>
            <div className="brand-subtitle">Innovation Hub</div>
          </div>
        </Link>

        <nav className="desktop-nav">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className="nav-link">
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <div className="profile-menu-wrap">
              <button
                type="button"
                className="btn btn-secondary profile-trigger"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <span className="profile-avatar">
                  {user?.avatar ? (
                    <img src={getMediaUrl(user.avatar, "image")} alt={user.name || "Profile"} />
                  ) : (
                    <UserCircle2 size={18} />
                  )}
                </span>
                <span>{user?.name || "Profile"}</span>
                <ChevronDown size={16} />
              </button>

              {profileOpen ? (
                <div className="profile-dropdown glass">
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="profile-link"
                      onClick={() => setProfileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    className="profile-link profile-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to={ROUTES.LOGIN} className="btn btn-primary nav-cta">
              Login
            </Link>
          )}
        </nav>

        <button
          className="btn btn-secondary mobile-nav-toggle"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className="container mobile-drawer">
          <div className="glass mobile-menu-card">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="nav-link"
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                {dropdownItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="btn btn-secondary"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <button className="btn btn-primary" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="btn btn-primary"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
