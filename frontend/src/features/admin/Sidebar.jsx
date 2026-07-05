import { useLocation, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Users,
  X,
  BarChart3,
  Settings,
  Bell,
  Search,
  Shield,
  TrendingUp,
  Activity,
  FileText,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { theme, appSettings } = useTheme();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "",
      description: "Overview & Analytics",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "content",
      label: "Content Management",
      icon: BookOpen,
      path: "content",
      description: "AgriTech Wiki Materials",
      color: "from-green-500 to-teal-600",
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
      id: "forms",
      label: "Forms Builder",
      icon: FileText,
      path: "forms",
      description: "Google Forms-style builder",
      color: "from-green-500 to-emerald-600",
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

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 ${theme.cardOpacity} ${theme.text} backdrop-blur-xl border-r ${theme.border} shadow-2xl flex flex-col justify-between z-50 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}
    >
      {/* Top Section - Logo and Navigation */}
      <div className="flex flex-col h-full">
        {/* Logo and Brand */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/20 shrink-0">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`w-12 h-12 ${theme.primary} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}
            >
              {appSettings.logoUrl ? (
                <img
                  src={appSettings.logoUrl}
                  alt={appSettings.appName || "Admin logo"}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
              ) : (
                <Shield size={24} />
              )}
            </div>
            <div>
              <h1 className={`text-xl font-bold ${theme.accent}`}>
                {appSettings.appName || "TECHNOSTHAN AGRITECH"}
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
              const currentPath = location.pathname.replace(/\/+$/, "");
              const targetPath = item.path
                ? `/admin/dashboard/${item.path}`
                : "/admin/dashboard";
              const isActive =
                currentPath === targetPath ||
                currentPath.startsWith(`${targetPath}/`) ||
                (item.path === "" && currentPath === "/admin/dashboard");

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center px-4 py-4 text-left rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? theme.sidebarActive
                      : `${theme.navItem} ${theme.sidebarHover}`
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`h-6 w-6 mr-4 transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : `${theme.textSecondary} group-hover:text-white`
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
                          : `${theme.textSecondary} group-hover:text-white`
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
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
