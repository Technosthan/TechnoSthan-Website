import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";

import { getSafeImageUrl, getAccountDisplayInitial } from "../utils";
import "./account-menu.css";

const AccountMenu = ({
  user,
  items = [],
  onLogout,
  logoutLabel = "Logout",
  triggerLabel = "Account menu",
  triggerClassName = "",
  dropdownClassName = "",
  compact = true,
  align = "right",
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const avatarUrl =
    user?.profileImageUrl || user?.profileImage || "";
  const initials = getAccountDisplayInitial(user?.name);

  const closeMenu = () => setOpen(false);

  const handleAction = (callback) => {
    closeMenu();
    callback?.();
  };

  return (
    <div
      ref={menuRef}
      className={`account-menu ${align === "left" ? "align-left" : ""}`}
    >
      <button
        type="button"
        className={`account-menu-trigger ${
          compact ? "compact" : ""
        } ${triggerClassName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="account-avatar">
          {avatarUrl ? (
            <img
              src={getSafeImageUrl(avatarUrl)}
              alt={user?.name || "Account"}
            />
          ) : (
            <span>{initials}</span>
          )}
        </span>
        <FiChevronDown className="account-menu-caret" />
      </button>

      {open && (
        <div
          className={`account-menu-dropdown ${dropdownClassName}`}
          role="menu"
        >
          <div className="account-menu-header">
            <div className="account-menu-name">
              {user?.name || "Account"}
            </div>
            <div className="account-menu-email">
              {user?.email || ""}
            </div>
          </div>

          <div className="account-menu-items">
            {items.map((item) =>
              item.to ? (
                <Link
                  key={item.to}
                  to={item.to}
                  className="account-menu-item"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className="account-menu-item"
                  onClick={() => handleAction(item.onClick)}
                >
                  {item.label}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className="account-menu-logout"
            onClick={() => handleAction(onLogout)}
          >
            <FiLogOut />
            {logoutLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
