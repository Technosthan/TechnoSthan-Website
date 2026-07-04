import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { navItems } from "../data/siteData";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="glass"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 0",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            fontWeight: 700,
          }}
        >
          <div className="gradient-text" style={{ fontSize: "1.2rem" }}>
            ⚡
          </div>
          <span>TechnoSthan Innovation Hub</span>
        </Link>

        <nav
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
          className="desktop-nav"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                color: isActive ? "#5ee7ff" : "#dbe5f2",
                fontSize: "0.95rem",
              })}
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href="/contact"
            className="btn btn-primary"
            style={{ padding: "0.7rem 1rem" }}
          >
            Apply / Enquire Now
          </a>
        </nav>

        <button
          className="btn btn-secondary mobile-nav-toggle"
          onClick={() => setOpen((prev) => !prev)}
          style={{ padding: "0.7rem" }}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="container" style={{ paddingBottom: "1rem" }}>
          <div
            className="glass"
            style={{
              borderRadius: "1rem",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                style={({ isActive }) => ({
                  color: isActive ? "#5ee7ff" : "#dbe5f2",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
