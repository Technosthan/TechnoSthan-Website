import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
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
  Sun,
  Moon,
  Shield,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useAuth } from "../auth/useAuth";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    description: "Overview & Analytics",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "content",
    label: "Content Management",
    icon: BookOpen,
    path: "/admin/content",
    description: "Learning Materials",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "quiz",
    label: "Quiz Management",
    icon: Brain,
    path: "/admin/quiz",
    description: "Questions & Tests",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    path: "/admin/users",
    description: "User Accounts",
    color: "from-orange-500 to-red-600",
  },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set active tab based on current path
    const currentItem = menuItems.find(
      (item) => item.path === location.pathname,
    );
    if (currentItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(currentItem.id);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMenuClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
    setSidebarOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you'd save this to localStorage and apply to the entire app
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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-yellow-100 dark:from-green-900 dark:via-gray-900 dark:to-yellow-900 transition-colors duration-500">
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

      {/* Main Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed lg:static inset-y-0 left-0 z-50 w-72 ${
            darkMode ? "bg-gray-900/90" : "bg-white/80"
          } backdrop-blur-xl border-r ${
            darkMode ? "border-gray-700/50" : "border-white/30"
          } shadow-2xl transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:translate-x-0`}
        >
          {/* Logo and Brand */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/20">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 text-transparent bg-clip-text">
                  TECHNOSTHAN AGRITECH
                </h1>
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Admin Panel
                </p>
              </div>
            </motion.div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-4">
            <div className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center px-4 py-4 text-left rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-xl transform scale-105`
                        : darkMode
                          ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                          : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                    }`}
                    whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {isActive && (
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
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white"
                      }`}
                    />
                    <div className="flex-1">
                      <div
                        className={`font-semibold ${isActive ? "text-white" : ""}`}
                      >
                        {item.label}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          isActive
                            ? "text-white/80"
                            : darkMode
                              ? "text-gray-500 group-hover:text-gray-300"
                              : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* User Profile Section */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
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
              <div className="ml-4 flex-1">
                <p
                  className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {user?.name}
                </p>
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {user?.email}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span
                    className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Admin Online
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <motion.button
                onClick={toggleDarkMode}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    : "bg-white/60 text-gray-600 hover:bg-white/80 hover:text-gray-900"
                } backdrop-blur-sm`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 mr-3" />
                ) : (
                  <Moon className="h-5 w-5 mr-3" />
                )}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </motion.button>

              <motion.button
                onClick={handleLogout}
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
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar - Mobile Only */}
          <motion.div
            className={`lg:hidden sticky top-0 z-30 ${
              darkMode ? "bg-gray-900/90" : "bg-white/80"
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
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>

              <div className="flex items-center">
                <h1
                  className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {menuItems.find((item) => item.id === activeTab)?.label ||
                    "Admin Panel"}
                </h1>
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-xl ${
                    darkMode
                      ? "bg-gray-800/50 hover:bg-gray-700/50"
                      : "bg-white/60 hover:bg-white/80"
                  } transition-colors duration-200`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Page Content */}
          <motion.main
            className="flex-1 p-6 lg:p-8 overflow-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
