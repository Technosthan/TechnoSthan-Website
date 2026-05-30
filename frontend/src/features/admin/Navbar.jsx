import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../../contexts/ThemeContext";

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <motion.nav
        className={`sticky top-0 z-20 ${theme.navbar} shadow-lg`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center h-16 px-6">
          <span className={`${theme.text}`}>Loading...</span>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav
      className={`sticky top-0 z-20 ${theme.navbar} shadow-lg`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Page title or breadcrumbs could go here */}
        <div className="flex items-center">
          <h1 className={`text-xl font-semibold ${theme.text}`}>
            Admin Dashboard
          </h1>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <Link to="profile" className="hidden md:block text-left">
                <p className={`text-sm font-medium ${theme.text}`}>
                  {user.name}
                </p>
                <p className={`text-xs ${theme.textSecondary}`}>{user.email}</p>
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            className={`flex items-center px-4 py-2 rounded-lg ${theme.logoutButton} transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
