import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

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

  return (
    <div
      className={`flex h-screen ${theme.bgGradient} ${theme.text} transition-colors duration-500`}
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

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 flex flex-col min-w-0">
        {/* Mobile Navigation Bar */}
        <motion.div
          className={`lg:hidden sticky top-0 z-20 ${theme.navbar} shadow-lg`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-xl ${theme.surface} hover:${theme.navItemHover} transition-colors duration-200`}
            >
              <Menu className={`h-6 w-6 ${theme.text}`} />
            </button>
            <div className="flex items-center">
              <h1 className={`text-lg font-semibold ${theme.text}`}>
                Admin Panel
              </h1>
            </div>
            <Link
              to="/?view=website"
              className={`p-2 rounded-xl ${theme.surface} hover:${theme.navItemHover} transition-colors duration-200`}
              aria-label="Go to home page"
            >
              <Home className={`h-5 w-5 ${theme.text}`} />
            </Link>
          </div>
        </motion.div>

        {/* Desktop Navbar */}
        <div className="hidden lg:block">
          <Navbar />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
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

export default AdminLayout;
