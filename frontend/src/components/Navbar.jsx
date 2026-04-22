import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Shield } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

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
          src="/hero.png"
          className="w-12 h-12 rounded-full border-2 border-green-500 shadow"
          alt="TECHNOSTHAN AGRITECH Logo"
        />
        <h1 className={`font-bold text-lg ${theme.text} ${theme.textDark}`}>
          TECHNOSTHAN AGRITECH
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={handleHomeClick}
          className={`text-gray-700 dark:text-gray-300 hover:${theme.accent} transition`}
        >
          Home
        </button>
        <Link
          to="/about"
          className={`text-gray-700 dark:text-gray-300 hover:${theme.accent} transition`}
        >
          About
        </Link>
        <Link
          to="/contact"
          className={`text-gray-700 dark:text-gray-300 hover:${theme.accent} transition`}
        >
          Contact
        </Link>
        <Link
          to="/learning"
          className={`text-gray-700 dark:text-gray-300 hover:${theme.accent} transition`}
        >
          Learning
        </Link>
        <Link
          to="/chat"
          className={`text-gray-700 dark:text-gray-300 hover:${theme.accent} transition`}
        >
          AI Chat
        </Link>

        {token ? (
          <>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`text-gray-700 dark:text-gray-300 hover:${theme.accent} transition flex items-center gap-1`}
              >
                <Shield size={16} />
                Admin Panel
              </Link>
            )}
            <span className="text-gray-700 dark:text-gray-300">
              Welcome, {user.name}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300"
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
