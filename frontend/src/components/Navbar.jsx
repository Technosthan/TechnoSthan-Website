import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Shield, Bell } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { getUnreadCount } from "../shared/lib/announcementsApi";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, appSettings } = useTheme();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const [unread, setUnread] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleHomeClick = () => {
    if (token && isAdmin) {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        if (!token) return;
        const res = await getUnreadCount();
        if (!mounted) return;
        setUnread(res.data?.data?.count || 0);
      } catch (err) {
        // ignore
      }
    };

    fetchCount();

    const intervalId = window.setInterval(fetchCount, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCount();
      }
    };

    window.addEventListener("focus", fetchCount);
    window.addEventListener("announcements:changed", fetchCount);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", fetchCount);
      window.removeEventListener("announcements:changed", fetchCount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token]);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex justify-between items-center px-6 md:px-12 py-4
      backdrop-blur-md ${theme.navbar} shadow-sm sticky top-0 z-50`}
    >
      <Link to="/" className="flex items-center gap-3">
        <img
          src={appSettings.logoUrl || "/hero.png"}
          className={`w-12 h-12 rounded-full border-2 ${theme.border} shadow`}
          alt={`${appSettings.appName || "TECHNOSTHAN AGRITECH"} Logo`}
        />
        <h1 className={`font-bold text-lg ${theme.text}`}>
          {appSettings.appName || "TECHNOSTHAN AGRITECH"}
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={handleHomeClick}
          className={`${theme.navItem} transition`}
        >
          Home
        </button>
        <Link to="/about" className={`${theme.navItem} transition`}>
          About
        </Link>
        <Link to="/contact" className={`${theme.navItem} transition`}>
          Contact
        </Link>
        {appSettings.featureFlags?.contentVisibility !== false && (
          <Link to="/AgriTech Wiki" className={`${theme.navItem} transition`}>
            AgriTech Wiki
          </Link>
        )}
        {appSettings.featureFlags?.aiChat !== false && (
          <Link to="/chat" className={`${theme.navItem} transition`}>
            AI Chat
          </Link>
        )}

        {token ? (
          <>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`${theme.navItem} transition flex items-center gap-1`}
              >
                <Shield size={16} />
                Admin Panel
              </Link>
            )}
            <button
              title="Announcements"
              onClick={() => navigate("/dashboard")}
              className="relative mr-3"
            >
              <Bell size={18} className={`${theme.textSecondary}`} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                  {unread}
                </span>
              )}
            </button>
            <span className={`${theme.textSecondary}`}>
              Welcome, {user.name}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className={`${theme.logoutButton} px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300`}
            >
              <LogOut size={18} />
              Logout
            </motion.button>
          </>
        ) : (
          <Link
            to="/login"
            className={`${theme.buttonSecondary} hover:scale-105 transition transform px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm`}
          >
            <Shield size={16} />
            Login
          </Link>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
