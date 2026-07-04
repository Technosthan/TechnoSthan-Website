import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTES } from "../constants/routes";
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
          <a href={ROUTES.CONTACT} className="btn btn-primary nav-cta">
            Apply Now
          </a>
        </nav>

        <button
          className="btn btn-secondary mobile-nav-toggle"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
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
            <a
              href={ROUTES.CONTACT}
              className="btn btn-primary"
              onClick={() => setOpen(false)}
            >
              Apply Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
