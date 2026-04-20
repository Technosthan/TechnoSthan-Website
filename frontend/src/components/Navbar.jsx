import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Shield, Compass } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center px-6 md:px-12 py-4
      backdrop-blur-md bg-green-300 dark:bg-gray-900/70 shadow-sm sticky top-0 z-50"
    >

      {/* LOGO */}
      <Link to="/" className="flex items-center gap-3">
        <img
          src="/hero.png"
          className="w-12 h-12 rounded-full border-2 border-gray-300 shadow"
          alt="Technosthan Logo"
        />
        <h1 className="font-bold text-lg text-gray-900 dark:text-gray-300">
          TECHNOSTHAN
        </h1>
      </Link>

      {/* MENU */}
      <div className="flex items-center gap-4">

        <Link to="/" className={`nav-link ${isActive("/") && "active"}`}>
          Home
        </Link>

        <Link to="/about" className={`nav-link ${isActive("/about") && "active"}`}>
          About
        </Link>

        <Link to="/contact" className={`nav-link ${isActive("/contact") && "active"}`}>
          Contact
        </Link>

        {/* 🔥 EXPLORE (FIXED) */}
        <Link
          to="/explore"
          className={`nav-link flex items-center gap-1 ${isActive("/explore") && "active"}`}
        >
          <Compass size={16} />
          Explore
        </Link>

        {token && (
          <>
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className={`nav-link flex items-center gap-1 ${isActive("/admin") && "active"}`}
                >
                  <Shield size={16} />
                  Admin
                </Link>

                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") && "active"}`}
                >
                  Student
                </Link>
              </>
            ) : (
              <>
                <Link to="/learning" className="nav-link">Learning</Link>
                <Link to="/quiz" className="nav-link">Quiz</Link>
                <Link to="/chat" className="nav-link">AI Chat</Link>
              </>
            )}
          </>
        )}

        {token ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="btn-logout"
          >
            <LogOut size={18} />
            Logout
          </motion.button>
        ) : (
          <>
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;