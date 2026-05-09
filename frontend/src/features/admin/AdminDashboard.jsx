import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Users,
  LogOut,
  Menu,
  X,
  BarChart3,
  Settings,
  Bell,
  Search,
  Shield,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../../contexts/ThemeContext";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, currentTheme } = useTheme();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "",
      description: "Overview & Analytics",
      color: `from-${theme.gradient.split("-")[0]}-${theme.gradient.split("-")[1]} to-${theme.gradient.split("-")[2]}-${theme.gradient.split("-")[3]}`,
    },
    {
      id: "content",
      label: "Content Management",
      icon: BookOpen,
      path: "content",
      description: "AgriTech Wiki Materials",
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "quiz",
      label: "Quiz Management",
      icon: Brain,
      path: "quiz",
      description: "Questions & Tests",
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      path: "users",
      description: "User Accounts & Roles",
      color: "from-orange-500 to-red-600",
    },
    {
      id: "ai-control",
      label: "AI Control Panel",
      icon: TrendingUp,
      path: "ai-control",
      description: "AI Settings & Prompts",
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "settings",
      description: "App Configuration",
      color: "from-gray-500 to-slate-600",
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: Bell,
      path: "announcements",
      description: "System Messages",
      color: "from-yellow-500 to-orange-600",
    },
    {
      id: "search",
      label: "Global Search",
      icon: Search,
      path: "search",
      description: "Search Everything",
      color: "from-indigo-500 to-blue-600",
    },
    {
      id: "monitoring",
      label: "Monitoring",
      icon: Activity,
      path: "monitoring",
      description: "System Monitoring",
      color: "from-green-500 to-teal-600",
    },
  ];

  const darkMode = currentTheme === "red-black";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${theme.bgGradient} ${theme.text} transition-colors duration-500`}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Position */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 ${theme.cardOpacity} ${theme.text} backdrop-blur-xl border-r ${theme.border} shadow-2xl flex flex-col justify-between z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 flex-shrink-0`}
      >
        {/* Top Section - Logo and Navigation */}
        <div className="flex flex-col h-full">
          {/* Logo and Brand */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/20 flex-shrink-0">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`w-12 h-12 ${theme.primary} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}
              >
                <Shield size={24} />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${theme.accent}`}>
                  TECHNOSTHAN AGRITECH
                </h1>
                <p className={`text-xs ${theme.textSecondary}`}>Admin Panel</p>
              </div>
            </motion.div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200"
            >
              <X className={`h-5 w-5 ${theme.textSecondary}`} />
            </button>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive: navIsActive }) =>
                      `w-full flex items-center px-4 py-4 text-left rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                        navIsActive
                          ? `text-white shadow-xl transform scale-105`
                          : `${theme.navItem} hover:${theme.navItemHover}`
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {({ isActive: navIsActive }) => (
                      <>
                        {navIsActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          />
                        )}
                        <Icon
                          className={`h-6 w-6 mr-4 transition-colors duration-200 ${
                            navIsActive
                              ? "text-white"
                              : `${theme.textSecondary} group-hover:text-white`
                          }`}
                        />
                        <div className="flex-1">
                          <div
                            className={`font-semibold ${navIsActive ? "text-white" : ""}`}
                          >
                            {item.label}
                          </div>
                          <div
                            className={`text-xs mt-0.5 ${
                              navIsActive
                                ? "text-white/80"
                                : `${theme.textSecondary} group-hover:text-white`
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                        {navIsActive && (
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom Section - User Profile and Logout */}
        <div className="flex-shrink-0 border-t border-white/20 p-6">
          {/* User Profile Section */}
          <div className="flex items-center mb-4">
            <motion.div
              className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </motion.div>
            <div className="ml-4 flex-1 min-w-0">
              <p
                className={`text-sm font-semibold truncate ${darkMode ? "text-white" : theme.text}`}
              >
                {user?.name}
              </p>
              <p
                className={`text-xs truncate ${darkMode ? theme.textSecondary : "text-gray-500"}`}
              >
                {user?.email}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span
                  className={`text-xs font-medium ${darkMode ? theme.textSecondary : "text-gray-600"}`}
                >
                  Admin Online
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <motion.button
            type="button"
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
            className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50/80 hover:text-red-700 rounded-xl transition-all duration-200 font-medium backdrop-blur-sm"
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </motion.button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-0 lg:ml-72 flex-1 overflow-y-auto h-screen bg-transparent">
        {/* Mobile Navigation Bar */}
        <motion.div
          className={`lg:hidden sticky top-0 z-20 ${
            darkMode
              ? `${theme.card} ${theme.text}`
              : `bg-white/80 ${theme.text}`
          } backdrop-blur-xl border-b border-white/20 shadow-lg`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-xl ${
                darkMode
                  ? "bg-gray-800/50 hover:bg-gray-700/50"
                  : "bg-white/60 hover:bg-white/80"
              } transition-colors duration-200`}
            >
              <Menu className={`h-6 w-6 ${theme.text}`} />
            </button>

            <div className="flex items-center">
              <h1
                className={`text-lg font-semibold ${darkMode ? "text-white" : theme.text}`}
              >
                {menuItems.find((item) => location.pathname.endsWith(item.path))
                  ?.label || "Admin Panel"}
              </h1>
            </div>

            <div className="w-10"></div>
          </div>
        </motion.div>

        {/* Page Content */}
        <div className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
