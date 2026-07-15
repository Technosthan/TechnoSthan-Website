import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";

import Sidebar from "../../features/admin/components/Sidebar";
import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import AccountMenu from "../components/AccountMenu";
import { ADMIN_ROUTE } from "../constants";
import "../../features/admin/styles/admin.css";

const pageTitles = {
  [ADMIN_ROUTE]: "Dashboard",
  [`${ADMIN_ROUTE}/products`]: "Products",
  [`${ADMIN_ROUTE}/testimonials`]: "Client Testimonials",
  [`${ADMIN_ROUTE}/hero-visual`]: "Hero Visual",
};

const AdminLayout = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] =
    useState(false);
  const { user, isAdmin } = useAuth();
  const { logoutAndRedirect } = useLogout();
  const location = useLocation();

  const title =
    pageTitles[location.pathname] || "Dashboard";

  const accountItems = isAdmin
    ? [
        {
          label: "Admin Dashboard",
          to: ADMIN_ROUTE,
        },
        {
          label: "My Profile",
          to: "/profile",
        },
      ]
    : [
        {
          label: "Dashboard",
          to: "/dashboard",
        },
        {
          label: "My Profile",
          to: "/profile",
        },
      ];

  return (
    <div
      className={`admin-shell ${
        mobileDrawerOpen ? "drawer-open" : ""
      }`}
    >
      {mobileDrawerOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close admin navigation"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      <Sidebar
        onNavigate={() => setMobileDrawerOpen(false)}
      />

      <div className="admin-shell-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              aria-label="Open admin navigation"
              onClick={() =>
                setMobileDrawerOpen((current) => !current)
              }
            >
              <FiMenu />
            </button>

            <div>
              
              <h2>TechnoSthan {title}</h2>
              <p>Manage the public site from one place.</p>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <AccountMenu
              user={user}
              items={accountItems}
              onLogout={() => logoutAndRedirect("/login")}
              triggerLabel="Open admin account menu"
              triggerClassName="navbar-profile-trigger"
              dropdownClassName="navbar-account-dropdown"
              compact
            />
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
