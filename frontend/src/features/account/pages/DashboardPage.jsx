import { Link } from "react-router-dom";
import { FiEdit3, FiLogOut } from "react-icons/fi";

import useAuth from "../../../shared/hooks/useAuth";
import useLogout from "../../../shared/hooks/useLogout";
import {
  PROFILE_ROUTE,
} from "../../../shared/constants";
import { getSafeImageUrl, getAccountDisplayInitial } from "../../../shared/utils";

import "../styles/account.css";

const DashboardPage = () => {
  const { user } = useAuth();
  const { logoutAndRedirect } = useLogout();

  const avatarUrl =
    user?.profileImageUrl || user?.profileImage || "";
  const initial = getAccountDisplayInitial(user?.name);

  return (
    <section className="account-page">
      <div className="account-shell">
        <header className="account-hero">
          <div>
            <span className="section-badge">Dashboard</span>
            <h1>Welcome back, {user?.name || "Account"}</h1>
            <p>
              Manage your profile details and keep your
              account information up to date.
            </p>
          </div>

          <div className="account-actions">
            <Link
              to={PROFILE_ROUTE}
              className="btn-secondary account-button-secondary"
            >
              <FiEdit3 />
              Edit Profile
            </Link>
            <button
              type="button"
              className="btn-secondary account-button-secondary"
              onClick={() => logoutAndRedirect()}
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </header>

        <div className="account-grid">
          <section className="account-card">
            <span className="section-badge">Account details</span>
            <h2>Profile snapshot</h2>
            <div className="account-details">
              <div className="account-detail">
                <div className="account-detail-label">Name</div>
                <div className="account-detail-value">
                  {user?.name || "Not available"}
                </div>
              </div>
              <div className="account-detail">
                <div className="account-detail-label">Email</div>
                <div className="account-detail-value">
                  {user?.email || "Not available"}
                </div>
              </div>
            </div>
          </section>

          <section className="account-card">
            <span className="section-badge">Avatar</span>
            <h3>Profile image</h3>
            <div className="account-avatar-large">
              {avatarUrl ? (
                <img
                  src={getSafeImageUrl(avatarUrl)}
                  alt={user?.name || "Account"}
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className="account-note account-note-spaced">
              Keep your profile image updated so your account is
              easy to recognize.
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
